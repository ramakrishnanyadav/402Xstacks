import { classifyError, ErrorType } from '../error-classifier';

describe('Error Classifier', () => {
  describe('classifyError', () => {
    it('should classify network timeout errors', () => {
      const timeoutErrors = [
        new Error('ETIMEDOUT'),
        new Error('Request timeout'),
        new Error('Connection timed out'),
        { message: 'timeout exceeded' }
      ];

      timeoutErrors.forEach(error => {
        const result = classifyError(error);
        expect(result).toBe(ErrorType.NETWORK_TIMEOUT);
      });
    });

    it('should classify RPC errors', () => {
      const rpcErrors = [
        new Error('RPC error: method not found'),
        new Error('JSON-RPC error'),
        { message: 'rpc call failed' }
      ];

      rpcErrors.forEach(error => {
        const result = classifyError(error);
        expect(result).toBe(ErrorType.RPC_ERROR);
      });
    });

    it('should classify insufficient balance errors', () => {
      const balanceErrors = [
        new Error('insufficient balance'),
        new Error('not enough funds'),
        { message: 'balance too low' }
      ];

      balanceErrors.forEach(error => {
        const result = classifyError(error);
        expect(result).toBe(ErrorType.INSUFFICIENT_BALANCE);
      });
    });

    it('should classify nonce conflicts', () => {
      const nonceErrors = [
        new Error('nonce conflict'),
        new Error('invalid nonce'),
        { message: 'nonce too low' }
      ];

      nonceErrors.forEach(error => {
        const result = classifyError(error);
        expect(result).toBe(ErrorType.NONCE_CONFLICT);
      });
    });

    it('should classify mempool congestion', () => {
      const congestionErrors = [
        new Error('mempool full'),
        new Error('fee too low'),
        { message: 'network congested' }
      ];

      congestionErrors.forEach(error => {
        const result = classifyError(error);
        expect(result).toBe(ErrorType.MEMPOOL_FULL);
      });
    });

    it('should classify invalid address errors', () => {
      const addressErrors = [
        new Error('invalid address'),
        new Error('malformed recipient'),
        { message: 'address validation failed' }
      ];

      addressErrors.forEach(error => {
        const result = classifyError(error);
        expect(result).toBe(ErrorType.INVALID_ADDRESS);
      });
    });

    it('should default to unknown for unrecognized errors', () => {
      const unknownErrors = [
        new Error('some random error'),
        { message: 'unexpected issue' },
        'string error'
      ];

      unknownErrors.forEach(error => {
        const result = classifyError(error);
        expect(result).toBe(ErrorType.UNKNOWN);
      });
    });
  });
});
