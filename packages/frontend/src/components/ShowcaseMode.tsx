import { useState, useEffect } from 'react';

interface ShowcaseModeProps {
  onExit: () => void;
}

export default function ShowcaseMode({ onExit }: ShowcaseModeProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (step < 3) {
        setStep(step + 1);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [step]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-slate-900 to-pink-900 z-50 flex items-center justify-center">
      <div className="text-center space-y-8 p-12">
        {/* Logo */}
        <div className="mb-12">
          <h1 className="text-8xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
            x402-Nexus
          </h1>
          <p className="text-2xl text-slate-300 mt-4">
            Non-Custodial Payment Reliability Layer
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-8 border border-purple-500/20">
            <div className="text-6xl font-bold text-green-400 mb-2">96.3%</div>
            <div className="text-slate-400">Success Rate</div>
            <div className="text-sm text-green-400 mt-2">+11.3% improvement</div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-8 border border-purple-500/20">
            <div className="text-6xl font-bold text-blue-400 mb-2">4.2s</div>
            <div className="text-slate-400">Avg Recovery Time</div>
            <div className="text-sm text-blue-400 mt-2">Auto-retry enabled</div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-8 border border-purple-500/20">
            <div className="text-6xl font-bold text-purple-400 mb-2">$2.47</div>
            <div className="text-slate-400">Revenue Recovered</div>
            <div className="text-sm text-purple-400 mt-2">Per 100 transactions</div>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-4 mt-12 text-xl text-slate-300">
          <div className={`transform transition-all duration-500 ${step >= 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            ✨ Intelligent Retry Engine with Adaptive Backoff
          </div>
          <div className={`transform transition-all duration-500 ${step >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            🔒 Non-Custodial Escrow on Stacks Blockchain
          </div>
          <div className={`transform transition-all duration-500 ${step >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            ⚡ Real-Time WebSocket Updates
          </div>
          <div className={`transform transition-all duration-500 ${step >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            🔬 Blockchain Proof of Settlement
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16">
          <button
            onClick={onExit}
            className="px-12 py-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-2xl font-bold rounded-2xl hover:from-purple-500 hover:to-pink-500 transform hover:scale-105 transition-all shadow-2xl"
          >
            🚀 ENTER LIVE DEMO
          </button>
        </div>

        <div className="text-slate-500 mt-8">
          Press any key or click the button to continue
        </div>
      </div>
    </div>
  );
}
