import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

/**
 * Rate limiting middleware for API endpoints
 */

// General API rate limiter - More permissive for development
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Much higher limit in dev
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    const resetTime = res.getHeader('RateLimit-Reset');
    res.status(429).json({
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: resetTime
    });
  }
});

// Stricter limiter for payment creation - More permissive for development
export const paymentLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === 'production' ? 10 : 100, // Much higher in dev
  message: 'Too many payment requests, please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  handler: (req: Request, res: Response) => {
    const resetTime = res.getHeader('RateLimit-Reset');
    res.status(429).json({
      error: 'Payment rate limit exceeded',
      message: 'Too many payment requests. Please wait before trying again.',
      retryAfter: resetTime
    });
  }
});

// Demo endpoint limiter
export const demoLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // Allow more for demo purposes
  message: 'Demo rate limit exceeded.',
  standardHeaders: true,
  legacyHeaders: false
});
