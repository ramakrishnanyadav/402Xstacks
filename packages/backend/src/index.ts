import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import { AdaptiveRetryEngine } from './core/retry-engine';
import { PaymentOrchestrator } from './core/payment-orchestrator';
import { BlockchainClient } from './services/blockchain-client';
import { BlockchainVerifier } from './services/blockchain-verifier';
import { PaymentStateManager } from './services/payment-state-manager';
import { DemoService } from './services/demo-service';
import { createRouter } from './api/routes';
import { createDemoRouter } from './api/demo-routes';
import { createMonitoringRouter } from './api/monitoring-routes';
import { createX402DemoRouter } from './api/x402-demo-routes';
import { cleanupExpiredChallenges, getActiveChallengesCount } from './middleware/x402-protocol';
import { logger } from './utils/logger';
import { configureSecurityMiddleware } from './middleware/security';
import { apiLimiter } from './middleware/rate-limiter';
import { requestTracking, healthChecker } from './utils/monitoring';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3001;

async function main() {
  // Initialize services
  logger.info('[App] Initializing x402-Nexus services...');

  const stateManager = new PaymentStateManager();
  await stateManager.connect();

  const blockchainClient = new BlockchainClient();
  const retryEngine = new AdaptiveRetryEngine();
  const verifier = new BlockchainVerifier(blockchainClient, stateManager);
  
  const orchestrator = new PaymentOrchestrator(
    retryEngine,
    blockchainClient,
    verifier,
    stateManager
  );

  const demoService = new DemoService();

  // Create Express app
  const app = express();
  
  // ====================================================================
  // CRITICAL: CORS MUST BE FIRST - Before ANY other middleware
  // ====================================================================
  app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-API-Key',
      'X-Sender-Key',
      'x-payment-proof',
      'x-payment-id',
      'x-payment-nonce'
    ],
    exposedHeaders: ['x-payment-proof', 'x-payment-id', 'x-payment-nonce'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
  }));

  // Explicit OPTIONS handler for all routes
  app.options('*', cors());
  
  // Request logging (for debugging)
  app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
      logger.debug('[CORS] Preflight request', { 
        path: req.path,
        origin: req.headers.origin,
        requestedHeaders: req.headers['access-control-request-headers']
      });
    }
    next();
  });
  
  // Security middleware (AFTER CORS)
  configureSecurityMiddleware(app);
  
  // Body parser
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  // Rate limiting
  app.use('/api', apiLimiter);

  // Request tracking middleware
  app.use(requestTracking);

  // Create HTTP server
  const httpServer = createServer(app);

  // Setup Socket.IO for real-time updates
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true
  });

  logger.info('[WebSocket] Socket.io server configured');

  // WebSocket connection handling
  io.on('connection', (socket) => {
    logger.info(`[WebSocket] Client connected: ${socket.id}`);

    socket.on('disconnect', () => {
      logger.info(`[WebSocket] Client disconnected: ${socket.id}`);
    });
  });

  // Forward orchestrator events to WebSocket clients
  orchestrator.on('payment:created', (data) => {
    logger.info('[WebSocket] Broadcasting payment:created', data);
    io.emit('payment:created', data);
  });

  orchestrator.on('payment:retrying', (data) => {
    logger.info('[WebSocket] Broadcasting payment:retrying', data);
    io.emit('payment:retrying', data);
  });

  orchestrator.on('payment:confirmed', (data) => {
    logger.info('[WebSocket] Broadcasting payment:confirmed', data);
    io.emit('payment:confirmed', data);
  });

  orchestrator.on('payment:failed', (data) => {
    logger.info('[WebSocket] Broadcasting payment:failed', data);
    io.emit('payment:failed', data);
  });

  orchestrator.on('payment:refunded', (data) => {
    logger.info('[WebSocket] Broadcasting payment:refunded', data);
    io.emit('payment:refunded', data);
  });

  // Setup API routes
  const apiRouter = createRouter(orchestrator, stateManager);
  app.use('/api', apiRouter);

  // Setup demo routes
  const demoRouter = createDemoRouter(demoService);
  app.use('/api/demo', demoRouter);

  // Setup monitoring routes
  const monitoringRouter = createMonitoringRouter();
  app.use('/monitoring', monitoringRouter);

  // Setup x402 protocol demo routes
  const x402Router = createX402DemoRouter();
  app.use('/api/x402', x402Router);

  // Forward demo service events to WebSocket
  demoService.on('payment:created', (data) => {
    logger.info('[Demo] Broadcasting payment:created', data);
    io.emit('payment:created', data);
  });

  demoService.on('payment:retrying', (data) => {
    logger.info('[Demo] Broadcasting payment:retrying', data);
    io.emit('payment:retrying', data);
  });

  demoService.on('payment:confirmed', (data) => {
    logger.info('[Demo] Broadcasting payment:confirmed', data);
    io.emit('payment:confirmed', data);
  });

  demoService.on('payment:failed', (data) => {
    logger.info('[Demo] Broadcasting payment:failed', data);
    io.emit('payment:failed', data);
  });

  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      service: 'x402-Nexus API',
      version: '1.0.0',
      description: 'Non-Custodial Payment Reliability Layer for Stacks',
      endpoints: {
        health: '/api/health',
        payments: '/api/payments',
        metrics: '/api/metrics',
        demo: '/api/demo/trigger'
      },
      websocket: 'ws://localhost:' + PORT,
      network: blockchainClient.getNetworkInfo()
    });
  });

  // Register health checks
  healthChecker.register('redis', async () => {
    try {
      await stateManager.getMetric('health_check');
      return true;
    } catch {
      return false;
    }
  });

  healthChecker.register('blockchain', async () => {
    try {
      const info = blockchainClient.getNetworkInfo();
      return !!info.network;
    } catch {
      return false;
    }
  });

  // Start orchestrator background services
  await orchestrator.start();

  // Auto-generate demo payments in demo mode
  if (process.env.DEMO_MODE === 'true') {
    logger.info('[App] Starting auto-demo payment generator (every 8s)...');
    setInterval(async () => {
      try {
        const scenarios = ['success', 'rpc_timeout', 'success', 'network_congestion', 'success'];
        const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
        
        if (scenario === 'success') {
          await demoService.simulateSuccess();
        } else if (scenario === 'rpc_timeout') {
          await demoService.simulateRpcTimeout();
        } else if (scenario === 'network_congestion') {
          await demoService.simulateNetworkCongestion();
        }
      } catch (err) {
        logger.error('[AutoDemo] Error:', err);
      }
    }, 8000);
  }

  // Cleanup expired x402 payment challenges every 5 minutes
  setInterval(() => {
    cleanupExpiredChallenges();
    logger.debug('[X402] Active challenges:', { count: getActiveChallengesCount() });
  }, 5 * 60 * 1000);

  // Start server
  httpServer.listen(PORT, () => {
    logger.info(`[App] x402-Nexus API listening on port ${PORT}`);
    logger.info(`[App] WebSocket server ready`);
    logger.info(`[App] Network: ${blockchainClient.getNetworkInfo().network}`);
    logger.info(`[App] Auto-demo: ${process.env.DEMO_MODE === 'true' ? 'ACTIVE (8s interval)' : 'disabled'}`);
    logger.info(`[App] 💰 x402 Protocol: ENABLED - Payment-gated endpoints at /api/x402/*`);
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    logger.info('[App] Shutting down gracefully...');
    orchestrator.stop();
    await stateManager.disconnect();
    httpServer.close(() => {
      logger.info('[App] Server closed');
      process.exit(0);
    });
  });

  process.on('SIGTERM', async () => {
    logger.info('[App] Shutting down gracefully...');
    orchestrator.stop();
    await stateManager.disconnect();
    httpServer.close(() => {
      logger.info('[App] Server closed');
      process.exit(0);
    });
  });
}

// Start the application
main().catch((error) => {
  logger.error('[App] Fatal error:', error);
  process.exit(1);
});
