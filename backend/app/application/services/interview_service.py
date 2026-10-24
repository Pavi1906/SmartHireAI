import uuid
import random
from typing import List, Dict, Any, Optional
from app.infrastructure.repositories.interview_repository import InterviewRepository
from app.infrastructure.repositories.ats_repository import ATSRepository
from app.application.dto.interview import (
    StartInterviewRequestDTO,
    SubmitAnswerRequestDTO,
    InterviewSessionDTO,
    InterviewQuestionDTO,
    InterviewFeedbackDTO,
    InterviewStatus
)
from app.core.exceptions import EntityNotFoundException, ValidationException, ForbiddenException


# --- Curated question bank keyed by domain ---
QUESTION_BANK: Dict[str, List[str]] = {
    "python": [
        "Explain the difference between a list and a tuple in Python and when you would use each.",
        "What are Python decorators? Write a real-world example.",
        "How does Python's GIL affect multithreaded programs?",
        "Explain generator functions and the yield keyword with an example.",
        "What is the difference between deep copy and shallow copy?",
    ],
    "data_structures": [
        "Explain the time complexity of common operations on a hash map.",
        "When would you use a heap vs a sorted array?",
        "Describe the difference between BFS and DFS and when each is optimal.",
        "Explain how a B-tree differs from a binary search tree.",
    ],
    "system_design": [
        "Design a scalable URL shortener service handling 100M requests/day.",
        "How would you design a notification system for a social media platform?",
        "Explain horizontal vs vertical scaling with real trade-offs.",
        "How do you design an idempotent API endpoint?",
    ],
    "machine_learning": [
        "Explain the bias-variance trade-off and how you would address each.",
        "When would you use precision vs recall as your primary metric?",
        "What is the difference between bagging and boosting? Give examples.",
        "How do you handle class imbalance in a classification problem?",
    ],
    "behavioral": [
        "Tell me about a time you had a technical disagreement with a teammate and how you resolved it.",
        "Describe the most complex project you have worked on and your specific contributions.",
        "Tell me about a time you had to learn a new technology under a deadline.",
        "How do you prioritize tasks when multiple urgent items compete for your time?",
    ],
    "general": [
        "Walk me through how you would approach debugging a production issue at 2 AM.",
        "How do you stay updated with rapidly evolving technology trends?",
        "Describe your ideal software development workflow.",
        "What makes a good code review? What do you look for when reviewing others' code?",
        "How would you mentor a junior developer who is struggling with a complex concept?",
    ],
}


def _select_questions(num: int) -> List[str]:
    """Select a balanced mix of questions from the bank."""
    all_questions: List[str] = []
    for questions in QUESTION_BANK.values():
        all_questions.extend(questions)
    random.shuffle(all_questions)
    return all_questions[:num]


def _evaluate_answer(question_text: str, answer_text: str) -> Dict[str, Any]:
    """
    Heuristic answer evaluator.
    In production this would call Gemini Pro with a structured rubric.
    """
    words = answer_text.strip().split()
    word_count = len(words)

    # Base score on answer depth
    if word_count < 20:
        base_score = 30.0
        depth_feedback = "Answer is too brief. Provide more detail and concrete examples."
    elif word_count < 60:
        base_score = 55.0
        depth_feedback = "Answer shows basic understanding but lacks depth. Expand with examples."
    elif word_count < 150:
        base_score = 72.0
        depth_feedback = "Good answer with reasonable depth. Could be strengthened with specific examples."
    else:
        base_score = 88.0
        depth_feedback = "Comprehensive answer demonstrating strong depth of knowledge."

    # Boost if answer contains technical keywords
    tech_keywords = ["algorithm", "complexity", "database", "async", "cache", "index",
                     "scale", "queue", "service", "pattern", "trade-off", "performance"]
    matches = sum(1 for kw in tech_keywords if kw.lower() in answer_text.lower())
    keyword_boost = min(matches * 2.5, 10.0)

    final_score = min(round(base_score + keyword_boost, 1), 100.0)

    feedback = (
        f"{depth_feedback} "
        f"({'Strong' if matches >= 3 else 'Moderate' if matches >= 1 else 'Weak'} technical vocabulary detected.)"
    )

    return {"score": final_score, "feedback": feedback}


