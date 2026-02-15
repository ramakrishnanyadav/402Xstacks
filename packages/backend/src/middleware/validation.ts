import { Request, Response, NextFunction } from 'express';
import { body, validationResult, ValidationChain } from 'express-validator';

/**
 * Validation middleware for API requests
 */

// Validation rules for payment creation
export const validatePaymentRequest: ValidationChain[] = [
  body('amount')
    .isFloat({ min: 0.000001, max: 1000000 })
    .withMessage('Amount must be between 0.000001 and 1,000,000 STX'),
  
  body('recipient')
    .isString()
    .trim()
    .matches(/^S[TMP][A-Z0-9]{38,40}$/)
    .withMessage('Invalid Stacks address format'),
  
  body('metadata')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Metadata must be less than 1000 characters'),
  
  body('idempotencyKey')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 10, max: 100 })
    .withMessage('Idempotency key must be between 10 and 100 characters')
];

// Validation error handler
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.type === 'field' ? err.path : 'unknown',
        message: err.msg
      }))
    });
  }
  
  next();
};

// API key validation middleware
export const validateApiKey = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const apiKey = req.headers['x-api-key'] as string;
  const expectedKey = process.env.API_KEY_SECRET;
  
  // Skip validation in demo mode
  if (process.env.DEMO_MODE === 'true') {
    return next();
  }
  
  if (!apiKey) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'API key missing. Include X-API-Key header.'
    });
  }
  
  if (apiKey !== expectedKey) {
    return res.status(403).json({
      error: 'Authentication failed',
      message: 'Invalid API key.'
    });
  }
  
  next();
};
