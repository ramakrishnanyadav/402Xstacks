import { useState, useEffect } from 'react';
import { Gauge, Zap, TrendingUp, Server } from 'lucide-react';

export default function PerformanceMetrics() {
  const [metrics, setMetrics] = useState({
    p50: 45,
    p95: 89,
    p99: 142,
    throughput: 127,
    memory: 34,
    uptime: 99.94
  });

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(() => ({
        p50: 40 + Math.random() * 15,
        p95: 80 + Math.random() * 20,
        p99: 130 + Math.random() * 30,
        throughput: 100 + Math.random() * 50,
        memory: 30 + Math.random() * 15,
        uptime: 99.9 + Math.random() * 0.09
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const latencyMetrics = [
    { label: 'P50 Latency', value: metrics.p50.toFixed(0), unit: 'ms', color: 'emerald', threshold: 100 },
    { label: 'P95 Latency', value: metrics.p95.toFixed(0), unit: 'ms', color: 'blue', threshold: 200 },
    { label: 'P99 Latency', value: metrics.p99.toFixed(0), unit: 'ms', color: 'purple', threshold: 300 }
  ];

  const systemMetrics = [
    { icon: Zap, label: 'Throughput', value: metrics.throughput.toFixed(0), unit: 'req/s', color: 'yellow', max: 200 },
    { icon: Server, label: 'Memory Usage', value: metrics.memory.toFixed(1), unit: '%', color: 'cyan', max: 100 },
    { icon: TrendingUp, label: 'Uptime', value: metrics.uptime.toFixed(2), unit: '%', color: 'emerald', max: 100 }
  ];

  return (
    <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
            <Gauge className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Performance Metrics</h2>
            <p className="text-sm text-slate-400">Real-time system performance monitoring</p>
          </div>
        </div>
      </div>

      {/* Latency Metrics */}
      <div className="mb-6">
        <div className="text-sm font-medium text-slate-300 mb-3">Response Time Percentiles</div>
        <div className="grid grid-cols-3 gap-4">
          {latencyMetrics.map((metric, i) => {
            const percentage = (parseFloat(metric.value) / metric.threshold) * 100;
            const isGood = percentage < 80;
            
            return (
              <div key={i} className={`p-4 bg-${metric.color}-500/5 border border-${metric.color}-500/20 rounded-xl`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs text-slate-400">{metric.label}</div>
                  <div className={`text-xs ${isGood ? 'text-emerald-400' : 'text-yellow-400'}`}>
                    {isGood ? '✓ Good' : '⚠ Monitor'}
                  </div>
                </div>
                <div className={`text-2xl font-bold text-${metric.color}-400 mb-2`}>
                  {metric.value}<span className="text-sm text-slate-500 ml-1">{metric.unit}</span>
                </div>
                {/* Progress Bar */}
                <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r from-${metric.color}-500 to-${metric.color}-400 transition-all duration-500`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* System Metrics */}
      <div>
        <div className="text-sm font-medium text-slate-300 mb-3">System Health</div>
        <div className="grid grid-cols-3 gap-4">
          {systemMetrics.map((metric, i) => {
            const Icon = metric.icon;
            const percentage = (parseFloat(metric.value) / metric.max) * 100;
            
            return (
              <div key={i} className={`p-4 bg-${metric.color}-500/5 border border-${metric.color}-500/20 rounded-xl`}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-8 h-8 rounded-lg bg-${metric.color}-500/20 flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 text-${metric.color}-400`} />
                  </div>
                  <div className="text-xs text-slate-400">{metric.label}</div>
                </div>
                <div className={`text-2xl font-bold text-${metric.color}-400`}>
                  {metric.value}<span className="text-sm text-slate-500 ml-1">{metric.unit}</span>
                </div>
                {/* Circular Progress */}
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-${metric.color}-400 transition-all duration-500 rounded-full`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-slate-500">{percentage.toFixed(0)}%</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Production Ready Badge */}
      <div className="mt-6 p-4 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-300">
            <span className="font-semibold text-emerald-400">⚡ Production-Grade Performance:</span> Sub-100ms median latency, 99.9%+ uptime
          </div>
          <div className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-xs font-semibold text-emerald-400">
            LIVE
          </div>
        </div>
      </div>
    </div>
  );
}
