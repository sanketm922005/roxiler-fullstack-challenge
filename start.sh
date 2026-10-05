#!/bin/bash

# Navigate to project directory
cd "$(dirname "$0")" || exit 1

# Ensure Node.js binaries in standard user paths are in PATH if available
export PATH="$HOME/.local/bin:$HOME/.nodejs/bin:$PATH"

echo "==========================================="
echo "  Starting Roxiler Store Rating Platform   "
echo "==========================================="

# 1. Start PostgreSQL if not already running
if ! docker ps 2>/dev/null | grep -q sanket_roxiler_postgres; then
  echo "📦 Starting PostgreSQL database container..."
  docker compose up -d
  sleep 3
else
  echo "✅ PostgreSQL database container is already running."
fi

# 2. Build backend if dist is not compiled
if [ ! -d "backend/dist" ]; then
  echo "🔨 Compiling backend..."
  (cd backend && npm run build)
fi

echo "🚀 Starting Backend API on http://localhost:5000..."
(cd backend && node dist/server.js) &
BACKEND_PID=$!

echo "✨ Starting Frontend on http://localhost:5173..."
(cd frontend && npx vite --host 0.0.0.0 --port 5173) &
FRONTEND_PID=$!

# Trap Ctrl+C to terminate both servers cleanly
trap "echo -e '\nStopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM

echo ""
echo "==========================================="
echo "  All services are up and running!"
echo "  Frontend URL: http://localhost:5173"
echo "  Backend API:  http://localhost:5000"
echo "  Press Ctrl+C to stop all services."
echo "==========================================="

wait
