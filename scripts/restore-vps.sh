#!/usr/bin/env bash
set -euo pipefail

# ─── SOL Hub VPS Restore Script ──────────────────────────────────────────
# Restores a full SOL Hub backup created by backup-vps.sh.
#
# Usage:
#   ./scripts/restore-vps.sh <backup-archive>
#
# Example:
#   ./scripts/restore-vps.sh ./backups/solhub-backup-20260708_120000.tar.gz
#
# ─── DANGER ZONE ──────────────────────────────────────────────────────────
# This will OVERWRITE the current database, MinIO data, and Redis data.
# ──────────────────────────────────────────────────────────────────────────

if [ $# -lt 1 ]; then
  echo "Usage: $0 <backup-archive>"
  exit 1
fi

ARCHIVE="$1"
if [ ! -f "$ARCHIVE" ]; then
  echo "Error: Archive not found: $ARCHIVE"
  exit 1
fi

cd "$(dirname "$0")/.." || exit 1
PROJECT_ROOT=$(pwd)
TMP_DIR=$(mktemp -d)
trap 'rm -rf "$TMP_DIR"' EXIT

echo "=== SOL Hub VPS Restore ==="
echo "Archive:      $ARCHIVE"
echo "Project root: $PROJECT_ROOT"
echo ""

echo "Extracting archive..."
tar -xzf "$ARCHIVE" -C "$TMP_DIR"

echo "Contents:"
ls -lh "$TMP_DIR"
echo ""

# ── Prompt for confirmation ───────────────────────────────────────────────
read -r -p "WARNING: This will OVERWRITE database, MinIO, and Redis data. Continue? [y/N] " CONFIRM
if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
  echo "Restore cancelled."
  exit 0
fi

# ── 1. Restore PostgreSQL ─────────────────────────────────────────────────
if [ -f "$TMP_DIR/database.sql" ]; then
  echo "[1/4] Restoring PostgreSQL database..."
  DB_CONTAINER=$(docker ps --format '{{.Names}}' | grep postgres | head -1 || true)
  if [ -n "$DB_CONTAINER" ]; then
    docker cp "$TMP_DIR/database.sql" "${DB_CONTAINER}:/tmp/restore.sql"
    docker exec "$DB_CONTAINER" sh -c "
      psql --username=${PGUSER:-solhub} --dbname=${PGDATABASE:-solhub} -f /tmp/restore.sql
    " 2>&1 && echo "  Done: database restored" || echo "  WARNING: psql had errors (see above)"
    docker exec "$DB_CONTAINER" rm -f /tmp/restore.sql
  else
    echo "  WARNING: No postgres container — skipping"
  fi
else
  echo "[1/4] No database dump found — skipping"
fi

# ── 2. Restore MinIO / S3 Storage ─────────────────────────────────────────
if [ -d "$TMP_DIR/minio" ] && [ "$(find "$TMP_DIR/minio" -type f 2>/dev/null | wc -l)" -gt 0 ]; then
  echo "[2/4] Restoring MinIO object storage..."
  MINIO_CONTAINER=$(docker ps --format '{{.Names}}' | grep minio | head -1 || true)
  if [ -n "$MINIO_CONTAINER" ]; then
    S3_BUCKET="${S3_BUCKET:-solhub}"
    docker cp "$TMP_DIR/minio/." "${MINIO_CONTAINER}:/tmp/solhub-minio-restore/"
    docker exec "$MINIO_CONTAINER" sh -c "
      mc alias delete local 2>/dev/null || true
      mc alias set local http://localhost:9000 ${S3_ACCESS_KEY:-minioadmin} ${S3_SECRET_KEY:-minioadmin} >/dev/null 2>&1
      mc mb local/${S3_BUCKET} --ignore-existing >/dev/null 2>&1
      mc mirror --overwrite /tmp/solhub-minio-restore local/${S3_BUCKET}
    " 2>&1 && echo "  Done: restored to bucket '$S3_BUCKET'" || echo "  WARNING: MinIO restore had errors"
    docker exec "$MINIO_CONTAINER" rm -rf /tmp/solhub-minio-restore
  else
    echo "  WARNING: No minio container — skipping"
  fi
else
  echo "[2/4] No MinIO backup found — skipping"
fi

# ── 3. Restore Redis ──────────────────────────────────────────────────────
if [ -f "$TMP_DIR/redis-dump.rdb" ]; then
  echo "[3/4] Restoring Redis..."
  REDIS_CONTAINER=$(docker ps --format '{{.Names}}' | grep redis | head -1 || true)
  if [ -n "$REDIS_CONTAINER" ]; then
    # Stop Redis, replace dump, restart
    docker exec "$REDIS_CONTAINER" redis-cli SHUTDOWN NOSAVE >/dev/null 2>&1 || true
    docker cp "$TMP_DIR/redis-dump.rdb" "${REDIS_CONTAINER}:/data/dump.rdb"
    docker start "$REDIS_CONTAINER" >/dev/null 2>&1 || \
      docker restart "$REDIS_CONTAINER" >/dev/null 2>&1
    echo "  Done: Redis restored and restarted"
  else
    echo "  WARNING: No redis container — skipping"
  fi
else
  echo "[3/4] No Redis backup found — skipping"
fi

# ── 4. Restore Environment Files ──────────────────────────────────────────
if [ -d "$TMP_DIR/env" ]; then
  echo "[4/4] Restoring environment files..."
  find "$TMP_DIR/env" -type f | while read -r f; do
    rel_path="${f#$TMP_DIR/env/}"
    target="$PROJECT_ROOT/$rel_path"
    mkdir -p "$(dirname "$target")"
    cp "$f" "$target"
    echo "  $rel_path"
  done
else
  echo "[4/4] No env files found — skipping"
fi

# ── Done ──────────────────────────────────────────────────────────────────
echo ""
echo "=== Restore Complete ==="
echo ""
echo "Next steps:"
echo "  1. Restart the API server:"
echo "     pkill -f uvicorn; cd apps/api && .venv/bin/python3 -m uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload"
echo "  2. Restart the frontend:"
echo "     pkill -f 'next dev'; cd apps/web && npx next dev -p 3000"
echo "  3. Verify:"
echo "     curl http://localhost:8000/api/health"
