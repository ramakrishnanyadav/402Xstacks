import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3001;

// ==========================================
// MINIMAL CORS - NO RESTRICTIONS
// ==========================================
app.use(cors({
  origin: '*',
  methods: '*',
  allowedHeaders: '*',
  credentials: true
}));

app.use(express.json());

// ==========================================
// SIMPLE IN-MEMORY STORAGE
// ==========================================
const challenges = new Map();
const payments = new Map();

// ==========================================
// ENDPOINT 1: Protected Resource (Returns 402)
// ==========================================
app.post('/api/x402/premium/ai-inference', (req, res) => {
  const proof = req.headers['x-payment-proof'];
  const id = req.headers['x-payment-id'];
  const nonce = req.headers['x-payment-nonce'];

  console.log('=== REQUEST RECEIVED ===');
  console.log('Headers:', { proof, id, nonce });
  console.log('Has proof?', !!proof);

  // If has valid proof, grant access
  if (proof && id && nonce) {
    const payment = payments.get(id);
    
    if (payment) {
      console.log('✅ PAYMENT VALID - GRANTING ACCESS');
      return res.json({
        success: true,
        message: 'Access granted!',
        data: 'AI inference result here'
      });
    }
  }

  // No valid proof - return 402
  const challenge = {
    amount: 100000,
    amountSTX: 0.1,
    recipient: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    resource: '/premium/ai-inference',
    nonce: `x402-${Date.now()}`,
    expiresAt: Date.now() + 900000,
    paymentEndpoint: 'http://localhost:3001/api/payments',
    protocol: 'x402-stacks',
    network: 'testnet'
  };

  challenges.set(challenge.nonce, challenge);
  
  console.log('❌ NO VALID PAYMENT - SENDING 402');
  res.status(402).json({
    error: 'Payment Required',
    message: 'This resource requires payment',
    paymentChallenge: challenge
  });
});

// ==========================================
// ENDPOINT 2: Payment Submission
// ==========================================
app.post('/api/payments', (req, res) => {
  console.log('=== PAYMENT RECEIVED ===');
  console.log('Body:', req.body);

  const paymentId = `PAY-${Date.now()}`;
  const txHash = `0x${Date.now().toString(16)}`;

  const payment = {
    paymentId,
    txHash,
    amount: req.body.amount,
    recipient: req.body.recipient,
    status: 'CONFIRMED',
    timestamp: Date.now()
  };

  payments.set(paymentId, payment);

  console.log('✅ PAYMENT STORED:', payment);

  res.json({
    success: true,
    paymentId,
    txHash,
    status: 'CONFIRMED'
  });
});

// ==========================================
// HEALTH CHECK
// ==========================================
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ==========================================
// START SERVER
// ==========================================
app.listen(PORT, () => {
  console.log('');
  console.log('==============================================');
  console.log('  MINIMAL x402 SERVER RUNNING');
  console.log('==============================================');
  console.log(`  Port: ${PORT}`);
  console.log(`  URL: http://localhost:${PORT}`);
  console.log('');
  console.log('  Endpoints:');
  console.log('  - POST /api/x402/premium/ai-inference');
  console.log('  - POST /api/payments');
  console.log('  - GET /api/health');
  console.log('');
  console.log('  CORS: Fully open (all origins, all headers)');
  console.log('==============================================');
  console.log('');
});
