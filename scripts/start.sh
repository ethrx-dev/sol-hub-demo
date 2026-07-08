#!/usr/bin/env bash
set -euo pipefail

# ─── SOL Hub Startup Script ───────────────────────────────────────────────
# Starts all services for the SOL Hub application.
#
# Usage:
#   ./scripts/start.sh                    # development mode (Docker infra + host API/web)
#   ./scripts/start.sh --docker           # everything in Docker
#   ./scripts/start.sh --production       # production mode (Docker + no reload)
#
# Restore with: ./scripts/restore.sh <backup-archive>
# ──────────────────────────────────────────────────────────────────────────

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CERT_DIR="$ROOT/apps/web/certificates"
MODE="${1:-dev}"

echo "=== SOL Hub Startup ==="
echo "Mode: $MODE"
echo ""

# ── 1. Docker Infrastructure ──────────────────────────────────────────────
echo "[1/4] Starting Docker infrastructure (PostgreSQL, Redis, MinIO)..."
cd "$ROOT/docker"
docker compose up -d postgres redis minio 2>/dev/null || docker compose up -d

echo "  Waiting for PostgreSQL..."
for i in $(seq 1 30); do
  if docker compose exec -T postgres pg_isready -U solhub >/dev/null 2>&1; then
    echo "  PostgreSQL is ready."
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "  ERROR: PostgreSQL failed to start within 60 seconds"
    exit 1
  fi
  sleep 2
done

echo "  Waiting for Redis..."
for i in $(seq 1 15); do
  if docker compose exec -T redis redis-cli ping >/dev/null 2>&1; then
    echo "  Redis is ready."
    break
  fi
  if [ "$i" -eq 15 ]; then
    echo "  ERROR: Redis failed to start within 30 seconds"
    exit 1
  fi
  sleep 2
done

echo "  Waiting for MinIO..."
for i in $(seq 1 15); do
  if curl -s -o /dev/null http://localhost:9000/minio/health/live 2>/dev/null; then
    echo "  MinIO is ready."
    break
  fi
  if [ "$i" -eq 15 ]; then
    echo "  ERROR: MinIO failed to start within 30 seconds"
    exit 1
  fi
  sleep 2
done

# ── 2. Docker Compose Build (if needed) ───────────────────────────────────
if [ "$MODE" = "--docker" ] || [ "$MODE" = "--production" ]; then
  echo "[2/4] Building & starting Docker services (API, Worker, Web)..."
  cd "$ROOT/docker"
  if [ "$MODE" = "--production" ]; then
    docker compose up -d --build
  else
    docker compose up -d --build api worker web
  fi
  echo "  All Docker services started."
  echo ""
  echo "=== All services running in Docker ==="
  echo "  PostgreSQL  →  port 5432"
  echo "  Redis       →  port 6379"
  echo "  MinIO       →  ports 9000 (API) / 9001 (Console)"
  echo "  API         →  http://localhost:8000"
  echo "  Worker      →  celery (background)"
  echo "  Web         →  http://localhost:3000"
  echo ""
  echo "To stop:  cd docker && docker compose down"
  exit 0
fi

# ── 3. Python Virtual Environment ─────────────────────────────────────────
echo "[2/4] Setting up Python environment..."
cd "$ROOT/apps/api"
if [ ! -d ".venv" ]; then
  python3 -m venv .venv
  echo "  Created virtual environment."
fi
source .venv/bin/activate
pip install -r requirements.txt -q 2>/dev/null || true
echo "  Python environment ready."

# ── 4. Kill any existing processes ────────────────────────────────────────
echo "[3/4] Stopping any existing API/Web processes..."
pkill -f "uvicorn src.main:app" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
sleep 1
echo "  Clean."

# ── 5. Start API (host) ──────────────────────────────────────────────────
echo "[4/4] Starting API server..."
cd "$ROOT/apps/api"
nohup .venv/bin/python3 -m uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload \
  > /tmp/solhub-api.log 2>&1 &
API_PID=$!
echo "  API → http://localhost:8000  (pid $API_PID)"

# ── 6. Generate HTTPS certs (if missing) ──────────────────────────────────
if [ ! -f "$CERT_DIR/localhost.pem" ]; then
  mkdir -p "$CERT_DIR"
  IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "127.0.0.1")
  openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout "$CERT_DIR/localhost-key.pem" \
    -out "$CERT_DIR/localhost.pem" \
    -subj "/CN=localhost" \
    -addext "subjectAltName=DNS:localhost,IP:${IP}" 2>/dev/null
  echo "  Generated self-signed HTTPS certificates."
fi

# ── 7. Start Web (host) ───────────────────────────────────────────────────
echo "  Starting frontend (HTTPS)..."
cd "$ROOT/apps/web"
nohup npx next dev -p 3000 --experimental-https \
  --experimental-https-key "$CERT_DIR/localhost-key.pem" \
  --experimental-https-cert "$CERT_DIR/localhost.pem" \
  > /tmp/solhub-web.log 2>&1 &
WEB_PID=$!
echo "  Web → https://localhost:3000  (pid $WEB_PID)"

# ── 8. Verify startup ─────────────────────────────────────────────────────
echo ""
echo "  Waiting for API..."
for i in $(seq 1 15); do
  if curl -s -o /dev/null http://localhost:8000/api/health 2>/dev/null; then
    echo "  API is ready."
    break
  fi
  if [ "$i" -eq 15 ]; then
    echo "  WARNING: API did not respond within 30 seconds. Check /tmp/solhub-api.log"
  fi
  sleep 2
done

echo "  Waiting for Web..."
for i in $(seq 1 30); do
  if curl -sk -o /dev/null https://localhost:3000 2>/dev/null; then
    echo "  Web is ready."
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "  WARNING: Web did not respond within 60 seconds. Check /tmp/solhub-web.log"
  fi
  sleep 2
done

# ── Summary ──────────────────────────────────────────────────────────────
IP_ADDR=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "localhost")
echo ""
echo "=== SOL Hub Services Running ==="
echo "  PostgreSQL  →  docker (port 5432)"
echo "  Redis       →  docker (port 6379)"
echo "  MinIO       →  http://localhost:9000  (port 9000)"
echo "  API         →  http://localhost:8000  (pid $API_PID)"
echo "  Frontend    →  https://localhost:3000  (pid $WEB_PID)"
echo "  Network     →  https://${IP_ADDR}:3000"
echo ""
echo "Logs:"
echo "  API   →  tail -f /tmp/solhub-api.log"
echo "  Web   →  tail -f /tmp/solhub-web.log"
echo ""
echo "To stop all:  ./scripts/stop.sh"

# ── Trap for Ctrl+C (development mode) ────────────────────────────────────
trap "echo 'Shutting down...'; kill $API_PID $WEB_PID 2>/dev/null; cd $ROOT/docker && docker compose stop postgres redis minio 2>/dev/null; echo 'All services stopped.'; exit" INT TERM
wait
