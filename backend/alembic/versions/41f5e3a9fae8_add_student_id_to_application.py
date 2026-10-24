"""add student_id to application

Revision ID: 41f5e3a9fae8
Revises: 0002_recruiter_domain
Create Date: 2026-09-13 12:58:40.780522

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '41f5e3a9fae8'
down_revision: Union[str, Sequence[str], None] = '0002_recruiter_domain'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema: add nullable student_id FK to applications."""
    # Add column
    op.add_column('applications', sa.Column('student_id', sa.dialects.postgresql.UUID(as_uuid=True), sa.ForeignKey('students.id'), nullable=True))
    # Create index for faster look‑ups
    op.create_index('ix_applications_student_id', 'applications', ['student_id'])


def downgrade() -> None:
    """Downgrade schema: remove student_id column and its index."""
    op.drop_index('ix_applications_student_id', table_name='applications')
    op.drop_column('applications', 'student_id')
