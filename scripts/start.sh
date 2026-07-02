#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CERT_DIR="$ROOT/apps/web/certificates"

echo "Starting Docker services (PostgreSQL, MinIO, Redis)..."
cd "$ROOT/docker"
docker compose up -d postgres minio redis 2>/dev/null || docker compose up -d

echo "Waiting for PostgreSQL..."
until docker compose exec -T postgres pg_isready -U postgres 2>/dev/null; do sleep 2; done
echo "PostgreSQL is ready."

echo "Waiting for MinIO..."
until curl -s -o /dev/null http://localhost:9000/minio/health/live 2>/dev/null; do sleep 2; done
echo "MinIO is ready."

echo "Starting API server..."
cd "$ROOT/apps/api"
.venv/bin/python3 -m uvicorn src.main:app --host 0.0.0.0 --port 8000 &
API_PID=$!

echo "Starting frontend (HTTPS)..."
cd "$ROOT/apps/web"
# Generate self-signed certs if missing
if [ ! -f "$CERT_DIR/localhost.pem" ]; then
  mkdir -p "$CERT_DIR"
  openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout "$CERT_DIR/localhost-key.pem" \
    -out "$CERT_DIR/localhost.pem" \
    -subj "/CN=localhost" \
    -addext "subjectAltName=DNS:localhost,IP:$(hostname -I | awk '{print $1}')" 2>/dev/null
fi
npx next dev -p 3000 --experimental-https &
WEB_PID=$!

echo ""
echo "Services:"
echo "  PostgreSQL  →  docker (port 5432)"
echo "  MinIO       →  http://localhost:9000  (port 9000)"
echo "  Redis       →  docker (port 6379)"
echo "  API         →  http://localhost:8000  (pid $API_PID)"
echo "  Frontend    →  https://localhost:3000  (pid $WEB_PID)"
  echo "  Network     →  https://$(hostname -I | awk '{print $1}'):3000"
echo ""
echo "Press Ctrl+C to stop all."

trap "kill $API_PID $WEB_PID 2>/dev/null; cd $ROOT/docker && docker compose stop postgres minio redis 2>/dev/null; exit" INT TERM
wait
