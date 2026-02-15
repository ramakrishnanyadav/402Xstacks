# x402-Nexus Architecture

## Overview

x402-Nexus is a **non-custodial payment reliability layer** built on Stacks blockchain. It provides intelligent retry orchestration, on-chain escrow protection, and real-time verification for x402 micropayments.

## Core Principles

1. **Non-Custodial**: We never hold user funds. All payments flow directly from user → smart contract → merchant.
2. **Blockchain as Source of Truth**: All settlement verification happens on-chain.
3. **Adaptive Intelligence**: System learns from failures and optimizes retry strategies.
4. **Developer-First**: Simple SDK, clear APIs, comprehensive monitoring.

## System Architecture

```
┌─────────────────────────────────────────┐
│       CLIENT APPLICATION                │
│  (AI Agents, Marketplaces, Creators)    │
└───────────────┬─────────────────────────┘
                │ HTTP 402 + x402-stacks
                ▼
┌─────────────────────────────────────────┐
│      x402-Nexus Coordinator             │
│  ┌────────────────────────────────────┐ │
│  │  Orchestration Layer               │ │
│  │   • Request Validation             │ │
│  │   • Idempotency Enforcement        │ │
│  │   • Payment State Machine          │ │
│  │   • Adaptive Retry Engine          │ │
│  │   • Rate Limiting                  │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │  Persistence Layer                 │ │
│  │   • Redis: State & Cache           │ │
│  │   • PostgreSQL: Analytics          │ │
│  │   • Bull Queue: Job Scheduling     │ │
│  └────────────────────────────────────┘ │
└───────────────┬─────────────────────────┘
                │ Submit transaction
                ▼
┌─────────────────────────────────────────┐
│     STACKS BLOCKCHAIN (L2)              │
│  ┌────────────────────────────────────┐ │
│  │  x402-nexus-escrow.clar            │ │
│  │                                    │ │
│  │  Functions:                        │ │
│  │   • create-payment                 │ │
│  │   • claim-payment                  │ │
│  │   • refund-expired                 │ │
│  │                                    │ │
│  │  State:                            │ │
│  │   • Payment metadata               │ │
│  │   • Timestamp tracking             │ │
│  │   • Status (pending/claimed/...)   │ │
│  └────────────────────────────────────┘ │
│                                         │
│         Bitcoin Settlement               │
└───────────────┬─────────────────────────┘
                │ Events & status
                ▼
┌─────────────────────────────────────────┐
│    Verification & Indexer Layer         │
│  • Mempool monitoring                   │
│  • Block confirmation tracking          │
│  • Event log parsing                    │
│  • State reconciliation                 │
│  • WebSocket real-time updates          │
└───────────────┬─────────────────────────┘
                │ Status updates
                ▼
┌─────────────────────────────────────────┐
│       Observability Layer               │
│  • Real-time dashboard                  │
│  • Success rate metrics                 │
│  • Retry analytics                      │
│  • Revenue recovery tracking            │
│  • Alert management                     │
└─────────────────────────────────────────┘
```

## Component Details

### 1. Adaptive Retry Engine

**Purpose**: Intelligently retry failed payments based on error type and historical patterns.

**Key Features**:
- Error classification (transient vs. permanent)
- Exponential backoff with jitter
- Provider-specific optimization
- ML-lite learning from past failures

**Algorithm**:
```typescript
for attempt = 1 to maxAttempts:
  try:
    txHash = submitToBlockchain()
    verified = verifyOnChain(txHash)
    if verified:
      return success
  catch error:
    errorType = classifyError(error)
    if isPermanent(errorType):
      return failure
    delay = calculateBackoff(attempt, errorType, providerStats)
    sleep(delay)
return failure after exhausting attempts
```

### 2. Smart Contract Escrow

**Purpose**: Provide trustless escrow with automatic timeout protection.

**Contract Functions**:

1. **create-payment**: Lock STX in escrow
   - Transfers STX from user to contract
   - Records payment metadata
   - Sets creation timestamp

2. **claim-payment**: Merchant claims after delivery
   - Verifies caller is recipient
   - Transfers STX to merchant
   - Marks payment as claimed

3. **refund-expired**: Auto-refund after timeout
   - Checks if 100 blocks have passed (~16 min)
   - Returns STX to original sender
   - Prevents merchant from claiming

**Security**:
- No one can claim funds except the designated recipient
- Automatic refund prevents indefinite lock
- All state changes emit events for verification

### 3. Blockchain Verification

**Purpose**: Ensure off-chain state matches on-chain reality.

**Reconciliation Process**:
```
Every 10 seconds:
  1. Get all pending payments from Redis
  2. For each payment:
     a. Query on-chain status
     b. Compare with off-chain status
     c. If mismatch:
        - Update Redis (blockchain wins)
        - Emit WebSocket event
        - Log discrepancy
  3. Update metrics
```

**Proof of Settlement**:
- Block height of confirmation
- Transaction hash
- Merkle proof (for SPV verification)
- Timestamp

### 4. State Management (Redis)

**Data Structures**:

```
payment:{paymentId}               → PaymentAttempt object (JSON)
idempotency:{key}                 → paymentId
payments:pending                  → Set of pending payment IDs
payments:confirmed                → Set of confirmed payment IDs
payments:failed                   → Set of failed payment IDs
metric:{metricName}               → Counter value
```

**TTL**: 24 hours for all keys (automatic cleanup)

### 5. WebSocket Real-Time Updates

**Events Emitted**:

- `payment:created` - New payment initiated
- `payment:retrying` - Retry attempt in progress
- `payment:confirmed` - Payment confirmed on-chain
- `payment:failed` - Payment failed permanently
- `payment:refunded` - Payment refunded after timeout

