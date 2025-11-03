import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import blockchain from './blockchain.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// In-memory storage for agent sessions (use database in production)
const sessions = new Map();

// Initialize blockchain connection
let blockchainEnabled = false;

(async () => {
  blockchainEnabled = await blockchain.initialize();
  if (blockchainEnabled) {
    console.log('✅ Blockchain integration enabled');
  } else {
    console.log('⚠️  Running in demo mode (no blockchain)');
  }
})();

/**
 * X402 Payment Middleware
 * Implements HTTP 402 Payment Required with on-chain verification
 */
function requirePayment(agentId) {
  return async (req, res, next) => {
    const paymentId = req.headers['x-payment-id'];

    if (!paymentId) {
      // Get agent info to determine price
      const agent = sessions.get(agentId);
      const price = agent?.pricePerQuery || '0.001';

      return res.status(402).json({
        error: 'Payment Required',
        payment: {
          amount: price,
          currency: 'USDC',
          network: 'ethereum-sepolia',
          agentAddress: agent?.walletAddress || process.env.PAYMENT_RECIPIENT,
          paymentProcessorAddress: process.env.PAYMENT_PROCESSOR_ADDRESS,
          instructions: blockchainEnabled
            ? 'Create payment on-chain using PaymentProcessor contract'
            : 'Send USDC and include payment ID in X-Payment-Id header'
        },
        message: 'Please complete payment to access this resource',
        blockchain: blockchainEnabled
      });
    }

    // Verify payment
    try {
      if (blockchainEnabled) {
        // Verify on-chain
        const result = await blockchain.verifyPaymentOnChain(paymentId);

        if (!result.valid) {
          return res.status(402).json({
            error: 'Payment not verified',
            message: 'Payment does not exist or is already settled'
          });
        }

        // Attach payment info to request
        req.payment = result.payment;
      } else {
        // Demo mode: accept any payment ID
        console.log(`[DEMO] Accepting payment ID: ${paymentId}`);
      }

      next();
    } catch (error) {
      return res.status(500).json({
        error: 'Payment verification failed',
        message: error.message
      });
    }
  };
}

/**
 * A2A Protocol Endpoint
 * Allows agents to communicate with each other
 */
app.post('/a2a/message', async (req, res) => {
  const { from, to, message, task } = req.body;

  if (!from || !to || !message) {
    return res.status(400).json({ error: 'Missing required fields: from, to, message' });
  }

  console.log(`[A2A] Message from ${from} to ${to}: ${message}`);

  // Simple echo response for demo
  const response = {
    from: 'agent-hub',
    to: from,
    message: `Received: ${message}`,
    task_result: task ? `Task "${task}" acknowledged` : null,
    timestamp: new Date().toISOString()
  };

  res.json(response);
});

/**
 * Agent Registration Endpoint
 * Register agent both locally and on blockchain
 */
app.post('/agents/register', async (req, res) => {
  const { name, description, endpoint, walletAddress, pricePerQuery, metadataURI } = req.body;

  if (!name || !endpoint || !walletAddress) {
    return res.status(400).json({ error: 'Missing required fields: name, endpoint, walletAddress' });
  }

  const price = pricePerQuery || '0.001';
  const metadata = metadataURI || `https://agent-hub.com/metadata/${walletAddress}`;

  // Register locally
  const agentId = `agent_${Date.now()}`;

  const agentData = {
    id: agentId,
    name,
    description,
    endpoint,
    walletAddress,
    pricePerQuery: price,
    metadataURI: metadata,
    registered: new Date().toISOString(),
    active: true,
    blockchain: null
  };

  sessions.set(agentId, agentData);

  // Register on blockchain if enabled
  if (blockchainEnabled && blockchain.agentRegistry) {
    try {
      const result = await blockchain.registerAgentOnChain(
        name,
        description || '',
        endpoint,
        metadata,
        price
      );

      agentData.blockchain = {
        tokenId: result.tokenId,
        txHash: result.txHash,
        blockNumber: result.blockNumber
      };

      sessions.set(agentId, agentData);

      console.log(`✅ Agent registered on-chain: Token ID ${result.tokenId}`);
    } catch (error) {
      console.error('❌ Blockchain registration failed:', error.message);
      // Continue with local registration only
    }
  }

  res.json({
    success: true,
    agentId,
    message: 'Agent registered successfully',
    data: agentData,
    blockchain: blockchainEnabled
  });
});

/**
 * Query Agent (Paid endpoint using X402)
 * Requires on-chain payment
 */
app.post('/agents/:agentId/query', requirePayment(':agentId'), async (req, res) => {
  const { agentId } = req.params;
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  const agent = sessions.get(agentId);

  // Simple AI response simulation
  const response = {
    agentId,
    query,
    answer: `This is a response from ${agent?.name || 'AI Agent'}: "${query}". In production, this would connect to an actual AI agent.`,
    timestamp: new Date().toISOString(),
    cost: agent?.pricePerQuery || '0.001',
    paymentId: req.headers['x-payment-id']
  };

  // Settle payment if blockchain enabled
  if (blockchainEnabled && req.payment) {
    try {
      await blockchain.settlePayment(req.payment.paymentId);
      console.log(`✅ Payment settled: ${req.payment.paymentId}`);
    } catch (error) {
      console.error('❌ Payment settlement failed:', error.message);
    }
  }

  res.json(response);
});

