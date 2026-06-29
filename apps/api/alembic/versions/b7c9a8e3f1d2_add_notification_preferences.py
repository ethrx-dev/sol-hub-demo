"""add notification_preferences

Revision ID: b7c9a8e3f1d2
Revises: a7dfb9ac7ccf
Create Date: 2026-06-27 10:00:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID


revision: str = 'b7c9a8e3f1d2'
down_revision: Union[str, None] = 'a7dfb9ac7ccf'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('notification_preferences',
        sa.Column('id', UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', UUID(as_uuid=True), nullable=False),
        sa.Column('matches', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('messages', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('milestones', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('activity', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('email_matches', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('email_messages', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('email_milestones', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('email_activity', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id'),
    )


def downgrade() -> None:
    op.drop_table('notification_preferences')
