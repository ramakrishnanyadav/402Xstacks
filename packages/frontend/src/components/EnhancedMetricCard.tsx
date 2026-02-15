import { ReactNode, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface EnhancedMetricCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
  color: 'green' | 'blue' | 'yellow' | 'purple' | 'red' | 'indigo';
  subtitle?: string;
  delay?: number;
}

const colorConfig = {
  green: {
    gradient: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    glow: 'hover:shadow-emerald-500/20',
    iconBg: 'bg-emerald-500/20',
  },
  blue: {
    gradient: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    glow: 'hover:shadow-blue-500/20',
    iconBg: 'bg-blue-500/20',
  },
  yellow: {
    gradient: 'from-amber-500 to-yellow-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    glow: 'hover:shadow-amber-500/20',
    iconBg: 'bg-amber-500/20',
  },
  purple: {
    gradient: 'from-purple-500 to-violet-500',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    glow: 'hover:shadow-purple-500/20',
    iconBg: 'bg-purple-500/20',
  },
  red: {
    gradient: 'from-rose-500 to-pink-500',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    text: 'text-rose-400',
    glow: 'hover:shadow-rose-500/20',
    iconBg: 'bg-rose-500/20',
  },
  indigo: {
    gradient: 'from-indigo-500 to-purple-500',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
    text: 'text-indigo-400',
    glow: 'hover:shadow-indigo-500/20',
    iconBg: 'bg-indigo-500/20',
  },
};

export default function EnhancedMetricCard({
  title,
  value,
  icon,
  trend,
  trendUp,
  color,
  subtitle,
  delay = 0,
}: EnhancedMetricCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const config = colorConfig[color];

  return (
    <div
      className={`relative group animate-slide-up`}
      style={{ animationDelay: `${delay}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Gradient Border Effect */}
      <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 rounded-2xl`} />
      
      {/* Main Card */}
      <div className={`relative premium-card p-6 ${config.glow} transition-all duration-300 ${isHovered ? 'scale-[1.02]' : ''}`}>
        {/* Top Accent Line */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${config.gradient} rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
        
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Title */}
            <p className="text-slate-400 text-sm font-medium mb-3 tracking-wide uppercase">
              {title}
            </p>
            
            {/* Value */}
            <div className="flex items-baseline gap-3 mb-2">
              <h3 className={`text-4xl font-bold ${config.text} tracking-tight transition-all duration-300 ${isHovered ? 'scale-105' : ''}`}>
                {value}
              </h3>
              
              {/* Trend Indicator */}
              {trend && (
                <div className={`flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-full ${
                  trendUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                }`}>
                  {trendUp ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>{trend}</span>
                </div>
              )}
            </div>
            
            {/* Subtitle */}
            {subtitle && (
              <p className="text-slate-500 text-xs">
                {subtitle}
              </p>
            )}
          </div>
          
          {/* Icon Container */}
          <div className={`${config.iconBg} p-3 rounded-xl ${config.text} transition-all duration-300 ${isHovered ? 'rotate-12 scale-110' : ''}`}>
            {icon}
          </div>
        </div>
        
        {/* Shimmer Effect */}
        <div className={`absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none`} />
      </div>
    </div>
  );
}
