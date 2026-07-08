#!/usr/bin/env bash
set -euo pipefail

# ─── SOL Hub Stop Script ──────────────────────────────────────────────────
# Stops all services started by start.sh.
# ──────────────────────────────────────────────────────────────────────────

echo "=== SOL Hub Shutdown ==="

# Kill host-based processes
echo "  Stopping API server..."
pkill -f "uvicorn src.main:app" 2>/dev/null && echo "  API stopped." || echo "  API not running."

echo "  Stopping frontend..."
pkill -f "next dev" 2>/dev/null && echo "  Web stopped." || echo "  Web not running."

# Stop Docker services (preserve data volumes)
echo "  Stopping Docker services..."
cd "$(dirname "$0")/../docker"
docker compose stop postgres redis minio 2>/dev/null && echo "  Docker services stopped." || echo "  Docker services not running."

echo ""
echo "=== All services stopped ==="
echo "Data volumes are preserved. Run ./scripts/start.sh to restart."
