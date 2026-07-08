#!/usr/bin/env bash
set -euo pipefail

# ─── SOL Hub VPS Backup Script ───────────────────────────────────────────
# Creates a timestamped backup of the SOL Hub application on the sol.machine VPS:
#   - PostgreSQL database (pg_dump via Docker)
#   - MinIO/S3 object storage (mc mirror via Docker)
#   - Redis RDB snapshot (docker cp)
#   - Environment files (.env)
#   - Application code (git archive)
#
# Usage:
#   ./scripts/backup-vps.sh                    # saves to ./backups/
#   ./scripts/backup-vps.sh /custom/path       # saves to custom path
#
# Restore with: ./scripts/restore-vps.sh <backup-archive>
# ──────────────────────────────────────────────────────────────────────────

cd "$(dirname "$0")/.." || exit 1
PROJECT_ROOT=$(pwd)
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="${1:-${PROJECT_ROOT}/backups}"
ARCHIVE_NAME="solhub-backup-${TIMESTAMP}.tar.gz"
TMP_DIR=$(mktemp -d)
trap 'rm -rf "$TMP_DIR"' EXIT

echo "=== SOL Hub VPS Backup ==="
echo "Host:         $(hostname)"
echo "Project root: $PROJECT_ROOT"
echo "Backup dir:   $BACKUP_DIR"
echo "Timestamp:    $TIMESTAMP"
echo ""

mkdir -p "$BACKUP_DIR"

# ── 1. PostgreSQL Dump ─────────────────────────────────────────────────────
echo "[1/5] Dumping PostgreSQL database..."
DB_CONTAINER=$(docker ps --format '{{.Names}}' | grep postgres | head -1 || true)
if [ -n "$DB_CONTAINER" ]; then
  docker exec "$DB_CONTAINER" pg_dump \
    --username="${PGUSER:-solhub}" \
    --dbname="${PGDATABASE:-solhub}" \
    --clean --if-exists --no-owner --no-privileges \
    --file=/tmp/solhub-db.sql 2>/dev/null
  docker cp "$DB_CONTAINER:/tmp/solhub-db.sql" "$TMP_DIR/database.sql"
  docker exec "$DB_CONTAINER" rm -f /tmp/solhub-db.sql
  echo "  Done: $(wc -c < "$TMP_DIR/database.sql") bytes"
else
  echo "  WARNING: No postgres container running — skipping db dump"
fi

# ── 2. MinIO / S3 Storage ──────────────────────────────────────────────────
echo "[2/5] Backing up MinIO object storage..."
MINIO_CONTAINER=$(docker ps --format '{{.Names}}' | grep minio | head -1 || true)
S3_BUCKET="${S3_BUCKET:-solhub}"

if [ -n "$MINIO_CONTAINER" ]; then
  mkdir -p "$TMP_DIR/minio"
  if docker exec "$MINIO_CONTAINER" sh -c "
    mc alias delete local 2>/dev/null || true
    mc alias set local http://localhost:9000 ${S3_ACCESS_KEY:-minioadmin} ${S3_SECRET_KEY:-minioadmin} >/dev/null 2>&1
    mc mb local/${S3_BUCKET} --ignore-exist >/dev/null 2>&1
    mc mirror --overwrite local/${S3_BUCKET} /tmp/solhub-minio-snap
  " >/dev/null 2>&1; then
    docker cp "$MINIO_CONTAINER:/tmp/solhub-minio-snap/." "$TMP_DIR/minio/" 2>/dev/null
    docker exec "$MINIO_CONTAINER" rm -rf /tmp/solhub-minio-snap
    count=$(find "$TMP_DIR/minio" -type f 2>/dev/null | wc -l)
    echo "  Done: $count objects from bucket '$S3_BUCKET'"
  else
    echo "  WARNING: MinIO mirror failed — bucket may be empty"
  fi
else
  echo "  WARNING: No minio container running — skipping storage backup"
fi

# ── 3. Redis RDB Snapshot ──────────────────────────────────────────────────
echo "[3/5] Backing up Redis..."
REDIS_CONTAINER=$(docker ps --format '{{.Names}}' | grep redis | head -1 || true)
if [ -n "$REDIS_CONTAINER" ]; then
  docker exec "$REDIS_CONTAINER" redis-cli SAVE >/dev/null 2>&1
  docker cp "$REDIS_CONTAINER:/data/dump.rdb" "$TMP_DIR/redis-dump.rdb" 2>/dev/null || \
    echo "  WARNING: Redis RDB snapshot failed"
  echo "  Done: $(wc -c < "$TMP_DIR/redis-dump.rdb" 2>/dev/null || echo '0') bytes"
else
  echo "  WARNING: No redis container running — skipping redis backup"
fi

# ── 4. Environment Files ───────────────────────────────────────────────────
echo "[4/5] Copying environment files..."
mkdir -p "$TMP_DIR/env"
for f in apps/api/.env apps/web/.env apps/api/.env.example apps/web/.env.example; do
  if [ -f "$PROJECT_ROOT/$f" ]; then
    mkdir -p "$TMP_DIR/env/$(dirname "$f")"
    cp "$PROJECT_ROOT/$f" "$TMP_DIR/env/$f"
    echo "  $f"
  fi
done

# ── 5. Application Code ────────────────────────────────────────────────────
echo "[5/5] Snapshotting application code..."
if git -C "$PROJECT_ROOT" rev-parse --git-dir >/dev/null 2>&1; then
  COMMIT=$(git -C "$PROJECT_ROOT" rev-parse --short HEAD)
  BRANCH=$(git -C "$PROJECT_ROOT" rev-parse --abbrev-ref HEAD)
  git -C "$PROJECT_ROOT" archive --format=tar.gz --prefix="solhub-code/" HEAD > "$TMP_DIR/code.tar.gz"
  mkdir -p "$TMP_DIR/code"
  tar -xzf "$TMP_DIR/code.tar.gz" -C "$TMP_DIR/code/"
  rm "$TMP_DIR/code.tar.gz"
  echo "  Done: branch=$BRANCH commit=$COMMIT"
else
  echo "  Not a git repository — copying project tree..."
  rsync -a --quiet \
    --exclude='node_modules' --exclude='.next' --exclude='.venv' \
    --exclude='__pycache__' --exclude='*.pyc' --exclude='.git' \
    --exclude='backups' \
    "$PROJECT_ROOT/" "$TMP_DIR/code/"
  echo "  Done"
fi

# ── 6. Create Archive ──────────────────────────────────────────────────────
echo ""
echo "Creating archive..."
tar -czf "$BACKUP_DIR/$ARCHIVE_NAME" -C "$TMP_DIR" .
echo ""
echo "=== Backup Complete ==="
echo "Archive: $BACKUP_DIR/$ARCHIVE_NAME"
echo "Size:    $(du -h "$BACKUP_DIR/$ARCHIVE_NAME" | cut -f1)"
echo ""
echo "To restore: ./scripts/restore-vps.sh $BACKUP_DIR/$ARCHIVE_NAME"
