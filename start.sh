#!/bin/bash
# ResumeForge — one-command dev launcher
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND="$ROOT/backend"
FRONTEND="$ROOT/frontend"

# Load .env if present
if [ -f "$BACKEND/.env" ]; then
  export $(grep -v '^#' "$BACKEND/.env" | xargs)
  echo "✓ Loaded $BACKEND/.env"
fi

echo ""
echo "======================================"
echo "  ResumeForge — Dev Launcher"
echo "======================================"
echo ""

# Backend setup
cd "$BACKEND"
if [ ! -d ".venv" ]; then
  echo "Creating Python virtual environment..."
  python -m venv .venv
fi
source .venv/bin/activate || source .venv/Scripts/activate 2>/dev/null || true
pip install -q -r requirements.txt

python manage.py migrate --run-syncdb 2>/dev/null || python manage.py migrate
python manage.py runserver 8000 &
BACKEND_PID=$!
echo "✓ Django running on http://localhost:8000 (PID $BACKEND_PID)"

# Frontend
cd "$FRONTEND"
if [ ! -d "node_modules" ]; then
  echo "Installing npm dependencies..."
  npm install
fi
npm start &
FRONTEND_PID=$!
echo "✓ React running on http://localhost:3000 (PID $FRONTEND_PID)"

echo ""
echo "Press Ctrl+C to stop both servers."
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT TERM
wait
