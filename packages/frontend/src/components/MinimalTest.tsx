import { useState } from 'react';

export default function MinimalTest() {
  const [log, setLog] = useState<string[]>([]);
  const [status, setStatus] = useState('idle');

  const addLog = (msg: string) => {
    console.log(msg);
    setLog(prev => [...prev, msg]);
  };

  const test = async () => {
    setLog([]);
    setStatus('running');
    
    try {
      const API = 'http://localhost:3001';
      
      // STEP 1: Get 402 challenge
      addLog('STEP 1: Requesting protected resource...');
      const res1 = await fetch(`${API}/api/x402/premium/ai-inference`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'test' })
      });
      
      addLog(`Response: ${res1.status}`);
      
      if (res1.status !== 402) {
        addLog('❌ ERROR: Expected 402, got ' + res1.status);
        setStatus('error');
        return;
      }
      
      const data1 = await res1.json();
      addLog('✅ Got 402 challenge');
      addLog(JSON.stringify(data1.paymentChallenge, null, 2));
      
      const challenge = data1.paymentChallenge;
      
      // STEP 2: Make payment
      addLog('');
      addLog('STEP 2: Making payment...');
      const res2 = await fetch(`${API}/api/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: challenge.amountSTX,
          recipient: challenge.recipient,
          sender: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'
        })
      });
      
      addLog(`Response: ${res2.status}`);
      
      if (!res2.ok) {
        addLog('❌ ERROR: Payment failed');
        setStatus('error');
        return;
      }
      
      const data2 = await res2.json();
      addLog('✅ Payment successful');
      addLog(`PaymentId: ${data2.paymentId}`);
      addLog(`TxHash: ${data2.txHash}`);
      
      // STEP 3: Retry with proof
      addLog('');
      addLog('STEP 3: Retrying with payment proof...');
      addLog(`Sending headers:`);
      addLog(`  x-payment-proof: ${data2.txHash}`);
      addLog(`  x-payment-id: ${data2.paymentId}`);
      addLog(`  x-payment-nonce: ${challenge.nonce}`);
      
      const res3 = await fetch(`${API}/api/x402/premium/ai-inference`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-payment-proof': data2.txHash,
          'x-payment-id': data2.paymentId,
          'x-payment-nonce': challenge.nonce
        },
        body: JSON.stringify({ prompt: 'test' })
      });
      
      addLog(`Response: ${res3.status}`);
      
      if (res3.status === 402) {
        addLog('❌ ERROR: Still got 402! Headers not working!');
        setStatus('error');
        return;
      }
      
      if (res3.ok) {
        const data3 = await res3.json();
        addLog('');
        addLog('🎉 SUCCESS! Access granted!');
        addLog(JSON.stringify(data3, null, 2));
        setStatus('success');
      } else {
        addLog('❌ ERROR: Unexpected response');
        setStatus('error');
      }
      
    } catch (err: any) {
      addLog('❌ ERROR: ' + err.message);
      setStatus('error');
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6">
        Minimal Payment Flow Test
      </h1>
      
      <button
        onClick={test}
        disabled={status === 'running'}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {status === 'running' ? 'Testing...' : 'Run Test'}
      </button>
      
      <div className="mt-6 p-6 bg-gray-900 rounded-lg font-mono text-sm">
        {log.length === 0 && (
          <div className="text-gray-500">Click button to start test</div>
        )}
        {log.map((line, i) => (
          <div key={i} className={`
            ${line.startsWith('✅') ? 'text-green-400' : ''}
            ${line.startsWith('❌') ? 'text-red-400' : ''}
            ${line.startsWith('STEP') ? 'text-blue-400 font-bold mt-2' : ''}
            ${line.startsWith('🎉') ? 'text-green-500 font-bold text-lg' : ''}
            ${!line.startsWith('✅') && !line.startsWith('❌') && !line.startsWith('STEP') && !line.startsWith('🎉') ? 'text-gray-300' : ''}
          `}>
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}
