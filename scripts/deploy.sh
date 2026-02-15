#!/bin/bash
set -e

echo "🚀 x402-Nexus Deployment Script"
echo "================================"

# Check if environment is set
if [ -z "$ENVIRONMENT" ]; then
    echo "❌ Error: ENVIRONMENT variable not set"
    echo "Usage: ENVIRONMENT=production ./scripts/deploy.sh"
    exit 1
fi

echo "📋 Environment: $ENVIRONMENT"

# Load environment variables
if [ -f ".env.$ENVIRONMENT" ]; then
    echo "✅ Loading .env.$ENVIRONMENT"
    export $(cat .env.$ENVIRONMENT | xargs)
else
    echo "⚠️  Warning: .env.$ENVIRONMENT not found, using defaults"
fi

# Build Docker images
echo ""
echo "🔨 Building Docker images..."
docker-compose build

# Run database migrations (if any)
echo ""
echo "📦 Running database setup..."
# Add migration commands here if needed

# Deploy smart contracts (if needed)
echo ""
echo "📜 Deploying smart contracts..."
if [ "$DEPLOY_CONTRACTS" = "true" ]; then
    cd packages/contracts
    npm run deploy
    cd ../..
fi

# Start services
echo ""
echo "🎬 Starting services..."
docker-compose up -d

# Wait for health checks
echo ""
echo "🏥 Waiting for services to be healthy..."
sleep 10

# Check health
echo ""
echo "🔍 Checking service health..."
curl -f http://localhost:3001/api/health || exit 1
curl -f http://localhost:3000/health || exit 1

echo ""
echo "✅ Deployment successful!"
echo "📊 Backend API: http://localhost:3001"
echo "🎨 Frontend Dashboard: http://localhost:3000"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop: docker-compose down"
