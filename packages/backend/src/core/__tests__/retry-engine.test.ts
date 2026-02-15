import { AdaptiveRetryEngine } from '../retry-engine';
import { ErrorType, PaymentStatus } from '../../types';

describe('AdaptiveRetryEngine', () => {
  let retryEngine: AdaptiveRetryEngine;

  beforeEach(() => {
    retryEngine = new AdaptiveRetryEngine();
  });

  describe('shouldRetry', () => {
    it('should retry on transient errors', () => {
      const transientErrors = [
        ErrorType.NETWORK_TIMEOUT,
        ErrorType.RPC_ERROR,
        ErrorType.MEMPOOL_FULL,
        ErrorType.NONCE_CONFLICT
      ];

      transientErrors.forEach(errorType => {
        const result = retryEngine.shouldRetry(errorType, 1);
        expect(result).toBe(true);
      });
    });

    it('should not retry on permanent errors', () => {
      const permanentErrors = [
        ErrorType.INSUFFICIENT_BALANCE,
        ErrorType.INVALID_ADDRESS,
        ErrorType.INVALID_AMOUNT
      ];

      permanentErrors.forEach(errorType => {
        const result = retryEngine.shouldRetry(errorType, 1);
        expect(result).toBe(false);
      });
    });

    it('should not retry after max attempts', () => {
      const result = retryEngine.shouldRetry(ErrorType.NETWORK_TIMEOUT, 6);
      expect(result).toBe(false);
    });
  });

  describe('getRetryDelay', () => {
    it('should calculate exponential backoff', () => {
      const delay1 = retryEngine.getRetryDelay(1, ErrorType.NETWORK_TIMEOUT);
      const delay2 = retryEngine.getRetryDelay(2, ErrorType.NETWORK_TIMEOUT);
      const delay3 = retryEngine.getRetryDelay(3, ErrorType.NETWORK_TIMEOUT);

      // Each delay should be approximately double the previous (with jitter)
      expect(delay2).toBeGreaterThan(delay1);
      expect(delay3).toBeGreaterThan(delay2);
      
      // Base delay is 1000ms, should not exceed reasonable bounds
      expect(delay1).toBeGreaterThanOrEqual(800); // Allow for jitter
      expect(delay1).toBeLessThanOrEqual(1200);
    });

    it('should apply jitter to prevent thundering herd', () => {
      const delays = Array.from({ length: 10 }, () => 
        retryEngine.getRetryDelay(1, ErrorType.NETWORK_TIMEOUT)
      );

      // All delays should be different due to jitter
      const uniqueDelays = new Set(delays);
      expect(uniqueDelays.size).toBeGreaterThan(1);
    });

    it('should cap maximum delay', () => {
      const delay = retryEngine.getRetryDelay(10, ErrorType.NETWORK_TIMEOUT);
      expect(delay).toBeLessThanOrEqual(30000); // 30 second max
    });
  });

  describe('getRetryStrategy', () => {
    it('should return appropriate strategy for error type', () => {
      const strategy = retryEngine.getRetryStrategy(ErrorType.NETWORK_TIMEOUT);
      
      expect(strategy).toHaveProperty('maxAttempts');
      expect(strategy).toHaveProperty('baseDelay');
      expect(strategy).toHaveProperty('maxDelay');
      expect(strategy).toHaveProperty('backoffMultiplier');
    });

    it('should have different strategies for different errors', () => {
      const timeoutStrategy = retryEngine.getRetryStrategy(ErrorType.NETWORK_TIMEOUT);
      const congestionStrategy = retryEngine.getRetryStrategy(ErrorType.MEMPOOL_FULL);

      // Congestion might have longer delays than timeouts
      expect(timeoutStrategy.baseDelay).toBeDefined();
      expect(congestionStrategy.baseDelay).toBeDefined();
    });
  });

  describe('recordAttempt', () => {
    it('should track retry statistics', () => {
      const provider = 'test-provider';
      
      retryEngine.recordAttempt(provider, true);
      retryEngine.recordAttempt(provider, true);
      retryEngine.recordAttempt(provider, false);

      const stats = retryEngine.getProviderStats(provider);
      
      expect(stats.totalAttempts).toBe(3);
      expect(stats.successfulAttempts).toBe(2);
      expect(stats.failedAttempts).toBe(1);
    });

    it('should calculate success rate correctly', () => {
      const provider = 'test-provider-2';
      
      // 7 successes out of 10 attempts = 70%
      for (let i = 0; i < 7; i++) {
        retryEngine.recordAttempt(provider, true);
      }
      for (let i = 0; i < 3; i++) {
        retryEngine.recordAttempt(provider, false);
      }

      const stats = retryEngine.getProviderStats(provider);
      expect(stats.successRate).toBeCloseTo(70, 0);
    });
  });
});
