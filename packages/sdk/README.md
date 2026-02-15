# @x402-nexus/sdk

> JavaScript/TypeScript SDK for x402-Nexus - Non-Custodial Payment Reliability Layer

## Installation

```bash
npm install @x402-nexus/sdk
```

## Quick Start

```typescript
import { X402Nexus } from '@x402-nexus/sdk';

// Initialize the SDK
const nexus = new X402Nexus({
  apiKey: process.env.NEXUS_API_KEY,
  senderKey: process.env.SENDER_PRIVATE_KEY,
  network: 'testnet' // or 'mainnet'
});

// Process a payment with automatic retry
const result = await nexus.processPayment({
  amount: 0.05, // STX
  recipient: 'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC',
  metadata: 'premium-article-123'
});

console.log(`Payment ${result.paymentId} status: ${result.status}`);
```

## Features

- ✅ **Automatic Retry Logic**: Intelligent retries for transient failures
- ✅ **Idempotency**: Prevent duplicate payments
- ✅ **Real-time Status**: Track payment progress
- ✅ **Non-custodial**: You control your keys and funds
- ✅ **TypeScript Support**: Full type definitions included

## API Reference

### Constructor

```typescript
new X402Nexus(config: X402NexusConfig)
```

**Config Options:**
- `apiKey` (required): Your x402-Nexus API key
- `senderKey` (required): Private key for signing transactions
- `apiUrl` (optional): Custom API URL (default: production endpoint)
- `network` (optional): 'testnet' or 'mainnet' (default: 'testnet')

### Methods

#### `processPayment(request: PaymentRequest): Promise<PaymentResult>`

Process a payment with automatic retry and verification.

**Parameters:**
```typescript
{
  amount: number;        // STX amount
  recipient: string;     // Stacks address
  metadata?: string;     // Optional metadata
  idempotencyKey?: string; // Optional idempotency key
}
```

**Returns:**
```typescript
{
  success: boolean;
  paymentId: string;
  txHash?: string;
  status: PaymentStatus;
  attempts: number;
  processingTime?: number;
}
```

#### `getPaymentStatus(paymentId: string): Promise<PaymentResult>`

Get the current status of a payment.

#### `processPaymentWithPolling(request, interval?, maxPolls?): Promise<PaymentResult>`

Process payment and poll for final status.

**Parameters:**
- `request`: Payment request object
- `interval`: Polling interval in ms (default: 2000)
- `maxPolls`: Maximum number of polls (default: 30)

#### `onPaymentStatus(callback: PaymentStatusCallback): void`

Register a callback for payment status updates (when using polling).

```typescript
nexus.onPaymentStatus((event) => {
  console.log(`Payment ${event.paymentId}: ${event.status}`);
});
```

#### `getMetrics(): Promise<Metrics>`

Get network-wide metrics.

#### `healthCheck(): Promise<HealthStatus>`

Check API health status.

## Usage Examples

### Basic Payment

```typescript
const result = await nexus.processPayment({
  amount: 0.1,
  recipient: 'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC'
});

if (result.success) {
  console.log(`Payment confirmed: ${result.txHash}`);
} else {
  console.error(`Payment failed: ${result.error?.message}`);
}
```

### Payment with Idempotency

```typescript
const result = await nexus.processPayment({
  amount: 0.05,
  recipient: 'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC',
  idempotencyKey: 'order-12345', // Prevents duplicate payments
  metadata: 'order-12345-payment'
});
```

### Payment with Status Tracking

```typescript
// Register status callback
nexus.onPaymentStatus((event) => {
  console.log(`Status update: ${event.status}`);
  if (event.status === 'RETRYING') {
    console.log(`Retry attempt in progress...`);
  }
});

// Process payment with polling
const result = await nexus.processPaymentWithPolling({
  amount: 0.05,
  recipient: 'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC'
});
```

### Express.js Integration

```typescript
import express from 'express';
import { X402Nexus } from '@x402-nexus/sdk';

const app = express();
const nexus = new X402Nexus({ /* config */ });

app.get('/premium-content', async (req, res) => {
  try {
    const payment = await nexus.processPayment({
      amount: 0.05,
      recipient: process.env.MERCHANT_ADDRESS,
      metadata: 'premium-article'
    });

    if (payment.success) {
      res.json({ content: premiumContent });
    } else {
      res.status(402).json({ error: 'Payment required' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Error Handling

The SDK throws errors for:
- API errors (network issues, validation errors)
- Payment failures (insufficient balance, invalid address)
- Timeout errors (when using polling)

Always wrap SDK calls in try/catch blocks:

```typescript
try {
  const result = await nexus.processPayment(request);
} catch (error) {
  console.error('Payment error:', error.message);
}
```

## Payment Statuses

- `PENDING`: Payment created, not yet submitted
- `RETRYING`: Payment failed, retry in progress
- `SUBMITTED`: Transaction submitted to blockchain
- `CONFIRMED`: Payment confirmed on-chain
- `FAILED`: Payment failed permanently
- `REFUNDED`: Payment refunded after timeout

## License

MIT
