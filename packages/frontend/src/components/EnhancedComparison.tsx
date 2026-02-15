import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Zap } from 'lucide-react';

export default function EnhancedComparison() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const withoutNexus = {
    successRate: 85.2,
    avgTime: 8.5,
    failedPayments: 148,
    revenueRecovered: 0,
    manualIntervention: 'High',
  };

  const withNexus = {
    successRate: 96.3,
    avgTime: 4.2,
    failedPayments: 37,
    revenueRecovered: 247.85,
    manualIntervention: 'None',
  };

  const improvement = {
    successRate: ((withNexus.successRate - withoutNexus.successRate) / withoutNexus.successRate * 100).toFixed(1),
    avgTime: ((withoutNexus.avgTime - withNexus.avgTime) / withoutNexus.avgTime * 100).toFixed(1),
    failedPayments: ((withoutNexus.failedPayments - withNexus.failedPayments) / withoutNexus.failedPayments * 100).toFixed(1),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden p-8">
      {/* Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-rose-500/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl animate-float-delay" />

      <div className="relative z-10 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className={`text-center mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
          <h1 className="text-6xl font-bold gradient-text mb-4">Before vs After x402-Nexus</h1>
          <p className="text-xl text-slate-400">See the dramatic improvement in payment reliability</p>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Without Nexus */}
          <div className={`transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'}`}>
            <div className="premium-card p-8 border-rose-500/30 hover:border-rose-500/50 transition-all">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-rose-500/20 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-rose-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Without x402-Nexus</h2>
                  <p className="text-sm text-rose-400">Traditional Payment Flow</p>
                </div>
              </div>

              <div className="space-y-4">
                <MetricRow 
                  label="Success Rate" 
                  value={`${withoutNexus.successRate}%`} 
                  negative 
                  icon={<TrendingDown className="w-5 h-5" />}
                />
                <MetricRow 
                  label="Avg Processing Time" 
                  value={`${withoutNexus.avgTime}s`} 
                  negative 
                  icon={<TrendingDown className="w-5 h-5" />}
                />
                <MetricRow 
                  label="Failed Payments" 
                  value={withoutNexus.failedPayments} 
                  negative 
                  icon={<AlertCircle className="w-5 h-5" />}
                />
                <MetricRow 
                  label="Revenue Recovered" 
                  value={`$${withoutNexus.revenueRecovered}`} 
                  negative 
                  icon={<TrendingDown className="w-5 h-5" />}
                />
                <MetricRow 
                  label="Manual Intervention" 
                  value={withoutNexus.manualIntervention} 
                  negative 
                  icon={<AlertCircle className="w-5 h-5" />}
                />
              </div>

              <div className="mt-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <p className="text-rose-400 text-sm font-semibold">⚠️ High failure rate leads to lost revenue</p>
              </div>
            </div>
          </div>

          {/* With Nexus */}
          <div className={`transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'}`}>
            <div className="premium-card p-8 border-emerald-500/30 hover:border-emerald-500/50 transition-all relative overflow-hidden">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 opacity-0 hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center animate-pulse">
                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">With x402-Nexus</h2>
                    <p className="text-sm text-emerald-400">Intelligent Retry Layer</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <MetricRow 
                    label="Success Rate" 
                    value={`${withNexus.successRate}%`} 
                    positive 
                    improvement={`+${improvement.successRate}%`}
                    icon={<TrendingUp className="w-5 h-5" />}
                  />
                  <MetricRow 
                    label="Avg Processing Time" 
                    value={`${withNexus.avgTime}s`} 
                    positive 
                    improvement={`-${improvement.avgTime}%`}
                    icon={<Zap className="w-5 h-5" />}
                  />
                  <MetricRow 
                    label="Failed Payments" 
                    value={withNexus.failedPayments} 
                    positive 
                    improvement={`-${improvement.failedPayments}%`}
                    icon={<CheckCircle className="w-5 h-5" />}
                  />
                  <MetricRow 
                    label="Revenue Recovered" 
                    value={`$${withNexus.revenueRecovered}`} 
                    positive 
                    icon={<TrendingUp className="w-5 h-5" />}
                  />
                  <MetricRow 
                    label="Manual Intervention" 
                    value={withNexus.manualIntervention} 
                    positive 
                    icon={<CheckCircle className="w-5 h-5" />}
                  />
                </div>

                <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-emerald-400 text-sm font-semibold">✨ Automated recovery maximizes revenue</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Benefits */}
        <div className={`transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
          <div className="premium-card p-8">
            <h3 className="text-3xl font-bold text-white mb-8 text-center">Key Improvements</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ImprovementCard
                value={`+${improvement.successRate}%`}
                label="Success Rate Boost"
                description="From 85% to 96% with intelligent retry"
                color="emerald"
              />
              <ImprovementCard
                value={`${improvement.avgTime}%`}
                label="Faster Processing"
                description="Reduced time from 8.5s to 4.2s"
                color="blue"
              />
              <ImprovementCard
                value={`${improvement.failedPayments}%`}
                label="Fewer Failures"
                description="111 payments recovered automatically"
                color="purple"
              />
            </div>
          </div>
        </div>
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

interface MetricRowProps {
  label: string;
  value: string | number;
  positive?: boolean;
  negative?: boolean;
  improvement?: string;
  icon: React.ReactNode;
}

function MetricRow({ label, value, positive, negative, improvement, icon }: MetricRowProps) {
  const color = positive ? 'emerald' : negative ? 'rose' : 'slate';
  
  return (
    <div className={`flex items-center justify-between p-4 rounded-xl bg-${color}-500/5 border border-${color}-500/10 hover:border-${color}-500/30 transition-all group`}>
      <div className="flex items-center gap-3">
        <div className={`text-${color}-400 opacity-70 group-hover:opacity-100 transition-opacity`}>
          {icon}
        </div>
        <span className="text-slate-400 font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className={`text-xl font-bold text-${color}-400`}>{value}</span>
        {improvement && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full bg-${color}-500/20 text-${color}-400`}>
            {improvement}
          </span>
        )}
      </div>
    </div>
  );
}

interface ImprovementCardProps {
  value: string;
  label: string;
  description: string;
  color: 'emerald' | 'blue' | 'purple';
}

function ImprovementCard({ value, label, description, color }: ImprovementCardProps) {
  const colorMap = {
    emerald: 'from-emerald-500 to-teal-500',
    blue: 'from-blue-500 to-cyan-500',
    purple: 'from-purple-500 to-violet-500',
  };

  return (
    <div className="text-center p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 hover:border-slate-600 transition-all group hover-lift">
      <div className={`text-5xl font-bold bg-gradient-to-r ${colorMap[color]} bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform`}>
        {value}
      </div>
      <div className="text-lg font-semibold text-white mb-2">{label}</div>
      <div className="text-sm text-slate-400">{description}</div>
    </div>
  );
}
