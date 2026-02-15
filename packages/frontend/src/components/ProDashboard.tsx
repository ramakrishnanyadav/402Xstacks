import { useState } from 'react';
import { Activity, TrendingUp, DollarSign, Package, CheckCircle2, XCircle, Clock, Zap } from 'lucide-react';
import { PaymentEvent, Metrics, PaymentStatus } from '../types';
import SuccessRateTrendChart from './SuccessRateTrendChart';
import RevenueCounter from './RevenueCounter';
import ChaosEngineering from './ChaosEngineering';

interface ProDashboardProps {
  connected: boolean;
  events: PaymentEvent[];
  metrics: Metrics;
}

export default function ProDashboard({ connected, events, metrics }: ProDashboardProps) {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const mainMetrics = [
    {
      icon: TrendingUp,
      label: 'Success Rate',
      value: `${(metrics?.successRate || 0).toFixed(1)}%`,
      change: '+8.3%',
      color: 'emerald',
      gradient: 'from-emerald-500 to-teal-500'
    },
    {
      icon: Clock,
      label: 'Avg Processing',
      value: `${((metrics?.avgProcessingTime || 0) / 1000).toFixed(1)}s`,
      change: '-2.1s',
      color: 'blue',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: DollarSign,
      label: 'Revenue Recovered',
      value: `${metrics.revenueRecovered.toFixed(2)} STX`,
      change: '+$247',
      color: 'violet',
      gradient: 'from-violet-500 to-purple-500'
    },
    {
      icon: Package,
      label: 'Total Payments',
      value: (metrics?.totalPayments || 0).toLocaleString(),
      change: `+${metrics?.totalPayments || 0}`,
      color: 'amber',
      gradient: 'from-amber-500 to-orange-500'
    }
  ];

  const statusCards = [
    { label: 'Active', value: metrics.activePayments, icon: Activity, color: 'blue' },
    { label: 'Confirmed', value: metrics.totalConfirmed, icon: CheckCircle2, color: 'emerald' },
    { label: 'Failed', value: metrics.failedPayments, icon: XCircle, color: 'rose' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950/20 to-slate-900 p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-2">
            Payment Dashboard
          </h1>
          <p className="text-slate-400">Real-time monitoring and analytics</p>
        </div>
        
        <div className={`flex items-center gap-3 px-5 py-3 rounded-full backdrop-blur-sm transition-all ${
          connected 
            ? 'bg-emerald-500/10 border border-emerald-500/30' 
            : 'bg-rose-500/10 border border-rose-500/30 animate-pulse'
        }`}>
          <div className={`w-2.5 h-2.5 rounded-full ${connected ? 'bg-emerald-400' : 'bg-rose-400'} animate-pulse`} />
          <span className={`font-medium ${connected ? 'text-emerald-300' : 'text-rose-300'}`}>
            {connected ? 'Live Connection' : 'Connecting...'}
          </span>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {mainMetrics.map((metric, index) => (
          <div
            key={index}
            onMouseEnter={() => setHoveredCard(index)}
            onMouseLeave={() => setHoveredCard(null)}
            className="group relative"
          >
            {/* 3D Card Effect */}
            <div 
              className={`relative bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 transition-all duration-500 ${
                hoveredCard === index 
                  ? 'transform -translate-y-2 shadow-2xl shadow-' + metric.color + '-500/20' 
                  : 'shadow-lg'
              }`}
              style={{
                transform: hoveredCard === index 
                  ? 'perspective(1000px) rotateX(5deg)' 
                  : 'perspective(1000px) rotateX(0deg)'
              }}
            >
              {/* Gradient Glow */}
              <div className={`absolute inset-0 bg-gradient-to-br ${metric.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-500`} />
              
              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${metric.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <metric.icon className="w-6 h-6 text-white" />
              </div>

              {/* Content */}
              <div className="text-sm text-slate-400 mb-1">{metric.label}</div>
              <div className="text-3xl font-bold text-white mb-2">{metric.value}</div>
              <div className={`text-sm font-medium text-${metric.color}-400`}>{metric.change}</div>

              {/* Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-2xl" />
            </div>
          </div>
        ))}
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {statusCards.map((card, index) => (
          <div key={index} className={`bg-slate-800/40 backdrop-blur-sm border border-${card.color}-500/30 rounded-xl p-5 hover:border-${card.color}-500/50 transition-all duration-300 hover:scale-105`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-slate-400 text-sm mb-1">{card.label}</div>
                <div className={`text-3xl font-bold text-${card.color}-400`}>{card.value}</div>
              </div>
              <div className={`w-14 h-14 rounded-xl bg-${card.color}-500/10 flex items-center justify-center`}>
                <card.icon className={`w-7 h-7 text-${card.color}-400`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Success Rate Trend Chart */}
      <div className="mb-8">
        <SuccessRateTrendChart />
      </div>

      {/* Revenue Counter and Chaos Mode Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <RevenueCounter revenueRecovered={metrics.revenueRecovered} />
        <ChaosEngineering />
      </div>

      {/* Live Payment Stream */}
      <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Live Payment Stream</h2>
            <p className="text-slate-400">Real-time transaction monitoring</p>
          </div>
          <div className="flex items-center gap-2 text-emerald-400">
            <Zap className="w-5 h-5 animate-pulse" />
            <span className="text-sm font-medium">Auto-updating</span>
          </div>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
          {events.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-slate-500 animate-pulse" />
              </div>
              <div className="text-slate-400">Waiting for payments...</div>
              <div className="text-sm text-slate-500 mt-2">Transactions will appear here in real-time</div>
            </div>
          ) : (
            events.slice(0, 20).map((event, index) => {
              const statusConfig: Record<string, { bg: string; text: string; icon: any; label: string }> = {
                [PaymentStatus.PENDING]: { bg: 'bg-blue-500/10', text: 'text-blue-400', icon: Clock, label: 'Processing' },
                [PaymentStatus.RETRYING]: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', icon: Activity, label: 'Retrying' },
                [PaymentStatus.CONFIRMED]: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', icon: CheckCircle2, label: 'Confirmed' },
                [PaymentStatus.FAILED]: { bg: 'bg-rose-500/10', text: 'text-rose-400', icon: XCircle, label: 'Failed' }
              };

              const config = statusConfig[event.status as string] || statusConfig[PaymentStatus.PENDING];
              const StatusIcon = config.icon;

              const txHash = (event as any).txHash;
              const explorerUrl = txHash ? `https://explorer.hiro.so/txid/${txHash}?chain=testnet` : null;

              return (
                <div
                  key={event.paymentId}
                  className="group flex items-center justify-between p-4 bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/50 hover:border-slate-500/50 rounded-xl transition-all duration-300"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg ${config.bg} flex items-center justify-center`}>
                      <StatusIcon className={`w-5 h-5 ${config.text}`} />
                    </div>
                    <div>
                      <div className="font-mono text-sm text-slate-300">{event.paymentId.slice(0, 12)}...</div>
                      {txHash && explorerUrl && (
                        <a 
                          href={explorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-indigo-400 hover:text-indigo-300 underline mt-1 inline-block"
                        >
                          View on Explorer →
                        </a>
                      )}
                      {!txHash && (
                        <div className="text-xs text-slate-500 mt-1">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className={`text-sm font-semibold ${config.text}`}>
                        {config.label}
                      </div>
                      {event.attempts && event.attempts > 1 && (
                        <div className="text-xs text-slate-500 mt-1">Attempt {event.attempts}</div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-white font-semibold">{event.amount} STX</div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