/**
 * List Active Agents
 */
app.get('/agents', async (req, res) => {
  try {
    // Get local agents
    const localAgents = Array.from(sessions.values()).filter(agent => agent.active);

    // Get blockchain agents if enabled
    let blockchainAgents = [];
    if (blockchainEnabled && blockchain.agentRegistry) {
      try {
        blockchainAgents = await blockchain.getActiveAgents();
      } catch (error) {
        console.error('Failed to fetch blockchain agents:', error.message);
      }
    }

    res.json({
      count: localAgents.length,
      agents: localAgents,
      blockchainAgents: blockchainAgents,
      blockchain: blockchainEnabled
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get Agent Info (from blockchain)
 */
app.get('/agents/:tokenId/info', async (req, res) => {
  const { tokenId } = req.params;

  if (!blockchainEnabled) {
    return res.status(503).json({ error: 'Blockchain not available' });
  }

  try {
    const info = await blockchain.getAgentInfo(tokenId);
    res.json(info);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Create Payment (On-chain)
 */
app.post('/payments/create', async (req, res) => {
  const { agentAddress, amount, serviceId, currency } = req.body;

  if (!blockchainEnabled) {
    return res.status(503).json({ error: 'Blockchain not available' });
  }

  if (!agentAddress || !amount || !serviceId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    let result;
    if (currency === 'ETH') {
      result = await blockchain.createPaymentETH(paymentId, agentAddress, amount, serviceId);
    } else {
      result = await blockchain.createPaymentUSDC(paymentId, agentAddress, amount, serviceId);
    }

    res.json({
      success: true,
      paymentId: result.paymentId,
      txHash: result.txHash,
      blockNumber: result.blockNumber,
      message: 'Payment created on-chain'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Verify Payment (On-chain)
 */
app.post('/payments/verify', async (req, res) => {
  const { paymentId } = req.body;

  if (!paymentId) {
    return res.status(400).json({ error: 'Payment ID required' });
  }

  try {
    if (blockchainEnabled) {
      const result = await blockchain.verifyPaymentOnChain(paymentId);

      res.json({
        success: result.valid,
        payment: result.payment,
        message: result.valid ? 'Payment verified on-chain' : 'Payment not found'
      });
    } else {
      // Demo mode
      res.json({
        success: true,
        paymentId,
        message: 'Payment verified (demo mode)',
        note: 'Enable blockchain for real verification'
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get Agent Earnings
 */
app.get('/agents/:address/earnings', async (req, res) => {
  const { address } = req.params;

  if (!blockchainEnabled) {
    return res.status(503).json({ error: 'Blockchain not available' });
  }

  try {
    const earnings = await blockchain.getAgentEarnings(address);
    res.json({ earnings, currency: 'USDC' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Withdraw Earnings
 */
app.post('/agents/withdraw', async (req, res) => {
  const { currency } = req.body;

  if (!blockchainEnabled) {
    return res.status(503).json({ error: 'Blockchain not available' });
  }

  try {
    const result = await blockchain.withdrawEarnings(currency || 'USDC');

    res.json({
      success: true,
      txHash: result.txHash,
      blockNumber: result.blockNumber,
      message: 'Withdrawal successful'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Health Check
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    blockchain: blockchainEnabled,
    protocols: {
      'ERC-8004': 'Identity Registry',
      'A2A': 'Agent-to-Agent Communication',
      'X402': 'Payment Protocol'
    },
    endpoints: {
      a2a: '/a2a/message',
      register: '/agents/register',
      query: '/agents/:agentId/query (paid)',
      list: '/agents',
      info: '/agents/:tokenId/info',
      createPayment: '/payments/create',
      verifyPayment: '/payments/verify',
      earnings: '/agents/:address/earnings',
      withdraw: '/agents/withdraw'
    },
    contracts: blockchainEnabled ? {
      agentRegistry: process.env.AGENT_REGISTRY_ADDRESS,
      paymentProcessor: process.env.PAYMENT_PROCESSOR_ADDRESS,
      usdc: process.env.USDC_ADDRESS
    } : null
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 AI Agent Hub running on http://localhost:${PORT}`);
  console.log(`\n📋 Protocols enabled:`);
  console.log(`   ✓ ERC-8004 (Identity Registry)`);
  console.log(`   ✓ A2A (Agent Communication)`);
  console.log(`   ✓ X402 (Payments${blockchainEnabled ? ' - On-chain' : ' - Demo mode'})`);
  console.log(`\n🔗 Endpoints:`);
  console.log(`   GET  /health - Health check`);
  console.log(`   GET  /agents - List agents`);
  console.log(`   POST /agents/register - Register agent`);
  console.log(`   POST /agents/:id/query - Query agent (requires payment)`);
  console.log(`   POST /payments/create - Create on-chain payment`);
  console.log(`   POST /payments/verify - Verify payment`);
  console.log(`   POST /a2a/message - A2A communication`);
  console.log(`   GET  /agents/:address/earnings - Check earnings`);
  console.log(`   POST /agents/withdraw - Withdraw earnings\n`);
});
