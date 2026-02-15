# Smart Contract Documentation

## x402-nexus-escrow.clar

### Overview

The x402-nexus-escrow contract provides non-custodial escrow functionality for x402 micropayments with automatic timeout protection.

### Contract Address

- **Testnet**: `ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.x402-nexus-escrow`
- **Mainnet**: TBD (pending deployment)

## Public Functions

### create-payment

Creates a new escrow payment.

**Signature:**
```clarity
(define-public (create-payment 
    (payment-id (buff 32))
    (recipient principal)
    (amount uint)
    (metadata (string-ascii 256)))
  (response (buff 32) uint))
```

**Parameters:**
- `payment-id`: Unique 32-byte identifier for the payment
- `recipient`: Stacks address of the payment recipient
- `amount`: Amount in micro-STX (1 STX = 1,000,000 micro-STX)
- `metadata`: ASCII string describing the payment

**Returns:**
- Success: `(ok payment-id)`
- Error codes:
  - `u105`: Invalid amount (must be > 0)
  - `u106`: Duplicate payment ID

**Example:**
```clarity
(contract-call? .x402-nexus-escrow create-payment
  0x1234567890abcdef1234567890abcdef12345678
  'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC
  u50000  ;; 0.05 STX
  "premium-article-123"
)
```

### claim-payment

Allows recipient to claim payment after service delivery.

**Signature:**
```clarity
(define-public (claim-payment (payment-id (buff 32)))
  (response bool uint))
```

**Parameters:**
- `payment-id`: ID of the payment to claim

**Returns:**
- Success: `(ok true)`
- Error codes:
  - `u100`: Payment not found
  - `u101`: Unauthorized (caller is not recipient)
  - `u102`: Already claimed
  - `u103`: Already refunded

**Example:**
```clarity
(contract-call? .x402-nexus-escrow claim-payment
  0x1234567890abcdef1234567890abcdef12345678
)
```

### refund-expired

Refunds payment to sender after timeout expires.

**Signature:**
```clarity
(define-public (refund-expired (payment-id (buff 32)))
  (response bool uint))
```

**Parameters:**
- `payment-id`: ID of the payment to refund

**Returns:**
- Success: `(ok true)`
- Error codes:
  - `u100`: Payment not found
  - `u102`: Already claimed
  - `u103`: Already refunded
  - `u104`: Not expired yet (< 100 blocks)

**Timeout**: 100 blocks (~16 minutes on Stacks)

**Example:**
```clarity
(contract-call? .x402-nexus-escrow refund-expired
  0x1234567890abcdef1234567890abcdef12345678
)
```

## Read-Only Functions

### get-payment

Retrieves payment details.

**Signature:**
```clarity
(define-read-only (get-payment (payment-id (buff 32)))
  (optional {
    sender: principal,
    recipient: principal,
    amount: uint,
    created-at: uint,
    claimed: bool,
    refunded: bool,
    metadata: (string-ascii 256)
  }))
```

**Example:**
```clarity
(contract-call? .x402-nexus-escrow get-payment
  0x1234567890abcdef1234567890abcdef12345678
)
```

### get-payment-status

Gets simplified payment status.

**Signature:**
```clarity
(define-read-only (get-payment-status (payment-id (buff 32)))
  (response {
    exists: bool,
    claimed: bool,
    refunded: bool,
    expired: bool
  } uint))
```

### get-stats

Returns contract-wide statistics.

**Signature:**
```clarity
(define-read-only (get-stats)
  {
    total-created: uint,
    total-claimed: uint,
    total-refunded: uint,
    total-volume: uint,
    success-rate: uint
  })
```

**Example:**
```clarity
(contract-call? .x402-nexus-escrow get-stats)
;; Returns:
;; {
;;   total-created: u1247,
;;   total-claimed: u1198,
;;   total-refunded: u49,
;;   total-volume: u624700000,
;;   success-rate: u96
;; }
```

### can-refund

Checks if payment is eligible for refund.

**Signature:**
```clarity
(define-read-only (can-refund (payment-id (buff 32)))
  (response bool uint))
```

## Constants

```clarity
payment-timeout: u100  ;; ~16 minutes (100 blocks)
```

## Error Codes

| Code | Constant | Description |
|------|----------|-------------|
| u100 | err-not-found | Payment not found |
| u101 | err-unauthorized | Caller not authorized |
| u102 | err-already-claimed | Payment already claimed |
| u103 | err-already-refunded | Payment already refunded |
| u104 | err-not-expired | Timeout not reached yet |
| u105 | err-invalid-amount | Amount must be > 0 |
| u106 | err-duplicate-payment | Payment ID already exists |

## Events

The contract emits events for indexing:

**Event Types:**
- `CREATED`: New payment created
- `CLAIMED`: Payment claimed by recipient
- `REFUNDED`: Payment refunded to sender

## Security Features

### 1. Non-Custodial Design
- Contract holds funds temporarily
- Only recipient can claim
- Auto-refund ensures no indefinite lock

### 2. Timeout Protection
- 100-block timeout (~16 minutes)
- Automatic refund eligibility
- Prevents merchant from delaying claim indefinitely

### 3. State Validation
- Cannot claim already-claimed payment
- Cannot refund already-refunded payment
- Cannot claim after refund
- Cannot refund before timeout

### 4. Access Control
- Only recipient can claim payment
- Anyone can trigger refund (after timeout)
- Sender automatically receives refund

## Gas Costs (Approximate)

| Function | Cost (STX) |
|----------|-----------|
| create-payment | ~0.002 |
| claim-payment | ~0.001 |
| refund-expired | ~0.001 |

*Note: Gas costs vary based on network congestion*

## Testing

Run contract tests:
```bash
cd packages/contracts
clarinet test
```

## Deployment

### Testnet
```bash
clarinet deploy --testnet
```

### Mainnet
```bash
clarinet deploy --mainnet
```

## Upgradeability

Current contract is **immutable**. For future versions, consider:
- Proxy pattern for upgrades
- Migration function for transferring state
- Versioned contract deployment

## Audit Status

- ⏳ **Pending**: Security audit recommended before mainnet deployment
- ✅ **Self-review**: Internal security review completed
- ⏳ **Third-party**: Professional audit pending

## License

MIT License - See [LICENSE](../LICENSE)
