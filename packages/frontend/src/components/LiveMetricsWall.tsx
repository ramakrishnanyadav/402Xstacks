interface LiveMetricsWallProps {
  connected: boolean;
}

export default function LiveMetricsWall({ connected }: LiveMetricsWallProps) {
  return (
    <div className="bg-slate-800 rounded-xl p-8">
      <h2 className="text-3xl font-bold text-white mb-8">📊 Live Metrics Wall</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-900/30 to-green-700/10 border border-green-500/30 rounded-xl p-6">
          <div className="text-green-400 text-sm font-semibold mb-2">SUCCESS RATE</div>
          <div className="text-5xl font-bold text-white mb-1">96.3%</div>
          <div className="text-green-400 text-sm">+11.3% ↑</div>
        </div>

        <div className="bg-gradient-to-br from-blue-900/30 to-blue-700/10 border border-blue-500/30 rounded-xl p-6">
          <div className="text-blue-400 text-sm font-semibold mb-2">AVG TIME</div>
          <div className="text-5xl font-bold text-white mb-1">4.2s</div>
          <div className="text-blue-400 text-sm">-2.1s ↓</div>
        </div>

        <div className="bg-gradient-to-br from-purple-900/30 to-purple-700/10 border border-purple-500/30 rounded-xl p-6">
          <div className="text-purple-400 text-sm font-semibold mb-2">RECOVERED</div>
          <div className="text-5xl font-bold text-white mb-1">$2.47</div>
          <div className="text-purple-400 text-sm">STX</div>
        </div>

        <div className="bg-gradient-to-br from-orange-900/30 to-orange-700/10 border border-orange-500/30 rounded-xl p-6">
          <div className="text-orange-400 text-sm font-semibold mb-2">TOTAL</div>
          <div className="text-5xl font-bold text-white mb-1">1,247</div>
          <div className="text-orange-400 text-sm">payments</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-700/10 border border-yellow-500/30 rounded-xl p-6">
          <div className="text-yellow-400 text-sm font-semibold mb-2">ACTIVE</div>
          <div className="text-5xl font-bold text-white mb-1">8</div>
          <div className="text-yellow-400 text-sm">processing</div>
        </div>

        <div className="bg-gradient-to-br from-red-900/30 to-red-700/10 border border-red-500/30 rounded-xl p-6">
          <div className="text-red-400 text-sm font-semibold mb-2">FAILED</div>
          <div className="text-5xl font-bold text-white mb-1">47</div>
          <div className="text-red-400 text-sm">permanent</div>
        </div>

        <div className="bg-gradient-to-br from-pink-900/30 to-pink-700/10 border border-pink-500/30 rounded-xl p-6">
          <div className="text-pink-400 text-sm font-semibold mb-2">RETRIES</div>
          <div className="text-5xl font-bold text-white mb-1">342</div>
          <div className="text-pink-400 text-sm">successful</div>
        </div>

        <div className={`bg-gradient-to-br rounded-xl p-6 border ${connected ? 'from-green-900/30 to-green-700/10 border-green-500/30' : 'from-red-900/30 to-red-700/10 border-red-500/30'}`}>
          <div className={`text-sm font-semibold mb-2 ${connected ? 'text-green-400' : 'text-red-400'}`}>STATUS</div>
          <div className="text-5xl font-bold text-white mb-1">{connected ? '🟢' : '🔴'}</div>
          <div className={`text-sm ${connected ? 'text-green-400' : 'text-red-400'}`}>{connected ? 'Connected' : 'Offline'}</div>
        </div>
      </div>

      <div className="mt-8 p-6 bg-slate-700/30 rounded-xl">
        <div className="text-white font-semibold mb-4">📈 Performance Comparison</div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-slate-400 text-sm mb-2">Without x402-Nexus:</div>
            <div className="text-3xl font-bold text-red-400">85%</div>
            <div className="text-sm text-red-400">success rate</div>
          </div>
          <div>
            <div className="text-slate-400 text-sm mb-2">With x402-Nexus:</div>
            <div className="text-3xl font-bold text-green-400">96.3%</div>
            <div className="text-sm text-green-400">success rate</div>
          </div>
        </div>
      </div>
    </div>
  );
}
