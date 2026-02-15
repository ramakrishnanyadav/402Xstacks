import { Bot, ShoppingCart, FileText, Palette, Coins, Users } from 'lucide-react';

export default function EcosystemImpact() {
  const useCases = [
    {
      icon: Bot,
      name: 'AI Agent Marketplaces',
      description: 'Autonomous agents buying/selling data & services',
      examples: ['ShadowFeed', 'MoltMarket', 'TragenX'],
      color: 'blue',
      impact: '10K+ micropayments/day'
    },
    {
      icon: ShoppingCart,
      name: 'E-Commerce Platforms',
      description: 'Digital goods & services marketplaces',
      examples: ['NFT Markets', 'Digital Downloads'],
      color: 'emerald',
      impact: '5K+ transactions/day'
    },
    {
      icon: FileText,
      name: 'Content Platforms',
      description: 'Pay-per-view articles, videos, courses',
      examples: ['Stacktreon', 'The Wire', 'Medium-style'],
      color: 'purple',
      impact: '50K+ payments/day'
    },
    {
      icon: Palette,
      name: 'Creator Tools',
      description: 'Tipping, subscriptions, memberships',
      examples: ['Patreon-style', 'OnlyFans-style'],
      color: 'pink',
      impact: '20K+ payments/day'
    },
    {
      icon: Coins,
      name: 'DeFi Applications',
      description: 'Micro-lending, yield protocols',
      examples: ['Liquidity Pools', 'Yield Farms'],
      color: 'amber',
      impact: '15K+ transactions/day'
    },
    {
      icon: Users,
      name: 'Social Platforms',
      description: 'Social tipping, content rewards',
      examples: ['Twitter-style', 'Reddit-style'],
      color: 'cyan',
      impact: '100K+ tips/day'
    }
  ];

  return (
    <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-2xl font-bold text-white">Ecosystem Impact</h2>
            <p className="text-sm text-slate-400">x402-Nexus enables the entire x402 ecosystem</p>
          </div>
          <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
            <span className="text-emerald-400 font-semibold">6+ Use Cases</span>
          </div>
        </div>
      </div>

      {/* Use Cases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {useCases.map((useCase, index) => {
          const Icon = useCase.icon;
          return (
            <div
              key={index}
              className={`group p-5 bg-${useCase.color}-500/5 border border-${useCase.color}-500/20 rounded-xl hover:border-${useCase.color}-500/40 transition-all duration-300 hover:scale-105`}
            >
              <div className={`w-12 h-12 rounded-lg bg-${useCase.color}-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <Icon className={`w-6 h-6 text-${useCase.color}-400`} />
              </div>
              
              <h3 className={`text-base font-bold text-${useCase.color}-400 mb-2`}>
                {useCase.name}
              </h3>
              
              <p className="text-xs text-slate-400 mb-3">{useCase.description}</p>
              
              <div className="space-y-1 mb-3">
                {useCase.examples.map((example, i) => (
                  <div key={i} className="text-xs text-slate-500 flex items-center gap-1">
                    <div className={`w-1 h-1 rounded-full bg-${useCase.color}-400`} />
                    {example}
                  </div>
                ))}
              </div>
              
              <div className={`text-xs font-medium text-${useCase.color}-400 bg-${useCase.color}-500/10 px-2 py-1 rounded`}>
                {useCase.impact}
              </div>
            </div>
          );
        })}
      </div>

      {/* Impact Statement */}
      <div className="p-6 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 rounded-xl">
        <div className="text-center">
          <div className="text-3xl font-bold text-white mb-2">200,000+</div>
          <div className="text-sm text-slate-300 mb-4">Estimated daily payments across x402 ecosystem</div>
          
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div>
              <div className="text-lg font-bold text-emerald-400">$28K/day</div>
              <div className="text-xs text-slate-400">Revenue at Risk</div>
            </div>
            <div>
              <div className="text-lg font-bold text-indigo-400">$4K/day</div>
              <div className="text-xs text-slate-400">Recoverable with x402-Nexus</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-400">$1.5M/year</div>
              <div className="text-xs text-slate-400">Ecosystem Impact</div>
            </div>
          </div>
        </div>
      </div>

      {/* Why This Matters */}
      <div className="mt-6 p-4 bg-slate-700/30 rounded-xl">
        <div className="text-sm text-slate-300">
          <span className="font-semibold text-indigo-400">🌐 Ecosystem Multiplier:</span> Every x402 project needs reliable payments. By solving this fundamental problem, x402-Nexus makes the entire ecosystem viable for production deployment.
        </div>
      </div>
    </div>
  );
}
