import { X402Nexus } from '../src/index';

/**
 * Example: AI Agent using x402-Nexus SDK
 * 
 * This example demonstrates how an AI agent can autonomously:
 * 1. Access payment-gated APIs using HTTP 402 protocol
 * 2. Automatically handle payment requirements
 * 3. Retry failed transactions
 * 4. Track spending and API usage
 */

async function main() {
  // Initialize x402-Nexus SDK
  const nexus = new X402Nexus({
    apiKey: process.env.API_KEY_SECRET || 'your-api-key',
    apiUrl: process.env.API_URL || 'http://localhost:3001',
    senderKey: process.env.STACKS_PRIVATE_KEY || 'your-private-key',
    network: 'testnet'
  });

  console.log('🤖 AI Agent starting...\n');

  try {
    // Example 1: Access AI Inference API (requires 0.1 STX payment)
    console.log('1️⃣ Requesting AI inference...');
    const aiResult = await nexus.accessAIInference(
      'What is the future of blockchain payments?',
      'llama-3'
    );
    console.log('✅ AI Response:', aiResult.result);
    console.log(`💰 Cost: ${aiResult.costSTX} STX\n`);

    // Example 2: Access Market Data API (requires 0.05 STX payment)
    console.log('2️⃣ Fetching market data...');
    const marketData = await nexus.accessMarketData('BTC');
    console.log('✅ Market Data:', {
      symbol: marketData.symbol,
      price: marketData.price,
      change: marketData.change24h
    });
    console.log(`💰 Cost: ${marketData.costSTX} STX\n`);

    // Example 3: Access Premium Content (requires 0.01 STX payment)
    console.log('3️⃣ Accessing premium article...');
    const article = await nexus.accessPremiumContent('article-123');
    console.log('✅ Article:', article.title);
    console.log(`💰 Cost: ${article.costSTX} STX\n`);

    // Example 4: Purchase API Credits (requires 0.5 STX payment)
    console.log('4️⃣ Purchasing API credits...');
    const credits = await nexus.purchaseAPICredits(100);
    console.log('✅ Credits purchased:', credits.creditsPurchased);
    console.log(`💰 Cost: ${credits.costSTX} STX\n`);

    // Example 5: Manual payment with retry
    console.log('5️⃣ Making manual payment with automatic retry...');
    const payment = await nexus.processPaymentWithPolling({
      amount: 0.1,
      recipient: 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
      metadata: 'AI agent task payment'
    });
    console.log('✅ Payment confirmed:', {
      paymentId: payment.paymentId,
      txHash: payment.txHash,
      attempts: payment.attempts,
      processingTime: payment.processingTime
    });
    if (payment.attempts > 1) {
      console.log(`🔄 Retry engine saved this transaction! (${payment.attempts} attempts)`);
    }

    console.log('\n✅ All tasks completed successfully!');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the example
main();
