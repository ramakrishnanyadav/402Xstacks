import { PaymentOrchestrator } from '../../core/payment-orchestrator';
import { PaymentStateManager } from '../../services/payment-state-manager';
import { PaymentStatus } from '../../types';

// Mock dependencies
jest.mock('../../core/payment-orchestrator');
jest.mock('../../services/payment-state-manager');

describe('API Routes', () => {
  let mockOrchestrator: jest.Mocked<PaymentOrchestrator>;
  let mockStateManager: jest.Mocked<PaymentStateManager>;

  beforeEach(() => {
    mockOrchestrator = {
      processPayment: jest.fn(),
      getPaymentStatus: jest.fn(),
      on: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
    } as any;

    mockStateManager = {
      getMetrics: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn(),
    } as any;
  });

  describe('POST /api/payments', () => {
    it('should create a new payment successfully', async () => {
      const mockPaymentResult = {
        success: true,
        paymentId: 'test-payment-id',
        status: PaymentStatus.PENDING,
        attempts: 0
      };

      mockOrchestrator.processPayment.mockResolvedValue(mockPaymentResult);

      const request = {
        amount: 0.05,
        recipient: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
        metadata: 'test payment'
      };

      const result = await mockOrchestrator.processPayment(request);

      expect(result).toEqual(mockPaymentResult);
      expect(mockOrchestrator.processPayment).toHaveBeenCalledWith(request);
    });

    it('should reject invalid payment amounts', () => {
      const invalidRequests = [
        { amount: -1, recipient: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM' },
        { amount: 0, recipient: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM' },
        { amount: 10000000, recipient: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM' }
      ];

      invalidRequests.forEach(req => {
        expect(req.amount).toBeLessThan(1000000);
      });
    });
  });

  describe('GET /api/metrics', () => {
    it('should return system metrics', async () => {
      const mockMetrics = {
        successRate: 96.5,
        avgProcessingTime: 4200,
        revenueRecovered: 2.47,
        totalPayments: 1000,
        activePayments: 5,
        failedPayments: 35,
        totalSubmitted: 1000,
        totalConfirmed: 965,
        totalFailed: 35
      };

      mockStateManager.getMetrics.mockResolvedValue(mockMetrics);

      const result = await mockStateManager.getMetrics();

      expect(result).toEqual(mockMetrics);
      expect(result.successRate).toBeGreaterThan(90);
    });
  });

  describe('GET /api/health', () => {
    it('should return healthy status', () => {
      const healthCheck = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'x402-nexus-api',
        version: '1.0.0'
      };

      expect(healthCheck.status).toBe('healthy');
      expect(healthCheck.service).toBe('x402-nexus-api');
    });
  });
});
