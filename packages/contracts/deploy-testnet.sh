#!/bin/bash

# Deploy x402-nexus-escrow contract to Stacks Testnet
# Requires: clarinet, stacks-cli

set -e

echo "🚀 Deploying x402-nexus-escrow to Stacks Testnet..."
echo ""

# Check if clarinet is installed
if ! command -v clarinet &> /dev/null; then
    echo "❌ Error: clarinet is not installed"
    echo "Install from: https://github.com/hirosystems/clarinet"
    exit 1
fi

# Check environment variables
if [ -z "$STACKS_PRIVATE_KEY" ]; then
    echo "❌ Error: STACKS_PRIVATE_KEY environment variable not set"
    echo "Please set your testnet private key:"
    echo "export STACKS_PRIVATE_KEY=your_private_key_here"
    exit 1
fi

# Contract details
CONTRACT_NAME="x402-nexus-escrow"
NETWORK="testnet"

echo "📋 Contract: $CONTRACT_NAME"
echo "🌐 Network: $NETWORK"
echo ""

# Build contract
echo "🔨 Building contract..."
clarinet check

# Deploy using clarinet
echo "📤 Deploying to testnet..."
clarinet deployments generate --testnet

# Apply deployment
clarinet deployments apply --testnet

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Note your contract address from the output above"
echo "2. Update .env with CONTRACT_ADDRESS=<your-contract-address>"
echo "3. Update PAYMENT_RECIPIENT_ADDRESS in .env"
echo "4. Run 'npm run start' to start the backend"
echo ""
echo "🔗 View on explorer:"
echo "https://explorer.hiro.so/txid/<transaction-id>?chain=testnet"
