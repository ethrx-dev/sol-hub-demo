"""Add match_settings table

Revision ID: c9d8e7f6a5b4
Revises: f8e7d6c5b4a3
Create Date: 2026-07-22 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'c9d8e7f6a5b4'
down_revision: Union[str, None] = 'f8e7d6c5b4a3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('match_settings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('sector_weight', sa.Integer(), nullable=False, server_default='10'),
        sa.Column('skill_weight', sa.Integer(), nullable=False, server_default='15'),
        sa.Column('mentor_exact_weight', sa.Integer(), nullable=False, server_default='25'),
        sa.Column('mentor_partial_weight', sa.Integer(), nullable=False, server_default='5'),
        sa.Column('guided_weight', sa.Integer(), nullable=False, server_default='10'),
        sa.Column('quality_threshold', sa.Integer(), nullable=False, server_default='50'),
        sa.Column('ai_enabled', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('ai_weight', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.execute("INSERT INTO match_settings (id, created_at) VALUES (1, NOW())")


def downgrade() -> None:
    op.drop_table('match_settings')
