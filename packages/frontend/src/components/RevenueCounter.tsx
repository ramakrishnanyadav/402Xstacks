import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp } from 'lucide-react';

interface RevenueCounterProps {
  revenueRecovered: number;
}

export default function RevenueCounter({ revenueRecovered }: RevenueCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);

  // Animate counter
  useEffect(() => {
    const target = revenueRecovered;
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setDisplayValue(target);
        clearInterval(timer);
      } else {
        setDisplayValue(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [revenueRecovered]);

  // Calculate yearly projection
  const yearlyProjection = (revenueRecovered / 100 * 365 * 24 * 10).toFixed(0); // Assuming 10 payments/hour

  return (
    <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-2xl p-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 blur-xl" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="text-sm text-slate-400">Revenue Recovered</div>
            <div className="text-xs text-emerald-400 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>Per 100 transactions</span>
            </div>
          </div>
        </div>

        {/* Big Counter */}
        <div className="mb-4">
          <div className="text-5xl font-bold text-emerald-400 mb-2 font-mono">
            ${displayValue.toFixed(2)} <span className="text-2xl text-slate-400">STX</span>
          </div>
          <div className="h-1 bg-emerald-500/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-1000"
              style={{ width: `${(displayValue / revenueRecovered) * 100}%` }}
            />
          </div>
        </div>

        {/* Projections */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="text-xs text-slate-400 mb-1">Daily Projection</div>
            <div className="text-lg font-bold text-white">${(revenueRecovered * 2.4).toFixed(2)}</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="text-xs text-slate-400 mb-1">Yearly Projection</div>
            <div className="text-lg font-bold text-emerald-400">${yearlyProjection}</div>
          </div>
        </div>

        {/* Impact Statement */}
        <div className="mt-4 p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/20">
          <div className="text-xs text-slate-300">
            💰 <span className="font-semibold text-emerald-400">Every retry matters!</span> Without intelligent retry, this revenue would be lost forever.
          </div>
        </div>
      </div>
    </div>
  );
}
