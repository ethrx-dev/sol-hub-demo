#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "Starting API server..."
cd "$ROOT/apps/api"
.venv/bin/python3 -m uvicorn src.main:app --host 0.0.0.0 --port 8000 &
API_PID=$!

echo "Starting frontend..."
cd "$ROOT/apps/web"
npx next dev -p 3000 &
WEB_PID=$!

echo ""
echo "API  → http://localhost:8000  (pid $API_PID)"
echo "Web  → http://localhost:3000  (pid $WEB_PID)"
echo ""
echo "Press Ctrl+C to stop both."

trap "kill $API_PID $WEB_PID 2>/dev/null; exit" INT TERM
wait
