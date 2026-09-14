"""Alter candidate_id to be nullable for applications table"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'b7c9d2e1f3a4'
down_revision: Union[str, Sequence[str], None] = '41f5e3a9fae8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Make Application.candidate_id nullable."""
    op.alter_column(
        'applications',
        'candidate_id',
        existing_type=sa.dialects.postgresql.UUID(as_uuid=True),
        nullable=True,
    )


def downgrade() -> None:
    """Revert Application.candidate_id to NOT NULL (may fail if NULL rows exist)."""
    op.alter_column(
        'applications',
        'candidate_id',
        existing_type=sa.dialects.postgresql.UUID(as_uuid=True),
        nullable=False,
    )
