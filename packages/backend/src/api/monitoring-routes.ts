import { Router, Request, Response } from 'express';
import { metricsCollector, performanceMonitor, healthChecker } from '../utils/monitoring';
import { logger } from '../utils/logger';

/**
 * Monitoring and observability endpoints
 */
export function createMonitoringRouter(): Router {
  const router = Router();

  /**
   * GET /monitoring/metrics
   * Get application metrics
   */
  router.get('/metrics', (req: Request, res: Response) => {
    try {
      const requestMetrics = metricsCollector.getMetrics();
      const performanceMetrics = performanceMonitor.getAllStats();

      res.json({
        requests: requestMetrics,
        performance: performanceMetrics,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      logger.error('[Monitoring] Error getting metrics:', error);
      res.status(500).json({ error: 'Failed to retrieve metrics' });
    }
  });

  /**
   * GET /monitoring/health
   * Comprehensive health check
   */
  router.get('/health', async (req: Request, res: Response) => {
    try {
      const healthStatus = await healthChecker.runChecks();
      
      const statusCode = healthStatus.status === 'healthy' ? 200 
        : healthStatus.status === 'degraded' ? 200 
        : 503;

      res.status(statusCode).json(healthStatus);
    } catch (error: any) {
      logger.error('[Monitoring] Error running health checks:', error);
      res.status(503).json({
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  /**
   * GET /monitoring/requests
   * Get recent request logs
   */
  router.get('/requests', (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const recentRequests = metricsCollector.getRecentRequests(limit);

      res.json({
        requests: recentRequests,
        total: recentRequests.length,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      logger.error('[Monitoring] Error getting requests:', error);
      res.status(500).json({ error: 'Failed to retrieve requests' });
    }
  });

  /**
   * GET /monitoring/performance/:operation
   * Get performance stats for a specific operation
   */
  router.get('/performance/:operation', (req: Request, res: Response) => {
    try {
      const { operation } = req.params;
      const stats = performanceMonitor.getStats(operation);

      if (!stats) {
        return res.status(404).json({
          error: 'Operation not found',
          message: `No performance data for operation: ${operation}`
        });
      }

      res.json({
        operation,
        stats,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      logger.error('[Monitoring] Error getting performance stats:', error);
      res.status(500).json({ error: 'Failed to retrieve performance stats' });
    }
  });

  return router;
}
