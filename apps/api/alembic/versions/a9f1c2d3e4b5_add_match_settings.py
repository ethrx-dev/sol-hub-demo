"""Add match_settings table for admin-configurable weighting

Revision ID: a9f1c2d3e4b5
Revises: 91faaf5502c0
Create Date: 2026-07-19 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a9f1c2d3e4b5'
down_revision: Union[str, None] = 'f8e7d6c5b4a3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'match_settings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('sector_weight', sa.Integer(), nullable=False),
        sa.Column('skill_weight', sa.Integer(), nullable=False),
        sa.Column('mentor_exact_weight', sa.Integer(), nullable=False),
        sa.Column('mentor_partial_weight', sa.Integer(), nullable=False),
        sa.Column('guided_weight', sa.Integer(), nullable=False),
        sa.Column('quality_threshold', sa.Integer(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )
    # Seed the singleton defaults row (id=1).
    op.execute(
        "INSERT INTO match_settings "
        "(id, sector_weight, skill_weight, mentor_exact_weight, "
        "mentor_partial_weight, guided_weight, quality_threshold, updated_at) "
        "VALUES (1, 25, 20, 30, 10, 25, 70, now())"
    )


def downgrade() -> None:
    op.execute("DELETE FROM match_settings WHERE id = 1")
    op.drop_table('match_settings')
