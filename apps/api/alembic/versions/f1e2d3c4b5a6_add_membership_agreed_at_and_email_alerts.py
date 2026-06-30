"""add membership_agreed_at and email_alerts to users

Revision ID: f1e2d3c4b5a6
Revises: d4a8b2c1e5f6
Create Date: 2026-06-29 18:00:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'f1e2d3c4b5a6'
down_revision: Union[str, None] = 'd4a8b2c1e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('membership_agreed_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('users', sa.Column('email_alerts', sa.Boolean(), nullable=False, server_default=sa.text('false')))


def downgrade() -> None:
    op.drop_column('users', 'email_alerts')
    op.drop_column('users', 'membership_agreed_at')