class InterviewService:
    """
    Application service orchestrating AI-powered mock interview sessions.
    Manages session lifecycle: start → question → answer → evaluate → complete → feedback.
    """

    def __init__(self, interview_repo: InterviewRepository):
        self.interview_repo = interview_repo

    async def start_session(
        self, student_id: str, dto: StartInterviewRequestDTO
    ) -> InterviewSessionDTO:
        # Create session record
        sess = await self.interview_repo.create_session(
            student_id=student_id,
            job_description_id=dto.job_description_id
        )

        # Select and persist questions
        questions_text = _select_questions(dto.num_questions)
        question_dtos = []
        for i, q_text in enumerate(questions_text, start=1):
            q = await self.interview_repo.add_question(
                session_id=str(sess.id),
                question_text=q_text,
                sequence=i
            )
            question_dtos.append(InterviewQuestionDTO(
                question_id=str(q.id),
                sequence=q.sequence,
                question_text=q.question_text
            ))

        return InterviewSessionDTO(
            session_id=str(sess.id),
            student_id=student_id,
            job_description_id=dto.job_description_id,
            status=InterviewStatus.IN_PROGRESS,
            questions=question_dtos,
            created_at=sess.created_at,
        )

    async def submit_answer(self, dto: SubmitAnswerRequestDTO) -> InterviewQuestionDTO:
        evaluation = _evaluate_answer("", dto.answer_text)
        q = await self.interview_repo.submit_answer(
            question_id=dto.question_id,
            answer_text=dto.answer_text,
            score=evaluation["score"],
            feedback=evaluation["feedback"]
        )
        if not q:
            raise EntityNotFoundException("InterviewQuestion", dto.question_id)

        return InterviewQuestionDTO(
            question_id=str(q.id),
            sequence=q.sequence,
            question_text=q.question_text,
            answer_text=q.answer_text,
            score=q.score,
            feedback=q.feedback
        )

    async def complete_session(self, session_id: str, student_id: str) -> InterviewFeedbackDTO:
        sess = await self.interview_repo.get_session(session_id)
        if not sess:
            raise EntityNotFoundException("InterviewSession", session_id)
        if str(sess.student_id) != student_id:
            raise ForbiddenException("You do not have access to this interview session.")

        questions = await self.interview_repo.get_session_questions(session_id)
        answered = [q for q in questions if q.score is not None]

        if not answered:
            raise ValidationException("No answers submitted. Answer at least one question before completing the session.")

        # Compute aggregate score
        scores = [q.score for q in answered]
        overall_score = round(sum(scores) / len(scores), 1)

        # Derive strength and improvement areas
        strong = [q.question_text[:60] + "..." for q in answered if q.score >= 70]
        weak = [q.question_text[:60] + "..." for q in answered if q.score < 70]

        if overall_score >= 80:
            recommendation = "Outstanding performance. Candidate is well prepared for interviews."
        elif overall_score >= 60:
            recommendation = "Good performance. Targeted practice on weak areas recommended."
        elif overall_score >= 40:
            recommendation = "Average performance. Significant preparation needed before real interviews."
        else:
            recommendation = "Below average. Intensive interview coaching and practice strongly recommended."

        overall_feedback = {
            "overall_score": overall_score,
            "questions_answered": len(answered),
            "recommendation": recommendation
        }

        await self.interview_repo.update_session_status(
            session_id=session_id,
            status="completed",
            overall_feedback=overall_feedback
        )

        question_dtos = [
            InterviewQuestionDTO(
                question_id=str(q.id),
                sequence=q.sequence,
                question_text=q.question_text,
                answer_text=q.answer_text,
                score=q.score,
                feedback=q.feedback
            )
            for q in questions
        ]

        return InterviewFeedbackDTO(
            session_id=session_id,
            overall_score=overall_score,
            strength_areas=strong[:3] if strong else ["Keep practicing to build strong answers."],
            improvement_areas=weak[:3] if weak else ["Continue the great work!"],
            recommendation=recommendation,
            detailed_feedback=question_dtos
        )

    async def get_session(self, session_id: str, student_id: str) -> InterviewSessionDTO:
        sess = await self.interview_repo.get_session(session_id)
        if not sess:
            raise EntityNotFoundException("InterviewSession", session_id)
        if str(sess.student_id) != student_id:
            raise ForbiddenException("You do not have access to this interview session.")

        questions = await self.interview_repo.get_session_questions(session_id)
        question_dtos = [
            InterviewQuestionDTO(
                question_id=str(q.id),
                sequence=q.sequence,
                question_text=q.question_text,
                answer_text=q.answer_text,
                score=q.score,
                feedback=q.feedback
            )
            for q in questions
        ]

        return InterviewSessionDTO(
            session_id=str(sess.id),
            student_id=str(sess.student_id),
            job_description_id=str(sess.job_description_id),
            status=InterviewStatus(sess.status),
            questions=question_dtos,
            overall_feedback=sess.overall_feedback,
            created_at=sess.created_at,
            completed_at=sess.completed_at
        )
