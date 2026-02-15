import { useState } from 'react';

export default function X402SimpleDemo() {
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [data, setData] = useState<any>(null);

  const testPaymentFlow = async () => {
    setStatus('working');
    setMessage('Step 1: Requesting protected resource...');
    
    try {
      const apiUrl = 'http://localhost:3001';
      
      // Step 1: Get 402 challenge
      console.log('1️⃣ Requesting resource...');
      const response1 = await fetch(`${apiUrl}/api/x402/premium/ai-inference`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'test', model: 'test' })
      });
      
      console.log('Response 1 status:', response1.status);
      const data1 = await response1.json();
      console.log('Response 1 data:', data1);
      
      if (response1.status !== 402) {
        setStatus('error');
        setMessage('Expected 402, got ' + response1.status);
        return;
      }
      
      setMessage('Step 2: Got 402 challenge. Making payment...');
      const challenge = data1.paymentChallenge;
      
      // Step 2: Make payment
      console.log('2️⃣ Making payment...');
      const response2 = await fetch(`${apiUrl}/api/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Sender-Key': 'demo-key'
        },
        body: JSON.stringify({
          amount: challenge.amountSTX,
          recipient: challenge.recipient,
          sender: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
          metadata: 'test payment'
        })
      });
      
      console.log('Response 2 status:', response2.status);
      const data2 = await response2.json();
      console.log('Response 2 data:', data2);
      
      if (!response2.ok) {
        setStatus('error');
        setMessage('Payment failed: ' + JSON.stringify(data2));
        return;
      }
      
      setMessage('Step 3: Payment succeeded. Retrying with proof...');
      
      // Step 3: Retry with proof
      console.log('3️⃣ Retrying with proof...');
      console.log('3️⃣ Headers being sent:', {
        'x-payment-proof': data2.txHash,
        'x-payment-id': data2.paymentId,
        'x-payment-nonce': challenge.nonce
      });
      
      const response3 = await fetch(`${apiUrl}/api/x402/premium/ai-inference`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'x-payment-proof': data2.txHash,
          'x-payment-id': data2.paymentId,
          'x-payment-nonce': challenge.nonce
        },
        body: JSON.stringify({ prompt: 'test', model: 'test' })
      });
      
      console.log('Response 3 status:', response3.status);
      const data3 = await response3.json();
      console.log('Response 3 data:', data3);
      
      if (response3.ok) {
        setStatus('success');
        setMessage('✅ SUCCESS! Payment flow completed');
        setData(data3);
      } else {
        setStatus('error');
        setMessage('Retry failed: ' + JSON.stringify(data3));
      }
      
    } catch (error: any) {
      setStatus('error');
      setMessage('Error: ' + error.message);
      console.error('Error:', error);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6">x402 Payment Flow Test</h1>
      
      <button
        onClick={testPaymentFlow}
        disabled={status === 'working'}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'working' ? 'Testing...' : 'Test Payment Flow'}
      </button>
      
      <div className="mt-6 p-4 rounded-lg bg-slate-800 border border-slate-700">
        <div className="font-semibold text-white mb-2">Status: {status}</div>
        <div className="text-slate-300 text-sm">{message}</div>
        {data && (
          <pre className="mt-4 text-xs text-green-400 overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </div>
      
      <div className="mt-4 text-xs text-slate-500">
        Check browser console (F12) for detailed logs
      </div>
    </div>
  );
}
