import { Router, Request, Response } from 'express';
import { requirePayment } from '../middleware/x402-protocol';
import { logger } from '../utils/logger';

/**
 * Demo routes showcasing HTTP 402 payment-gated endpoints
 * These routes demonstrate real x402-stacks protocol usage
 */

export function createX402DemoRouter(): Router {
  const router = Router();

  /**
   * Free tier: Public API endpoint (no payment required)
   */
  router.get('/public/data', (req: Request, res: Response) => {
    res.json({
      message: 'This is public data - no payment required',
      data: {
        timestamp: new Date().toISOString(),
        freeQuota: 'unlimited',
        tier: 'public'
      }
    });
  });

  /**
   * Premium tier: AI model access (requires 0.1 STX payment)
   * Demonstrates x402 payment-gated API
   */
  router.post('/premium/ai-inference', 
    requirePayment({ amount: 0.1, resource: '/premium/ai-inference' }),
    async (req: Request, res: Response) => {
      const { prompt, model = 'llama-3' } = req.body;

      logger.info('[X402 Demo] AI inference request', { model, promptLength: prompt?.length });

      // Simulate AI inference
      res.json({
        success: true,
        model,
        result: `AI Response to: "${prompt}"`,
        tokensUsed: 150,
        processingTime: 1200,
        costSTX: 0.1,
        timestamp: new Date().toISOString()
      });
    }
  );

  /**
   * Premium tier: High-frequency data API (requires 0.05 STX per request)
   */
  router.get('/premium/market-data/:symbol',
    requirePayment({ amount: 0.05, resource: '/premium/market-data' }),
    async (req: Request, res: Response) => {
      const { symbol } = req.params;

      logger.info('[X402 Demo] Market data request', { symbol });

      // Simulate market data
      res.json({
        symbol: symbol.toUpperCase(),
        price: 45_000 + Math.random() * 1000,
        volume24h: 125_000_000,
        change24h: (Math.random() * 10 - 5).toFixed(2) + '%',
        lastUpdated: new Date().toISOString(),
        tier: 'premium',
        costSTX: 0.05
      });
    }
  );

  /**
   * Enterprise tier: Batch processing (requires 1.0 STX)
   */
  router.post('/enterprise/batch-process',
    requirePayment({ amount: 1.0, resource: '/enterprise/batch-process' }),
    async (req: Request, res: Response) => {
      const { operations } = req.body;

      logger.info('[X402 Demo] Batch processing request', { 
        operationCount: operations?.length 
      });

      // Simulate batch processing
      const results = operations?.map((op: any, idx: number) => ({
        id: idx,
        operation: op,
        status: 'completed',
        result: `Processed: ${JSON.stringify(op)}`
      })) || [];

      res.json({
        success: true,
        batchId: `batch-${Date.now()}`,
        totalOperations: results.length,
        results,
        costSTX: 1.0,
        processingTime: results.length * 100,
        timestamp: new Date().toISOString()
      });
    }
  );

  /**
   * Micro-payment: Content access (requires 0.01 STX)
   * Perfect for pay-per-article or pay-per-view content
   */
  router.get('/content/premium-article/:id',
    requirePayment({ amount: 0.01, resource: '/content/premium-article' }),
    (req: Request, res: Response) => {
      const { id } = req.params;

      res.json({
        articleId: id,
        title: 'Premium Content: The Future of Micropayments',
        author: 'x402 Team',
        content: 'This premium article is only accessible with payment. The x402 protocol enables seamless micropayments for digital content...',
        publishedAt: '2026-02-10',
        costSTX: 0.01,
        wordCount: 1500
      });
    }
  );

  /**
   * API credits endpoint (requires 0.5 STX, grants 100 API calls)
   */
  router.post('/credits/purchase',
    requirePayment({ amount: 0.5, resource: '/credits/purchase' }),
    (req: Request, res: Response) => {
      const { credits = 100 } = req.body;

      res.json({
        success: true,
        creditsPurchased: credits,
        costSTX: 0.5,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        creditBalance: credits,
        perCallCost: '0.005 STX',
        timestamp: new Date().toISOString()
      });
    }
  );

  /**
   * WebSocket stream access token (requires 0.2 STX)
   */
  router.post('/stream/access-token',
    requirePayment({ amount: 0.2, resource: '/stream/access-token' }),
    (req: Request, res: Response) => {
      // Generate access token for WebSocket connection
      const token = `ws-token-${Date.now()}-${Math.random().toString(36).substring(2)}`;

      res.json({
        success: true,
        accessToken: token,
        wsUrl: `ws://localhost:3001/stream?token=${token}`,
        validFor: '1 hour',
        costSTX: 0.2,
        features: ['real-time market data', 'transaction alerts', 'network status'],
        timestamp: new Date().toISOString()
      });
    }
  );

  /**
   * Usage statistics (free endpoint to check spending)
   */
  router.get('/usage/stats', (req: Request, res: Response) => {
    res.json({
      totalRequests: 47,
      totalSpentSTX: 2.86,
      averageCostPerRequest: 0.061,
      topEndpoints: [
        { endpoint: '/premium/ai-inference', requests: 15, totalCost: 1.5 },
        { endpoint: '/premium/market-data', requests: 20, totalCost: 1.0 },
        { endpoint: '/content/premium-article', requests: 12, totalCost: 0.12 }
      ],
      period: 'last 30 days'
    });
  });

  return router;
}
