// Core type definitions for x402-Nexus

export enum PaymentStatus {
  PENDING = 'PENDING',
  RETRYING = 'RETRYING',
  SUBMITTED = 'SUBMITTED',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export enum ErrorType {
  // Transient errors (should retry)
  RPC_TIMEOUT = 'RPC_TIMEOUT',
  NETWORK_ERROR = 'NETWORK_ERROR',
  MEMPOOL_FULL = 'MEMPOOL_FULL',
  NONCE_CONFLICT = 'NONCE_CONFLICT',
  TX_TIMEOUT = 'TX_TIMEOUT',
  
  // Permanent errors (fail fast)
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  INVALID_ADDRESS = 'INVALID_ADDRESS',
  CONTRACT_ERROR = 'CONTRACT_ERROR',
  INVALID_REQUEST = 'INVALID_REQUEST'
}

export interface PaymentRequest {
  amount: number; // STX amount
  recipient: string; // Stacks address
  sender?: string; // Optional sender address
  metadata?: string; // Resource identifier
  idempotencyKey?: string; // For preventing duplicates
}

export interface PaymentAttempt {
  paymentId: string;
  txHash?: string;
  status: PaymentStatus;
  attempts: number;
  lastError?: ErrorType;
  lastErrorMessage?: string;
  createdAt: number;
  updatedAt: number;
}

export interface RetryStrategy {
  maxAttempts: number;
  backoffMultiplier: number;
  initialDelay: number;
  maxDelay: number;
}

export interface ProviderStats {
  provider: string;
  totalAttempts: number;
  successCount: number;
  failureCount: number;
  avgSuccessTime: number;
  recentFailureRate: number;
  lastUpdated: number;
}

export interface PaymentResult {
  success: boolean;
  paymentId: string;
  txHash?: string;
  status: PaymentStatus;
  attempts: number;
  processingTime?: number;
  error?: {
    type: ErrorType;
    message: string;
  };
}

export interface SettlementProof {
  paymentId: string;
  settled: boolean;
  blockHeight: number;
  amount: number;
  sender: string;
  recipient: string;
  txHash: string;
  timestamp: number;
}

export interface WebSocketEvent {
  type: 'payment:created' | 'payment:retrying' | 'payment:confirmed' | 'payment:failed';
  paymentId: string;
  status: PaymentStatus;
  data?: any;
  timestamp: number;
}

export interface DashboardMetrics {
  successRate: number;
  avgProcessingTime: number;
  revenueRecovered: number;
  totalPayments: number;
  activePayments: number;
  failedPayments: number;
}
