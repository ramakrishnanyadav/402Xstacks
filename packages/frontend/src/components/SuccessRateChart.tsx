import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function SuccessRateChart() {
  const [data] = useState([
    { time: '00:00', withRetries: 85, withoutRetries: 82 },
    { time: '02:00', withRetries: 88, withoutRetries: 81 },
    { time: '04:00', withRetries: 92, withoutRetries: 79 },
    { time: '06:00', withRetries: 95, withoutRetries: 80 },
    { time: '08:00', withRetries: 96, withoutRetries: 83 },
    { time: '10:00', withRetries: 97, withoutRetries: 84 },
    { time: '12:00', withRetries: 96, withoutRetries: 82 },
    { time: '14:00', withRetries: 98, withoutRetries: 85 },
    { time: '16:00', withRetries: 97, withoutRetries: 83 },
    { time: '18:00', withRetries: 96, withoutRetries: 81 },
    { time: '20:00', withRetries: 95, withoutRetries: 80 },
    { time: '22:00', withRetries: 96, withoutRetries: 82 },
  ]);

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-2">Success Rate Trend (24h)</h2>
        <p className="text-sm text-slate-400">
          Comparison of payment success rates with and without x402-Nexus retry logic
        </p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis 
            dataKey="time" 
            stroke="#94a3b8"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#94a3b8"
            style={{ fontSize: '12px' }}
            domain={[70, 100]}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#e2e8f0'
            }}
          />
          <Legend 
            wrapperStyle={{
              paddingTop: '20px',
              fontSize: '14px'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="withRetries" 
            stroke="#10b981" 
            strokeWidth={2}
            name="With x402-Nexus"
            dot={{ fill: '#10b981', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="withoutRetries" 
            stroke="#ef4444" 
            strokeWidth={2}
            name="Without Retries"
            dot={{ fill: '#ef4444', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-green-400">With x402-Nexus</span>
          </div>
          <p className="text-2xl font-bold text-white">96.3%</p>
          <p className="text-xs text-slate-400 mt-1">Average success rate</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm font-medium text-red-400">Without Retries</span>
          </div>
          <p className="text-2xl font-bold text-white">82.1%</p>
          <p className="text-xs text-slate-400 mt-1">Average success rate</p>
        </div>
      </div>
    </div>
  );
}
