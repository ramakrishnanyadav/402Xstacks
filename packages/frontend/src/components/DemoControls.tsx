import { useState } from 'react';
import { Zap, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const scenarios = [
  {
    id: 'rpc_timeout',
    name: 'RPC Timeout',
    description: 'Simulates RPC endpoint timeout, triggers retry with 1s delay',
    icon: Clock,
    color: 'yellow'
  },
  {
    id: 'network_congestion',
    name: 'Network Congestion',
    description: 'Simulates blockchain congestion, multiple retries with backoff',
    icon: Zap,
    color: 'orange'
  },
  {
    id: 'insufficient_balance',
    name: 'Insufficient Balance',
    description: 'Simulates permanent failure, no retry attempted',
    icon: AlertTriangle,
    color: 'red'
  },
  {
    id: 'success',
    name: 'Immediate Success',
    description: 'Simulates successful payment on first attempt',
    icon: CheckCircle,
    color: 'green'
  }
];

const colorClasses = {
  yellow: 'bg-yellow-500/10 hover:bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
  orange: 'bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/30 text-orange-400',
  red: 'bg-red-500/10 hover:bg-red-500/20 border-red-500/30 text-red-400',
  green: 'bg-green-500/10 hover:bg-green-500/20 border-green-500/30 text-green-400'
};

export default function DemoControls() {
  const [loading, setLoading] = useState<string | null>(null);

  const triggerScenario = async (scenarioId: string) => {
    setLoading(scenarioId);
    try {
      await axios.post(`${API_URL}/api/demo/trigger`, {
        scenario: scenarioId
      });
    } catch (error) {
      console.error('Error triggering demo:', error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/30 rounded-lg p-6 mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/20 rounded-lg">
          <Zap className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Controlled Chaos Demo</h2>
          <p className="text-sm text-slate-400">
            Simulate real-world payment failures and watch x402-Nexus recover automatically
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {scenarios.map((scenario) => {
          const Icon = scenario.icon;
          const isLoading = loading === scenario.id;

          return (
            <button
              key={scenario.id}
              onClick={() => triggerScenario(scenario.id)}
              disabled={isLoading}
              className={`${colorClasses[scenario.color as keyof typeof colorClasses]} border rounded-lg p-4 transition-all text-left relative overflow-hidden ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
              }`}
            >
              {isLoading && (
                <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              )}
              
              <Icon className="w-8 h-8 mb-3" />
              <h3 className="font-semibold mb-1">{scenario.name}</h3>
              <p className="text-xs text-slate-400">{scenario.description}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
        <p className="text-sm text-slate-300">
          💡 <strong>How it works:</strong> Each scenario demonstrates real payment failures and our intelligent retry system. 
          Watch the live feed below to see attempts, backoff timing, and successful recovery in real-time.
        </p>
      </div>
    </div>
  );
}
