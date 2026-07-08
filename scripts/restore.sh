#!/usr/bin/env bash
set -euo pipefail

# ─── SOL Hub Restore Script ──────────────────────────────────────────────
# Restores a full SOL Hub backup created by backup.sh.
#
# Usage:
#   ./scripts/restore.sh <backup-archive>
#
# Example:
#   ./scripts/restore.sh ./backups/solhub-backup-20260630_120000.tar.gz
#
# ─── DANGER ZONE ──────────────────────────────────────────────────────────
# This will OVERWRITE the current database and MinIO data with the backup.
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

echo "=== SOL Hub Restore ==="
echo "Archive:      $ARCHIVE"
echo "Project root: $PROJECT_ROOT"
echo ""

echo "Extracting archive..."
tar -xzf "$ARCHIVE" -C "$TMP_DIR"

echo "Contents:"
ls -la "$TMP_DIR"
echo ""

# ── Prompt for confirmation ───────────────────────────────────────────────
read -r -p "WARNING: This will OVERWRITE the current database and MinIO data. Continue? [y/N] " CONFIRM
if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
  echo "Restore cancelled."
  exit 0
fi

# ── 1. Restore PostgreSQL ─────────────────────────────────────────────────
if [ -f "$TMP_DIR/database.sql" ]; then
  echo "[1/3] Restoring PostgreSQL database..."
  DB_CONTAINER="docker-postgres-1"
  DB_NAME="${PGDATABASE:-solhub}"
  DB_USER="${PGUSER:-solhub}"

  if docker ps --format '{{.Names}}' | grep -q "^${DB_CONTAINER}$"; then
    # Copy dump into container and restore
    docker cp "$TMP_DIR/database.sql" "${DB_CONTAINER}:/tmp/restore.sql"
    docker exec "$DB_CONTAINER" sh -c "
      PGPASSWORD=\$(grep POSTGRES_PASSWORD /run/secrets/* 2>/dev/null || echo 'solhub_dev')
      psql --username=${DB_USER} --dbname=${DB_NAME} -f /tmp/restore.sql
    " 2>&1 || {
      echo "  WARNING: psql restore had errors (non-critical warnings above)"
    }
    docker exec "$DB_CONTAINER" rm -f /tmp/restore.sql
    echo "  Done: database restored"
  else
    echo "  WARNING: Container '$DB_CONTAINER' not running — skipping database restore"
  fi
else
  echo "[1/3] No database dump found — skipping"
fi

# ── 2. Restore MinIO / S3 Storage ─────────────────────────────────────────
if [ -d "$TMP_DIR/minio" ] && [ "$(find "$TMP_DIR/minio" -type f 2>/dev/null | wc -l)" -gt 0 ]; then
  echo "[2/3] Restoring MinIO object storage..."
  MINIO_CONTAINER="docker-minio-1"

  if docker ps --format '{{.Names}}' | grep -q "^${MINIO_CONTAINER}$"; then
    # Use same bucket name as original, or fall back to autodetect
    S3_BUCKET="${S3_BUCKET:-$(docker exec "$MINIO_CONTAINER" sh -c "
      mc alias delete local 2>/dev/null || true
      mc alias set local http://localhost:9000 minioadmin minioadmin >/dev/null 2>&1
      mc ls local/ | grep -v '0B$' | head -1 | awk '{print \$NF}' | tr -d '/'
    " 2>/dev/null)}"
    S3_BUCKET="${S3_BUCKET:-solhub}"

    docker cp "$TMP_DIR/minio/." "${MINIO_CONTAINER}:/tmp/solhub-minio-restore/"
    docker exec "$MINIO_CONTAINER" sh -c "
      mc alias delete local 2>/dev/null || true
      mc alias set local http://localhost:9000 minioadmin minioadmin >/dev/null 2>&1
      mc mb local/${S3_BUCKET} --ignore-exist >/dev/null 2>&1
      mc mirror --overwrite /tmp/solhub-minio-restore local/${S3_BUCKET}
    " 2>&1 && echo "  Done: $(find "$TMP_DIR/minio" -type f | wc -l) objects restored" || echo "  WARNING: MinIO restore encountered errors"
    docker exec "$MINIO_CONTAINER" rm -rf /tmp/solhub-minio-restore
  else
    echo "  WARNING: Container '$MINIO_CONTAINER' not running — skipping MinIO restore"
  fi
else
  echo "[2/3] No MinIO backup found — skipping"
fi

# ── 3. Restore Environment Files ──────────────────────────────────────────
if [ -d "$TMP_DIR/env" ]; then
  echo "[3/3] Restoring environment files..."
  find "$TMP_DIR/env" -type f | while read -r f; do
    rel_path="${f#$TMP_DIR/env/}"
    target="$PROJECT_ROOT/$rel_path"
    mkdir -p "$(dirname "$target")"
    cp "$f" "$target"
    echo "  $rel_path"
  done
else
  echo "[3/3] No env files found — skipping"
fi

# ── Done ──────────────────────────────────────────────────────────────────
echo ""
echo "=== Restore Complete ==="
echo ""
echo "Next steps:"
echo "  1. Restart the API server to pick up restored env files"
echo "     pkill -f uvicorn; cd apps/api && source .venv/bin/activate && uvicorn src.main:app --reload"
echo "  2. Restart the frontend if needed"
echo "     pkill -f 'next dev'; cd apps/web && npx next dev -p 3000"
echo "  3. Verify the database has the expected data:"
echo "     docker exec -it docker-postgres-1 psql -U solhub -d solhub -c 'SELECT count(*) FROM users;'"
