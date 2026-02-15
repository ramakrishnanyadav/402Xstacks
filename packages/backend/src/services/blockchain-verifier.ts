import { BlockchainClient } from './blockchain-client';
import { PaymentStateManager } from './payment-state-manager';
import { PaymentStatus, SettlementProof } from '../types';
import { logger } from '../utils/logger';
import { EventEmitter } from 'events';

/**
 * Verifies payments on-chain and reconciles with off-chain state
 * Emits events for WebSocket broadcasting
 */
export class BlockchainVerifier extends EventEmitter {
  private blockchainClient: BlockchainClient;
  private stateManager: PaymentStateManager;
  private reconciliationInterval: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;

  constructor(
    blockchainClient: BlockchainClient,
    stateManager: PaymentStateManager
  ) {
    super();
    this.blockchainClient = blockchainClient;
    this.stateManager = stateManager;
  }

  /**
   * Start watching blockchain for payment confirmations
   */
  async startWatching(intervalMs: number = 10000): Promise<void> {
    if (this.isRunning) {
      logger.warn('[Verifier] Already watching blockchain');
      return;
    }

    this.isRunning = true;
    logger.info(`[Verifier] Starting blockchain verification (interval: ${intervalMs}ms)`);

    // Reconcile immediately (non-blocking)
    this.reconcilePayments().catch(err => 
      logger.error('[Verifier] Error in initial reconciliation:', err)
    );

    // Set up periodic reconciliation
    this.reconciliationInterval = setInterval(async () => {
      await this.reconcilePayments();
    }, intervalMs);
  }

  /**
   * Stop watching blockchain
   */
  stopWatching(): void {
    if (this.reconciliationInterval) {
      clearInterval(this.reconciliationInterval);
      this.reconciliationInterval = null;
    }
    this.isRunning = false;
    logger.info('[Verifier] Stopped blockchain verification');
  }

  /**
   * Reconcile all pending payments with blockchain state
   */
  private async reconcilePayments(): Promise<void> {
    try {
      const pendingPayments = await this.stateManager.getPendingPayments();
      
      if (pendingPayments.length === 0) {
        return;
      }

      logger.info(`[Verifier] Reconciling ${pendingPayments.length} pending payments`);

      for (const paymentId of pendingPayments) {
        await this.reconcilePayment(paymentId);
      }

    } catch (error: any) {
      logger.error('[Verifier] Error during reconciliation:', error);
    }
  }

  /**
   * Reconcile single payment with blockchain
   */
  async reconcilePayment(paymentId: string): Promise<void> {
    try {
      const offChainPayment = await this.stateManager.getPayment(paymentId);
      if (!offChainPayment) {
        logger.warn(`[Verifier] Payment ${paymentId} not found in state`);
        return;
      }

      // Skip if already confirmed or failed
      if (
        offChainPayment.status === PaymentStatus.CONFIRMED ||
        offChainPayment.status === PaymentStatus.FAILED
      ) {
        return;
      }

      // Query blockchain for payment status
      const paymentIdBuffer = Buffer.from(paymentId, 'hex');
      const onChainStatus = await this.blockchainClient.getPaymentStatus(paymentIdBuffer);

      logger.debug(`[Verifier] On-chain status for ${paymentId}:`, onChainStatus);

      // Check if payment exists on-chain
      if (!onChainStatus.value.exists) {
        // Payment not yet on-chain (still in mempool or failed)
        return;
      }

      const { claimed, refunded } = onChainStatus.value;

      // Reconcile status
      if (claimed) {
        // Payment confirmed!
        await this.markPaymentConfirmed(paymentId, offChainPayment.txHash || '');
      } else if (refunded) {
        // Payment refunded
        await this.markPaymentRefunded(paymentId);
      }

    } catch (error: any) {
      logger.error(`[Verifier] Error reconciling payment ${paymentId}:`, error);
    }
  }

  /**
   * Mark payment as confirmed
   */
  private async markPaymentConfirmed(paymentId: string, txHash: string): Promise<void> {
    logger.info(`[Verifier] Payment ${paymentId} CONFIRMED on-chain`);

    await this.stateManager.updatePayment(paymentId, {
      status: PaymentStatus.CONFIRMED,
      txHash
    });

    // Emit event for WebSocket
    this.emit('payment:confirmed', {
      paymentId,
      txHash,
      timestamp: Date.now()
    });

    // Update metrics
    await this.stateManager.incrementMetric('total_confirmed');
  }

  /**
   * Mark payment as refunded
   */
  private async markPaymentRefunded(paymentId: string): Promise<void> {
    logger.info(`[Verifier] Payment ${paymentId} REFUNDED on-chain`);

    await this.stateManager.updatePayment(paymentId, {
      status: PaymentStatus.REFUNDED
    });

    // Emit event for WebSocket
    this.emit('payment:refunded', {
      paymentId,
      timestamp: Date.now()
    });

    // Update metrics
    await this.stateManager.incrementMetric('total_refunded');
  }

  /**
   * Verify payment settlement and generate proof
   */
  async verifySettlement(paymentId: string): Promise<SettlementProof | null> {
    try {
      const paymentIdBuffer = Buffer.from(paymentId, 'hex');
      const onChainPayment = await this.blockchainClient.getPayment(paymentIdBuffer);

      if (!onChainPayment.value) {
        return null;
      }

      const payment = onChainPayment.value;

      return {
        paymentId,
        settled: payment.claimed,
        blockHeight: payment['created-at'],
        amount: payment.amount,
        sender: payment.sender,
        recipient: payment.recipient,
        txHash: '', // Would need to track this separately
        timestamp: Date.now()
      };

    } catch (error: any) {
      logger.error(`[Verifier] Error verifying settlement for ${paymentId}:`, error);
      return null;
    }
  }

  /**
   * Check if payment needs refund
   */
  async checkRefundEligibility(paymentId: string): Promise<boolean> {
    try {
      const paymentIdBuffer = Buffer.from(paymentId, 'hex');
      return await this.blockchainClient.canRefund(paymentIdBuffer);
    } catch (error: any) {
      logger.error(`[Verifier] Error checking refund eligibility for ${paymentId}:`, error);
      return false;
    }
  }
}
