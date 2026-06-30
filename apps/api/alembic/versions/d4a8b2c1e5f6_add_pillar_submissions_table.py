"""add pillar_submissions table for video submissions

Revision ID: d4a8b2c1e5f6
Revises: 2665e6a6fb3e
Create Date: 2026-06-29 17:00:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'd4a8b2c1e5f6'
down_revision: Union[str, None] = '2665e6a6fb3e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('pillar_submissions',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('pillar', sa.String(32), nullable=False),
        sa.Column('video_size', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=True),
        sa.Column('storage_url', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
    )
    op.create_index('ix_pillar_submissions_pillar', 'pillar_submissions', ['pillar'])


def downgrade() -> None:
    op.drop_index('ix_pillar_submissions_pillar', table_name='pillar_submissions')
    op.drop_table('pillar_submissions')
