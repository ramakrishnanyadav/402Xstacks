import { FC } from 'react';
import { ArrowRight, Zap, Shield, Activity, Layers } from 'lucide-react';

interface ProfessionalHeroProps {
  onEnter: () => void;
}

const ProfessionalHero: FC<ProfessionalHeroProps> = ({ onEnter }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden flex items-center">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative z-10 container mx-auto px-6 py-16">
        <div className="max-w-7xl mx-auto">
          {/* Product Tag */}
          <div className="flex justify-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary/20 to-purple-500/20 border border-primary/40 rounded-full backdrop-blur-sm">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-slate-200 font-medium text-sm">Enterprise Payment Infrastructure</span>
            </div>
          </div>

          {/* Main Heading */}
          <div className="text-center mb-16">
            <h1 className="text-7xl md:text-8xl lg:text-9xl font-black mb-8 leading-none animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <span className="bg-gradient-to-r from-white via-primary to-purple-400 bg-clip-text text-transparent">
                x402-Nexus
              </span>
            </h1>
            
            <p className="text-3xl md:text-4xl lg:text-5xl text-white mb-6 font-light animate-fade-in leading-tight" style={{ animationDelay: '0.2s' }}>
              Non-Custodial Payment Reliability Layer
            </p>

            <p className="text-xl md:text-2xl text-slate-400 max-w-4xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.3s' }}>
              Built on <span className="text-primary font-semibold">Stacks x402 Protocol</span> — Transform blockchain payments into enterprise-grade transactions
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 max-w-5xl mx-auto animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="group flex flex-col items-center gap-3 p-8 bg-slate-800/40 border border-slate-700/50 rounded-2xl backdrop-blur-sm hover:border-green-500/50 transition-all duration-300 hover:scale-105 hover:bg-slate-800/60">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                <Shield className="w-6 h-6 text-green-400" />
              </div>
              <span className="text-slate-200 font-semibold">Non-Custodial</span>
              <span className="text-slate-500 text-xs text-center">Your keys, your funds</span>
            </div>
            
            <div className="group flex flex-col items-center gap-3 p-8 bg-slate-800/40 border border-slate-700/50 rounded-2xl backdrop-blur-sm hover:border-yellow-500/50 transition-all duration-300 hover:scale-105 hover:bg-slate-800/60">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center group-hover:bg-yellow-500/20 transition-colors">
                <Zap className="w-6 h-6 text-yellow-400" />
              </div>
              <span className="text-slate-200 font-semibold">99.9% Success</span>
              <span className="text-slate-500 text-xs text-center">Intelligent retries</span>
            </div>
            
            <div className="group flex flex-col items-center gap-3 p-8 bg-slate-800/40 border border-slate-700/50 rounded-2xl backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300 hover:scale-105 hover:bg-slate-800/60">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                <Activity className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-slate-200 font-semibold">Real-Time</span>
              <span className="text-slate-500 text-xs text-center">Live monitoring</span>
            </div>
            
            <div className="group flex flex-col items-center gap-3 p-8 bg-slate-800/40 border border-slate-700/50 rounded-2xl backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300 hover:scale-105 hover:bg-slate-800/60">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                <Layers className="w-6 h-6 text-purple-400" />
              </div>
              <span className="text-slate-200 font-semibold">Smart Layer</span>
              <span className="text-slate-500 text-xs text-center">Auto recovery</span>
            </div>
          </div>

          {/* CTA Button */}
          <div className="flex justify-center mb-20 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <button
              onClick={onEnter}
              className="group relative px-16 py-6 bg-gradient-to-r from-primary to-purple-600 text-white text-2xl font-bold rounded-2xl hover:shadow-2xl hover:shadow-primary/50 transition-all duration-300 hover:scale-105"
            >
              <span className="flex items-center gap-4">
                Launch Dashboard
                <ArrowRight className="w-7 h-7 group-hover:translate-x-2 transition-transform duration-300" />
              </span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="group text-center p-12 bg-slate-900/40 border border-slate-700/50 rounded-3xl backdrop-blur-sm hover:border-primary/40 transition-all duration-300 hover:scale-105">
              <div className="text-7xl font-black bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent mb-4">
                99.9%
              </div>
              <div className="text-slate-200 text-xl font-semibold mb-2">Success Rate</div>
              <div className="text-slate-500 text-sm">With intelligent retry logic</div>
            </div>
            
            <div className="group text-center p-12 bg-slate-900/40 border border-slate-700/50 rounded-3xl backdrop-blur-sm hover:border-primary/40 transition-all duration-300 hover:scale-105">
              <div className="text-7xl font-black bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent mb-4">
                &lt;2s
              </div>
              <div className="text-slate-200 text-xl font-semibold mb-2">Avg Processing</div>
              <div className="text-slate-500 text-sm">Lightning-fast execution</div>
            </div>
            
            <div className="group text-center p-12 bg-slate-900/40 border border-slate-700/50 rounded-3xl backdrop-blur-sm hover:border-primary/40 transition-all duration-300 hover:scale-105">
              <div className="text-7xl font-black bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent mb-4">
                100%
              </div>
              <div className="text-slate-200 text-xl font-semibold mb-2">Non-Custodial</div>
              <div className="text-slate-500 text-sm">You control your funds</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalHero;
