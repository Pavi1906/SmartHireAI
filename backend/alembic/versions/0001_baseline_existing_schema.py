"""Baseline existing SmartHireAI database schema.

This migration establishes Alembic history for an existing database.
The schema was already created before the migration history became
unavailable, so this migration intentionally performs no DDL.
"""

from alembic import op


revision = "0001_baseline"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Mark the existing database schema as the initial baseline."""
    pass


def downgrade() -> None:
    """Baseline migration cannot safely destroy the existing schema."""
    pass
