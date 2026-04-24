#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

echo -e "${PURPLE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║          AI Remote Patient Monitoring Platform              ║"
echo "║                   Starting Services...                     ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Load environment
set -a
source .env 2>/dev/null
set +a

BACKEND_PORT=${BACKEND_PORT:-3001}
FRONTEND_PORT=${FRONTEND_PORT:-3000}

# Function to kill processes on ports
cleanup_ports() {
    echo -e "${YELLOW}Cleaning up ports...${NC}"
    for port in $BACKEND_PORT $FRONTEND_PORT; do
        PID=$(lsof -ti:$port 2>/dev/null)
        if [ ! -z "$PID" ]; then
            echo -e "${YELLOW}Killing process on port $port (PID: $PID)${NC}"
            kill -9 $PID 2>/dev/null
            sleep 1
        fi
    done
    echo -e "${GREEN}Ports cleaned up.${NC}"
}

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Shutting down services...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    cleanup_ports
    echo -e "${GREEN}All services stopped.${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Clean up ports first
cleanup_ports

# Check PostgreSQL
echo -e "${BLUE}Checking PostgreSQL...${NC}"
if ! pg_isready -q 2>/dev/null; then
    echo -e "${YELLOW}Starting PostgreSQL...${NC}"
    brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null
    sleep 2
fi

if pg_isready -q 2>/dev/null; then
    echo -e "${GREEN}PostgreSQL is running.${NC}"
else
    echo -e "${RED}PostgreSQL is not running. Please start it manually.${NC}"
    exit 1
fi

# Create database if not exists
echo -e "${BLUE}Setting up database...${NC}"
DB_NAME=${DB_NAME:-rpm_db}
DB_USER=${DB_USER:-erolakarsu}

# Try creating database (ignore error if exists)
createdb -U $DB_USER $DB_NAME 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Database '$DB_NAME' created.${NC}"
else
    echo -e "${YELLOW}Database '$DB_NAME' already exists.${NC}"
fi

# Install backend dependencies
echo -e "${BLUE}Installing backend dependencies...${NC}"
cd backend
npm install --silent 2>&1 | tail -1
cd ..

# Install frontend dependencies
echo -e "${BLUE}Installing frontend dependencies...${NC}"
cd frontend
npm install --silent 2>&1 | tail -1
cd ..

# Start backend with hot reload (--watch)
echo -e "${BLUE}Starting backend server on port $BACKEND_PORT with hot reload...${NC}"
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait for backend to be ready
echo -e "${YELLOW}Waiting for backend to start...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:$BACKEND_PORT/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}Backend is ready!${NC}"
        break
    fi
    sleep 1
done

# Start frontend with hot reload (Vite HMR)
echo -e "${BLUE}Starting frontend on port $FRONTEND_PORT with hot reload...${NC}"
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

sleep 3

echo -e "${GREEN}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║              All Services Running!                         ║"
echo "║                                                            ║"
echo "║  Frontend:  http://localhost:$FRONTEND_PORT                     ║"
echo "║  Backend:   http://localhost:$BACKEND_PORT                     ║"
echo "║                                                            ║"
echo "║  Login:     admin@rpm.com / admin123                       ║"
echo "║                                                            ║"
echo "║  Hot reload enabled - changes auto-refresh                 ║"
echo "║  Press Ctrl+C to stop all services                        ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
