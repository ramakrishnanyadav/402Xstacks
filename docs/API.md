# x402-Nexus API Reference

## Base URL

- **Production**: `https://api.x402-nexus.xyz`
- **Testnet**: `https://api.testnet.x402-nexus.xyz`
- **Local Development**: `http://localhost:3001`

## Authentication

All API requests require authentication via API key in the header:

```
X-API-Key: your_api_key_here
X-Sender-Key: your_sender_private_key
```

## Endpoints

### Health Check

Check API status and network information.

**Request**:
```http
GET /api/health
```

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "x402-nexus-api"
}
```

---

### Create Payment

Submit a new payment with automatic retry protection.

**Request**:
```http
POST /api/payments
Content-Type: application/json
X-API-Key: your_api_key
X-Sender-Key: your_private_key

{
  "amount": 0.05,
  "recipient": "ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC",
  "metadata": "premium-article-123",
  "idempotencyKey": "order-12345"
}
```

**Parameters**:
- `amount` (required, number): Payment amount in STX
- `recipient` (required, string): Recipient Stacks address
- `metadata` (optional, string): Payment metadata/description
- `idempotencyKey` (optional, string): Unique key to prevent duplicate payments

**Response** (201 Created):
```json
{
  "success": true,
  "paymentId": "a1b2c3d4e5f6...",
  "txHash": "0x1234567890abcdef...",
  "status": "SUBMITTED",
  "attempts": 1,
  "processingTime": 1234
}
```

**Response** (400 Bad Request):
```json
{
  "success": false,
  "paymentId": "a1b2c3d4e5f6...",
  "status": "FAILED",
  "attempts": 3,
  "error": {
    "type": "INSUFFICIENT_BALANCE",
    "message": "Insufficient balance - payment failed permanently"
  }
}
```

**Error Codes**:
- `400`: Validation error or permanent payment failure
- `401`: Missing or invalid API key
- `500`: Internal server error

---

### Get Payment Status

Retrieve the current status of a payment.

**Request**:
```http
GET /api/payments/{paymentId}
X-API-Key: your_api_key
```

**Response**:
```json
{
  "success": true,
  "paymentId": "a1b2c3d4e5f6...",
  "txHash": "0x1234567890abcdef...",
  "status": "CONFIRMED",
  "attempts": 2,
  "processingTime": 3200
}
```

**Payment Statuses**:
- `PENDING`: Payment created, not yet submitted
- `RETRYING`: Payment failed, retry in progress
- `SUBMITTED`: Transaction submitted to blockchain
- `CONFIRMED`: Payment confirmed on-chain
- `FAILED`: Payment failed permanently
- `REFUNDED`: Payment refunded after timeout

---

### Get Metrics

Retrieve network-wide performance metrics.

**Request**:
```http
GET /api/metrics
```

**Response**:
```json
{
  "totalPayments": 12547,
  "pendingPayments": 23,
  "confirmedPayments": 11892,
  "failedPayments": 632,
  "successRate": 96.3,
  "avgProcessingTime": 4200,
  "totalSubmitted": 12524,
  "totalConfirmed": 11892,
  "totalFailed": 632
}
```

**Metrics Explained**:
- `successRate`: Percentage of payments that eventually confirm
- `avgProcessingTime`: Average time from submission to confirmation (ms)
- `totalPayments`: Total number of payment attempts
- `confirmedPayments`: Number of successfully confirmed payments
- `failedPayments`: Number of permanently failed payments

---

### Trigger Demo Scenario

**⚠️ Demo Mode Only** - Trigger controlled chaos scenarios for testing.

**Request**:
```http
POST /api/demo/trigger
Content-Type: application/json

{
  "scenario": "rpc_timeout"
}
```

**Parameters**:
- `scenario` (required, enum):
  - `rpc_timeout`: Simulates RPC endpoint timeout
  - `network_congestion`: Simulates blockchain congestion
  - `insufficient_balance`: Simulates balance failure
  - `success`: Simulates immediate success

**Response**:
```json
{
  "success": true,
  "scenario": "rpc_timeout",
  "message": "Demo scenario 'rpc_timeout' triggered successfully"
}
```

---

## WebSocket Events

Connect to receive real-time payment updates.

**Connection**:
```javascript
import { io } from 'socket.io-client';

