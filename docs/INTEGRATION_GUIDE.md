# x402-Nexus Integration Guide

## Overview

This guide walks you through integrating x402-Nexus into your application for reliable micropayments.

## Installation

```bash
npm install @x402-nexus/sdk
```

## Quick Start (5 minutes)

### 1. Get API Key

Sign up at https://app.x402-nexus.xyz to get your API key.

### 2. Initialize SDK

```typescript
import { X402Nexus } from '@x402-nexus/sdk';

const nexus = new X402Nexus({
  apiKey: process.env.NEXUS_API_KEY,
  senderKey: process.env.SENDER_PRIVATE_KEY,
  network: 'testnet'
});
```

### 3. Process Payment

```typescript
const result = await nexus.processPayment({
  amount: 0.05, // STX
  recipient: 'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC',
  metadata: 'premium-content'
});

if (result.success) {
  console.log('Payment confirmed:', result.txHash);
} else {
  console.error('Payment failed:', result.error);
}
```

## Integration Patterns

### Pattern 1: Express.js API

```typescript
import express from 'express';
import { X402Nexus } from '@x402-nexus/sdk';

const app = express();
const nexus = new X402Nexus({ /* config */ });

app.get('/premium-content', async (req, res) => {
  try {
    const payment = await nexus.processPayment({
      amount: 0.05,
      recipient: process.env.MERCHANT_ADDRESS
    });

    if (payment.success) {
      res.json({ content: getPremiumContent() });
    } else {
      res.status(402).json({ 
        error: 'Payment required',
        details: payment.error 
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Pattern 2: AI Agent Marketplace

```typescript
class AIAgentMarketplace {
  private nexus: X402Nexus;

  async purchaseAgentService(agentId: string, userId: string) {
    const agent = await this.getAgent(agentId);
    
    const payment = await this.nexus.processPayment({
      amount: agent.price,
      recipient: agent.walletAddress,
      metadata: `agent-${agentId}-user-${userId}`,
      idempotencyKey: `${userId}-${agentId}-${Date.now()}`
    });

    if (payment.success) {
      await this.grantAccess(userId, agentId);
      return { success: true, txHash: payment.txHash };
    } else {
      throw new Error(`Payment failed: ${payment.error?.message}`);
    }
  }
}
```

### Pattern 3: Creator Platform

```typescript
class CreatorPlatform {
  async processSubscription(creatorId: string, subscriberId: string) {
    const creator = await this.getCreator(creatorId);
    
    // Register status callback
    this.nexus.onPaymentStatus((event) => {
      this.notifyUser(subscriberId, {
        status: event.status,
        paymentId: event.paymentId
      });
    });

    const result = await this.nexus.processPaymentWithPolling({
      amount: creator.subscriptionPrice,
      recipient: creator.walletAddress,
      metadata: `subscription-${creatorId}`
    });

    if (result.success) {
      await this.activateSubscription(subscriberId, creatorId);
    }

    return result;
  }
}
```

## Best Practices

### 1. Use Idempotency Keys

```typescript
const payment = await nexus.processPayment({
  amount: 0.05,
  recipient: merchantAddress,
  idempotencyKey: `order-${orderId}` // Prevents double-charging
});
```

### 2. Handle Errors Gracefully

```typescript
try {
  const payment = await nexus.processPayment(request);
  
  if (!payment.success) {
    // Check error type
    if (payment.error?.type === 'INSUFFICIENT_BALANCE') {
      return { message: 'Please top up your wallet' };
    }
    return { message: 'Payment failed, please try again' };
  }
} catch (error) {
  // Network/API error
  return { message: 'Service temporarily unavailable' };
}
```

### 3. Provide User Feedback

```typescript
nexus.onPaymentStatus((event) => {
  switch (event.status) {
    case 'PENDING':
      showMessage('Processing payment...');
      break;
    case 'RETRYING':
      showMessage('Network congestion, retrying...');
      break;
    case 'CONFIRMED':
      showMessage('Payment confirmed!');
      break;
    case 'FAILED':
      showMessage('Payment failed');
      break;
  }
});
```

## Common Use Cases

### Micropayment Paywall

```typescript
async function checkPaywall(userId: string, articleId: string) {
  // Check if user already paid
  const hasPaid = await checkUserAccess(userId, articleId);
  if (hasPaid) return { access: true };

  // Process payment
  const payment = await nexus.processPayment({
    amount: 0.01, // $0.01 in STX
    recipient: PUBLISHER_ADDRESS,
    metadata: `article-${articleId}`,
    idempotencyKey: `${userId}-${articleId}`
  });

  if (payment.success) {
    await grantAccess(userId, articleId);
    return { access: true, txHash: payment.txHash };
  }

  return { access: false, error: payment.error };
}
```

### API Metered Billing

```typescript
async function processAPICall(userId: string, endpoint: string) {
  const cost = API_COSTS[endpoint];
  
  const payment = await nexus.processPayment({
    amount: cost,
    recipient: SERVICE_ADDRESS,
    metadata: `api-${endpoint}`,
    idempotencyKey: `${userId}-${Date.now()}`
  });

  if (payment.success) {
    return await executeAPICall(endpoint);
  } else {
    throw new Error('Payment required');
  }
}
```

## Testing

### Local Testing

```typescript
// Use demo mode for testing
const nexus = new X402Nexus({
  apiKey: 'demo-key',
  senderKey: process.env.TEST_PRIVATE_KEY,
  apiUrl: 'http://localhost:3001',
  network: 'testnet'
});
```

### Integration Tests

```typescript
describe('Payment Integration', () => {
  it('should process payment successfully', async () => {
    const result = await nexus.processPayment({
      amount: 0.01,
      recipient: TEST_ADDRESS
    });

    expect(result.success).toBe(true);
    expect(result.txHash).toBeDefined();
  });

  it('should handle insufficient balance', async () => {
    const result = await nexus.processPayment({
      amount: 999999,
      recipient: TEST_ADDRESS
    });

    expect(result.success).toBe(false);
    expect(result.error?.type).toBe('INSUFFICIENT_BALANCE');
  });
});
```

## Support

- **Docs**: https://docs.x402-nexus.xyz
- **Discord**: https://discord.gg/x402nexus
- **GitHub**: https://github.com/x402-nexus/x402-nexus
