import { Router, Request, Response } from 'express';
import { DemoService } from '../services/demo-service';
import { logger } from '../utils/logger';
import { z } from 'zod';

const DemoScenarioSchema = z.object({
  scenario: z.enum(['rpc_timeout', 'network_congestion', 'insufficient_balance', 'success'])
});

export function createDemoRouter(demoService: DemoService): Router {
  const router = Router();

  /**
   * POST /api/demo/trigger
   * Trigger demo scenarios for controlled chaos
   */
  router.post('/trigger', async (req: Request, res: Response) => {
    try {
      const validated = DemoScenarioSchema.parse(req.body);
      const { scenario } = validated;

      logger.info(`[DemoAPI] Triggering scenario: ${scenario}`);

      // Trigger scenario asynchronously (don't wait)
      switch (scenario) {
        case 'rpc_timeout':
          demoService.simulateRpcTimeout().catch(err => 
            logger.error('[DemoAPI] Error in RPC timeout simulation:', err)
          );
          break;

        case 'network_congestion':
          demoService.simulateNetworkCongestion().catch(err =>
            logger.error('[DemoAPI] Error in network congestion simulation:', err)
          );
          break;

        case 'insufficient_balance':
          demoService.simulateInsufficientBalance().catch(err =>
            logger.error('[DemoAPI] Error in insufficient balance simulation:', err)
          );
          break;

        case 'success':
          demoService.simulateSuccess().catch(err =>
            logger.error('[DemoAPI] Error in success simulation:', err)
          );
          break;
      }

      res.json({
        success: true,
        scenario,
        message: `Demo scenario '${scenario}' triggered successfully`
      });

    } catch (error: any) {
      logger.error('[DemoAPI] Error triggering demo:', error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors
        });
      }

      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  });

  return router;
}