const socket = io('https://api.x402-nexus.xyz');

socket.on('connect', () => {
  console.log('Connected to x402-Nexus');
});
```

### Event: `payment:created`

Emitted when a new payment is initiated.

**Payload**:
```json
{
  "paymentId": "a1b2c3d4e5f6...",
  "amount": 0.05,
  "recipient": "ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC",
  "timestamp": 1705315800000
}
```

### Event: `payment:retrying`

Emitted when a payment retry is in progress.

**Payload**:
```json
{
  "paymentId": "a1b2c3d4e5f6...",
  "attempts": 2,
  "error": "RPC_TIMEOUT",
  "timestamp": 1705315802000
}
```

### Event: `payment:confirmed`

Emitted when a payment is confirmed on-chain.

**Payload**:
```json
{
  "paymentId": "a1b2c3d4e5f6...",
  "txHash": "0x1234567890abcdef...",
  "recoveredRevenue": 0.05,
  "processingTime": 3200,
  "timestamp": 1705315805000
}
```

### Event: `payment:failed`

Emitted when a payment fails permanently.

**Payload**:
```json
{
  "paymentId": "a1b2c3d4e5f6...",
  "error": "Insufficient balance - user notified to top up wallet",
  "attempts": 1,
  "timestamp": 1705315801000
}
```

### Event: `payment:refunded`

Emitted when a payment is refunded after timeout.

**Payload**:
```json
{
  "paymentId": "a1b2c3d4e5f6...",
  "timestamp": 1705316400000
}
```

---

## Error Handling

### Error Response Format

```json
{
  "error": "Error type or message",
  "message": "Detailed error description",
  "details": [
    {
      "field": "amount",
      "message": "Must be a positive number"
    }
  ]
}
```

### Common Error Types

| Error Type | Description | HTTP Status |
|------------|-------------|-------------|
| `VALIDATION_ERROR` | Invalid request parameters | 400 |
| `AUTHENTICATION_ERROR` | Missing or invalid API key | 401 |
| `NOT_FOUND` | Payment not found | 404 |
| `RPC_TIMEOUT` | Blockchain RPC timeout (transient) | 500 |
| `NETWORK_ERROR` | Network connectivity issue (transient) | 500 |
| `INSUFFICIENT_BALANCE` | Insufficient STX balance (permanent) | 400 |
| `INVALID_ADDRESS` | Invalid recipient address (permanent) | 400 |
| `CONTRACT_ERROR` | Smart contract error (permanent) | 400 |

### Retry Recommendations

**Transient Errors** (retry recommended):
- `RPC_TIMEOUT`
- `NETWORK_ERROR`
- `MEMPOOL_FULL`
- `NONCE_CONFLICT`

**Permanent Errors** (do not retry):
- `INSUFFICIENT_BALANCE`
- `INVALID_ADDRESS`
- `CONTRACT_ERROR`
- `VALIDATION_ERROR`

---

## Rate Limits

- **Standard Plan**: 100 requests/minute
- **Pro Plan**: 1,000 requests/minute
- **Enterprise**: Custom limits

**Rate Limit Headers**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705315860
```

When rate limit is exceeded:
```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 60
}
```

---

## SDK Integration

For easier integration, use our official SDK:

```bash
npm install @x402-nexus/sdk
```

```typescript
import { X402Nexus } from '@x402-nexus/sdk';

const nexus = new X402Nexus({
  apiKey: process.env.NEXUS_API_KEY,
  senderKey: process.env.SENDER_PRIVATE_KEY,
  network: 'testnet'
});

const result = await nexus.processPayment({
  amount: 0.05,
  recipient: 'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC'
});
```

See [SDK Documentation](../packages/sdk/README.md) for full details.

---

## Support

- **Documentation**: https://docs.x402-nexus.xyz
- **GitHub**: https://github.com/x402-nexus/x402-nexus
- **Discord**: https://discord.gg/x402nexus
- **Email**: support@x402-nexus.xyz
