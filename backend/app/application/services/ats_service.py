import uuid
from typing import List, Dict, Any
from app.infrastructure.repositories.ats_repository import ATSRepository
from app.infrastructure.ai.ats_engine import ats_engine
from app.application.dto.ats import ATSScoreRequestDTO, ATSScoreResponseDTO
from app.core.exceptions import EntityNotFoundException, ValidationException


class ATSService:
    """
    Application service for ATS scoring orchestration.
    Combines the ATS AI engine with DB persistence via ATSRepository.
    """

    def __init__(self, ats_repo: ATSRepository):
        self.ats_repo = ats_repo

    async def score_resume_against_jd(
        self,
        dto: ATSScoreRequestDTO
    ) -> ATSScoreResponseDTO:
        if not dto.resume_skills:
            raise ValidationException("Resume must contain at least one skill for ATS scoring.")
        if not dto.jd_skills:
            raise ValidationException("Job description must contain at least one required skill.")

        # Run the deterministic ATS scoring engine
        result = ats_engine.score(
            resume_json={"skills": dto.resume_skills},
            jd_json={"skills": dto.jd_skills}
        )

        # Persist the ATS report to PostgreSQL
        report = await self.ats_repo.create_ats_report(
            resume_id=dto.resume_id,
            job_description_id=dto.job_description_id,
            ats_score=result["ats_score"],
            matched_skills=result["matched_skills"],
            missing_skills=result["missing_skills"],
            explanation=result.get("breakdown", {})
        )

        # Generate actionable recommendation
        score = result["ats_score"]
        if score >= 85:
            recommendation = "Excellent match. Candidate is highly recommended for this role."
        elif score >= 65:
            recommendation = "Good match. Minor skill gaps — recommend addressing missing skills before interview."
        elif score >= 45:
            recommendation = "Moderate match. Significant skill gaps present. Upskilling advised."
        else:
            recommendation = "Low match. Candidate profile does not sufficiently align with this job description."

        return ATSScoreResponseDTO(
            report_id=str(report.id),
            resume_id=dto.resume_id,
            job_description_id=dto.job_description_id,
            ats_score=result["ats_score"],
            matched_skills=result["matched_skills"],
            missing_skills=result["missing_skills"],
            breakdown=result.get("breakdown", {}),
            explanation={"summary": f"ATS Score: {score:.1f}/100. {len(result['matched_skills'])} of {len(dto.jd_skills)} required skills matched."},
            recommendation=recommendation
        )

    async def get_reports_for_resume(self, resume_id: str) -> List[ATSScoreResponseDTO]:
        reports = await self.ats_repo.get_by_resume_id(resume_id)
        results = []
        for r in reports:
            score = r.ats_score
            recommendation = (
                "Excellent match." if score >= 85 else
                "Good match." if score >= 65 else
                "Moderate match." if score >= 45 else
                "Low match."
            )
            results.append(ATSScoreResponseDTO(
                report_id=str(r.id),
                resume_id=str(r.resume_id),
                job_description_id=str(r.job_description_id),
                ats_score=r.ats_score,
                matched_skills=r.matched_skills or [],
                missing_skills=r.missing_skills or [],
                breakdown=r.explanation or {},
                recommendation=recommendation
            ))
        return results
