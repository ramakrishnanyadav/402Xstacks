import { useEffect, useState } from 'react';
import { Activity, Database, Zap, Globe } from 'lucide-react';

interface PaymentFlow {
  id: string;
  stage: 'client' | 'nexus' | 'blockchain' | 'confirmed';
  progress: number;
  status: 'pending' | 'retrying' | 'success' | 'failed';
}

export default function NetworkVisualization() {
  const [flows, setFlows] = useState<PaymentFlow[]>([]);
  const [particles, setParticles] = useState<Array<{ id: string; x: number; y: number }>>([]);

  useEffect(() => {
    // Simulate payment flows
    const interval = setInterval(() => {
      const newFlow: PaymentFlow = {
        id: Math.random().toString(36).substr(2, 9),
        stage: 'client',
        progress: 0,
        status: 'pending'
      };
      
      setFlows(prev => [...prev.slice(-2), newFlow]);
      animateFlow(newFlow.id);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const animateFlow = (id: string) => {
    const stages: Array<PaymentFlow['stage']> = ['client', 'nexus', 'blockchain', 'confirmed'];
    let currentStage = 0;

    const animate = setInterval(() => {
      if (currentStage >= stages.length) {
        clearInterval(animate);
        return;
      }

      setFlows(prev => prev.map(f => 
        f.id === id 
          ? { ...f, stage: stages[currentStage], status: currentStage === stages.length - 1 ? 'success' : 'pending' }
          : f
      ));

      // Add success particle
      if (currentStage === stages.length - 1) {
        addParticles();
      }

      currentStage++;
    }, 2000);
  };

  const addParticles = () => {
    const newParticles = Array.from({ length: 5 }, () => ({
      id: Math.random().toString(),
      x: 50 + Math.random() * 20 - 10,
      y: 50 + Math.random() * 20 - 10
    }));
    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => setParticles([]), 2000);
  };

  const nodes = [
    { id: 'client', icon: Globe, label: 'Client App', x: 10, y: 50, color: 'blue' },
    { id: 'nexus', icon: Zap, label: 'x402-Nexus', x: 40, y: 50, color: 'purple' },
    { id: 'blockchain', icon: Database, label: 'Stacks Blockchain', x: 70, y: 50, color: 'emerald' }
  ];

  return (
    <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Live Network Flow</h2>
            <p className="text-sm text-slate-400">Watch payments flow through the system in real-time</p>
          </div>
        </div>
      </div>

      {/* Network Diagram */}
      <div className="relative h-64 bg-slate-900/50 rounded-xl border border-slate-700/50 overflow-hidden">
        {/* Connection Lines */}
        <svg className="absolute inset-0 w-full h-full">
          <defs>
            <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#a855f7" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          
          {/* Connection paths */}
          <line x1="15%" y1="50%" x2="40%" y2="50%" stroke="url(#line-gradient)" strokeWidth="2" strokeDasharray="5,5">
            <animate attributeName="stroke-dashoffset" from="10" to="0" dur="1s" repeatCount="indefinite" />
          </line>
          <line x1="45%" y1="50%" x2="70%" y2="50%" stroke="url(#line-gradient)" strokeWidth="2" strokeDasharray="5,5">
            <animate attributeName="stroke-dashoffset" from="10" to="0" dur="1s" repeatCount="indefinite" />
          </line>

          {/* Animated payment flows */}
          {flows.map(flow => {
            const x = flow.stage === 'client' ? 15 : flow.stage === 'nexus' ? 40 : flow.stage === 'blockchain' ? 70 : 85;
            return (
              <circle
                key={flow.id}
                cx={`${x}%`}
                cy="50%"
                r="6"
                className={flow.status === 'success' ? 'fill-emerald-400' : flow.status === 'retrying' ? 'fill-yellow-400' : 'fill-blue-400'}
                opacity="0.8"
              >
                <animate attributeName="r" values="6;8;6" dur="1s" repeatCount="indefinite" />
              </circle>
            );
          })}

          {/* Success particles */}
          {particles.map(p => (
            <circle
              key={p.id}
              cx={`${p.x}%`}
              cy={`${p.y}%`}
              r="3"
              className="fill-emerald-400"
              opacity="1"
            >
              <animate attributeName="opacity" from="1" to="0" dur="2s" fill="freeze" />
              <animate attributeName="r" from="3" to="1" dur="2s" fill="freeze" />
            </circle>
          ))}
        </svg>

        {/* Nodes */}
        {nodes.map(node => {
          const Icon = node.icon;
          const isActive = flows.some(f => f.stage === node.id);
          
          return (
            <div
              key={node.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
            >
              <div className={`relative ${isActive ? 'animate-pulse' : ''}`}>
                {/* Glow effect when active */}
                {isActive && (
                  <div className={`absolute inset-0 bg-${node.color}-500/30 rounded-full blur-xl`} />
                )}
                
                {/* Node */}
                <div className={`relative w-16 h-16 rounded-full bg-gradient-to-br from-${node.color}-500 to-${node.color}-600 flex items-center justify-center border-2 border-${node.color}-400/50 shadow-lg`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                
                {/* Label */}
                <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  <div className={`text-xs font-medium text-${node.color}-400`}>{node.label}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="flex items-center gap-2 p-3 bg-blue-500/5 rounded-lg border border-blue-500/20">
          <div className="w-3 h-3 rounded-full bg-blue-400" />
          <div className="text-xs text-slate-300">Processing</div>
        </div>
        <div className="flex items-center gap-2 p-3 bg-yellow-500/5 rounded-lg border border-yellow-500/20">
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="text-xs text-slate-300">Retrying</div>
        </div>
        <div className="flex items-center gap-2 p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/20">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
          <div className="text-xs text-slate-300">Confirmed</div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 p-4 bg-slate-700/30 rounded-xl">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-cyan-400">&lt;100ms</div>
            <div className="text-xs text-slate-400">Avg Latency</div>
          </div>
          <div>
            <div className="text-lg font-bold text-purple-400">3-layer</div>
            <div className="text-xs text-slate-400">Architecture</div>
          </div>
          <div>
            <div className="text-lg font-bold text-emerald-400">99.9%</div>
            <div className="text-xs text-slate-400">Uptime</div>
          </div>
        </div>
      </div>
    </div>
  );
}
