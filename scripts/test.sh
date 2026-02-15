#!/bin/bash
set -e

echo "🧪 x402-Nexus Test Suite"
echo "========================"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to run tests and report
run_tests() {
    local package=$1
    local name=$2
    
    echo ""
    echo "Testing $name..."
    echo "-------------------"
    
    cd "packages/$package"
    
    if npm test; then
        echo -e "${GREEN}✅ $name tests passed${NC}"
        cd ../..
        return 0
    else
        echo -e "${RED}❌ $name tests failed${NC}"
        cd ../..
        return 1
    fi
}

# Start Redis for integration tests
echo "🐳 Starting Redis for tests..."
docker run -d --name test-redis -p 6379:6379 redis:7-alpine || docker start test-redis
sleep 2

# Track results
FAILED=0

# Run backend tests
run_tests "backend" "Backend" || FAILED=1

# Run frontend tests
run_tests "frontend" "Frontend" || FAILED=1

# Run SDK tests
run_tests "sdk" "SDK" || FAILED=1

# Run contract tests
echo ""
echo "Testing Smart Contracts..."
echo "-------------------"
cd packages/contracts
if npm test; then
    echo -e "${GREEN}✅ Contract tests passed${NC}"
else
    echo -e "${RED}❌ Contract tests failed${NC}"
    FAILED=1
fi
cd ../..

# Cleanup
echo ""
echo "🧹 Cleaning up..."
docker stop test-redis || true

# Report results
echo ""
echo "========================"
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    exit 1
fi