**Client Usage**:
```typescript
socket.on('payment:confirmed', (data) => {
  console.log(`Payment ${data.paymentId} confirmed!`);
  updateUI(data);
});
```

## Data Flow

### Successful Payment Flow

```
1. Client → API: POST /api/payments
2. API → Orchestrator: processPayment()
3. Orchestrator → Redis: Create payment record
4. Orchestrator → RetryEngine: executeWithRetry()
5. RetryEngine → BlockchainClient: createEscrowPayment()
6. BlockchainClient → Stacks: Submit transaction
7. Stacks → Blockchain: Transaction in mempool
8. Orchestrator → Redis: Update status to SUBMITTED
9. Orchestrator → WebSocket: Emit payment:created
10. Verifier (every 10s) → Stacks: Check payment status
11. Verifier → Redis: Update status to CONFIRMED
12. Verifier → WebSocket: Emit payment:confirmed
13. Merchant → Stacks: Call claim-payment
14. Stacks → Merchant: Transfer STX
```

### Failed Payment Flow (with Retry)

```
1. Client → API: POST /api/payments
2. Orchestrator → RetryEngine: executeWithRetry()
3. RetryEngine → BlockchainClient: createEscrowPayment()
4. BlockchainClient: RPC_TIMEOUT error
5. RetryEngine: Classify error as TRANSIENT
6. RetryEngine → WebSocket: Emit payment:retrying (attempt 1)
7. RetryEngine: Sleep(backoff delay)
8. RetryEngine → BlockchainClient: createEscrowPayment() [retry]
9. BlockchainClient → Stacks: Success!
10. Orchestrator → Redis: Update status to SUBMITTED
11. [Continue as successful flow...]
```

### Permanent Failure Flow

```
1. Client → API: POST /api/payments
2. Orchestrator → RetryEngine: executeWithRetry()
3. RetryEngine → BlockchainClient: createEscrowPayment()
4. BlockchainClient: INSUFFICIENT_BALANCE error
5. RetryEngine: Classify error as PERMANENT
6. RetryEngine: Immediate failure (no retry)
7. Orchestrator → Redis: Update status to FAILED
8. Orchestrator → WebSocket: Emit payment:failed
9. API → Client: Return error response
```

## Scalability Considerations

### Horizontal Scaling

- **API Layer**: Stateless, can scale horizontally
- **WebSocket**: Sticky sessions or Redis pub/sub for multi-node
- **Verifier**: Distributed via leader election (Redis-based)

### Performance Optimizations

1. **Redis Caching**: Fast lookups, idempotency checks
2. **Batch Verification**: Check multiple payments per RPC call
3. **Connection Pooling**: Reuse blockchain RPC connections
4. **Rate Limiting**: Prevent abuse, protect RPC endpoints

### Bottlenecks

1. **Blockchain RPC**: Limited by provider rate limits
   - Solution: Multi-provider fallback
2. **Redis Memory**: Limited by payment volume
   - Solution: TTL-based cleanup, archival to PostgreSQL
3. **WebSocket Connections**: Limited by server resources
   - Solution: Connection limits, Redis pub/sub

## Security Model

### Threat Analysis

| Threat | Mitigation |
|--------|-----------|
| **Private key theft** | Keys never stored on server; client-side signing |
| **Double-spending** | Idempotency keys + blockchain finality |
| **Man-in-the-middle** | HTTPS + WebSocket TLS |
| **Replay attacks** | Nonce tracking in smart contract |
| **Contract exploits** | Security audit + formal verification |
| **DoS attacks** | Rate limiting + API keys |

### Trust Model

**What Users Must Trust**:
- Stacks blockchain security
- Smart contract correctness
- Their own key management

**What Users DON'T Trust**:
- x402-Nexus coordinator (it's just an orchestrator)
- Off-chain state (blockchain is source of truth)
- Centralized custody (funds never held by us)

## Future Enhancements

### Phase 2 (Month 2-3)
- Multi-provider fallback (Hiro, Quicknode, etc.)
- ML-based retry optimization
- Payment batching
- Dispute resolution framework

### Phase 3 (Month 4-6)
- Cross-chain support (Lightning, other L2s)
- Advanced fraud detection
- White-label deployment
- Governance token

## Monitoring & Observability

### Key Metrics

- **Success Rate**: % of payments confirmed
- **Avg Processing Time**: Time from submit to confirm
- **Revenue Recovered**: STX recovered via retries
- **Retry Rate**: % of payments requiring retry
- **Error Distribution**: Breakdown by error type

### Alerting

- Payment success rate drops below 90%
- Avg processing time exceeds 30s
- RPC provider failure rate > 20%
- Smart contract errors detected
- Redis connection loss

## Disaster Recovery

### Failure Scenarios

1. **API Server Crash**
   - Impact: New payments fail
   - Recovery: Auto-restart, existing payments continue via verifier

2. **Redis Failure**
   - Impact: State loss for recent payments
   - Recovery: Rebuild from blockchain events

3. **Blockchain RPC Outage**
   - Impact: Cannot submit/verify payments
   - Recovery: Multi-provider fallback

4. **Smart Contract Bug**
   - Impact: Critical - funds at risk
   - Recovery: Emergency pause function, migration plan

### Backup Strategy

- **Redis**: Periodic snapshots to S3
- **PostgreSQL**: Daily backups + WAL archiving
- **Smart Contract**: Immutable, no backup needed (upgrade via proxy pattern)

## Conclusion

x402-Nexus provides production-grade payment reliability through intelligent orchestration, on-chain verification, and comprehensive observability—all while maintaining a non-custodial architecture that puts users in control of their funds.
