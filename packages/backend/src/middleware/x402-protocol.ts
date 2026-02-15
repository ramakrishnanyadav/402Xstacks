import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * HTTP 402 Payment Required Protocol Middleware
 * Implements x402-stacks standard for payment-gated API endpoints
 */

export interface X402PaymentChallenge {
  amount: number; // Amount in microSTX
  recipient: string; // Stacks address to receive payment
  resource: string; // Resource being accessed
  nonce: string; // Unique challenge nonce
  expiresAt: number; // Unix timestamp
}

export interface X402PaymentProof {
  txHash: string; // Stacks transaction hash
  paymentId: string; // x402-Nexus payment ID
  nonce: string; // Challenge nonce
}

// Store for active payment challenges (in production, use Redis)
const activeChallenges = new Map<string, X402PaymentChallenge>();

/**
 * Middleware to enforce HTTP 402 payment requirements
 * Returns 402 Payment Required with payment challenge if no valid proof is provided
 */
export const requirePayment = (options: {
  amount: number; // Amount in STX
  recipient?: string;
  resource?: string;
}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check for payment proof in headers (lowercase normalized)
      const paymentProof = req.headers['x-payment-proof'] as string;
      const paymentId = req.headers['x-payment-id'] as string;
      const paymentNonce = req.headers['x-payment-nonce'] as string;

      logger.info('[X402] Payment validation check', { 
        path: req.path,
        method: req.method,
        hasProof: !!paymentProof, 
        hasId: !!paymentId,
        hasNonce: !!paymentNonce,
        proofValue: paymentProof?.substring(0, 20) + '...',
        idValue: paymentId,
        nonceValue: paymentNonce?.substring(0, 30) + '...',
        paymentHeaders: Object.keys(req.headers).filter(h => h.includes('payment'))
      });

      // If payment proof is provided, validate it
      if (paymentProof && paymentId) {
        try {
          const isValid = await validatePaymentProof({
            txHash: paymentProof,
            paymentId,
            nonce: paymentNonce || ''
          });

          if (isValid) {
            logger.info('[X402] Payment verified, granting access', { paymentId });
            return next();
          } else {
            logger.warn('[X402] Payment proof invalid', { paymentId });
          }
        } catch (error) {
          logger.error('[X402] Payment verification error', { error, paymentId });
        }
      }

      // No valid payment - return 402 with payment challenge
      const challenge = createPaymentChallenge({
        amount: options.amount * 1_000_000, // Convert STX to microSTX
        recipient: options.recipient || process.env.PAYMENT_RECIPIENT || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
        resource: options.resource || req.path,
      });

      // Store challenge
      activeChallenges.set(challenge.nonce, challenge);

      logger.info('[X402] Created new payment challenge', { 
        nonce: challenge.nonce,
        amountSTX: options.amount,
        resource: challenge.resource,
        expiresAt: new Date(challenge.expiresAt).toISOString()
      });

      // Return 402 Payment Required with challenge details
      return res.status(402).json({
        error: 'Payment Required',
        message: 'This resource requires payment to access',
        paymentChallenge: {
          amount: challenge.amount,
          amountSTX: options.amount,
          recipient: challenge.recipient || process.env.PAYMENT_RECIPIENT || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
          resource: challenge.resource,
          nonce: challenge.nonce,
          expiresAt: challenge.expiresAt,
          paymentEndpoint: `${process.env.API_URL || 'http://localhost:3001'}/api/payments`,
          protocol: 'x402-stacks',
          network: process.env.STACKS_NETWORK || 'testnet'
        },
        instructions: {
          step1: 'Submit payment to the paymentEndpoint with the provided nonce',
          step2: 'Include X-Payment-Nonce header with the nonce value',
          step3: 'Wait for payment confirmation',
          step4: 'Retry this request with x-payment-proof and x-payment-id headers'
        }
      });
    } catch (error: any) {
      logger.error('[X402] Middleware error', { 
        error: error.message,
        path: req.path
      });
      return res.status(500).json({
        error: 'Internal server error',
        message: 'Payment validation failed'
      });
    }
  };
};

/**
 * Create a new payment challenge
 */
function createPaymentChallenge(params: {
  amount: number;
  recipient: string;
  resource: string;
}): X402PaymentChallenge {
  return {
    amount: params.amount,
    recipient: params.recipient,
    resource: params.resource,
    nonce: generateNonce(),
    expiresAt: Date.now() + 15 * 60 * 1000 // 15 minutes
  };
}

/**
 * Validate payment proof against challenge
 */
async function validatePaymentProof(proof: X402PaymentProof): Promise<boolean> {
  // Get the challenge
  const challenge = activeChallenges.get(proof.nonce);
  
  if (!challenge) {
    logger.warn('[X402] Challenge not found', { nonce: proof.nonce });
    return false;
  }

  // Check if challenge has expired
  if (Date.now() > challenge.expiresAt) {
    logger.warn('[X402] Challenge expired', { nonce: proof.nonce });
    activeChallenges.delete(proof.nonce);
    return false;
  }

  // For demo/development: Simply validate that we have the required fields
  // In production, this would verify the transaction on-chain via Stacks API
  
  // Basic validation: check we have payment proof fields
  if (!proof.paymentId || !proof.txHash) {
    logger.warn('[X402] Invalid payment proof - missing fields', { 
      hasPaymentId: !!proof.paymentId,
      hasTxHash: !!proof.txHash
    });
    return false;
  }

  // For demo mode, accept any payment with valid structure
  // In production, you would:
  // 1. Query Stacks blockchain for the transaction
  // 2. Verify transaction is confirmed
  // 3. Verify amount and recipient match the challenge
  
  logger.info('[X402] Payment validated successfully (demo mode)', { 
    paymentId: proof.paymentId,
    nonce: proof.nonce,
    txHash: proof.txHash
  });

  // Remove challenge after successful validation
  activeChallenges.delete(proof.nonce);
  
  return true;
}

/**
 * Generate a unique nonce for payment challenges
 */
function generateNonce(): string {
  return `x402-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Cleanup expired challenges (should be called periodically)
 */
export function cleanupExpiredChallenges(): void {
  const now = Date.now();
  let cleaned = 0;

  activeChallenges.forEach((challenge, nonce) => {
    if (now > challenge.expiresAt) {
      activeChallenges.delete(nonce);
      cleaned++;
    }
  });

  if (cleaned > 0) {
    logger.info('[X402] Cleaned up expired challenges', { count: cleaned });
  }
}

/**
 * Middleware to accept payment with challenge nonce
 */
export const acceptPaymentWithNonce = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const nonce = req.headers['x-payment-nonce'] as string;

  if (nonce) {
    const challenge = activeChallenges.get(nonce);
    
    if (challenge) {
      // Attach challenge to request for validation
      (req as any).paymentChallenge = challenge;
    }
  }

  next();
};

/**
 * Get active challenges count (for monitoring)
 */
export function getActiveChallengesCount(): number {
  return activeChallenges.size;
}
