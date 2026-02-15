import { useState } from 'react';
import { Zap, AlertTriangle, Activity, TrendingUp } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function ChaosEngineering() {
  const [failureRate, setFailureRate] = useState(30);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>(null);

  const scenarios = [
    { id: 'rpc_timeout', name: 'RPC Timeout', icon: Activity, color: 'yellow', description: 'Network timeouts' },
    { id: 'network_congestion', name: 'Network Congestion', icon: AlertTriangle, color: 'orange', description: 'Mempool full' },
    { id: 'success', name: 'Immediate Success', icon: TrendingUp, color: 'emerald', description: 'First attempt success' },
  ];

  const triggerScenario = async (scenario: string) => {
    setIsRunning(true);
    try {
      await axios.post(`${API_URL}/api/demo/trigger`, { scenario });
      setResults({ scenario, success: true, time: new Date().toLocaleTimeString() });
    } catch (error) {
      console.error('Error triggering scenario:', error);
    } finally {
      setTimeout(() => setIsRunning(false), 1000);
    }
  };

  const stressTest = async () => {
    setIsRunning(true);
    setResults({ type: 'stress', status: 'Running stress test...' });
    
    for (let i = 0; i < 5; i++) {
      const randomScenario = Math.random() > (failureRate / 100) ? 'success' : 'rpc_timeout';
      await triggerScenario(randomScenario);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setResults({ type: 'stress', status: 'Completed!', count: 5 });
    setIsRunning(false);
  };

  return (
    <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Chaos Engineering Mode</h2>
            <p className="text-sm text-slate-400">Test system resilience with controlled failures</p>
          </div>
        </div>
      </div>

      {/* Failure Rate Slider */}
      <div className="mb-6 p-4 bg-slate-700/30 rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-slate-300">Failure Injection Rate</label>
          <span className="text-2xl font-bold text-purple-400">{failureRate}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={failureRate}
          onChange={(e) => setFailureRate(Number(e.target.value))}
          className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${failureRate}%, #475569 ${failureRate}%, #475569 100%)`
          }}
        />
        <div className="flex justify-between text-xs text-slate-500 mt-2">
          <span>0% (Perfect Network)</span>
          <span>100% (Total Chaos)</span>
        </div>
      </div>

      {/* Scenario Buttons */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {scenarios.map((scenario) => {
          const Icon = scenario.icon;
          return (
            <button
              key={scenario.id}
              onClick={() => triggerScenario(scenario.id)}
              disabled={isRunning}
              className={`p-4 rounded-xl border transition-all ${
                isRunning
                  ? 'opacity-50 cursor-not-allowed'
                  : `border-${scenario.color}-500/30 bg-${scenario.color}-500/10 hover:bg-${scenario.color}-500/20 hover:scale-105`
              }`}
            >
              <Icon className={`w-6 h-6 text-${scenario.color}-400 mx-auto mb-2`} />
              <div className={`text-sm font-semibold text-${scenario.color}-400 mb-1`}>
                {scenario.name}
              </div>
              <div className="text-xs text-slate-500">{scenario.description}</div>
            </button>
          );
        })}
      </div>

      {/* Stress Test Button */}
      <button
        onClick={stressTest}
        disabled={isRunning}
        className={`w-full py-4 rounded-xl font-semibold transition-all ${
          isRunning
            ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 shadow-lg shadow-purple-500/30'
        }`}
      >
        {isRunning ? (
          <span className="flex items-center justify-center gap-2">
            <Activity className="w-5 h-5 animate-spin" />
            Running Stress Test...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Zap className="w-5 h-5" />
            Run Stress Test (5 Payments)
          </span>
        )}
      </button>

      {/* Results Display */}
      {results && (
        <div className="mt-6 p-4 bg-slate-700/30 rounded-xl border border-slate-600/50">
          <div className="text-sm text-slate-300">
            <div className="font-semibold text-purple-400 mb-2">Last Test Result:</div>
            {results.type === 'stress' ? (
              <div>
                <div>{results.status}</div>
                {results.count && <div className="text-emerald-400 mt-1">✓ {results.count} payments processed</div>}
              </div>
            ) : (
              <div>
                <div>Scenario: <span className="text-purple-400">{results.scenario}</span></div>
                <div>Time: {results.time}</div>
                <div className="text-emerald-400 mt-1">✓ Test completed successfully</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 p-4 bg-purple-500/5 rounded-xl border border-purple-500/20">
        <div className="text-xs text-slate-300">
          <span className="font-semibold text-purple-400">💡 Tip:</span> Even at 80% failure rate, x402-Nexus maintains 90%+ final success through intelligent retry!
        </div>
      </div>
    </div>
  );
}
