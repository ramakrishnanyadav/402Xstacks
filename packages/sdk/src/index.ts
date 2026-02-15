import axios, { AxiosInstance } from 'axios';
import { makeContractCall, broadcastTransaction, AnchorMode, PostConditionMode } from '@stacks/transactions';
import { StacksTestnet, StacksMainnet } from '@stacks/network';

// Types
export enum PaymentStatus {
  PENDING = 'PENDING',
  RETRYING = 'RETRYING',
  SUBMITTED = 'SUBMITTED',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export interface PaymentRequest {
  amount: number; // STX amount
  recipient: string; // Stacks address
  metadata?: string; // Optional metadata
  idempotencyKey?: string; // Optional idempotency key
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
  senderKey: string; // Private key for signing transactions
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
export class X402Nexus {
  private apiClient: AxiosInstance;
  private config: X402NexusConfig;
  private statusCallbacks: PaymentStatusCallback[] = [];

  constructor(config: X402NexusConfig) {
    this.config = {
      apiUrl: 'https://api.x402-nexus.xyz',
      network: 'testnet',
      ...config
    };

    this.apiClient = axios.create({
      baseURL: this.config.apiUrl,
      headers: {
        'X-API-Key': this.config.apiKey,
        'X-Sender-Key': this.config.senderKey,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Process payment with automatic retry and verification
   */
  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      const response = await this.apiClient.post<PaymentResult>('/api/payments', request);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentResult> {
    try {
      const response = await this.apiClient.get<PaymentResult>(`/api/payments/${paymentId}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Register callback for payment status updates
   */
  onPaymentStatus(callback: PaymentStatusCallback): void {
    this.statusCallbacks.push(callback);
  }

  /**
   * Process payment with polling for status updates
   */
  async processPaymentWithPolling(
    request: PaymentRequest,
    pollingInterval: number = 2000,
    maxPolls: number = 30
  ): Promise<PaymentResult> {
    const result = await this.processPayment(request);
    
    if (result.status === PaymentStatus.CONFIRMED || result.status === PaymentStatus.FAILED) {
      return result;
    }

    // Poll for updates
    let polls = 0;
    while (polls < maxPolls) {
      await this.sleep(pollingInterval);
      
      const status = await this.getPaymentStatus(result.paymentId);
      
      // Notify callbacks
      this.statusCallbacks.forEach(cb => cb({
        paymentId: result.paymentId,
        status: status.status,
        data: status
      }));

      if (status.status === PaymentStatus.CONFIRMED || status.status === PaymentStatus.FAILED) {
        return status;
      }

      polls++;
    }

    throw new Error('Payment status polling timeout');
  }

  /**
   * Get network metrics
   */
  async getMetrics(): Promise<any> {
    try {
      const response = await this.apiClient.get('/api/metrics');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await this.apiClient.get('/api/health');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Access x402 protocol protected resource
   * Automatically handles 402 Payment Required responses
   */
  async accessProtectedResource(resource: X402ProtectedResource): Promise<any> {
    try {
      // First, try to access the resource
      const response = await this.makeRequest(resource);
      return response.data;

    } catch (error: any) {
      // Check if this is a 402 Payment Required response
      if (error.response?.status === 402) {
        const challenge: X402PaymentChallenge = error.response.data.paymentChallenge;
        
        console.log('[X402 SDK] 402 Payment Required received');
        console.log('[X402 SDK] Payment challenge:', challenge);

        // Submit payment for the challenged resource
        const payment = await this.processPaymentWithPolling({
          amount: challenge.amountSTX,
          recipient: challenge.recipient,
          metadata: `x402 payment for ${challenge.resource}`
        });

        if (!payment.success || payment.status !== PaymentStatus.CONFIRMED) {
          throw new Error('Payment failed - cannot access resource');
        }

        console.log('[X402 SDK] Payment confirmed, retrying resource access...');

        // Retry the request with payment proof
        const retryResponse = await this.makeRequest(resource, {
          'X-Payment-Proof': payment.txHash!,
          'X-Payment-ID': payment.paymentId,
          'X-Payment-Nonce': challenge.nonce
        });

        return retryResponse.data;
      }

      throw this.handleError(error);
    }
  }

  /**
   * Make HTTP request (helper method)
   */
  private async makeRequest(
    resource: X402ProtectedResource,
    additionalHeaders?: Record<string, string>
  ): Promise<any> {
    const method = resource.method || 'GET';
    const headers = { ...resource.headers, ...additionalHeaders };

    return await axios({
      method,
      url: resource.url,
      headers,
      data: resource.body
    });
  }

  /**
   * Access premium AI inference endpoint (x402 protected)
   */
  async accessAIInference(prompt: string, model: string = 'llama-3'): Promise<any> {
    return await this.accessProtectedResource({
      url: `${this.config.apiUrl}/api/x402/premium/ai-inference`,
      method: 'POST',
      body: { prompt, model }
    });
  }

  /**
   * Access premium market data endpoint (x402 protected)
   */
  async accessMarketData(symbol: string): Promise<any> {
    return await this.accessProtectedResource({
      url: `${this.config.apiUrl}/api/x402/premium/market-data/${symbol}`
    });
  }

  /**
   * Access premium content (x402 protected)
   */
  async accessPremiumContent(articleId: string): Promise<any> {
    return await this.accessProtectedResource({
      url: `${this.config.apiUrl}/api/x402/content/premium-article/${articleId}`
    });
  }

  /**
   * Purchase API credits (x402 protected)
   */
  async purchaseAPICredits(credits: number = 100): Promise<any> {
    return await this.accessProtectedResource({
      url: `${this.config.apiUrl}/api/x402/credits/purchase`,
      method: 'POST',
      body: { credits }
    });
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): Error {
    if (error.response) {
      const message = error.response.data?.error || error.response.data?.message || 'API error';
      return new Error(`x402-Nexus API Error: ${message}`);
    } else if (error.request) {
      return new Error('x402-Nexus API: No response received');
    } else {
      return new Error(`x402-Nexus SDK Error: ${error.message}`);
    }
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export types
export * from '@stacks/transactions';
