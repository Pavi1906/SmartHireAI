"""Initialize foundational tables for a fresh SmartHireAI database.

For an already initialized database, preserve the original baseline behavior.
Refuse to guess how to repair a partially initialized database.
"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

from app.infrastructure.db.models import Base


revision = "0001_baseline"
down_revision = None
branch_labels = None
depends_on = None

FOUNDATION_TABLES = {
    "users",
    "companies",
    "skills",
    "students",
    "recruiters",
    "refresh_tokens",
    "job_descriptions",
    "resumes",
    "placement_scores",
    "interview_sessions",
    "ats_reports",
    "interview_questions",
}

EXPECTED_TABLES = FOUNDATION_TABLES | {"audit_logs"}


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing = set(inspector.get_table_names(schema="public"))
    existing.discard("alembic_version")

    if not existing:
        tables = [
            Base.metadata.tables[name]
            for name in sorted(FOUNDATION_TABLES)
        ]
        Base.metadata.create_all(bind=bind, tables=tables, checkfirst=True)

        op.create_table(
            "audit_logs",
            sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
            sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=True),
            sa.Column("action", sa.String(length=100), nullable=False),
            sa.Column("resource", sa.String(length=100), nullable=False),
            sa.Column("metadata_json", postgresql.JSONB(), nullable=True),
            sa.Column("ip_address", sa.String(length=45), nullable=True),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                nullable=True,
            ),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index(
            "ix_audit_logs_created_at",
            "audit_logs",
            ["created_at"],
        )
        return

    if EXPECTED_TABLES.issubset(existing):
        return

    raise RuntimeError(
        "Refusing to initialize a partially populated database. "
        f"Existing public tables: {sorted(existing)}"
    )


def downgrade() -> None:
    """Do not destructively remove foundational tables."""
    pass
