"""add is_super_admin to users

Revision ID: c8d9f0e1a2b3
Revises: b7c9a8e3f1d2
Create Date: 2026-06-27 12:00:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'c8d9f0e1a2b3'
down_revision: Union[str, None] = 'b7c9a8e3f1d2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('is_super_admin', sa.Boolean(), nullable=False, server_default=sa.text('false')))


def downgrade() -> None:
    op.drop_column('users', 'is_super_admin')
