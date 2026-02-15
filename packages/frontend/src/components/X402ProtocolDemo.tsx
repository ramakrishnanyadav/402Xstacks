import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Lock, Unlock, CreditCard } from 'lucide-react';

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

export const X402ProtocolDemo: React.FC = () => {
  const [step, setStep] = useState<'initial' | 'challenge' | 'payment' | 'success'>('initial');
  const [loading, setLoading] = useState(false);
  const [challenge, setChallenge] = useState<PaymentChallenge | null>(null);
  const [proof, setProof] = useState<PaymentProof | null>(null);
  const [resourceData, setResourceData] = useState<any>(null);
  const [selectedEndpoint, setSelectedEndpoint] = useState('/api/x402/premium/ai-inference');

  const endpoints = [
    { path: '/api/x402/premium/ai-inference', name: 'AI Inference', cost: 0.1, icon: '🤖' },
    { path: '/api/x402/premium/market-data/BTC', name: 'Market Data', cost: 0.05, icon: '📊' },
    { path: '/api/x402/content/premium-article/123', name: 'Premium Content', cost: 0.01, icon: '📰' },
    { path: '/api/x402/credits/purchase', name: 'API Credits', cost: 0.5, icon: '💳' },
  ];

  const handleAccessResource = async () => {
    setLoading(true);
    setStep('initial');

    try {
      // Step 1: Try to access protected resource
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}${selectedEndpoint}`, {
        method: selectedEndpoint.includes('inference') || selectedEndpoint.includes('credits') ? 'POST' : 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: selectedEndpoint.includes('inference') 
          ? JSON.stringify({ prompt: 'What is x402?', model: 'llama-3' })
          : selectedEndpoint.includes('credits')
          ? JSON.stringify({ credits: 100 })
          : undefined
      });

      if (response.status === 402) {
        // Step 2: Received payment challenge
        const data = await response.json();
        setChallenge(data.paymentChallenge);
        setStep('challenge');
      } else if (response.ok) {
        // Resource was accessible without payment (shouldn't happen for these endpoints)
        const data = await response.json();
        setResourceData(data);
        setStep('success');
      } else {
        throw new Error(`Unexpected response: ${response.status}`);
      }
    } catch (error: any) {
      console.error('Error accessing resource:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMakePayment = async () => {
    if (!challenge) return;

    setLoading(true);
    setStep('payment');

    try {
      // Step 3: Submit payment
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const paymentResponse = await fetch(`${apiUrl}/api/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'dev-secret-key-x402-nexus-2024',
          'X-Sender-Key': 'demo-private-key-for-testing', // Required by backend validation
          'X-Payment-Nonce': challenge.nonce
        },
        body: JSON.stringify({
          amount: challenge.amountSTX,
          recipient: challenge.recipient,
          sender: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', // Demo sender address
          metadata: `x402 payment for ${challenge.resource}`
        })
      });

      const paymentResult = await paymentResponse.json();

      if (paymentResult.success) {
        // Step 4: Wait for confirmation and retry with proof
        // For demo purposes, we'll simulate this
        setTimeout(async () => {
          const paymentProof: PaymentProof = {
            txHash: paymentResult.txHash || 'demo-tx-hash',
            paymentId: paymentResult.paymentId,
            nonce: challenge.nonce
          };
          setProof(paymentProof);

          // Step 5: Retry resource access with payment proof
          const retryResponse = await fetch(`${apiUrl}${selectedEndpoint}`, {
            method: selectedEndpoint.includes('inference') || selectedEndpoint.includes('credits') ? 'POST' : 'GET',
            headers: {
              'Content-Type': 'application/json',
              'X-Payment-Proof': paymentProof.txHash,
              'X-Payment-ID': paymentProof.paymentId,
              'X-Payment-Nonce': paymentProof.nonce
            },
            body: selectedEndpoint.includes('inference') 
              ? JSON.stringify({ prompt: 'What is x402?', model: 'llama-3' })
              : selectedEndpoint.includes('credits')
              ? JSON.stringify({ credits: 100 })
              : undefined
          });

          if (retryResponse.ok) {
            const data = await retryResponse.json();
            setResourceData(data);
            setStep('success');
          } else {
            throw new Error('Payment verification failed');
          }

          setLoading(false);
        }, 2000); // Simulate payment confirmation delay
      } else {
        throw new Error('Payment failed');
      }
    } catch (error: any) {
      console.error('Error making payment:', error);
      alert('Payment error: ' + error.message);
      setLoading(false);
      setStep('challenge');
    }
  };

  const resetDemo = () => {
    setStep('initial');
    setChallenge(null);
    setProof(null);
    setResourceData(null);
  };

  return (
    <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 rounded-xl p-8 text-white">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-purple-500/20 rounded-lg">
          <Lock className="w-6 h-6 text-purple-300" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">HTTP 402 Protocol Demo</h2>
          <p className="text-purple-200">Experience x402-stacks payment-gated APIs</p>
        </div>
      </div>

      {/* Endpoint Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-3 text-purple-200">Select Protected Endpoint</label>
        <div className="grid grid-cols-2 gap-3">
          {endpoints.map((endpoint) => (
            <button
              key={endpoint.path}
              onClick={() => setSelectedEndpoint(endpoint.path)}
              disabled={loading || step !== 'initial'}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedEndpoint === endpoint.path
                  ? 'border-purple-400 bg-purple-500/30'
                  : 'border-purple-700/30 bg-purple-800/20 hover:border-purple-500/50'
              } ${loading || step !== 'initial' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="text-2xl mb-2">{endpoint.icon}</div>
              <div className="text-sm font-semibold">{endpoint.name}</div>
              <div className="text-xs text-purple-300 mt-1">{endpoint.cost} STX</div>
            </button>
          ))}
        </div>
      </div>

      {/* Protocol Flow Steps */}
      <div className="space-y-4">
        {/* Step 1: Initial Access */}
        <div className={`p-4 rounded-lg border-2 ${
          step === 'initial' ? 'border-purple-400 bg-purple-500/20' : 'border-purple-700/30 bg-purple-800/10'
        }`}>
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-full ${step === 'initial' ? 'bg-purple-500' : 'bg-purple-700'}`}>
              <span className="text-sm font-bold">1</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-2">Access Protected Resource</h3>
              <p className="text-sm text-purple-200 mb-3">
                Attempt to access the payment-gated API endpoint
              </p>
              {step === 'initial' && (
                <button
                  onClick={handleAccessResource}
                  disabled={loading}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  {loading ? 'Accessing...' : 'Access Resource'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Step 2: Payment Challenge */}
        {challenge && (
          <div className={`p-4 rounded-lg border-2 ${
            step === 'challenge' ? 'border-yellow-400 bg-yellow-500/20' : 'border-purple-700/30 bg-purple-800/10'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-full ${step === 'challenge' ? 'bg-yellow-500' : 'bg-purple-700'}`}>
                <span className="text-sm font-bold text-gray-900">2</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                  402 Payment Required
                </h3>
                <div className="bg-black/30 rounded-lg p-3 mb-3 text-xs font-mono">
                  <div className="text-yellow-300 mb-1">HTTP/1.1 402 Payment Required</div>
                  <div className="text-purple-300">
                    <div>Amount: {challenge.amountSTX} STX</div>
                    <div>Resource: {challenge.resource}</div>
                    <div>Protocol: {challenge.protocol}</div>
                    <div>Network: {challenge.network}</div>
                  </div>
                </div>
                {step === 'challenge' && (
                  <button
                    onClick={handleMakePayment}
                    disabled={loading}
                    className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-gray-900 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                    {loading ? 'Processing...' : `Pay ${challenge.amountSTX} STX`}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Payment Processing */}
        {step === 'payment' && (
          <div className="p-4 rounded-lg border-2 border-blue-400 bg-blue-500/20">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-blue-500">
                <span className="text-sm font-bold">3</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing Payment
                </h3>
                <p className="text-sm text-blue-200">
                  Submitting payment to Stacks blockchain with automatic retry...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 'success' && proof && resourceData && (
          <div className="p-4 rounded-lg border-2 border-green-400 bg-green-500/20">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-green-500">
                <span className="text-sm font-bold">4</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  Access Granted
                </h3>
                <div className="bg-black/30 rounded-lg p-3 mb-3 text-xs font-mono">
                  <div className="text-green-300 mb-2">HTTP/1.1 200 OK</div>
                  <div className="text-purple-300">
                    <div>Payment ID: {proof.paymentId}</div>
                    <div className="truncate">TX Hash: {proof.txHash}</div>
                  </div>
                </div>
                <div className="bg-black/30 rounded-lg p-3 mb-3">
                  <div className="text-xs text-purple-300 mb-1">Response Data:</div>
                  <pre className="text-xs text-green-300 overflow-auto max-h-40">
                    {JSON.stringify(resourceData, null, 2)}
                  </pre>
                </div>
                <button
                  onClick={resetDemo}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Unlock className="w-4 h-4" />
                  Try Another Endpoint
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info Footer */}
      <div className="mt-6 p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
        <h4 className="text-sm font-semibold mb-2 text-purple-300">How x402 Protocol Works:</h4>
        <ol className="text-xs space-y-1 text-purple-200">
          <li>1. Client requests protected resource</li>
          <li>2. Server responds with 402 Payment Required + payment challenge</li>
          <li>3. Client submits payment using x402-Nexus (with automatic retry)</li>
          <li>4. Client retries request with payment proof</li>
          <li>5. Server validates payment and grants access</li>
        </ol>
      </div>
    </div>
  );
};
