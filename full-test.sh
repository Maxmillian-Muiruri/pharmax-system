#!/bin/bash

echo "=========================================="
echo "   Complete Integration Test"
echo "=========================================="
echo ""

# Start backend in background
echo "Starting backend server..."
cd "apps/pharmaOS-main (3)/backend"
node server.js &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait for backend to be ready
echo "Waiting for backend to start..."
for i in {1..30}; do
  if curl -s http://localhost:4000/health > /dev/null 2>&1; then
    echo "✅ Backend is running!"
    break
  fi
  sleep 1
  echo -n "."
done
echo ""

# Run Node.js test script
echo ""
echo "Running API tests..."
cd /home/max/Dev/skillyme/pharmX
node test-backend.js

# Capture exit code
TEST_EXIT=$?

# Kill backend
echo ""
echo "Stopping backend..."
kill $BACKEND_PID 2>/dev/null
wait $BACKEND_PID 2>/dev/null

exit $TEST_EXIT
