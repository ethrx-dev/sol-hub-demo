"""Add mentor_type to pillar_submissions

Revision ID: f8e7d6c5b4a3
Revises: bacd16a8022d
Create Date: 2026-07-15 14:30:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f8e7d6c5b4a3'
down_revision = 'bacd16a8022d'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('pillar_submissions', sa.Column('mentor_type', sa.String(32), nullable=True))


def downgrade() -> None:
    op.drop_column('pillar_submissions', 'mentor_type')