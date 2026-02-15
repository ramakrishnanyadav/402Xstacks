import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Generate sample data for last 24 hours
const generateTrendData = () => {
  const data = [];
  const now = new Date();
  
  for (let i = 23; i >= 0; i--) {
    const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
    const timeLabel = hour.getHours().toString().padStart(2, '0') + ':00';
    
    // With x402-Nexus: steady improvement from 93% to 96.3%
    const withNexus = 93 + (Math.random() * 2) + ((23 - i) / 23 * 3.3);
    
    // Without retries: fluctuates around 82%
    const withoutRetries = 80 + (Math.random() * 5);
    
    data.push({
      time: timeLabel,
      withNexus: Number(withNexus.toFixed(1)),
      withoutRetries: Number(withoutRetries.toFixed(1))
    });
  }
  
  return data;
};

export default function SuccessRateTrendChart() {
  const data = generateTrendData();

  return (
    <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Success Rate Trend (24h)</h2>
        <p className="text-slate-400">Comparison of payment success rates with and without intelligent retry</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
          <XAxis 
            dataKey="time" 
            stroke="#94a3b8"
            style={{ fontSize: '12px' }}
            interval={3}
          />
          <YAxis 
            stroke="#94a3b8"
            style={{ fontSize: '12px' }}
            domain={[70, 100]}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1e293b', 
              border: '1px solid #334155',
              borderRadius: '8px',
              padding: '12px'
            }}
            labelStyle={{ color: '#e2e8f0', fontWeight: 'bold', marginBottom: '8px' }}
            itemStyle={{ color: '#94a3b8' }}
            formatter={(value: number) => [`${value}%`, '']}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="line"
            formatter={(value) => {
              if (value === 'withNexus') return 'With x402-Nexus';
              if (value === 'withoutRetries') return 'Without Retries';
              return value;
            }}
          />
          <Line 
            type="monotone" 
            dataKey="withNexus" 
            stroke="#10b981" 
            strokeWidth={3}
            dot={{ fill: '#10b981', r: 4 }}
            activeDot={{ r: 6, fill: '#10b981' }}
            name="withNexus"
          />
          <Line 
            type="monotone" 
            dataKey="withoutRetries" 
            stroke="#ef4444" 
            strokeWidth={3}
            dot={{ fill: '#ef4444', r: 4 }}
            activeDot={{ r: 6, fill: '#ef4444' }}
            name="withoutRetries"
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-6 mt-8 pt-6 border-t border-slate-700/50">
        <div className="text-center">
          <div className="text-sm text-slate-400 mb-2">With x402-Nexus</div>
          <div className="text-3xl font-bold text-emerald-400">96.3%</div>
          <div className="text-xs text-slate-500 mt-1">Average success rate</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-slate-400 mb-2">Without Retries</div>
          <div className="text-3xl font-bold text-rose-400">82.1%</div>
          <div className="text-xs text-slate-500 mt-1">Average success rate</div>
        </div>
      </div>

      {/* Improvement Badge */}
      <div className="mt-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-emerald-400 font-semibold">+14.2% Improvement</span>
        </div>
      </div>
    </div>
  );
}
