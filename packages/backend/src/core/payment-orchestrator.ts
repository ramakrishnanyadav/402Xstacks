import { v4 as uuidv4 } from 'uuid';
import { AdaptiveRetryEngine } from './retry-engine';
import { BlockchainClient } from '../services/blockchain-client';
import { BlockchainVerifier } from '../services/blockchain-verifier';
import { PaymentStateManager } from '../services/payment-state-manager';
import { PaymentRequest, PaymentResult, PaymentStatus, ErrorType } from '../types';
import { logger } from '../utils/logger';
import { EventEmitter } from 'events';

/**
 * Main orchestrator that coordinates payment processing
 */
export class PaymentOrchestrator extends EventEmitter {
  private retryEngine: AdaptiveRetryEngine;
  private blockchainClient: BlockchainClient;
  private verifier: BlockchainVerifier;
  private stateManager: PaymentStateManager;

  constructor(
    retryEngine: AdaptiveRetryEngine,
    blockchainClient: BlockchainClient,
    verifier: BlockchainVerifier,
    stateManager: PaymentStateManager
  ) {
    super();
    this.retryEngine = retryEngine;
    this.blockchainClient = blockchainClient;
    this.verifier = verifier;
    this.stateManager = stateManager;

    // Forward verifier events
    this.verifier.on('payment:confirmed', (data) => this.emit('payment:confirmed', data));
    this.verifier.on('payment:refunded', (data) => this.emit('payment:refunded', data));
  }

  /**
   * Process payment with automatic retry and verification
   */
  async processPayment(request: PaymentRequest, senderKey: string): Promise<PaymentResult> {
    const startTime = Date.now();

    try {
      // Generate payment ID
      const paymentId = this.generatePaymentId();

      // Check idempotency
      if (request.idempotencyKey) {
        const existingPaymentId = await this.stateManager.checkIdempotency(request.idempotencyKey);
        if (existingPaymentId) {
          logger.info(`[Orchestrator] Idempotent request detected: ${request.idempotencyKey}`);
          const existingPayment = await this.stateManager.getPayment(existingPaymentId);
          
          if (existingPayment) {
            return {
              success: existingPayment.status === PaymentStatus.CONFIRMED,
              paymentId: existingPaymentId,
              txHash: existingPayment.txHash,
              status: existingPayment.status,
              attempts: existingPayment.attempts
            };
          }
        }

        // Store idempotency key
        await this.stateManager.storeIdempotency(request.idempotencyKey, paymentId);
      }

      // Create payment record
      await this.stateManager.createPayment(paymentId, {
        paymentId,
        status: PaymentStatus.PENDING,
        attempts: 0
      });

      // Emit created event
      this.emit('payment:created', {
        paymentId,
        amount: request.amount,
        recipient: request.recipient,
        timestamp: Date.now()
      });

      logger.info(`[Orchestrator] Processing payment ${paymentId}`);

      // Execute with retry logic
      const result = await this.retryEngine.executeWithRetry(
        paymentId,
        'stacks-blockchain',
        async () => {
          // Update status to retrying
          const payment = await this.stateManager.getPayment(paymentId);
          if (payment) {
            await this.stateManager.updatePayment(paymentId, {
              status: PaymentStatus.RETRYING,
              attempts: payment.attempts + 1
            });

            // Emit retrying event
            this.emit('payment:retrying', {
              paymentId,
              attempts: payment.attempts + 1,
              timestamp: Date.now()
            });
          }

          // Submit to blockchain
          return await this.submitToBlockchain(paymentId, request, senderKey);
        }
      );

      if (result.success && result.result) {
        const txHash = result.result;
        const processingTime = Date.now() - startTime;

        // Update state with transaction hash
        await this.stateManager.updatePayment(paymentId, {
          status: PaymentStatus.SUBMITTED,
          txHash,
          attempts: result.attempts
        });

        logger.info(`[Orchestrator] Payment ${paymentId} submitted successfully (txHash: ${txHash})`);

        // Update metrics
        await this.stateManager.incrementMetric('total_submitted');
        await this.stateManager.incrementMetric('total_processing_time', processingTime);

        return {
          success: true,
          paymentId,
          txHash,
          status: PaymentStatus.SUBMITTED,
          attempts: result.attempts,
          processingTime
        };

      } else {
        // Payment failed permanently
        await this.stateManager.updatePayment(paymentId, {
          status: PaymentStatus.FAILED,
          attempts: result.attempts,
          lastError: result.error ? ErrorType.NETWORK_ERROR : undefined,
          lastErrorMessage: result.error?.message
        });

        // Emit failed event
        this.emit('payment:failed', {
          paymentId,
          error: result.error?.message,
          attempts: result.attempts,
          timestamp: Date.now()
        });

        logger.error(`[Orchestrator] Payment ${paymentId} failed permanently`);

        // Update metrics
        await this.stateManager.incrementMetric('total_failed');

        return {
          success: false,
          paymentId,
          status: PaymentStatus.FAILED,
          attempts: result.attempts,
          error: result.error ? {
            type: ErrorType.NETWORK_ERROR,
            message: result.error.message
          } : undefined
        };
      }

    } catch (error: any) {
      logger.error('[Orchestrator] Error processing payment:', error);
      throw error;
    }
  }

  /**
   * Submit payment to blockchain
   */
  private async submitToBlockchain(
    paymentId: string,
    request: PaymentRequest,
    senderKey: string
  ): Promise<string> {
    // Demo mode: Skip actual blockchain transaction
    if (senderKey === 'demo-key' || process.env.DEMO_MODE === 'true') {
      const demoTxHash = `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2, 18)}`;
      logger.info(`[Orchestrator] Demo mode - simulated blockchain transaction`, { 
        paymentId, 
        demoTxHash,
        amount: request.amount 
      });
      return demoTxHash;
    }

    try {
      const paymentIdBuffer = Buffer.from(paymentId, 'hex');
      const amountMicroStx = Math.floor(request.amount * 1_000_000); // Convert STX to micro-STX
      const metadata = request.metadata || 'x402-payment';

      const result = await this.blockchainClient.createEscrowPayment(
        paymentIdBuffer,
        request.recipient,
        amountMicroStx,
        metadata,
        senderKey
      );

      if ('error' in result) {
        throw new Error(result.error);
      }

      return result.txid;

    } catch (error: any) {
      logger.error(`[Orchestrator] Error submitting to blockchain:`, error);
      throw error;
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentResult | null> {
    const payment = await this.stateManager.getPayment(paymentId);
    
    if (!payment) {
      return null;
    }

    return {
      success: payment.status === PaymentStatus.CONFIRMED,
      paymentId,
      txHash: payment.txHash,
      status: payment.status,
      attempts: payment.attempts,
      error: payment.lastError ? {
        type: payment.lastError,
        message: payment.lastErrorMessage || ''
      } : undefined
    };
  }

  /**
   * Generate unique payment ID
   */
  private generatePaymentId(): string {
    return uuidv4().replace(/-/g, '');
  }

  /**
   * Start background services
   */
  async start(): Promise<void> {
    // Start blockchain verification
    await this.verifier.startWatching(10000); // Check every 10 seconds
    logger.info('[Orchestrator] Started background services');
  }

  /**
   * Stop background services
   */
  stop(): void {
    this.verifier.stopWatching();
    logger.info('[Orchestrator] Stopped background services');
  }
}
