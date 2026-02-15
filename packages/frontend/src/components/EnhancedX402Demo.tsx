import { useState } from 'react';
import { Send, Shield, Lock, Unlock, CheckCircle, Clock, XCircle, Code, Sparkles } from 'lucide-react';

export default function EnhancedX402Demo() {
  const [amount, setAmount] = useState('10');
  const [recipient, setRecipient] = useState('SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7');
  const [demoStep, setDemoStep] = useState<'idle' | 'escrow' | 'processing' | 'success' | 'failed'>('idle');
  const [showProof, setShowProof] = useState(false);

  const handleDemoPayment = () => {
    setDemoStep('escrow');
    setTimeout(() => setDemoStep('processing'), 2000);
    setTimeout(() => {
      setDemoStep('success');
      setShowProof(true);
    }, 4000);
  };

  const resetDemo = () => {
    setDemoStep('idle');
    setShowProof(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 relative overflow-hidden p-8">
      {/* Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-3xl animate-float-delay" />

      <div className="relative z-10 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 mb-6">
            <Lock className="w-5 h-5 text-purple-400" />
            <span className="font-bold text-purple-300">HTTP 402 Payment Required Protocol</span>
          </div>
          <h1 className="text-6xl font-bold gradient-text mb-4">x402 Protocol Demo</h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Experience the power of non-custodial, blockchain-verified payments with automatic retry mechanisms
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Payment Form */}
          <div className="space-y-6">
            <div className="premium-card p-8 animate-slide-up">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Send className="w-6 h-6 text-indigo-400" />
                Initiate Payment
              </h2>

              <div className="space-y-6">
                {/* Amount Input */}
                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wide">
                    Amount (STX)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-6 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white text-2xl font-bold focus:outline-none focus:border-indigo-500 transition-all"
                      placeholder="0.00"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">
                      STX
                    </div>
                  </div>
                </div>

                {/* Recipient Input */}
                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wide">
                    Recipient Address
                  </label>
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-indigo-500 transition-all"
                    placeholder="SP..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleDemoPayment}
                    disabled={demoStep !== 'idle'}
                    className={`w-full px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 ${
                      demoStep === 'idle'
                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:shadow-glow-lg hover:scale-[1.02] interactive-hover'
                        : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {demoStep === 'idle' ? (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Send Payment via x402
                      </>
                    ) : (
                      <>
                        <Clock className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    )}
                  </button>

                  {demoStep !== 'idle' && (
                    <button
                      onClick={resetDemo}
                      className="w-full px-8 py-3 rounded-xl bg-slate-700/50 text-slate-300 font-semibold hover:bg-slate-700 transition-all"
                    >
                      Reset Demo
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Protocol Features */}
            <div className="premium-card p-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-400" />
                Protocol Features
              </h3>
              <div className="space-y-3">
                {[
                  { icon: '🔒', text: 'Non-custodial escrow via smart contracts' },
                  { icon: '⚡', text: 'Automatic retry on network failures' },
                  { icon: '🔗', text: 'Immutable blockchain proof' },
                  { icon: '📡', text: 'Real-time WebSocket updates' },
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
                    <span className="text-2xl">{feature.icon}</span>
                    <span className="text-slate-300 text-sm">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Payment Flow Visualization */}
          <div className="space-y-6">
            <div className="premium-card p-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
              <h2 className="text-2xl font-bold text-white mb-6">Payment Flow</h2>

              <div className="space-y-4">
                {/* Step 1: Escrow */}
                <StepCard
                  number={1}
                  title="Funds Locked in Escrow"
                  description="Smart contract securely holds funds"
                  icon={<Lock className="w-6 h-6" />}
                  active={demoStep === 'escrow'}
                  completed={['processing', 'success', 'failed'].includes(demoStep)}
                  color="purple"
                />

                {/* Step 2: Processing */}
                <StepCard
                  number={2}
                  title="Payment Processing"
                  description="x402 protocol handles the transfer"
                  icon={<Clock className="w-6 h-6" />}
                  active={demoStep === 'processing'}
                  completed={['success', 'failed'].includes(demoStep)}
                  color="blue"
                />

                {/* Step 3: Settlement */}
                <StepCard
                  number={3}
                  title={demoStep === 'failed' ? 'Payment Failed' : 'Settlement Complete'}
                  description={demoStep === 'failed' ? 'Funds returned to sender' : 'Funds released to recipient'}
                  icon={demoStep === 'failed' ? <XCircle className="w-6 h-6" /> : <Unlock className="w-6 h-6" />}
                  active={false}
                  completed={demoStep === 'success'}
                  failed={demoStep === 'failed'}
                  color={demoStep === 'failed' ? 'red' : 'green'}
                />
              </div>
            </div>

            {/* Blockchain Proof */}
            {showProof && (
              <div className="premium-card p-8 animate-scale-in border-emerald-500/30">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle className="w-7 h-7 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Blockchain Proof</h3>
                    <p className="text-sm text-emerald-400">Transaction verified on Stacks</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <ProofRow label="Transaction Hash" value="0x7f8a9b2c4d5e6f1a2b3c4d5e6f7a8b9c0d1e2f3a" />
                  <ProofRow label="Block Height" value="145,892" />
                  <ProofRow label="Confirmation Time" value="4.2 seconds" />
                  <ProofRow label="Gas Fee" value="0.000123 STX" />
                  <ProofRow label="Status" value="✅ Confirmed" color="emerald" />
                </div>

                <a
                  href="#"
                  className="mt-6 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold hover:bg-emerald-500/20 transition-all"
                >
                  <Code className="w-5 h-5" />
                  View on Stacks Explorer
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Technical Details */}
        <div className="mt-12 premium-card p-8 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <h2 className="text-2xl font-bold text-white mb-6">How x402 Protocol Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TechnicalCard
              number="1"
              title="HTTP 402 Request"
              description="Server returns 402 Payment Required with payment details and escrow contract address"
              color="purple"
            />
            <TechnicalCard
              number="2"
              title="Escrow & Retry"
              description="Funds locked in smart contract. Auto-retry engine handles failures with exponential backoff"
              color="blue"
            />
            <TechnicalCard
              number="3"
              title="Settlement & Proof"
              description="On success, funds released. Immutable proof recorded on Stacks blockchain"
              color="emerald"
            />
          </div>
        </div>
      </div>

      <style>{`
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

interface StepCardProps {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  active: boolean;
  completed: boolean;
  failed?: boolean;
  color: string;
}

function StepCard({ number, title, description, icon, active, completed, failed, color }: StepCardProps) {
  const getColors = () => {
    if (failed) return 'border-rose-500/30 bg-rose-500/5';
    if (completed) return 'border-emerald-500/30 bg-emerald-500/5';
    if (active) return `border-${color}-500/30 bg-${color}-500/5 shadow-glow-sm`;
    return 'border-slate-700/50 bg-slate-800/20';
  };

  const getIconColor = () => {
    if (failed) return 'text-rose-400 bg-rose-500/20';
    if (completed) return 'text-emerald-400 bg-emerald-500/20';
    if (active) return `text-${color}-400 bg-${color}-500/20`;
    return 'text-slate-500 bg-slate-700/20';
  };

  return (
    <div className={`p-6 rounded-xl border transition-all ${getColors()} ${active ? 'scale-105' : ''}`}>
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${getIconColor()} ${active ? 'animate-pulse' : ''}`}>
          {completed ? <CheckCircle className="w-6 h-6 text-emerald-400" /> : icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className={`text-sm font-bold px-2 py-1 rounded ${getIconColor()}`}>
              Step {number}
            </span>
            {active && <span className="status-dot processing" />}
          </div>
          <h4 className="text-lg font-bold text-white mb-1">{title}</h4>
          <p className="text-sm text-slate-400">{description}</p>
        </div>
      </div>
    </div>
  );
}

interface ProofRowProps {
  label: string;
  value: string;
  color?: string;
}

function ProofRow({ label, value, color = 'slate' }: ProofRowProps) {
  return (
    <div className="flex justify-between items-center p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
      <span className="text-sm text-slate-400 font-medium">{label}</span>
      <span className={`text-sm font-mono font-semibold text-${color}-300`}>{value}</span>
    </div>
  );
}

interface TechnicalCardProps {
  number: string;
  title: string;
  description: string;
  color: string;
}

function TechnicalCard({ number, title, description, color }: TechnicalCardProps) {
  return (
    <div className={`p-6 rounded-xl bg-slate-800/30 border border-slate-700/50 hover:border-${color}-500/30 transition-all group`}>
      <div className={`w-12 h-12 rounded-xl bg-${color}-500/20 text-${color}-400 flex items-center justify-center text-2xl font-bold mb-4 group-hover:scale-110 transition-transform`}>
        {number}
      </div>
      <h4 className="text-lg font-bold text-white mb-2">{title}</h4>
      <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}
