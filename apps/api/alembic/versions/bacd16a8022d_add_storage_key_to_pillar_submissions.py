"""add_storage_key_to_pillar_submissions

Revision ID: bacd16a8022d
Revises: f1e2d3c4b5a6
Create Date: 2026-06-30 11:34:32.749562

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'bacd16a8022d'
down_revision: Union[str, None] = 'f1e2d3c4b5a6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('pillar_submissions', sa.Column('storage_key', sa.String(length=255), nullable=True))


def downgrade() -> None:
    op.drop_column('pillar_submissions', 'storage_key')
