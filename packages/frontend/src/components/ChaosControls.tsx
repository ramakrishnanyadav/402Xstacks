import { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function ChaosControls() {
  const [failureRate, setFailureRate] = useState(20);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const injectChaos = async (scenario: string) => {
    setIsRunning(true);
    setResults([]);

    try {
      await axios.post(`${API_URL}/api/demo/trigger`, { scenario });
      
      setResults(prev => [...prev, {
        scenario,
        success: true,
        message: `${scenario} scenario completed`,
        timestamp: Date.now()
      }]);
    } catch (error: any) {
      setResults(prev => [...prev, {
        scenario,
        success: false,
        message: error.message,
        timestamp: Date.now()
      }]);
    }

    setIsRunning(false);
  };

  return (
    <div className="bg-slate-800 rounded-xl p-8">
      <h2 className="text-3xl font-bold text-white mb-6">🎮 Chaos Engineering Mode</h2>
      
      <div className="space-y-6">
        {/* Failure Rate Control */}
        <div className="bg-slate-700/50 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">⚙️ Failure Rate Control</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-300">Simulated Failure Rate:</span>
                <span className="text-white font-bold">{failureRate}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={failureRate}
                onChange={(e) => setFailureRate(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm text-slate-400 mt-1">
                <span>0% (Perfect Network)</span>
                <span>100% (Total Chaos)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scenario Buttons */}
        <div className="bg-slate-700/50 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">💥 Inject Failures</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => injectChaos('rpc_timeout')}
              disabled={isRunning}
              className="p-4 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-lg font-semibold hover:from-yellow-500 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <div className="text-2xl mb-2">⏱️</div>
              <div>RPC Timeout</div>
              <div className="text-sm opacity-80">Network delay</div>
            </button>

            <button
              onClick={() => injectChaos('network_congestion')}
              disabled={isRunning}
              className="p-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-semibold hover:from-orange-500 hover:to-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <div className="text-2xl mb-2">🚦</div>
              <div>Network Congestion</div>
              <div className="text-sm opacity-80">High mempool</div>
            </button>

            <button
              onClick={() => injectChaos('insufficient_balance')}
              disabled={isRunning}
              className="p-4 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg font-semibold hover:from-red-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <div className="text-2xl mb-2">💸</div>
              <div>Insufficient Balance</div>
              <div className="text-sm opacity-80">Permanent failure</div>
            </button>

            <button
              onClick={() => injectChaos('success')}
              disabled={isRunning}
              className="p-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-semibold hover:from-green-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <div className="text-2xl mb-2">✅</div>
              <div>Normal Payment</div>
              <div className="text-sm opacity-80">Instant success</div>
            </button>
          </div>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="bg-slate-700/50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">📊 Test Results</h3>
            
            <div className="space-y-3">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    result.success
                      ? 'bg-green-900/20 border-green-500/30'
                      : 'bg-red-900/20 border-red-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">
                        {result.scenario.replace(/_/g, ' ').toUpperCase()}
                      </div>
                      <div className={`text-sm ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                        {result.message}
                      </div>
                    </div>
                    <div className="text-2xl">
                      {result.success ? '✅' : '❌'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="text-2xl">💡</div>
            <div>
              <div className="font-semibold text-blue-400">Interactive Testing</div>
              <div className="text-sm text-slate-300 mt-1">
                Click the buttons above to inject different failure scenarios and watch how x402-Nexus handles them in real-time.
                The system will automatically retry transient failures and fail fast on permanent errors.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
