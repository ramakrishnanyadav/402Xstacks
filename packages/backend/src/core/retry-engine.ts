import { ErrorType, PaymentStatus, RetryStrategy, ProviderStats } from '../types';
import { ErrorClassifier } from '../utils/error-classifier';
import { logger } from '../utils/logger';

/**
 * Adaptive Retry Engine with ML-lite learning capabilities
 */
export class AdaptiveRetryEngine {
  private providerStats: Map<string, ProviderStats> = new Map();

  /**
   * Execute payment with intelligent retry logic
   */
  async executeWithRetry<T>(
    paymentId: string,
    provider: string,
    paymentFn: () => Promise<T>,
    options?: Partial<RetryStrategy>
  ): Promise<{ success: boolean; result?: T; attempts: number; error?: Error }> {
    const strategy = await this.calculateStrategy(provider, options);
    let lastError: Error | undefined;

    logger.info(`[RetryEngine] Starting payment ${paymentId} with strategy:`, strategy);

    for (let attempt = 1; attempt <= strategy.maxAttempts; attempt++) {
      try {
        logger.info(`[RetryEngine] Payment ${paymentId} - Attempt ${attempt}/${strategy.maxAttempts}`);

        const startTime = Date.now();
        const result = await paymentFn();
        const duration = Date.now() - startTime;

        // Record success
        await this.recordAttempt(provider, null, attempt, duration, true);

        logger.info(`[RetryEngine] Payment ${paymentId} succeeded on attempt ${attempt} (${duration}ms)`);

        return {
          success: true,
          result,
          attempts: attempt
        };

      } catch (error: any) {
        lastError = error;

        // Classify error
        const errorType = ErrorClassifier.classify(error);
        const isRetryable = ErrorClassifier.isRetryable(errorType);

        logger.warn(`[RetryEngine] Payment ${paymentId} failed (${errorType}):`, error.message);

        // Record failure
        await this.recordAttempt(provider, errorType, attempt, 0, false);

        // If not retryable, fail immediately
        if (!isRetryable) {
          logger.error(`[RetryEngine] Payment ${paymentId} failed permanently (${errorType})`);
          return {
            success: false,
            attempts: attempt,
            error: new Error(ErrorClassifier.getErrorMessage(errorType))
          };
        }

        // If last attempt, give up
        if (attempt === strategy.maxAttempts) {
          logger.error(`[RetryEngine] Payment ${paymentId} exhausted all retry attempts`);
          return {
            success: false,
            attempts: attempt,
            error: new Error(`Payment failed after ${attempt} attempts: ${errorType}`)
          };
        }

        // Calculate backoff delay
        const delay = this.calculateBackoff(attempt, strategy, errorType);
        logger.info(`[RetryEngine] Retrying payment ${paymentId} in ${delay}ms...`);

        await this.sleep(delay);
      }
    }

    return {
      success: false,
      attempts: strategy.maxAttempts,
      error: lastError || new Error('Payment failed')
    };
  }

  /**
   * Calculate retry strategy based on provider statistics
   */
  async calculateStrategy(
    provider: string,
    options?: Partial<RetryStrategy>
  ): Promise<RetryStrategy> {
    const stats = this.providerStats.get(provider);

    // Default strategy
    const defaultStrategy: RetryStrategy = {
      maxAttempts: 3,
      backoffMultiplier: 2,
      initialDelay: 1000,
      maxDelay: 10000
    };

    // If no stats, use default
    if (!stats) {
      return { ...defaultStrategy, ...options };
    }

    // Adaptive strategy based on recent performance
    const recentFailureRate = stats.recentFailureRate;
    const avgSuccessTime = stats.avgSuccessTime;

    let adaptiveStrategy: RetryStrategy;

    if (recentFailureRate > 0.3) {
      // Provider having issues - more aggressive backoff
      adaptiveStrategy = {
        maxAttempts: 5,
        backoffMultiplier: 3,
        initialDelay: 5000,
        maxDelay: 30000
      };
      logger.info(`[RetryEngine] Provider ${provider} has high failure rate (${recentFailureRate.toFixed(2)}), using aggressive strategy`);
    } else if (avgSuccessTime > 5000) {
      // Provider is slow - longer delays
      adaptiveStrategy = {
        maxAttempts: 4,
        backoffMultiplier: 2.5,
        initialDelay: 3000,
        maxDelay: 20000
      };
      logger.info(`[RetryEngine] Provider ${provider} is slow (${avgSuccessTime}ms avg), using patient strategy`);
    } else {
      // Provider is healthy - quick retries
      adaptiveStrategy = {
        maxAttempts: 3,
        backoffMultiplier: 2,
        initialDelay: 1000,
        maxDelay: 10000
      };
    }

    return { ...adaptiveStrategy, ...options };
  }

  /**
   * Calculate exponential backoff with jitter
   */
  calculateBackoff(
    attempt: number,
    strategy: RetryStrategy,
    errorType: ErrorType
  ): number {
    // Base exponential backoff
    const exponential = strategy.initialDelay * Math.pow(strategy.backoffMultiplier, attempt - 1);

    // Add jitter to prevent thundering herd
    const jitter = Math.random() * 1000;

    // Error-specific multipliers
    const errorMultipliers: Partial<Record<ErrorType, number>> = {
      [ErrorType.MEMPOOL_FULL]: 1.5, // Longer wait for congestion
      [ErrorType.NONCE_CONFLICT]: 2.0, // Much longer for nonce issues
      [ErrorType.RPC_TIMEOUT]: 1.0, // Normal for timeouts
    };

    const multiplier = errorMultipliers[errorType] || 1.0;
    const delay = (exponential + jitter) * multiplier;

    return Math.min(delay, strategy.maxDelay);
  }

  /**
   * Record attempt for learning
   */
  private async recordAttempt(
    provider: string,
    errorType: ErrorType | null,
    attempt: number,
    duration: number,
    success: boolean
  ): Promise<void> {
    const stats = this.providerStats.get(provider) || {
      provider,
      totalAttempts: 0,
      successCount: 0,
      failureCount: 0,
      avgSuccessTime: 0,
      recentFailureRate: 0,
      lastUpdated: Date.now()
    };

    stats.totalAttempts++;
    
    if (success) {
      stats.successCount++;
      // Update rolling average
      stats.avgSuccessTime = (stats.avgSuccessTime * (stats.successCount - 1) + duration) / stats.successCount;
    } else {
      stats.failureCount++;
    }

    // Calculate recent failure rate (last 100 attempts)
    const recentTotal = Math.min(stats.totalAttempts, 100);
    const recentFailures = Math.min(stats.failureCount, recentTotal);
    stats.recentFailureRate = recentFailures / recentTotal;

    stats.lastUpdated = Date.now();

    this.providerStats.set(provider, stats);
  }

  /**
   * Get provider statistics
   */
  getProviderStats(provider: string): ProviderStats | undefined {
    return this.providerStats.get(provider);
  }

  /**
   * Get all provider statistics
   */
  getAllProviderStats(): ProviderStats[] {
    return Array.from(this.providerStats.values());
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
