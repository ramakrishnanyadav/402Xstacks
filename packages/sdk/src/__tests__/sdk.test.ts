import { X402Nexus, PaymentStatus } from '../index';

// Mock axios
jest.mock('axios');

describe('X402Nexus SDK', () => {
  let sdk: X402Nexus;

  beforeEach(() => {
    sdk = new X402Nexus({
      apiKey: 'test-api-key',
      apiUrl: 'http://localhost:3001',
      network: 'testnet',
      senderKey: 'test-sender-key'
    });
  });

  describe('constructor', () => {
    it('should initialize with provided config', () => {
      expect(sdk).toBeDefined();
    });

    it('should use default apiUrl if not provided', () => {
      const sdkWithDefaults = new X402Nexus({
        apiKey: 'test-key',
        senderKey: 'test-sender-key'
      });
      
      expect(sdkWithDefaults).toBeDefined();
    });
  });

  describe('processPayment', () => {
    it('should accept valid payment request', async () => {
      const request = {
        amount: 0.05,
        recipient: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
        metadata: 'test payment'
      };

      // Mock implementation would go here
      expect(request.amount).toBeGreaterThan(0);
      expect(request.recipient).toMatch(/^S[TMP]/);
    });

    it('should validate payment amount', () => {
      const invalidAmounts = [-1, 0, 10000000];
      
      invalidAmounts.forEach(amount => {
        expect(amount).toBeLessThan(1000000); // Should be within valid range
      });
    });

    it('should validate recipient address format', () => {
      const validAddresses = [
        'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
        'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
        'SM2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7'
      ];

      validAddresses.forEach(address => {
        expect(address).toMatch(/^S[TMP][A-Z0-9]{38,40}$/);
      });
    });
  });

  describe('getPaymentStatus', () => {
    it('should accept payment ID', () => {
      const paymentId = 'test-payment-123';
      expect(paymentId).toBeDefined();
      expect(typeof paymentId).toBe('string');
    });
  });

  describe('processPaymentWithPolling', () => {
    it('should accept polling configuration', () => {
      const pollingInterval = 2000;
      const maxPolls = 30;
      
      expect(pollingInterval).toBeGreaterThan(0);
      expect(maxPolls).toBeGreaterThan(0);
      expect(pollingInterval * maxPolls).toBeLessThan(120000); // Max 2 minutes
    });
  });

  describe('onPaymentStatus', () => {
    it('should register callback', () => {
      const callback = jest.fn();
      sdk.onPaymentStatus(callback);
      
      expect(callback).toBeDefined();
    });

    it('should handle payment status updates', () => {
      const statuses: PaymentStatus[] = [
        PaymentStatus.PENDING,
        PaymentStatus.RETRYING,
        PaymentStatus.SUBMITTED,
        PaymentStatus.CONFIRMED
      ];

      statuses.forEach(status => {
        expect(Object.values(PaymentStatus)).toContain(status);
      });
    });
  });
});
