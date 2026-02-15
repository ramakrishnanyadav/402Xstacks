import React from 'react';

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
  trendUp: boolean;
  color: 'green' | 'blue' | 'yellow' | 'purple';
}

const colorClasses = {
  green: 'bg-green-500/10 text-green-400',
  blue: 'bg-blue-500/10 text-blue-400',
  yellow: 'bg-yellow-500/10 text-yellow-400',
  purple: 'bg-purple-500/10 text-purple-400'
};

export default function MetricCard({ title, value, icon, trend, trendUp, color }: MetricCardProps) {
  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        <span className={`text-sm font-medium ${trendUp ? 'text-green-400' : 'text-red-400'}`}>
          {trend}
        </span>
      </div>
      <h3 className="text-slate-400 text-sm mb-1">{title}</h3>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
}
