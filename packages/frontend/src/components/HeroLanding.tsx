import { useEffect, useState } from 'react';
import { ArrowRight, Shield, Zap, TrendingUp, Sparkles } from 'lucide-react';

interface HeroLandingProps {
  onEnter: () => void;
}

export default function HeroLanding({ onEnter }: HeroLandingProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      
      {/* Gradient Orbs */}
      <div 
        className="absolute w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl animate-float"
        style={{
          left: `${mousePosition.x / 20}px`,
          top: `${mousePosition.y / 20}px`,
          transition: 'all 0.3s ease-out'
        }}
      />
      <div className="absolute right-0 bottom-0 w-96 h-96 bg-violet-500/30 rounded-full blur-3xl animate-float-delay" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        {/* Logo/Badge */}
        <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
          <div className="mb-6 flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-medium text-indigo-300">Payment Reliability Infrastructure</span>
          </div>
        </div>

        {/* Main Heading */}
        <h1 className={`text-7xl md:text-8xl font-bold text-center mb-6 transform transition-all duration-1000 delay-100 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
          <span className="bg-gradient-to-r from-white via-indigo-200 to-violet-200 bg-clip-text text-transparent">
            x402-Nexus
          </span>
        </h1>

        {/* Subtitle */}
        <p className={`text-2xl md:text-3xl text-slate-300 text-center mb-12 max-w-3xl transform transition-all duration-1000 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
          Turn <span className="text-rose-400 font-semibold">85% payment failures</span> into <span className="text-emerald-400 font-semibold">96% success</span> with intelligent retry orchestration
        </p>

        {/* Feature Pills */}
        <div className={`flex flex-wrap gap-4 justify-center mb-12 transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
          {[
            { icon: Shield, text: 'Non-Custodial', color: 'emerald' },
            { icon: Zap, text: 'Real-Time Retry', color: 'yellow' },
            { icon: TrendingUp, text: '96% Success Rate', color: 'indigo' }
          ].map((feature, i) => (
            <div key={i} className={`flex items-center gap-2 px-5 py-3 rounded-full bg-slate-800/50 border border-${feature.color}-500/30 backdrop-blur-sm hover:scale-105 transition-transform cursor-pointer group`}>
              <feature.icon className={`w-5 h-5 text-${feature.color}-400 group-hover:rotate-12 transition-transform`} />
              <span className="text-slate-200 font-medium">{feature.text}</span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={onEnter}
          className={`group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-full font-semibold text-lg shadow-2xl shadow-indigo-500/50 hover:shadow-indigo-500/70 hover:scale-105 transition-all duration-300 transform ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'} delay-400`}
        >
          <span className="flex items-center gap-3">
            Launch Dashboard
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </span>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-400 to-violet-400 opacity-0 group-hover:opacity-20 blur transition-opacity" />
        </button>

        {/* Stats */}
        <div className={`mt-20 grid grid-cols-3 gap-8 text-center transform transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          {[
            { value: '$2.47', label: 'Revenue Recovered', unit: 'per 100 tx' },
            { value: '4.2s', label: 'Avg Recovery Time', unit: 'median' },
            { value: '96.3%', label: 'Final Success Rate', unit: 'vs 82% baseline' }
          ].map((stat, i) => (
            <div key={i} className="group">
              <div className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                {stat.value}
              </div>
              <div className="text-slate-400 font-medium">{stat.label}</div>
              <div className="text-xs text-slate-500 mt-1">{stat.unit}</div>
            </div>
          ))}
        </div>

        {/* Scroll Indicator */}
        <div className={`absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce ${isVisible ? 'opacity-100' : 'opacity-0'} delay-700 transition-opacity`}>
          <div className="w-6 h-10 rounded-full border-2 border-slate-600 flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-slate-500 rounded-full animate-scroll" />
          </div>
        </div>
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-delay {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(20px); }
        }
        @keyframes scroll {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(12px); opacity: 0; }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delay {
          animation: float-delay 8s ease-in-out infinite;
        }
        .animate-scroll {
          animation: scroll 2s ease-in-out infinite;
        }
        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, rgb(71 85 105 / 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgb(71 85 105 / 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
        }
      `}</style>
    </div>
  );
}
