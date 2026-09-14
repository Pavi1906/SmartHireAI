from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from app.infrastructure.db.models import JobRequisition, Candidate, Application, MatchResult
from app.application.dto.recruiter_dto import RecruiterKPIsResponse

class RecruiterAnalyticsService:

    @classmethod
    async def get_recruiter_kpis(cls, db: AsyncSession, company_id: str) -> RecruiterKPIsResponse:
        # 1. Job Counts by Status
        jobs_query = select(
            JobRequisition.status,
            func.count(JobRequisition.id)
        ).where(JobRequisition.company_id == company_id).group_by(JobRequisition.status)
        
        jobs_res = await db.execute(jobs_query)
        job_counts = dict(jobs_res.all())

        total_jobs = sum(job_counts.values())
        active_jobs = job_counts.get("published", 0)
        draft_jobs = job_counts.get("draft", 0)
        closed_jobs = job_counts.get("closed", 0)
        archived_jobs = job_counts.get("archived", 0)

        # 2. Candidate & Pipeline Counts
        cand_query = select(func.count(Candidate.id)).where(Candidate.company_id == company_id)
        cand_res = await db.execute(cand_query)
        total_candidates = cand_res.scalar() or 0

        shortlisted_query = select(func.count(Application.id))\
            .where(Application.company_id == company_id, Application.pipeline_stage == "Shortlisted")
        shortlisted_res = await db.execute(shortlisted_query)
        shortlisted_candidates = shortlisted_res.scalar() or 0

        interviewing_query = select(func.count(Application.id))\
            .where(Application.company_id == company_id, Application.pipeline_stage == "Interview")
        interviewing_res = await db.execute(interviewing_query)
        interviewing_candidates = interviewing_res.scalar() or 0

        # 3. Average Match Score
        avg_score_query = select(func.avg(MatchResult.match_score))\
            .join(JobRequisition, MatchResult.job_id == JobRequisition.id)\
            .where(JobRequisition.company_id == company_id)
        avg_res = await db.execute(avg_score_query)
        avg_match_val = avg_res.scalar()
        average_match_score = float(round(avg_match_val, 1)) if avg_match_val is not None else 0.0

        return RecruiterKPIsResponse(
            totalJobs=total_jobs,
            activeJobs=active_jobs,
            draftJobs=draft_jobs,
            closedJobs=closed_jobs,
            archivedJobs=archived_jobs,
            totalCandidates=total_candidates,
            shortlistedCandidates=shortlisted_candidates,
            interviewingCandidates=interviewing_candidates,
            averageMatchScore=average_match_score
        )

    @classmethod
    async def get_overview_analytics(cls, db: AsyncSession, company_id: str) -> dict:
        kpis = await cls.get_recruiter_kpis(db, company_id)
        return {
            "jobs": {
                "total": kpis.totalJobs,
                "open": kpis.activeJobs,
                "closed": kpis.closedJobs
            },
            "candidates": {
                "total": kpis.totalCandidates
            },
            "applications": {
                "total": kpis.totalCandidates
            },
            "interviews": {
                "total": kpis.interviewingCandidates
            },
            "offers": {
                "total": 0
            },
            "hires": {
                "total": 0
            }
        }

    @classmethod
    async def get_pipeline_analytics(cls, db: AsyncSession, company_id: str) -> dict:
        query = select(Application.pipeline_stage, func.count(Application.id))\
            .where(Application.company_id == company_id)\
            .group_by(Application.pipeline_stage)
        res = await db.execute(query)
        stage_counts = dict(res.all())
        
        stages = ["SOURCED", "SCREENING", "SHORTLISTED", "INTERVIEW", "OFFER", "HIRED", "REJECTED", "WITHDRAWN"]
        result = {}
        for s in stages:
            result[s] = stage_counts.get(s, stage_counts.get(s.capitalize(), 0))
        return result

