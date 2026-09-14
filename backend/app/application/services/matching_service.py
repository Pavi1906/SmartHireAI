from datetime import datetime, timezone
from typing import List, Dict, Any, Tuple, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.infrastructure.db.models import MatchResult, JobRequisition, Candidate, Application
from app.application.dto.recruiter_dto import MatchResultResponse, MatchEvaluationRequest

class MatchingService:

    @staticmethod
    def calculate_deterministic_match(
        candidate_skills: List[str],
        required_skills: List[str],
        preferred_skills: List[str],
        experience_count: int = 0,
        job_title: str = "Position"
    ) -> Tuple[float, float, List[str], List[str], str, Dict[str, Any]]:
        # Skill normalization helpers
        def normalize(skill: str) -> str:
            return skill.strip().lower()

        c_skills_norm = [normalize(s) for s in (candidate_skills or [])]

        req_skills = required_skills or []
        pref_skills = preferred_skills or []

        matched_req = []
        missing_req = []
        for req in req_skills:
            req_norm = normalize(req)
            if any(req_norm == cs or req_norm in cs or cs in req_norm for cs in c_skills_norm):
                matched_req.append(req)
            else:
                missing_req.append(req)

        matched_pref = []
        missing_pref = []
        for pref in pref_skills:
            pref_norm = normalize(pref)
            if any(pref_norm == cs or pref_norm in cs or cs in pref_norm for cs in c_skills_norm):
                matched_pref.append(pref)
            else:
                missing_pref.append(pref)

        # 80% Required / 20% Preferred Weighting Algorithm
        base_score = 0.0
        if req_skills:
            req_score = (len(matched_req) / len(req_skills)) * 80.0
            pref_score = (len(matched_pref) / len(pref_skills)) * 20.0 if pref_skills else (20.0 if matched_pref else 0.0)
            base_score = round(req_score + pref_score, 1)
        elif pref_skills:
            base_score = round((len(matched_pref) / len(pref_skills)) * 100.0, 1)
        else:
            base_score = 70.0 if c_skills_norm else 50.0

        match_score = min(100.0, max(15.0, base_score))

        # Deterministic Confidence metric based on Profile Depth & Criteria Completeness
        candidate_evidence = min(45.0, len(c_skills_norm) * 5.0 + (15.0 if experience_count > 0 else 0.0))
        job_evidence = min(45.0, len(req_skills) * 8.0 + len(pref_skills) * 4.0)
        confidence = min(99.0, max(50.0, float(round(10.0 + candidate_evidence + job_evidence))))

        matched_all = list(dict.fromkeys(matched_req + matched_pref))

        if match_score >= 75.0:
            matched_str = ", ".join(matched_all[:4]) if matched_all else "key skills"
            recommendation = f"Strong profile match for {job_title}. Candidate possesses key expertise in {matched_str}."
        else:
            missing_str = ", ".join(missing_req[:3]) if missing_req else "key requirements"
            recommendation = f"Partial match for {job_title}. Missing key requirements including {missing_str}."

        scoring_breakdown = {
            "required_score": round((len(matched_req) / len(req_skills) * 80.0), 1) if req_skills else 80.0,
            "preferred_score": round((len(matched_pref) / len(pref_skills) * 20.0), 1) if pref_skills else 20.0,
            "final_score": match_score,
            "matched_required": matched_req,
            "missing_required": missing_req,
            "matched_preferred": matched_pref,
            "missing_preferred": missing_pref,
            "evidence_completeness": confidence
        }

        return match_score, confidence, matched_all, missing_req, recommendation, scoring_breakdown

    @classmethod
    async def evaluate_and_save_match(
        cls,
        db: AsyncSession,
        candidate_id: str,
        job_id: str,
        company_id: str,
        application_id: Optional[str] = None
    ) -> MatchResult:
        # Fetch Candidate & Job
        cand_result = await db.execute(
            select(Candidate).where(Candidate.id == candidate_id, Candidate.company_id == company_id)
        )
        candidate = cand_result.scalars().first()
        if not candidate:
            raise ValueError(f"Candidate {candidate_id} not found for company {company_id}")

        job_result = await db.execute(
            select(JobRequisition).where(JobRequisition.id == job_id, JobRequisition.company_id == company_id)
        )
        job = job_result.scalars().first()
        if not job:
            raise ValueError(f"Job {job_id} not found for company {company_id}")

        # Extract Candidate Skills and Experience
        resume_data = candidate.resume_data or {}
        candidate_skills = resume_data.get("skills", [])
        experience = resume_data.get("experience", [])

        # Perform Calculation
        score, confidence, matched, missing, recommendation, breakdown = cls.calculate_deterministic_match(
            candidate_skills=candidate_skills,
            required_skills=job.required_skills or [],
            preferred_skills=job.preferred_skills or [],
            experience_count=len(experience),
            job_title=job.title
        )

        # Check existing match result
        existing_result = await db.execute(
            select(MatchResult).where(
                MatchResult.candidate_id == candidate.id,
                MatchResult.job_id == job.id
            )
        )
        match_record = existing_result.scalars().first()

        now = datetime.now(timezone.utc)
        if match_record:
            match_record.match_score = score
            match_record.confidence = confidence
            match_record.matched_skills = matched
            match_record.missing_skills = missing
            match_record.recommendation = recommendation
            match_record.scoring_breakdown = breakdown
            match_record.calculated_at = now
            if application_id:
                match_record.application_id = application_id
        else:
            match_record = MatchResult(
                application_id=application_id,
                candidate_id=candidate.id,
                job_id=job.id,
                match_score=score,
                confidence=confidence,
                matched_skills=matched,
                missing_skills=missing,
                recommendation=recommendation,
                scoring_breakdown=breakdown,
                algorithm_version="v1.0-deterministic",
                calculated_at=now
            )
            db.add(match_record)

        await db.commit()
        await db.refresh(match_record)
        return match_record
