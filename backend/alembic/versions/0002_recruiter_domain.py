"""Recruiter domain schema addition

Revision ID: 0002_recruiter_domain
Revises: 0001_baseline
Create Date: 2026-08-19 19:40:00.000000

"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0002_recruiter_domain"
down_revision = "0001_baseline"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. job_requisitions
    op.create_table(
        "job_requisitions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("company_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("companies.id", ondelete="CASCADE"), nullable=False),
        sa.Column("recruiter_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("department", sa.String(length=100), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("responsibilities", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("required_skills", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("preferred_skills", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("experience", sa.String(length=100), nullable=False),
        sa.Column("education", sa.String(length=200), nullable=False),
        sa.Column("location", sa.String(length=150), nullable=False),
        sa.Column("workplace_type", sa.String(length=50), server_default="Remote", nullable=False),
        sa.Column("employment_type", sa.String(length=50), server_default="Full-time", nullable=False),
        sa.Column("salary", sa.String(length=100), nullable=False),
        sa.Column("status", sa.String(length=20), server_default="published", nullable=False),
        sa.Column("applicant_count", sa.Integer(), server_default="0", nullable=False),
        sa.Column("views_count", sa.Integer(), server_default="0", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_job_requisitions_company_id", "job_requisitions", ["company_id"])
    op.create_index("ix_job_requisitions_recruiter_id", "job_requisitions", ["recruiter_id"])
    op.create_index("ix_job_requisitions_status", "job_requisitions", ["status"])

    # 2. candidates
    op.create_table(
        "candidates",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("company_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("companies.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(length=150), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=True),
        sa.Column("role", sa.String(length=150), nullable=False),
        sa.Column("location", sa.String(length=150), nullable=True),
        sa.Column("avatar", sa.String(length=500), nullable=True),
        sa.Column("resume_data", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("source", sa.String(length=50), server_default="Direct", nullable=False),
        sa.Column("availability", sa.String(length=50), nullable=True),
        sa.Column("status", sa.String(length=50), server_default="Active", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_candidates_company_id", "candidates", ["company_id"])
    op.create_index("ix_candidates_email", "candidates", ["email"])

    # 3. applications
    op.create_table(
        "applications",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("company_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("companies.id", ondelete="CASCADE"), nullable=False),
        sa.Column("job_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("job_requisitions.id", ondelete="CASCADE"), nullable=False),
        sa.Column("candidate_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False),
        sa.Column("pipeline_stage", sa.String(length=50), server_default="Sourced", nullable=False),
        sa.Column("status", sa.String(length=50), server_default="Active", nullable=False),
        sa.Column("applied_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_applications_company_id", "applications", ["company_id"])
    op.create_index("ix_applications_job_id", "applications", ["job_id"])
    op.create_index("ix_applications_candidate_id", "applications", ["candidate_id"])
    op.create_index("ix_applications_pipeline_stage", "applications", ["pipeline_stage"])

    # 4. application_stage_history
    op.create_table(
        "application_stage_history",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("application_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("applications.id", ondelete="CASCADE"), nullable=False),
        sa.Column("previous_stage", sa.String(length=50), nullable=True),
        sa.Column("new_stage", sa.String(length=50), nullable=False),
        sa.Column("changed_by_user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("reason", sa.Text(), nullable=True),
        sa.Column("changed_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_application_stage_history_application_id", "application_stage_history", ["application_id"])
    op.create_index("ix_application_stage_history_changed_at", "application_stage_history", ["changed_at"])

    # 5. match_results
    op.create_table(
        "match_results",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("application_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("applications.id", ondelete="CASCADE"), nullable=True),
        sa.Column("candidate_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False),
        sa.Column("job_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("job_requisitions.id", ondelete="CASCADE"), nullable=False),
        sa.Column("match_score", sa.Float(), nullable=False),
        sa.Column("confidence", sa.Float(), nullable=False),
        sa.Column("matched_skills", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("missing_skills", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("recommendation", sa.Text(), nullable=False),
        sa.Column("scoring_breakdown", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("algorithm_version", sa.String(length=30), server_default="v1.0-deterministic", nullable=False),
        sa.Column("calculated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_match_results_application_id", "match_results", ["application_id"], unique=True)
    op.create_index("ix_match_results_candidate_id", "match_results", ["candidate_id"])
    op.create_index("ix_match_results_job_id", "match_results", ["job_id"])

    # 6. sourcing_campaigns
    op.create_table(
        "sourcing_campaigns",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("company_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("companies.id", ondelete="CASCADE"), nullable=False),
        sa.Column("created_by_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("job_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("job_requisitions.id", ondelete="CASCADE"), nullable=True),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("criteria", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("status", sa.String(length=20), server_default="active", nullable=False),
        sa.Column("results", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_sourcing_campaigns_company_id", "sourcing_campaigns", ["company_id"])
    op.create_index("ix_sourcing_campaigns_job_id", "sourcing_campaigns", ["job_id"])

    # 7. recruiter_interviews
    op.create_table(
        "recruiter_interviews",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("company_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("companies.id", ondelete="CASCADE"), nullable=False),
        sa.Column("application_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("applications.id", ondelete="CASCADE"), nullable=False),
        sa.Column("candidate_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False),
        sa.Column("job_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("job_requisitions.id", ondelete="CASCADE"), nullable=False),
        sa.Column("interviewer_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("interview_type", sa.String(length=50), server_default="Technical", nullable=False),
        sa.Column("scheduled_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("duration_minutes", sa.Integer(), server_default="45", nullable=False),
        sa.Column("location_url", sa.String(length=500), nullable=True),
        sa.Column("status", sa.String(length=30), server_default="SCHEDULED", nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_recruiter_interviews_company_id", "recruiter_interviews", ["company_id"])
    op.create_index("ix_recruiter_interviews_application_id", "recruiter_interviews", ["application_id"])
    op.create_index("ix_recruiter_interviews_candidate_id", "recruiter_interviews", ["candidate_id"])
    op.create_index("ix_recruiter_interviews_job_id", "recruiter_interviews", ["job_id"])

    # 8. interview_feedbacks
    op.create_table(
        "interview_feedbacks",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("interview_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("recruiter_interviews.id", ondelete="CASCADE"), nullable=False),
        sa.Column("reviewer_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("rating", sa.Float(), nullable=False),
        sa.Column("recommendation", sa.String(length=50), nullable=False),
        sa.Column("strengths", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("weaknesses", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("submitted_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_interview_feedbacks_interview_id", "interview_feedbacks", ["interview_id"])

    # 9. offers
    op.create_table(
        "offers",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("company_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("companies.id", ondelete="CASCADE"), nullable=False),
        sa.Column("application_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("applications.id", ondelete="CASCADE"), nullable=False),
        sa.Column("candidate_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False),
        sa.Column("compensation", sa.String(length=100), nullable=False),
        sa.Column("currency", sa.String(length=10), server_default="USD", nullable=False),
        sa.Column("start_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("expiration_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("status", sa.String(length=30), server_default="DRAFT", nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("issued_by_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("issued_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_offers_company_id", "offers", ["company_id"])
    op.create_index("ix_offers_application_id", "offers", ["application_id"], unique=True)
    op.create_index("ix_offers_candidate_id", "offers", ["candidate_id"])

    # 10. recruiter_settings
    op.create_table(
        "recruiter_settings",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("company_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("companies.id", ondelete="CASCADE"), nullable=False),
        sa.Column("notification_prefs", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("sourcing_prefs", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("dashboard_prefs", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("ai_prefs", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("security_prefs", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_recruiter_settings_user_id", "recruiter_settings", ["user_id"], unique=True)
    op.create_index("ix_recruiter_settings_company_id", "recruiter_settings", ["company_id"])

    # 11. notifications
    op.create_table(
        "notifications",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("company_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("companies.id", ondelete="CASCADE"), nullable=False),
        sa.Column("type", sa.String(length=50), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("resource_type", sa.String(length=50), nullable=True),
        sa.Column("resource_id", sa.String(length=100), nullable=True),
        sa.Column("is_read", sa.Boolean(), server_default="false", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_notifications_user_id", "notifications", ["user_id"])
    op.create_index("ix_notifications_company_id", "notifications", ["company_id"])
    op.create_index("ix_notifications_is_read", "notifications", ["is_read"])
    op.create_index("ix_notifications_created_at", "notifications", ["created_at"])

    # 12. audit_logs extensions
    op.add_column("audit_logs", sa.Column("company_id", postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column("audit_logs", sa.Column("resource_id", sa.String(length=100), nullable=True))
    op.create_index("ix_audit_logs_user_id", "audit_logs", ["user_id"])
    op.create_index("ix_audit_logs_company_id", "audit_logs", ["company_id"])


def downgrade() -> None:
    op.drop_index("ix_audit_logs_company_id", table_name="audit_logs")
    op.drop_index("ix_audit_logs_user_id", table_name="audit_logs")
    op.drop_column("audit_logs", "resource_id")
    op.drop_column("audit_logs", "company_id")

    op.drop_table("notifications")
    op.drop_table("recruiter_settings")
    op.drop_table("offers")
    op.drop_table("interview_feedbacks")
    op.drop_table("recruiter_interviews")
    op.drop_table("sourcing_campaigns")
    op.drop_table("match_results")
    op.drop_table("application_stage_history")
    op.drop_table("applications")
    op.drop_table("candidates")
    op.drop_table("job_requisitions")
