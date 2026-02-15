import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';

/**
 * Monitoring and observability utilities
 */

// Request tracking
export interface RequestMetrics {
  method: string;
  path: string;
  statusCode: number;
  duration: number;
  timestamp: Date;
}

// In-memory metrics storage (replace with proper metrics service in production)
class MetricsCollector {
  private requests: RequestMetrics[] = [];
  private maxStoredRequests = 1000;

  recordRequest(metrics: RequestMetrics) {
    this.requests.push(metrics);
    
    // Keep only last N requests
    if (this.requests.length > this.maxStoredRequests) {
      this.requests.shift();
    }
  }

  getMetrics() {
    const now = Date.now();
    const last5min = this.requests.filter(r => 
      now - r.timestamp.getTime() < 5 * 60 * 1000
    );

    const totalRequests = last5min.length;
    const avgDuration = totalRequests > 0
      ? last5min.reduce((sum, r) => sum + r.duration, 0) / totalRequests
      : 0;

    const statusCodes = last5min.reduce((acc, r) => {
      acc[r.statusCode] = (acc[r.statusCode] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const errorRate = totalRequests > 0
      ? (statusCodes[500] || 0) / totalRequests * 100
      : 0;

    return {
      totalRequests,
      avgDuration: Math.round(avgDuration),
      errorRate: parseFloat(errorRate.toFixed(2)),
      statusCodes,
      timestamp: new Date().toISOString()
    };
  }

  getRecentRequests(limit = 50): RequestMetrics[] {
    return this.requests.slice(-limit);
  }
}

export const metricsCollector = new MetricsCollector();

/**
 * Middleware to track request metrics
 */
export const requestTracking = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  // Track response
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    const metrics: RequestMetrics = {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      timestamp: new Date()
    };

    metricsCollector.recordRequest(metrics);

    // Log slow requests
    if (duration > 5000) {
      logger.warn('[Monitoring] Slow request detected', {
        method: req.method,
        path: req.path,
        duration,
        statusCode: res.statusCode
      });
    }

    // Log errors
    if (res.statusCode >= 500) {
      logger.error('[Monitoring] Server error', {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration
      });
    }
  });

  next();
};

/**
 * Performance monitoring wrapper
 */
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  track(operation: string, duration: number) {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }
    
    const durations = this.metrics.get(operation)!;
    durations.push(duration);
    
    // Keep only last 100 measurements
    if (durations.length > 100) {
      durations.shift();
    }
  }

  getStats(operation: string) {
    const durations = this.metrics.get(operation) || [];
    
    if (durations.length === 0) {
      return null;
    }

    const sorted = [...durations].sort((a, b) => a - b);
    const avg = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const p50 = sorted[Math.floor(sorted.length * 0.5)];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    const p99 = sorted[Math.floor(sorted.length * 0.99)];

    return {
      count: durations.length,
      avg: Math.round(avg),
      p50: Math.round(p50),
      p95: Math.round(p95),
      p99: Math.round(p99),
      min: Math.round(sorted[0]),
      max: Math.round(sorted[sorted.length - 1])
    };
  }

  getAllStats() {
    const stats: Record<string, any> = {};
    
    for (const [operation, _] of this.metrics) {
      stats[operation] = this.getStats(operation);
    }
    
    return stats;
  }
}

export const performanceMonitor = new PerformanceMonitor();

/**
 * Async operation tracker
 */
export async function trackPerformance<T>(
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();
  
  try {
    const result = await fn();
    const duration = Date.now() - startTime;
    
    performanceMonitor.track(operation, duration);
    
    logger.debug(`[Performance] ${operation}: ${duration}ms`);
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error(`[Performance] ${operation} failed after ${duration}ms`, error);
    
    throw error;
  }
}

/**
 * Health check utilities
 */
export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: Record<string, {
    status: 'up' | 'down';
    latency?: number;
    error?: string;
  }>;
  timestamp: string;
}

export class HealthChecker {
  private checks: Map<string, () => Promise<boolean>> = new Map();

  register(name: string, check: () => Promise<boolean>) {
    this.checks.set(name, check);
  }

  async runChecks(): Promise<HealthCheckResult> {
    const checks: HealthCheckResult['checks'] = {};
    let healthyCount = 0;

    for (const [name, check] of this.checks) {
      const startTime = Date.now();
      
      try {
        const isHealthy = await Promise.race([
          check(),
          new Promise<boolean>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 5000)
          )
        ]);
        
        const latency = Date.now() - startTime;
        
        checks[name] = {
          status: isHealthy ? 'up' : 'down',
          latency
        };
        
        if (isHealthy) healthyCount++;
        
      } catch (error: any) {
        checks[name] = {
          status: 'down',
          error: error.message
        };
      }
    }

    const totalChecks = this.checks.size;
    let status: HealthCheckResult['status'] = 'healthy';
    
    if (healthyCount === 0) {
      status = 'unhealthy';
    } else if (healthyCount < totalChecks) {
      status = 'degraded';
    }

    return {
      status,
      checks,
      timestamp: new Date().toISOString()
    };
  }
}

export const healthChecker = new HealthChecker();
