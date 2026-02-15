import helmet from 'helmet';
import { Express } from 'express';

/**
 * Security middleware configuration
 */

export const configureSecurityMiddleware = (app: Express) => {
  // Helmet for various security headers
  // CRITICAL: Configured to NOT interfere with CORS headers
  app.use(helmet({
    contentSecurityPolicy: false, // Disabled to prevent conflicts
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: false, // Allow cross-origin requests
  }));

  // Additional security headers (non-conflicting)
  app.use((req, res, next) => {
    // Only set security headers that don't conflict with CORS
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Don't set X-Frame-Options as it can conflict with CORS
    // Don't override any CORS headers set by cors middleware
    
    next();
  });
};
