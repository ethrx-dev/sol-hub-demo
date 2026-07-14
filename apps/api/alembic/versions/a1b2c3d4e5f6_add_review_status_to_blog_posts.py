"""Add review_status fields to blog_posts

Revision ID: a1b2c3d4e5f6
Revises: fdcd563cdcde
Create Date: 2026-07-11
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "a1b2c3d4e5f6"
down_revision = "91faaf5502c0"
branch_labels = None
depends_on = None


def upgrade():
    review_status_enum = sa.Enum("none", "pending_review", "approved", "rejected", name="reviewstatus")
    review_status_enum.create(op.get_bind())
    op.add_column("blog_posts", sa.Column("review_status", review_status_enum, nullable=False, server_default="none"))
    op.add_column("blog_posts", sa.Column("review_notes", sa.Text(), nullable=True))
    op.add_column("blog_posts", sa.Column("reviewed_by_id", postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column("blog_posts", sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True))
    op.create_foreign_key(None, "blog_posts", "users", ["reviewed_by_id"], ["id"])


def downgrade():
    op.drop_constraint(None, "blog_posts", type_="foreignkey")
    op.drop_column("blog_posts", "reviewed_at")
    op.drop_column("blog_posts", "reviewed_by_id")
    op.drop_column("blog_posts", "review_notes")
    op.drop_column("blog_posts", "review_status")
    sa.Enum(name="reviewstatus").drop(op.get_bind())
