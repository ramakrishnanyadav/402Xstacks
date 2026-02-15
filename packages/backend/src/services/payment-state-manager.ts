import { createClient, RedisClientType } from 'redis';
import { PaymentAttempt, PaymentStatus } from '../types';
import { logger } from '../utils/logger';

/**
 * Manages payment state using Redis for fast lookups and idempotency
 */
export class PaymentStateManager {
  private client: RedisClientType;
  private connected: boolean = false;

  constructor() {
    this.client = createClient({
      url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
      password: process.env.REDIS_PASSWORD || undefined
    });

    // Suppress error logging when Redis isn't available
    this.client.on('error', (err) => {
      if (this.connected) {
        logger.error('[Redis] Error:', err);
      }
      // Ignore errors during connection attempts
    });
    this.client.on('connect', () => logger.info('[Redis] Connected'));
  }

  /**
   * Connect to Redis
   */
  async connect(): Promise<void> {
    if (!this.connected) {
      try {
        // Add timeout to prevent hanging
        const connectPromise = this.client.connect();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Redis connection timeout')), 3000)
        );
        
        await Promise.race([connectPromise, timeoutPromise]);
        this.connected = true;
        logger.info('[Redis] Connected successfully');
      } catch (error) {
        logger.warn('[Redis] Connection failed - running in demo mode without Redis');
        logger.warn('[Redis] To enable Redis: docker run -d --name redis -p 6379:6379 redis:7-alpine');
        // Don't throw - allow app to run without Redis for demo mode
        this.connected = false;
      }
    }
  }

  /**
   * Disconnect from Redis
   */
  async disconnect(): Promise<void> {
    if (this.connected) {
      await this.client.disconnect();
      this.connected = false;
    }
  }

  /**
   * Create new payment attempt
   */
  async createPayment(paymentId: string, data: Partial<PaymentAttempt>): Promise<void> {
    if (!this.connected) {
      logger.debug(`[StateManager] Skipping Redis storage (not connected) for payment ${paymentId}`);
      return;
    }

    const payment: PaymentAttempt = {
      paymentId,
      status: PaymentStatus.PENDING,
      attempts: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ...data
    };

    await this.client.set(
      `payment:${paymentId}`,
      JSON.stringify(payment),
      { EX: 86400 } // 24 hour TTL
    );

    // Add to pending set
    await this.client.sAdd('payments:pending', paymentId);

    logger.info(`[StateManager] Created payment ${paymentId}`);
  }

  /**
   * Get payment by ID
   */
  async getPayment(paymentId: string): Promise<PaymentAttempt | null> {
    if (!this.connected) return null;

    const data = await this.client.get(`payment:${paymentId}`);
    if (!data) return null;

    return JSON.parse(data) as PaymentAttempt;
  }

  /**
   * Update payment status
   */
  async updatePayment(paymentId: string, updates: Partial<PaymentAttempt>): Promise<void> {
    if (!this.connected) {
      logger.debug(`[StateManager] Skipping Redis update (not connected) for payment ${paymentId}`);
      return;
    }

    const existing = await this.getPayment(paymentId);
    if (!existing) {
      logger.warn(`[StateManager] Payment ${paymentId} not found in Redis`);
      return;
    }

    const updated: PaymentAttempt = {
      ...existing,
      ...updates,
      updatedAt: Date.now()
    };

    await this.client.set(
      `payment:${paymentId}`,
      JSON.stringify(updated),
      { EX: 86400 }
    );

    // Update status sets
    if (updates.status && updates.status !== existing.status) {
      await this.movePaymentStatus(paymentId, existing.status, updates.status);
    }

    logger.info(`[StateManager] Updated payment ${paymentId}:`, updates);
  }

  /**
   * Check idempotency key
   */
  async checkIdempotency(idempotencyKey: string): Promise<string | null> {
    return await this.client.get(`idempotency:${idempotencyKey}`);
  }

  /**
   * Store idempotency key
   */
  async storeIdempotency(idempotencyKey: string, paymentId: string): Promise<void> {
    await this.client.set(
      `idempotency:${idempotencyKey}`,
      paymentId,
      { EX: 86400 } // 24 hour TTL
    );
  }

  /**
   * Get all pending payments
   */
  async getPendingPayments(): Promise<string[]> {
    return await this.client.sMembers('payments:pending');
  }

  /**
   * Get payments by status
   */
  async getPaymentsByStatus(status: PaymentStatus): Promise<string[]> {
    return await this.client.sMembers(`payments:${status.toLowerCase()}`);
  }

  /**
   * Move payment between status sets
   */
  private async movePaymentStatus(
    paymentId: string,
    fromStatus: PaymentStatus,
    toStatus: PaymentStatus
  ): Promise<void> {
    const fromKey = `payments:${fromStatus.toLowerCase()}`;
    const toKey = `payments:${toStatus.toLowerCase()}`;

    await this.client.sRem(fromKey, paymentId);
    await this.client.sAdd(toKey, paymentId);
  }

  /**
   * Get dashboard metrics
   */
  async getMetrics(): Promise<{
    totalPayments: number;
    pendingPayments: number;
    confirmedPayments: number;
    failedPayments: number;
  }> {
    const [pending, confirmed, failed] = await Promise.all([
      this.client.sCard('payments:pending'),
      this.client.sCard('payments:confirmed'),
      this.client.sCard('payments:failed')
    ]);

    return {
      totalPayments: pending + confirmed + failed,
      pendingPayments: pending,
      confirmedPayments: confirmed,
      failedPayments: failed
    };
  }

  /**
   * Increment metrics counter
   */
  async incrementMetric(metric: string, value: number = 1): Promise<void> {
    await this.client.incrByFloat(`metric:${metric}`, value);
  }

  /**
   * Get metric value
   */
  async getMetric(metric: string): Promise<number> {
    if (!this.connected) return 0;

    const value = await this.client.get(`metric:${metric}`);
    return value ? parseFloat(value) : 0;
  }

  /**
   * Check if Redis is connected
   */
  isConnected(): boolean {
    return this.connected;
  }
}
