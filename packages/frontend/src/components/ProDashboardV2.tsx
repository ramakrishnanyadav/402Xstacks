import { useState, useEffect } from 'react';
import { Activity, TrendingUp, Clock, DollarSign, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { PaymentEvent, Metrics } from '../types';

interface Props {
  connected: boolean;
  events: PaymentEvent[];
  metrics: Metrics;
}

export default function ProDashboardV2({ connected, events, metrics }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Safe metric calculations
  const successRate = ((metrics?.successRate || 0) * 100).toFixed(1);
  const avgProcessing = ((metrics?.avgProcessingTime || 0) / 1000).toFixed(2);
  const totalPayments = metrics?.totalPayments || 0;
  const activePayments = metrics?.activePayments || 0;
  const failedPayments = metrics?.failedPayments || 0;
  const revenueRecovered = (metrics?.revenueRecovered || 0).toFixed(2);

  const mainMetrics = [
    {
      icon: TrendingUp,
      label: 'Success Rate',
      value: successRate,
      unit: '%',
      change: '+2.3%',
      trend: 'up',
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20'
    },
    {
      icon: Clock,
      label: 'Avg Processing Time',
      value: avgProcessing,
      unit: 's',
      change: '-0.4s',
      trend: 'down',
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    },
    {
      icon: DollarSign,
      label: 'Revenue Recovered',
      value: revenueRecovered,
      unit: 'STX',
      change: '+$147',
      trend: 'up',
      color: 'from-violet-500 to-purple-600',
      bgColor: 'bg-violet-500/10',
      borderColor: 'border-violet-500/20'
    },
    {
      icon: Activity,
      label: 'Total Payments',
      value: totalPayments.toLocaleString(),
      unit: '',
      change: `+${totalPayments}`,
      trend: 'up',
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20'
    }
  ];

  const statusMetrics = [
    {
      icon: CheckCircle2,
      label: 'Confirmed',
      value: (totalPayments - failedPayments - activePayments).toLocaleString(),
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20'
    },
    {
      icon: RefreshCw,
      label: 'Processing',
      value: activePayments.toLocaleString(),
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    },
    {
      icon: XCircle,
      label: 'Failed',
      value: failedPayments.toLocaleString(),
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur-xl bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                x402-Nexus
              </h1>
              <p className="text-sm text-slate-400 mt-1">Payment Reliability Infrastructure</p>
            </div>
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
                connected 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                  : 'bg-slate-800/50 border-slate-700/50 text-slate-400'
              } transition-all duration-300`}>
                <div className={`w-2 h-2 rounded-full ${
                  connected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                }`} />
                <span className="text-sm font-medium">{connected ? 'Live' : 'Disconnected'}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Main Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {mainMetrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div
                key={index}
                className={`group relative overflow-hidden rounded-2xl border ${metric.borderColor} ${metric.bgColor} backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-${metric.color.split('-')[1]}-500/20 ${
                  mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${metric.color} shadow-lg`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      metric.trend === 'up' ? 'text-emerald-400 bg-emerald-500/10' : 'text-blue-400 bg-blue-500/10'
                    }`}>
                      {metric.change}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-2">{metric.label}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-white">{metric.value}</span>
                      {metric.unit && <span className="text-lg text-slate-500">{metric.unit}</span>}
                    </div>
                  </div>
                </div>
                {/* Animated gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${metric.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              </div>
            );
          })}
        </div>

        {/* Status Overview & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Status Cards */}
          {statusMetrics.map((status, index) => {
            const Icon = status.icon;
            return (
              <div
                key={index}
                className={`rounded-2xl border ${status.borderColor} ${status.bgColor} backdrop-blur-sm p-6 transition-all duration-300 hover:scale-105 ${
                  mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: `${400 + index * 100}ms` }}
              >
                <div className="flex items-center gap-4">
                  <Icon className={`w-8 h-8 ${status.color}`} />
                  <div>
                    <p className="text-sm text-slate-400">{status.label}</p>
                    <p className="text-2xl font-bold text-white">{status.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Activity Feed */}
        <div
          className={`rounded-2xl border border-white/5 bg-slate-900/50 backdrop-blur-sm transition-all duration-500 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '700ms' }}
        >
          <div className="p-6 border-b border-white/5">
            <h3 className="text-lg font-semibold text-white">Live Activity</h3>
            <p className="text-sm text-slate-400 mt-1">Real-time payment processing stream</p>
          </div>
          <div className="p-6">
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {events?.slice(0, 10).map((event, index) => (
                <div
                  key={event.paymentId}
                  className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-slate-800/30 hover:bg-slate-800/50 transition-all duration-200"
                  style={{
                    animation: `slideIn 0.3s ease-out ${index * 50}ms both`
                  }}
                >
                  <div className={`w-2 h-2 rounded-full ${
                    event.status === 'CONFIRMED' ? 'bg-emerald-400' :
                    event.status === 'RETRYING' ? 'bg-amber-400 animate-pulse' :
                    event.status === 'FAILED' ? 'bg-red-400' :
                    'bg-blue-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      Payment {event.paymentId.slice(0, 8)}...
                    </p>
                    <p className="text-xs text-slate-400">
                      {event.amount} STX • {event.status}
                    </p>
                  </div>
                  <div className="text-xs text-slate-500">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
              {(!events || events.length === 0) && (
                <div className="text-center py-12">
                  <Activity className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-500">No activity yet</p>
                  <p className="text-sm text-slate-600 mt-1">Waiting for payment events...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
