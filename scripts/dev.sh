#!/bin/bash
set -e

echo "🛠️  x402-Nexus Development Setup"
echo "================================="

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check for Docker
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker is not installed. Redis will need to be run manually."
else
    echo "✅ Docker version: $(docker --version)"
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Setup environment files
echo ""
echo "⚙️  Setting up environment files..."
if [ ! -f "packages/backend/.env" ]; then
    cp packages/backend/.env.example packages/backend/.env
    echo "✅ Created packages/backend/.env"
fi

if [ ! -f "packages/frontend/.env" ]; then
    echo "VITE_API_URL=http://localhost:3001" > packages/frontend/.env
    echo "✅ Created packages/frontend/.env"
fi

# Start Redis with Docker
if command -v docker &> /dev/null; then
    echo ""
    echo "🐳 Starting Redis..."
    docker run -d --name x402-redis -p 6379:6379 redis:7-alpine || docker start x402-redis
    echo "✅ Redis running on port 6379"
else
    echo ""
    echo "⚠️  Please start Redis manually on port 6379"
fi

echo ""
echo "================================="
echo "✅ Development environment ready!"
echo ""
echo "To start development servers:"
echo "  Terminal 1: npm run dev:backend"
echo "  Terminal 2: npm run dev:frontend"
echo ""
echo "Or run both with: npm run dev"
echo ""
echo "API will be available at: http://localhost:3001"
echo "Dashboard will be available at: http://localhost:3000"
echo "================================="
