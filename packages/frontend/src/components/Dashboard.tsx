import { useState, FC } from 'react';
import { Activity, TrendingUp, Clock, DollarSign, Zap, AlertCircle } from 'lucide-react';
import MetricCard from './MetricCard';
import PaymentFeed from './PaymentFeed';
import SuccessRateChart from './SuccessRateChart';
import DemoControls from './DemoControls';
import { PaymentEvent, Metrics } from '../types';

interface DashboardProps {
  connected: boolean;
  events: PaymentEvent[];
  metrics: Metrics;
  onRefreshMetrics: () => void;
}

const Dashboard: FC<DashboardProps> = ({ connected, events, metrics }) => {
  const [demoMode, setDemoMode] = useState(false);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              x402-Nexus Dashboard
            </h1>
            <p className="text-slate-400">
              Non-Custodial Payment Reliability Layer for Stacks
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
              <span className="text-sm text-slate-400">
                {connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <button
              onClick={() => setDemoMode(!demoMode)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                demoMode 
                  ? 'bg-primary text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {demoMode ? '🎮 Demo Mode Active' : '🎮 Enable Demo Mode'}
            </button>
          </div>
        </div>
      </div>

      {/* Demo Controls */}
      {demoMode && <DemoControls />}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Success Rate"
          value={`${metrics.successRate.toFixed(1)}%`}
          icon={<TrendingUp className="w-6 h-6" />}
          trend="+8.3%"
          trendUp={true}
          color="green"
        />
        <MetricCard
          title="Avg Processing Time"
          value={`${(metrics.avgProcessingTime / 1000).toFixed(1)}s`}
          icon={<Clock className="w-6 h-6" />}
          trend="-2.1s"
          trendUp={true}
          color="blue"
        />
        <MetricCard
          title="Revenue Recovered"
          value={`${metrics.revenueRecovered.toFixed(2)} STX`}
          icon={<DollarSign className="w-6 h-6" />}
          trend="+$247"
          trendUp={true}
          color="yellow"
        />
        <MetricCard
          title="Total Payments"
          value={metrics.totalPayments.toLocaleString()}
          icon={<Activity className="w-6 h-6" />}
          trend={`+${metrics.totalSubmitted}`}
          trendUp={true}
          color="purple"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Active Payments</p>
              <p className="text-2xl font-bold text-white">{metrics.activePayments}</p>
            </div>
            <Zap className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Confirmed</p>
              <p className="text-2xl font-bold text-green-400">{metrics.totalConfirmed}</p>
            </div>
            <Activity className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Failed</p>
              <p className="text-2xl font-bold text-red-400">{metrics.totalFailed}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
        </div>
      </div>

      {/* Success Rate Chart */}
      <div className="mb-8">
        <SuccessRateChart />
      </div>

      {/* Live Payment Feed */}
      <PaymentFeed events={events} />
    </div>
  );
};

export default Dashboard;
