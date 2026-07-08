#!/usr/bin/env bash
set -euo pipefail

# ─── SOL Hub VPS Setup Script ─────────────────────────────────────────────
# Run this ONCE on a fresh VPS to install dependencies and configure services.
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/yourorg/sol-hub/main/deploy/setup.sh | bash
#   # or locally:
#   sudo bash deploy/setup.sh
# ──────────────────────────────────────────────────────────────────────────

echo "=== SOL Hub VPS Setup ==="
echo ""

# Detect OS
if [ -f /etc/os-release ]; then
  . /etc/os-release
  OS=$ID
else
  echo "ERROR: Cannot detect OS"
  exit 1
fi

# ── 1. System Dependencies ────────────────────────────────────────────────
echo "[1/5] Installing system dependencies..."
case "$OS" in
  ubuntu|debian)
    apt-get update -qq
    apt-get install -y -qq curl wget git openssl ca-certificates \
      python3 python3-pip python3-venv nodejs npm 2>/dev/null
    ;;
  *)
    echo "Unsupported OS: $OS. Install docker, python3, nodejs manually."
    ;;
esac

# ── 2. Docker ─────────────────────────────────────────────────────────────
echo "[2/5] Installing Docker..."
if ! command -v docker &>/dev/null; then
  curl -fsSL https://get.docker.com | bash
  systemctl enable docker
  systemctl start docker
fi
echo "  Docker: $(docker --version)"

if ! command -v docker compose &>/dev/null; then
  echo "  Installing Docker Compose plugin..."
  apt-get install -y -qq docker-compose-plugin 2>/dev/null || true
fi

# ── 3. Project Setup ──────────────────────────────────────────────────────
echo "[3/5] Setting up project..."
PROJECT_DIR="/opt/sol-hub"
if [ ! -d "$PROJECT_DIR" ]; then
  mkdir -p "$PROJECT_DIR"
  # If running from repo clone, copy files
  SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
  if [ "$SCRIPT_DIR" != "$PROJECT_DIR" ]; then
    cp -a "$SCRIPT_DIR/." "$PROJECT_DIR/"
  fi
fi
cd "$PROJECT_DIR"

# ── 4. Environment Configuration ──────────────────────────────────────────
echo "[4/5] Setting up environment..."
if [ ! -f ".env" ]; then
  cat > .env << 'EOF'
DATABASE_URL=postgresql+asyncpg://solhub:solhub_dev@localhost:5432/solhub
REDIS_URL=redis://localhost:6379/0
S3_ENDPOINT=http://localhost:9000
S3_PUBLIC_URL=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
SECRET_KEY=change-this-to-a-random-secret
ENVIRONMENT=production
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_S3_URL=http://localhost:9000
EOF
  echo "  Created .env file. Update SECRET_KEY before deploying."
fi

# ── 5. Systemd Services ────────────────────────────────────────────────────
echo "[5/5] Installing systemd services..."
cp "$PROJECT_DIR/deploy/solhub.service" /etc/systemd/system/solhub.service 2>/dev/null || true
systemctl daemon-reload
systemctl enable docker
echo "  To start all services: systemctl start solhub"
echo "  Or: cd /opt/sol-hub && bash scripts/start.sh --docker"

# ── Summary ───────────────────────────────────────────────────────────────
IP_ADDR=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "localhost")
echo ""
echo "=== SOL Hub VPS Setup Complete ==="
echo "  Install dir:  $PROJECT_DIR"
echo "  API:          http://${IP_ADDR}:8000"
echo "  Web:          http://${IP_ADDR}:3000"
echo ""
echo "Next steps:"
echo "  1. Edit .env and set a strong SECRET_KEY"
echo "  2. Run:  cd $PROJECT_DIR && bash scripts/start.sh --docker"
echo "  3. Or:   systemctl start solhub"
echo "  4. Set up nginx reverse proxy for HTTPS (recommended):"
echo "     See deploy/nginx.conf"
