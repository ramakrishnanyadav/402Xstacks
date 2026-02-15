import { Layers, ArrowRight, Shield, Database, Zap, Activity } from 'lucide-react';

export default function ArchitectureDiagram() {
  const layers = [
    {
      name: 'Client Layer',
      color: 'blue',
      components: [
        { icon: '🌐', name: 'Web Apps', desc: 'React, Vue, Angular' },
        { icon: '📱', name: 'Mobile Apps', desc: 'iOS, Android' },
        { icon: '🤖', name: 'AI Agents', desc: 'Autonomous clients' }
      ]
    },
    {
      name: 'x402-Nexus Core',
      color: 'purple',
      components: [
        { icon: '🔄', name: 'Retry Engine', desc: 'Adaptive intelligence' },
        { icon: '🎯', name: 'Orchestrator', desc: 'Payment coordination' },
        { icon: '📊', name: 'Monitoring', desc: 'Real-time metrics' }
      ]
    },
    {
      name: 'Blockchain Layer',
      color: 'emerald',
      components: [
        { icon: '⛓️', name: 'Stacks L2', desc: 'Smart contracts' },
        { icon: '🔐', name: 'Escrow', desc: 'Non-custodial' },
        { icon: '✓', name: 'Settlement', desc: 'Bitcoin finality' }
      ]
    }
  ];

  const dataFlow = [
    { from: 'Client', to: 'x402-Nexus', label: 'Payment Request', color: 'blue' },
    { from: 'x402-Nexus', to: 'Blockchain', label: 'Transaction', color: 'purple' },
    { from: 'Blockchain', to: 'x402-Nexus', label: 'Confirmation', color: 'emerald' },
    { from: 'x402-Nexus', to: 'Client', label: 'WebSocket Update', color: 'cyan' }
  ];

  return (
    <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">System Architecture</h2>
            <p className="text-sm text-slate-400">Multi-layer, production-grade design</p>
          </div>
        </div>
      </div>

      {/* Architecture Layers */}
      <div className="space-y-4 mb-6">
        {layers.map((layer, i) => (
          <div key={i}>
            <div className={`p-5 bg-${layer.color}-500/5 border-2 border-${layer.color}-500/30 rounded-xl`}>
              <div className={`text-lg font-bold text-${layer.color}-400 mb-4`}>{layer.name}</div>
              <div className="grid grid-cols-3 gap-3">
                {layer.components.map((comp, j) => (
                  <div key={j} className="p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                    <div className="text-2xl mb-2">{comp.icon}</div>
                    <div className="text-sm font-semibold text-white mb-1">{comp.name}</div>
                    <div className="text-xs text-slate-400">{comp.desc}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Arrow between layers */}
            {i < layers.length - 1 && (
              <div className="flex items-center justify-center py-2">
                <ArrowRight className="w-6 h-6 text-slate-600" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Data Flow */}
      <div className="p-5 bg-slate-900/50 rounded-xl border border-slate-700/50">
        <div className="text-sm font-semibold text-slate-300 mb-4">Data Flow Cycle</div>
        <div className="grid grid-cols-2 gap-3">
          {dataFlow.map((flow, i) => (
            <div key={i} className={`flex items-center gap-3 p-3 bg-${flow.color}-500/5 border border-${flow.color}-500/20 rounded-lg`}>
              <div className={`w-8 h-8 rounded-full bg-${flow.color}-500/20 flex items-center justify-center flex-shrink-0`}>
                <span className="text-xs font-bold text-white">{i + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-xs font-medium text-${flow.color}-400 truncate`}>{flow.label}</div>
                <div className="text-xs text-slate-500">{flow.from} → {flow.to}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Features */}
      <div className="mt-6 grid grid-cols-4 gap-3">
        {[
          { icon: Shield, label: 'Non-Custodial', color: 'emerald' },
          { icon: Database, label: 'Redis Cache', color: 'blue' },
          { icon: Zap, label: 'WebSocket', color: 'yellow' },
          { icon: Activity, label: 'Bull Queue', color: 'purple' }
        ].map((feature, i) => {
          const Icon = feature.icon;
          return (
            <div key={i} className={`p-3 bg-${feature.color}-500/5 border border-${feature.color}-500/20 rounded-lg text-center`}>
              <Icon className={`w-5 h-5 text-${feature.color}-400 mx-auto mb-1`} />
              <div className="text-xs text-slate-300">{feature.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
