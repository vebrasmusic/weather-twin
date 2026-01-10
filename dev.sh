#!/bin/bash

set -e  # Exit on any error

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "Shutting down development servers..."

    # Kill process groups (kills parent and all children)
    if [ ! -z "$BACKEND_PID" ]; then
        kill -TERM -$BACKEND_PID 2>/dev/null || true
    fi

    if [ ! -z "$FRONTEND_PID" ]; then
        kill -TERM -$FRONTEND_PID 2>/dev/null || true
    fi

    # Give processes time to terminate gracefully
    sleep 1

    # Force kill if still running
    if [ ! -z "$BACKEND_PID" ]; then
        kill -KILL -$BACKEND_PID 2>/dev/null || true
    fi

    if [ ! -z "$FRONTEND_PID" ]; then
        kill -KILL -$FRONTEND_PID 2>/dev/null || true
    fi

    echo "Cleanup complete. Exiting..."
    exit 0
}

# Trap Ctrl+C (SIGINT) and SIGTERM
trap cleanup SIGINT SIGTERM

echo "Starting backend server..."
(cd backend && uv run fastapi dev) &
BACKEND_PID=$!

echo "Starting frontend server..."
(cd frontend && pnpm install && pnpm dev) &
FRONTEND_PID=$!

echo ""
echo "Development servers started!"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "Press Ctrl+C to stop all servers..."
echo ""

# Wait for background processes
wait
