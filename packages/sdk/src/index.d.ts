export declare enum PaymentStatus {
    PENDING = "PENDING",
    RETRYING = "RETRYING",
    SUBMITTED = "SUBMITTED",
    CONFIRMED = "CONFIRMED",
    FAILED = "FAILED",
    REFUNDED = "REFUNDED"
}
export interface PaymentRequest {
    amount: number;
    recipient: string;
    metadata?: string;
    idempotencyKey?: string;
}
export interface PaymentResult {
    success: boolean;
    paymentId: string;
    txHash?: string;
    status: PaymentStatus;
    attempts: number;
    processingTime?: number;
    error?: {
        type: string;
        message: string;
    };
}
export interface X402NexusConfig {
    apiKey: string;
    apiUrl?: string;
    network?: 'testnet' | 'mainnet';
    senderKey: string;
}
export interface X402PaymentChallenge {
    amount: number;
    amountSTX: number;
    recipient: string;
    resource: string;
    nonce: string;
    expiresAt: number;
    paymentEndpoint: string;
    protocol: string;
    network: string;
}
export interface X402ProtectedResource {
    url: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    body?: any;
}
export type PaymentStatusCallback = (event: {
    paymentId: string;
    status: PaymentStatus;
    data?: any;
}) => void;
/**
 * x402-Nexus SDK
 * Non-custodial payment reliability layer for Stacks
 */
export declare class X402Nexus {
    private apiClient;
    private config;
    private statusCallbacks;
    constructor(config: X402NexusConfig);
    /**
     * Process payment with automatic retry and verification
     */
    processPayment(request: PaymentRequest): Promise<PaymentResult>;
    /**
     * Get payment status
     */
    getPaymentStatus(paymentId: string): Promise<PaymentResult>;
    /**
     * Register callback for payment status updates
     */
    onPaymentStatus(callback: PaymentStatusCallback): void;
    /**
     * Process payment with polling for status updates
     */
    processPaymentWithPolling(request: PaymentRequest, pollingInterval?: number, maxPolls?: number): Promise<PaymentResult>;
    /**
     * Get network metrics
     */
    getMetrics(): Promise<any>;
    /**
     * Health check
     */
    healthCheck(): Promise<{
        status: string;
        timestamp: string;
    }>;
    /**
     * Access x402 protocol protected resource
     * Automatically handles 402 Payment Required responses
     */
    accessProtectedResource(resource: X402ProtectedResource): Promise<any>;
    /**
     * Make HTTP request (helper method)
     */
    private makeRequest;
    /**
     * Access premium AI inference endpoint (x402 protected)
     */
    accessAIInference(prompt: string, model?: string): Promise<any>;
    /**
     * Access premium market data endpoint (x402 protected)
     */
    accessMarketData(symbol: string): Promise<any>;
    /**
     * Access premium content (x402 protected)
     */
    accessPremiumContent(articleId: string): Promise<any>;
    /**
     * Purchase API credits (x402 protected)
     */
    purchaseAPICredits(credits?: number): Promise<any>;
    /**
     * Handle API errors
     */
    private handleError;
    /**
     * Sleep utility
     */
    private sleep;
}
export * from '@stacks/transactions';
//# sourceMappingURL=index.d.ts.map