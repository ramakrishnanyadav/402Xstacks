import { ErrorType } from '../types';

/**
 * Classifies errors to determine retry strategy
 */
export class ErrorClassifier {
  /**
   * Classify an error to determine if it's transient or permanent
   */
  static classify(error: any): ErrorType {
    const errorMessage = error.message?.toLowerCase() || '';
    const errorCode = error.code;

    // RPC/Network errors (transient)
    if (
      errorMessage.includes('timeout') ||
      errorMessage.includes('econnrefused') ||
      errorMessage.includes('enotfound') ||
      errorCode === 'ETIMEDOUT' ||
      errorCode === 'ECONNREFUSED'
    ) {
      return ErrorType.RPC_TIMEOUT;
    }

    if (
      errorMessage.includes('network') ||
      errorMessage.includes('fetch failed') ||
      errorCode === 'ENETUNREACH'
    ) {
      return ErrorType.NETWORK_ERROR;
    }

    // Mempool/Transaction errors (transient)
    if (
      errorMessage.includes('mempool full') ||
      errorMessage.includes('too many pending') ||
      errorMessage.includes('nonce')
    ) {
      return ErrorType.MEMPOOL_FULL;
    }

    if (errorMessage.includes('nonce')) {
      return ErrorType.NONCE_CONFLICT;
    }

    if (errorMessage.includes('transaction timeout')) {
      return ErrorType.TX_TIMEOUT;
    }

    // Balance/Fund errors (permanent)
    if (
      errorMessage.includes('insufficient') ||
      errorMessage.includes('not enough balance') ||
      errorMessage.includes('insufficient funds')
    ) {
      return ErrorType.INSUFFICIENT_BALANCE;
    }

    // Address errors (permanent)
    if (
      errorMessage.includes('invalid address') ||
      errorMessage.includes('invalid recipient') ||
      errorMessage.includes('malformed address')
    ) {
      return ErrorType.INVALID_ADDRESS;
    }

    // Contract errors (permanent)
    if (
      errorMessage.includes('contract error') ||
      errorMessage.includes('runtime error')
    ) {
      return ErrorType.CONTRACT_ERROR;
    }

    // Default to network error (transient) for unknown errors
    return ErrorType.NETWORK_ERROR;
  }

  /**
   * Determine if error is retryable
   */
  static isRetryable(errorType: ErrorType): boolean {
    const permanentErrors = [
      ErrorType.INSUFFICIENT_BALANCE,
      ErrorType.INVALID_ADDRESS,
      ErrorType.CONTRACT_ERROR,
      ErrorType.INVALID_REQUEST
    ];

    return !permanentErrors.includes(errorType);
  }

  /**
   * Get human-readable error message
   */
  static getErrorMessage(errorType: ErrorType): string {
    const messages: Record<ErrorType, string> = {
      [ErrorType.RPC_TIMEOUT]: 'RPC endpoint timeout - retrying with backoff',
      [ErrorType.NETWORK_ERROR]: 'Network connectivity issue - retrying',
      [ErrorType.MEMPOOL_FULL]: 'Blockchain mempool congestion - retrying with delay',
      [ErrorType.NONCE_CONFLICT]: 'Transaction nonce conflict - retrying',
      [ErrorType.TX_TIMEOUT]: 'Transaction confirmation timeout - retrying',
      [ErrorType.INSUFFICIENT_BALANCE]: 'Insufficient balance - payment failed permanently',
      [ErrorType.INVALID_ADDRESS]: 'Invalid recipient address - payment failed permanently',
      [ErrorType.CONTRACT_ERROR]: 'Smart contract error - payment failed permanently',
      [ErrorType.INVALID_REQUEST]: 'Invalid payment request - payment failed permanently'
    };

    return messages[errorType] || 'Unknown error';
  }
}
