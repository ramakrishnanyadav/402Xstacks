export enum PaymentStatus {
  PENDING = 'PENDING',
  RETRYING = 'RETRYING',
  SUBMITTED = 'SUBMITTED',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export interface PaymentEvent {
  paymentId: string;
  status: PaymentStatus;
  amount?: number;
  recipient?: string;
  attempts?: number;
  error?: string;
  timestamp: number;
  txHash?: string;
  processingTime?: number;
  recoveredRevenue?: number;
}

export interface Metrics {
  successRate: number;
  avgProcessingTime: number;
  revenueRecovered: number;
  totalPayments: number;
  activePayments: number;
  failedPayments: number;
  totalSubmitted: number;
  totalConfirmed: number;
  totalFailed: number;
}

export interface HistoricalData {
  time: string;
  withRetries: number;
  withoutRetries: number;
}
