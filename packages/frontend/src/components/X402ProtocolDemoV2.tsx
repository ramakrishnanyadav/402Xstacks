import { useState } from 'react';
import { Lock, Zap, CheckCircle, ArrowRight, Loader2, Code, Sparkles } from 'lucide-react';

interface PaymentChallenge {
  amount: number;
  amountSTX: number;
  recipient: string;
  resource: string;
  nonce: string;
  expiresAt: number;
  paymentEndpoint: string;
  protocol: string;
  network: string;
}

interface PaymentProof {
  txHash: string;
  paymentId: string;
  nonce: string;
}

type Step = 'idle' | 'challenge' | 'payment' | 'retry' | 'success';

export default function X402ProtocolDemoV2() {
  const [step, setStep] = useState<Step>('idle');
  const [challenge, setChallenge] = useState<PaymentChallenge | null>(null);
  const [, setProof] = useState<PaymentProof | null>(null);
  const [resourceData, setResourceData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState('/api/x402/premium/ai-inference');

  const endpoints = [
    {
      path: '/api/x402/premium/ai-inference',
      name: 'AI Inference API',
      description: 'GPT-4 level language model access',
      price: '0.1 STX',
      icon: Sparkles
    },
    {
      path: '/api/x402/premium/market-data/BTC',
      name: 'Market Data API',
      description: 'Real-time crypto market analytics',
      price: '0.05 STX',
      icon: Code
    },
    {
      path: '/api/x402/credits/purchase',
      name: 'API Credits',
      description: 'Purchase 100 API credits',
      price: '0.5 STX',
      icon: Zap
    }
  ];

  const handleAccessResource = async () => {
    setLoading(true);
    setStep('challenge');
    setChallenge(null);
    setProof(null);
    setResourceData(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}${selectedEndpoint}`, {
        method: selectedEndpoint.includes('inference') || selectedEndpoint.includes('credits') ? 'POST' : 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        body: selectedEndpoint.includes('inference') 
          ? JSON.stringify({ prompt: 'What is x402?', model: 'llama-3' })
          : selectedEndpoint.includes('credits')
          ? JSON.stringify({ credits: 100 })
          : undefined
      });

      if (response.status === 402) {
        const data = await response.json();
        setChallenge(data.paymentChallenge);
        setLoading(false);
      } else if (response.ok) {
        const data = await response.json();
        setResourceData(data);
        setStep('success');
        setLoading(false);
      }
    } catch (error: any) {
      console.error('Error accessing resource:', error);
      setLoading(false);
      setStep('idle');
    }
  };

  const handleMakePayment = async () => {
    console.log('🔵 Make Payment clicked!');
    console.log('🔵 Challenge exists?', !!challenge);
    
    if (!challenge) {
      console.error('❌ No challenge found!');
      return;
    }

    console.log('🔵 Starting payment process...');
    setLoading(true);
    setStep('payment');
    
    // SAFETY: Force stop loading after 30 seconds
    const safetyTimeout = setTimeout(() => {
      console.error('⏱️ TIMEOUT! Forcing loading to stop after 30 seconds');
      setLoading(false);
      setStep('challenge');
      alert('Payment timed out. Please try again.');
    }, 30000);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      const payloadBody = {
        amount: challenge.amountSTX,
        recipient: challenge.recipient,
        sender: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
        metadata: `x402 payment for ${challenge.resource}`
      };
      
      console.log('Sending payment request:', payloadBody);
      console.log('Challenge object:', challenge);
      
      const paymentResponse = await fetch(`${apiUrl}/api/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'dev-secret-key-x402-nexus-2024',
          'X-Sender-Key': 'demo-private-key-for-testing',
          'X-Payment-Nonce': challenge.nonce
        },
        body: JSON.stringify(payloadBody)
      });

      const paymentResult = await paymentResponse.json();
      
      console.log('Payment response status:', paymentResponse.status);
      console.log('Payment result:', paymentResult);

      if (!paymentResponse.ok) {
        console.error('Payment failed:', paymentResult);
        throw new Error(paymentResult.error || 'Payment failed');
      }

      if (paymentResult.success || paymentResult.paymentId) {
        console.log('✅ Payment succeeded, will retry in 2 seconds...');
        setStep('retry');
        
        // Wait 2 seconds then retry with proof
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const paymentProof: PaymentProof = {
          txHash: paymentResult.txHash || 'demo-tx-' + Date.now(),
          paymentId: paymentResult.paymentId,
          nonce: challenge.nonce
        };
        
        console.log('🔄 Retrying with payment proof:', paymentProof);
        console.log('🔄 Retry URL:', `${apiUrl}${selectedEndpoint}`);
        
        const retryResponse = await fetch(`${apiUrl}${selectedEndpoint}`, {
          method: selectedEndpoint.includes('inference') || selectedEndpoint.includes('credits') ? 'POST' : 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-payment-proof': paymentProof.txHash,
            'x-payment-id': paymentProof.paymentId,
            'x-payment-nonce': paymentProof.nonce
          },
          body: selectedEndpoint.includes('inference') 
            ? JSON.stringify({ prompt: 'What is x402?', model: 'llama-3' })
            : selectedEndpoint.includes('credits')
            ? JSON.stringify({ credits: 100 })
            : undefined
        });

        console.log('🔄 Retry response status:', retryResponse.status);

        if (retryResponse.ok) {
          const data = await retryResponse.json();
          console.log('✅ SUCCESS! Resource data:', data);
          setResourceData(data);
          setStep('success');
          setLoading(false);
        } else {
          const errorData = await retryResponse.json().catch(() => ({ error: 'Unknown error' }));
          console.error('❌ Retry failed:', retryResponse.status, errorData);
          setLoading(false);
          setStep('challenge');
          alert(`Payment verification failed (${retryResponse.status}). Please try again.`);
        }
      } else {
        throw new Error('Payment failed');
      }
    } catch (error: any) {
      console.error('Error making payment:', error);
      setLoading(false);
      setStep('challenge');
    } finally {
      clearTimeout(safetyTimeout);
      // DOUBLE SAFETY: Always stop loading
      setTimeout(() => setLoading(false), 100);
    }
  };

  const reset = () => {
    setStep('idle');
    setChallenge(null);
    setProof(null);
    setResourceData(null);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 mb-6">
            <Lock className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-medium text-violet-400">HTTP 402 Payment Required</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent mb-4">
            x402 Protocol Demo
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Experience the future of micropayments with HTTP 402. Access premium resources with automatic blockchain payment handling.
          </p>
        </div>

        {/* Endpoint Selection */}
        {step === 'idle' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {endpoints.map((endpoint) => {
              const Icon = endpoint.icon;
              const isSelected = selectedEndpoint === endpoint.path;
              return (
                <button
                  key={endpoint.path}
                  onClick={() => setSelectedEndpoint(endpoint.path)}
                  className={`group relative overflow-hidden rounded-2xl border p-6 text-left transition-all duration-300 hover:scale-105 ${
                    isSelected
                      ? 'border-violet-500/50 bg-violet-500/10 shadow-lg shadow-violet-500/20'
                      : 'border-white/5 bg-slate-900/50 hover:border-white/10'
                  }`}
                >
                  <div className="relative z-10">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                      isSelected ? 'bg-gradient-to-br from-violet-500 to-purple-600' : 'bg-slate-800'
                    }`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{endpoint.name}</h3>
                    <p className="text-sm text-slate-400 mb-4">{endpoint.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-violet-400">{endpoint.price}</span>
                      {isSelected && (
                        <CheckCircle className="w-5 h-5 text-violet-400" />
                      )}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-purple-500/10" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Protocol Flow Visualization */}
        <div className="rounded-2xl border border-white/5 bg-slate-900/50 backdrop-blur-sm p-8">
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-12">
            {[
              { id: 'idle', label: 'Request', active: step === 'idle' },
              { id: 'challenge', label: '402 Challenge', active: step === 'challenge' },
              { id: 'payment', label: 'Payment', active: step === 'payment' },
              { id: 'retry', label: 'Retry', active: step === 'retry' },
              { id: 'success', label: 'Success', active: step === 'success' }
            ].map((s, index, arr) => (
              <div key={s.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                    s.active
                      ? 'border-violet-500 bg-violet-500 shadow-lg shadow-violet-500/50'
                      : step > s.id || (arr.findIndex(x => x.id === step) > index)
                      ? 'border-emerald-500 bg-emerald-500'
                      : 'border-slate-700 bg-slate-800'
                  }`}>
                    {s.active ? (
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    ) : (step > s.id || (arr.findIndex(x => x.id === step) > index)) ? (
                      <CheckCircle className="w-6 h-6 text-white" />
                    ) : (
                      <span className="text-white font-semibold">{index + 1}</span>
                    )}
                  </div>
                  <span className={`mt-3 text-sm font-medium ${
                    s.active ? 'text-violet-400' : 'text-slate-500'
                  }`}>
                    {s.label}
                  </span>
                </div>
                {index < arr.length - 1 && (
                  <div className={`flex-1 h-0.5 transition-all duration-500 ${
                    arr.findIndex(x => x.id === step) > index
                      ? 'bg-emerald-500'
                      : 'bg-slate-700'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Content Area */}
          <div className="min-h-64">
            {step === 'idle' && (
              <div className="text-center py-12">
                <button
                  onClick={handleAccessResource}
                  disabled={loading}
                  className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold shadow-lg shadow-violet-500/50 hover:shadow-xl hover:shadow-violet-500/60 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Zap className="w-5 h-5" />
                  )}
                  <span>Access Protected Resource</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <p className="text-sm text-slate-500 mt-4">
                  Click to initiate HTTP 402 payment flow
                </p>
              </div>
            )}

            {step === 'challenge' && challenge && (
              <div className="space-y-6">
                <div className="p-6 rounded-xl bg-amber-500/5 border border-amber-500/20">
                  <h3 className="text-lg font-semibold text-amber-400 mb-4">Payment Required</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500">Resource:</span>
                      <p className="text-white font-mono mt-1">{challenge.resource || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Amount:</span>
                      <p className="text-white font-semibold mt-1">{challenge.amountSTX || 0} STX</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Recipient:</span>
                      <p className="text-white font-mono text-xs mt-1">{challenge.recipient?.slice(0, 16) || 'N/A'}...</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Protocol:</span>
                      <p className="text-white font-semibold mt-1">{challenge.protocol || 'x402-stacks'}</p>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <button
                    onClick={() => {
                      console.log('🟢 BUTTON CLICKED!');
                      handleMakePayment();
                    }}
                    disabled={loading}
                    className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/60 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Zap className="w-5 h-5" />
                    <span>Make Payment</span>
                  </button>
                </div>
              </div>
            )}

            {step === 'payment' && (
              <div className="text-center py-12">
                <Loader2 className="w-16 h-16 text-violet-400 animate-spin mx-auto mb-4" />
                <p className="text-lg text-white font-semibold">Processing Payment...</p>
                <p className="text-sm text-slate-400 mt-2">Submitting transaction to Stacks blockchain</p>
              </div>
            )}

            {step === 'retry' && (
              <div className="text-center py-12">
                <Loader2 className="w-16 h-16 text-blue-400 animate-spin mx-auto mb-4" />
                <p className="text-lg text-white font-semibold">Retrying with Payment Proof...</p>
                <p className="text-sm text-slate-400 mt-2">Verifying payment and accessing resource</p>
              </div>
            )}

            {step === 'success' && resourceData && (
              <div className="space-y-6">
                <div className="text-center py-8">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/50">
                    <CheckCircle className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Access Granted</h3>
                  <p className="text-slate-400">Payment confirmed and resource accessed successfully</p>
                </div>
                <div className="p-6 rounded-xl bg-slate-800/50 border border-white/5">
                  <h4 className="text-sm font-medium text-slate-400 mb-3">Response Data</h4>
                  <pre className="text-xs text-emerald-400 font-mono overflow-auto">
                    {JSON.stringify(resourceData, null, 2)}
                  </pre>
                </div>
                <div className="text-center">
                  <button
                    onClick={reset}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 bg-slate-800/50 text-white font-medium hover:bg-slate-800 transition-all duration-300"
                  >
                    Try Another Request
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Technical Details */}
        <div className="mt-8 p-6 rounded-xl bg-slate-900/30 border border-white/5">
          <h3 className="text-sm font-semibold text-slate-400 mb-3">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs text-slate-500">
            <div>
              <span className="text-violet-400 font-semibold">1. Request</span>
              <p className="mt-1">Client attempts to access protected resource</p>
            </div>
            <div>
              <span className="text-amber-400 font-semibold">2. Challenge</span>
              <p className="mt-1">Server responds with 402 payment challenge</p>
            </div>
            <div>
              <span className="text-emerald-400 font-semibold">3. Payment</span>
              <p className="mt-1">Client submits blockchain payment automatically</p>
            </div>
            <div>
              <span className="text-blue-400 font-semibold">4. Access</span>
              <p className="mt-1">Request retried with payment proof, access granted</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
