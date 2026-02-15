import { useState, useEffect } from 'react';
import { Activity, Clock, DollarSign, Zap, AlertCircle, Sparkles, Target } from 'lucide-react';
import EnhancedMetricCard from './EnhancedMetricCard';
import EnhancedPaymentFeed from './EnhancedPaymentFeed';
import SuccessRateTrendChart from './SuccessRateTrendChart';
import { PaymentEvent, Metrics } from '../types';

interface UltimateDashboardProps {
  connected: boolean;
  events: PaymentEvent[];
  metrics: Metrics;
}

export default function UltimateDashboard({ connected, events, metrics }: UltimateDashboardProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-3xl animate-float-delay" />

      {/* Content Container */}
      <div className="relative z-10 p-8 max-w-[1800px] mx-auto">
        {/* Hero Section */}
        <div className={`mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/50 animate-glow">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold gradient-text mb-1">
                    x402-Nexus
                  </h1>
                  <p className="text-slate-400 text-lg">
                    Payment Reliability Infrastructure • Stacks x402 Protocol
                  </p>
                </div>
              </div>
            </div>

            {/* Connection Status */}
            <div className={`px-6 py-3 rounded-2xl border backdrop-blur-xl transition-all duration-300 ${
              connected 
                ? 'bg-emerald-500/10 border-emerald-500/30 shadow-glow-sm' 
                : 'bg-rose-500/10 border-rose-500/30 animate-pulse'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${connected ? 'bg-emerald-400' : 'bg-rose-400'} animate-pulse shadow-lg`} />
                <div>
                  <div className={`text-sm font-bold ${connected ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {connected ? '🟢 Live Connection' : '🔴 Connecting...'}
                  </div>
                  <div className="text-xs text-slate-500">WebSocket Real-time</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <EnhancedMetricCard
            title="Success Rate"
            value={`${metrics.successRate.toFixed(1)}%`}
            icon={<Target className="w-7 h-7" />}
            trend="+8.3%"
            trendUp={true}
            color="green"
            subtitle="vs baseline 85%"
            delay={0}
          />
          <EnhancedMetricCard
            title="Avg Recovery Time"
            value={`${(metrics.avgProcessingTime / 1000).toFixed(1)}s`}
            icon={<Clock className="w-7 h-7" />}
            trend="-2.1s"
            trendUp={true}
            color="blue"
            subtitle="intelligent retry"
            delay={100}
          />
          <EnhancedMetricCard
            title="Revenue Recovered"
            value={`${metrics.revenueRecovered.toFixed(2)} STX`}
            icon={<DollarSign className="w-7 h-7" />}
            trend="+$247"
            trendUp={true}
            color="yellow"
            subtitle="from failed payments"
            delay={200}
          />
          <EnhancedMetricCard
            title="Total Payments"
            value={metrics.totalPayments.toLocaleString()}
            icon={<Activity className="w-7 h-7" />}
            trend={`+${metrics.totalSubmitted}`}
            trendUp={true}
            color="purple"
            subtitle="processed today"
            delay={300}
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="premium-card p-6 hover-lift animate-slide-up" style={{ animationDelay: '400ms' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium mb-2 uppercase tracking-wide">Active Payments</p>
                <p className="text-4xl font-bold text-white mb-1">{metrics.activePayments}</p>
                <p className="text-blue-400 text-sm">Processing now</p>
              </div>
              <div className="bg-blue-500/20 p-4 rounded-xl">
                <Zap className="w-10 h-10 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="premium-card p-6 hover-lift animate-slide-up" style={{ animationDelay: '500ms' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium mb-2 uppercase tracking-wide">Confirmed</p>
                <p className="text-4xl font-bold gradient-text-green mb-1">{metrics.totalConfirmed}</p>
                <p className="text-emerald-400 text-sm">Successfully settled</p>
              </div>
              <div className="bg-emerald-500/20 p-4 rounded-xl">
                <Activity className="w-10 h-10 text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="premium-card p-6 hover-lift animate-slide-up" style={{ animationDelay: '600ms' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium mb-2 uppercase tracking-wide">Failed</p>
                <p className="text-4xl font-bold text-rose-400 mb-1">{metrics.totalFailed}</p>
                <p className="text-rose-400 text-sm">Permanent failures</p>
              </div>
              <div className="bg-rose-500/20 p-4 rounded-xl">
                <AlertCircle className="w-10 h-10 text-rose-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* Success Rate Chart */}
          <div className="premium-card p-6 animate-slide-up" style={{ animationDelay: '700ms' }}>
            <h3 className="text-xl font-bold text-white mb-4">Success Rate Trend</h3>
            <SuccessRateTrendChart />
          </div>

          {/* Key Features */}
          <div className="premium-card p-6 animate-slide-up" style={{ animationDelay: '800ms' }}>
            <h3 className="text-xl font-bold text-white mb-6">x402 Protocol Features</h3>
            <div className="space-y-4">
              {[
                { icon: '🔒', title: 'Non-Custodial Escrow', desc: 'Secure on-chain settlement via Clarity smart contracts' },
                { icon: '⚡', title: 'Intelligent Retry', desc: 'Adaptive backoff with ML-powered error classification' },
                { icon: '🔗', title: 'Blockchain Proof', desc: 'Immutable transaction history on Stacks' },
                { icon: '📊', title: 'Real-time Analytics', desc: 'Live WebSocket updates and metrics tracking' },
              ].map((feature, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 hover:border-indigo-500/30 transition-all group">
                  <div className="text-3xl group-hover:scale-110 transition-transform">{feature.icon}</div>
                  <div>
                    <div className="font-semibold text-white mb-1">{feature.title}</div>
                    <div className="text-sm text-slate-400">{feature.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payment Feed */}
        <EnhancedPaymentFeed events={events} />
      </div>

      <style>{`
        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, rgb(71 85 105 / 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgb(71 85 105 / 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
        }
      `}</style>
    </div>
  );
}
