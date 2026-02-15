import { useState } from 'react';

export default function PaymentFlowAnimation() {
  const [isRunning, setIsRunning] = useState(false);
  const [step, setStep] = useState(0);

  const startFlow = () => {
    setIsRunning(true);
    setStep(0);
    
    const steps = [1, 2, 3, 4, 5];
    steps.forEach((s, index) => {
      setTimeout(() => setStep(s), index * 1000);
    });

    setTimeout(() => setIsRunning(false), 6000);
  };

  return (
    <div className="bg-slate-800 rounded-xl p-8">
      <h2 className="text-3xl font-bold text-white mb-6">🌊 Payment Flow Visualization</h2>
      
      <button
        onClick={startFlow}
        disabled={isRunning}
        className={`mb-8 px-6 py-3 rounded-lg font-semibold transition-all ${
          isRunning
            ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500'
        }`}
      >
        {isRunning ? '⏳ Processing...' : '▶️ Start Payment Flow'}
      </button>

      <div className="space-y-6">
        {/* Step 1 */}
        <div className={`flex items-center space-x-4 p-4 rounded-lg transition-all ${step >= 1 ? 'bg-blue-900/30 border border-blue-500' : 'bg-slate-700/30'}`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-500 animate-pulse' : 'bg-slate-600'}`}>
            1
          </div>
          <div className="flex-1">
            <div className="text-white font-semibold">Client Initiates Payment</div>
            <div className="text-slate-400 text-sm">User requests to access premium content</div>
          </div>
          {step >= 1 && <div className="text-green-400">✓</div>}
        </div>

        {/* Step 2 */}
        <div className={`flex items-center space-x-4 p-4 rounded-lg transition-all ${step >= 2 ? 'bg-purple-900/30 border border-purple-500' : 'bg-slate-700/30'}`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-purple-500 animate-pulse' : 'bg-slate-600'}`}>
            2
          </div>
          <div className="flex-1">
            <div className="text-white font-semibold">x402-Nexus Validation</div>
            <div className="text-slate-400 text-sm">Idempotency check + request validation</div>
          </div>
          {step >= 2 && <div className="text-green-400">✓</div>}
        </div>

        {/* Step 3 */}
        <div className={`flex items-center space-x-4 p-4 rounded-lg transition-all ${step >= 3 ? 'bg-orange-900/30 border border-orange-500' : 'bg-slate-700/30'}`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-orange-500 animate-pulse' : 'bg-slate-600'}`}>
            3
          </div>
          <div className="flex-1">
            <div className="text-white font-semibold">Submit to Blockchain</div>
            <div className="text-slate-400 text-sm">Transaction sent to Stacks mempool</div>
          </div>
          {step >= 3 && <div className="text-yellow-400">🔄</div>}
        </div>

        {/* Step 4 */}
        <div className={`flex items-center space-x-4 p-4 rounded-lg transition-all ${step >= 4 ? 'bg-green-900/30 border border-green-500' : 'bg-slate-700/30'}`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${step >= 4 ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`}>
            4
          </div>
          <div className="flex-1">
            <div className="text-white font-semibold">Blockchain Confirmation</div>
            <div className="text-slate-400 text-sm">Smart contract executes and confirms</div>
          </div>
          {step >= 4 && <div className="text-green-400">✓</div>}
        </div>

        {/* Step 5 */}
        <div className={`flex items-center space-x-4 p-4 rounded-lg transition-all ${step >= 5 ? 'bg-pink-900/30 border border-pink-500' : 'bg-slate-700/30'}`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${step >= 5 ? 'bg-pink-500 animate-pulse' : 'bg-slate-600'}`}>
            5
          </div>
          <div className="flex-1">
            <div className="text-white font-semibold">Deliver Content</div>
            <div className="text-slate-400 text-sm">User receives premium content access</div>
          </div>
          {step >= 5 && <div className="text-green-400">✓</div>}
        </div>
      </div>

      {step === 5 && (
        <div className="mt-8 p-6 bg-gradient-to-r from-green-900/30 to-blue-900/30 border border-green-500/30 rounded-lg">
          <div className="text-2xl text-green-400 font-bold mb-2">✅ Payment Complete!</div>
          <div className="text-slate-300">Total time: ~5 seconds | Non-custodial | Verified on-chain</div>
        </div>
      )}
    </div>
  );
}
