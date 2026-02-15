import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { PaymentStatus } from '../types';
import { logger } from '../utils/logger';

/**
 * Demo service for controlled chaos demonstrations
 */
export class DemoService extends EventEmitter {
  /**
   * Simulate RPC timeout scenario
   */
  async simulateRpcTimeout(): Promise<void> {
    const paymentId = this.generateDemoPaymentId();
    const amount = 0.05;

    logger.info(`[Demo] Simulating RPC timeout for payment ${paymentId}`);

    // Step 1: Payment created
    this.emit('payment:created', {
      paymentId,
      amount,
      recipient: 'ST2DEMO...MERCHANT',
      timestamp: Date.now()
    });

    await this.sleep(1000);

    // Step 2: RPC timeout, first retry
    this.emit('payment:retrying', {
      paymentId,
      attempts: 1,
      error: 'RPC_TIMEOUT',
      timestamp: Date.now()
    });

    await this.sleep(2000);

    // Step 3: Success on retry
    this.emit('payment:confirmed', {
      paymentId,
      txHash: this.generateDemoTxHash(),
      recoveredRevenue: amount,
      processingTime: 3200,
      timestamp: Date.now()
    });

    logger.info(`[Demo] RPC timeout scenario completed - payment recovered`);
  }

  /**
   * Simulate network congestion scenario
   */
  async simulateNetworkCongestion(): Promise<void> {
    const paymentId = this.generateDemoPaymentId();
    const amount = 0.12;

    logger.info(`[Demo] Simulating network congestion for payment ${paymentId}`);

    // Step 1: Payment created
    this.emit('payment:created', {
      paymentId,
      amount,
      recipient: 'ST2DEMO...MERCHANT',
      timestamp: Date.now()
    });

    await this.sleep(1500);

    // Step 2: First retry
    this.emit('payment:retrying', {
      paymentId,
      attempts: 1,
      error: 'MEMPOOL_FULL',
      timestamp: Date.now()
    });

    await this.sleep(3000);

    // Step 3: Second retry
    this.emit('payment:retrying', {
      paymentId,
      attempts: 2,
      error: 'MEMPOOL_FULL',
      timestamp: Date.now()
    });

    await this.sleep(5000);

    // Step 4: Success on second retry
    this.emit('payment:confirmed', {
      paymentId,
      txHash: this.generateDemoTxHash(),
      recoveredRevenue: amount,
      processingTime: 9500,
      timestamp: Date.now()
    });

    logger.info(`[Demo] Network congestion scenario completed - payment recovered after 2 retries`);
  }

  /**
   * Simulate insufficient balance scenario (permanent failure)
   */
  async simulateInsufficientBalance(): Promise<void> {
    const paymentId = this.generateDemoPaymentId();
    const amount = 1.0;

    logger.info(`[Demo] Simulating insufficient balance for payment ${paymentId}`);

    // Step 1: Payment created
    this.emit('payment:created', {
      paymentId,
      amount,
      recipient: 'ST2DEMO...MERCHANT',
      timestamp: Date.now()
    });

    await this.sleep(1000);

    // Step 2: Permanent failure - no retry
    this.emit('payment:failed', {
      paymentId,
      error: 'Insufficient balance - user notified to top up wallet',
      attempts: 1,
      timestamp: Date.now()
    });

    logger.info(`[Demo] Insufficient balance scenario completed - permanent failure`);
  }

  /**
   * Simulate immediate success scenario
   */
  async simulateSuccess(): Promise<void> {
    const paymentId = this.generateDemoPaymentId();
    const amount = 0.08;

    logger.info(`[Demo] Simulating immediate success for payment ${paymentId}`);

    // Step 1: Payment created
    this.emit('payment:created', {
      paymentId,
      amount,
      recipient: 'ST2DEMO...MERCHANT',
      timestamp: Date.now()
    });

    await this.sleep(1500);

    // Step 2: Immediate success
    this.emit('payment:confirmed', {
      paymentId,
      txHash: this.generateDemoTxHash(),
      recoveredRevenue: 0, // No recovery needed, worked first time
      processingTime: 1500,
      timestamp: Date.now()
    });

    logger.info(`[Demo] Immediate success scenario completed`);
  }

  /**
   * Generate demo payment ID
   */
  private generateDemoPaymentId(): string {
    return 'DEMO' + uuidv4().replace(/-/g, '').slice(0, 28);
  }

  /**
   * Generate demo transaction hash
   */
  private generateDemoTxHash(): string {
    return '0x' + Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
