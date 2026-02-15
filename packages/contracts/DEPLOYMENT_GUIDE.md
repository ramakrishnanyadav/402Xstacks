# Stacks Testnet Deployment Guide

This guide walks you through deploying the x402-nexus-escrow smart contract to Stacks Testnet.

## Prerequisites

1. **Clarinet** - Stacks smart contract development tool
   ```bash
   # Install Clarinet
   curl --proto '=https' --tlsv1.2 -sSf https://raw.githubusercontent.com/hirosystems/clarinet/main/install.sh | sh
   ```

2. **Testnet STX** - Get free testnet tokens
   - Visit: https://explorer.hiro.so/sandbox/faucet?chain=testnet
   - Request testnet STX for your wallet address

3. **Stacks Wallet** - For signing transactions
   - Leather Wallet: https://leather.io/
   - Xverse Wallet: https://www.xverse.app/

## Step 1: Generate Testnet Account

```bash
# Generate a new testnet account (or use existing)
stx make_keychain -t

# Output will show:
# {
#   "mnemonic": "your 24 word phrase...",
#   "keyInfo": {
#     "privateKey": "your_private_key",
#     "address": "ST...",
#     "btcAddress": "...",
#     "index": 0
#   }
# }
```

**Save your private key and address securely!**

## Step 2: Fund Your Testnet Account

1. Go to https://explorer.hiro.so/sandbox/faucet?chain=testnet
2. Enter your testnet address (starts with `ST`)
3. Request STX tokens (you'll receive ~500 STX)
4. Wait for confirmation (~10 minutes)

## Step 3: Configure Deployment

Create a deployment configuration file:

```bash
cd packages/contracts
clarinet deployments generate --testnet
```

This creates `deployments/default.testnet-plan.yaml`

Edit the file to set your deployer address:

```yaml
---
id: 0
name: Testnet deployment
network: testnet
stacks-node: "https://api.testnet.hiro.so"
bitcoin-node: "http://blockstream.info:3000"
plan:
  batches:
    - id: 0
      transactions:
        - contract-publish:
            contract-name: x402-nexus-escrow
            expected-sender: ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM  # Replace with YOUR address
            cost: 5000
            path: contracts/x402-nexus-escrow.clar
```

## Step 4: Deploy Contract

### Option A: Using Clarinet (Recommended)

```bash
# Set your private key
export STACKS_PRIVATE_KEY="your_private_key_from_step_1"

# Deploy to testnet
clarinet deployments apply -p deployments/default.testnet-plan.yaml
```

### Option B: Using Deployment Script

```bash
# Make script executable
chmod +x deploy-testnet.sh

# Run deployment
./deploy-testnet.sh
```

## Step 5: Verify Deployment

1. **Check Transaction Status**
   ```bash
   # Replace with your transaction ID from deployment output
   curl https://api.testnet.hiro.so/extended/v1/tx/0x<txid>
   ```

2. **View on Explorer**
   - Go to: https://explorer.hiro.so/txid/<txid>?chain=testnet
   - Wait for confirmation (usually 10-20 minutes)

3. **Check Contract**
   ```bash
   # Replace with your address and contract name
   curl https://api.testnet.hiro.so/v2/contracts/interface/ST<your-address>/x402-nexus-escrow
   ```

## Step 6: Update Backend Configuration

Once deployed, update your `.env` file:

```bash
# packages/backend/.env

# Stacks Network Configuration
STACKS_NETWORK=testnet
STACKS_API_URL=https://api.testnet.hiro.so

# Contract Deployment
CONTRACT_ADDRESS=ST<your-address>.x402-nexus-escrow
PAYMENT_RECIPIENT_ADDRESS=ST<your-address>

# Deployer Private Key (for signing transactions)
STACKS_PRIVATE_KEY=your_private_key
```

## Step 7: Test Deployment

```bash
# Start backend
cd packages/backend
npm run start

# In another terminal, test the contract
curl -X POST http://localhost:3001/api/payments \
  -H "Content-Type: application/json" \
  -H "X-API-Key: dev-secret-key-x402-nexus-2024" \
  -H "X-Sender-Key: your_private_key" \
  -d '{
    "amount": 0.1,
    "recipient": "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG",
    "metadata": "Test payment on testnet"
  }'
```

## Troubleshooting

### Issue: "Insufficient Balance"
- **Solution**: Request more testnet STX from faucet
- Wait for previous transactions to confirm

### Issue: "Nonce too low/high"
- **Solution**: Check current account nonce
  ```bash
  curl https://api.testnet.hiro.so/v2/accounts/ST<your-address>?proof=0
  ```

### Issue: "Contract already exists"
- **Solution**: Either use existing contract or deploy with different name
- Check existing contracts:
  ```bash
  curl https://api.testnet.hiro.so/extended/v1/address/ST<your-address>/transactions
  ```

### Issue: "Transaction stuck in mempool"
- **Solution**: Wait 10-20 minutes for next block
- Testnet blocks are slower than mainnet
- Check mempool: https://explorer.hiro.so/transactions/pending?chain=testnet

## Next Steps

After successful deployment:

1. ✅ Update all environment variables
2. ✅ Test payment flow end-to-end
3. ✅ Document your contract address in README
4. ✅ Create demo video showing real testnet transactions
5. ✅ Submit to hackathon with live deployment!

## Useful Resources

- **Stacks Explorer**: https://explorer.hiro.so/?chain=testnet
- **API Docs**: https://docs.hiro.so/api
- **Clarinet Docs**: https://docs.hiro.so/clarinet
- **Testnet Faucet**: https://explorer.hiro.so/sandbox/faucet?chain=testnet
- **Discord Support**: https://discord.gg/stacks

## Security Notes

⚠️ **IMPORTANT**:
- Never commit private keys to git
- Use `.env` files (already in `.gitignore`)
- Testnet keys are for testing only
- For mainnet deployment, use hardware wallet or secure key management
