import { useState } from 'react';
import { Code, CheckCircle, Copy, Zap } from 'lucide-react';

export default function DeveloperShowcase() {
  const [copied, setCopied] = useState(false);

  const beforeCode = `// WITHOUT x402-Nexus - Payments fail, no retry
async function processPayment(amount, recipient) {
  try {
    const tx = await sendTransaction(amount, recipient);
    return { success: true, tx };
  } catch (error) {
    // Payment failed - revenue lost forever ❌
    return { success: false, error };
  }
}

// Result: 82% success rate, 18% revenue lost`;

  const afterCode = `// WITH x402-Nexus - 3 lines for production-ready payments
import { X402Nexus } from '@x402-nexus/sdk';

const nexus = new X402Nexus({ apiKey: process.env.NEXUS_KEY });

async function processPayment(amount, recipient) {
  // Intelligent retry, escrow protection, real-time monitoring
  return await nexus.processPayment({ amount, recipient });
}

// Result: 96% success rate, $73K/year recovered ✅`;

  const copyCode = () => {
    navigator.clipboard.writeText(afterCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
            <Code className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Developer Integration</h2>
            <p className="text-sm text-slate-400">From unreliable to production-ready in 3 lines</p>
          </div>
        </div>
      </div>

      {/* Before/After Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Before */}
        <div className="relative">
          <div className="absolute -top-3 left-4 px-3 py-1 bg-rose-500/20 border border-rose-500/30 rounded-full text-xs font-semibold text-rose-400">
            ❌ Without x402-Nexus
          </div>
          <div className="bg-slate-900/50 border border-rose-500/20 rounded-xl p-4 pt-6">
            <pre className="text-xs text-slate-300 overflow-x-auto custom-scrollbar">
              <code>{beforeCode}</code>
            </pre>
            <div className="mt-4 flex items-center gap-2 text-rose-400 text-sm">
              <span className="w-2 h-2 bg-rose-400 rounded-full" />
              82% Success Rate
            </div>
          </div>
        </div>

        {/* After */}
        <div className="relative">
          <div className="absolute -top-3 left-4 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-xs font-semibold text-emerald-400">
            ✅ With x402-Nexus
          </div>
          <div className="bg-slate-900/50 border border-emerald-500/20 rounded-xl p-4 pt-6">
            <pre className="text-xs text-slate-300 overflow-x-auto custom-scrollbar">
              <code>{afterCode}</code>
            </pre>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 text-sm">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                96% Success Rate
              </div>
              <button
                onClick={copyCode}
                className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-xs font-medium text-emerald-400 transition-all"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-3 h-3" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy Code
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Zap, title: '3-Line Integration', desc: 'Drop-in replacement', color: 'yellow' },
          { icon: CheckCircle, title: 'Auto Retry', desc: 'Intelligent recovery', color: 'emerald' },
          { icon: Code, title: 'TypeScript SDK', desc: 'Full type safety', color: 'indigo' }
        ].map((feature, i) => (
          <div key={i} className={`p-4 bg-${feature.color}-500/5 border border-${feature.color}-500/20 rounded-xl`}>
            <feature.icon className={`w-6 h-6 text-${feature.color}-400 mb-2`} />
            <div className={`text-sm font-semibold text-${feature.color}-400 mb-1`}>{feature.title}</div>
            <div className="text-xs text-slate-500">{feature.desc}</div>
          </div>
        ))}
      </div>

      {/* Impact Statement */}
      <div className="mt-6 p-4 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 rounded-xl">
        <div className="text-sm text-slate-300">
          <span className="font-semibold text-indigo-400">💡 Developer Impact:</span> What takes 200+ lines to implement yourself (retry logic, error handling, monitoring, escrow) becomes 3 lines with x402-Nexus.
        </div>
      </div>
    </div>
  );
}
