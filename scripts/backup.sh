#!/usr/bin/env bash
set -euo pipefail

# ─── SOL Hub Backup Script ───────────────────────────────────────────────
# Creates a timestamped backup of the full SOL Hub application:
#   - PostgreSQL database (pg_dump)
#   - MinIO/S3 object storage
#   - Environment files (.env)
#   - Application code (via git archive or full copy)
#
# Usage:
#   ./scripts/backup.sh                    # saves to ./backups/
#   ./scripts/backup.sh /custom/path       # saves to custom path
#
# Restore with: ./scripts/restore.sh <backup-archive>
# ──────────────────────────────────────────────────────────────────────────

cd "$(dirname "$0")/.." || exit 1
PROJECT_ROOT=$(pwd)
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="${1:-${PROJECT_ROOT}/backups}"
ARCHIVE_NAME="solhub-backup-${TIMESTAMP}.tar.gz"
TMP_DIR=$(mktemp -d)
trap 'rm -rf "$TMP_DIR"' EXIT

echo "=== SOL Hub Backup ==="
echo "Project root: $PROJECT_ROOT"
echo "Backup dir:   $BACKUP_DIR"
echo "Timestamp:    $TIMESTAMP"
echo ""

mkdir -p "$BACKUP_DIR"

# ── 1. PostgreSQL Dump ─────────────────────────────────────────────────────
echo "[1/4] Dumping PostgreSQL database..."
DB_CONTAINER="docker-postgres-1"
DB_NAME="${PGDATABASE:-solhub}"
DB_USER="${PGUSER:-solhub}"

if docker ps --format '{{.Names}}' | grep -q "^${DB_CONTAINER}$"; then
  docker exec "$DB_CONTAINER" pg_dump \
    --username="$DB_USER" \
    --dbname="$DB_NAME" \
    --clean \
    --if-exists \
    --no-owner \
    --no-privileges \
    --file="/tmp/solhub-db.sql" 2>/dev/null
  docker cp "$DB_CONTAINER:/tmp/solhub-db.sql" "$TMP_DIR/database.sql"
  docker exec "$DB_CONTAINER" rm -f /tmp/solhub-db.sql
  echo "  Done: database dump ($(wc -c < "$TMP_DIR/database.sql") bytes)"
else
  echo "  WARNING: Container '$DB_CONTAINER' not running — skipping database dump"
  echo "  If PostgreSQL is running locally, install pg_dump and dump manually."
fi

# ── 2. MinIO / S3 Storage ──────────────────────────────────────────────────
echo "[2/4] Backing up MinIO object storage..."
MINIO_CONTAINER="docker-minio-1"

if docker ps --format '{{.Names}}' | grep -q "^${MINIO_CONTAINER}$"; then
  # Auto-detect the first non-empty bucket
  S3_BUCKET=$(docker exec "$MINIO_CONTAINER" sh -c "
    mc alias delete local 2>/dev/null || true
    mc alias set local http://localhost:9000 minioadmin minioadmin >/dev/null 2>&1
    mc ls local/ | grep -v '0B$' | head -1 | awk '{print \$NF}' | tr -d '/'
  " 2>/dev/null || echo "")

  if [ -z "$S3_BUCKET" ]; then
    echo "  WARNING: No MinIO buckets found with data — skipping storage backup"
  else
    mkdir -p "$TMP_DIR/minio"
    echo "  Bucket detected: $S3_BUCKET"
    if docker exec "$MINIO_CONTAINER" sh -c "
      mc mirror --overwrite local/${S3_BUCKET} /tmp/solhub-minio-backup
    " >/dev/null 2>&1; then
      docker cp "$MINIO_CONTAINER:/tmp/solhub-minio-backup/." "$TMP_DIR/minio/" 2>/dev/null
      docker exec "$MINIO_CONTAINER" rm -rf /tmp/solhub-minio-backup
      count=$(find "$TMP_DIR/minio" -type f 2>/dev/null | wc -l)
      echo "  Done: $count objects backed up"
    else
      echo "  WARNING: MinIO backup failed (bucket may be empty or inaccessible)"
    fi
  fi
else
  echo "  WARNING: Container '$MINIO_CONTAINER' not running — skipping storage backup"
fi

# ── 3. Environment Files ───────────────────────────────────────────────────
echo "[3/4] Copying environment files..."
mkdir -p "$TMP_DIR/env"
for f in .env .env.example apps/api/.env apps/api/.env.example apps/web/.env apps/web/.env.example; do
  if [ -f "$PROJECT_ROOT/$f" ]; then
    mkdir -p "$TMP_DIR/env/$(dirname "$f")"
    cp "$PROJECT_ROOT/$f" "$TMP_DIR/env/$f"
    echo "  $f"
  fi
done

# ── 4. Application Code ────────────────────────────────────────────────────
echo "[4/4] Snapshotting application code..."
if git rev-parse --git-dir >/dev/null 2>&1; then
  git archive --format=tar.gz \
    --output="$TMP_DIR/code.tar.gz" \
    --prefix="solhub-code/" \
    HEAD
  mkdir -p "$TMP_DIR/code"
  tar -xzf "$TMP_DIR/code.tar.gz" -C "$TMP_DIR/code/"
  rm "$TMP_DIR/code.tar.gz"
  echo "  Done: git archive at $(git rev-parse --short HEAD)"
else
  echo "  Not a git repository — copying project files..."
  rsync -a --quiet \
    --exclude='node_modules' --exclude='.next' --exclude='.venv' \
    --exclude='__pycache__' --exclude='*.pyc' --exclude='.git' \
    --exclude='backups' \
    "$PROJECT_ROOT/" "$TMP_DIR/code/"
  echo "  Done: full copy (excluding node_modules, .next, .venv)"
fi

# ── 5. Create Archive ─────────────────────────────────────────────────────
echo ""
echo "Creating archive..."
tar -czf "$BACKUP_DIR/$ARCHIVE_NAME" -C "$TMP_DIR" .
echo ""
echo "=== Backup Complete ==="
echo "Archive: $BACKUP_DIR/$ARCHIVE_NAME"
echo "Size:    $(du -h "$BACKUP_DIR/$ARCHIVE_NAME" | cut -f1)"
echo ""
echo "To restore: ./scripts/restore.sh $BACKUP_DIR/$ARCHIVE_NAME"
