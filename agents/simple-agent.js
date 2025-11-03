import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const AGENT_NAME = 'SimpleAssistant';
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';

/**
 * Simple AI Agent demonstrating:
 * - Registration (ERC-8004)
 * - A2A Communication
 * - X402 Payment handling
 */
class SimpleAgent {
  constructor(name, endpoint, walletAddress = null) {
    this.name = name;
    this.endpoint = endpoint;
    this.agentId = null;
    this.walletAddress = walletAddress || process.env.PAYMENT_RECIPIENT || '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
    this.pricePerQuery = '0.001'; // Default price
  }

  /**
   * Register agent with the hub (ERC-8004 Identity)
   */
  async register() {
    console.log(`\n📝 Registering agent: ${this.name}...`);

    try {
      const response = await axios.post(`${SERVER_URL}/agents/register`, {
        name: this.name,
        description: 'A simple AI agent for demonstrations',
        endpoint: this.endpoint,
        walletAddress: this.walletAddress,
        pricePerQuery: this.pricePerQuery
      });

      this.agentId = response.data.agentId;

      console.log(`✅ Agent registered successfully!`);
      console.log(`   Agent ID: ${this.agentId}`);
      console.log(`   Endpoint: ${this.endpoint}`);
      console.log(`   Blockchain: ${response.data.blockchain ? 'Enabled' : 'Demo mode'}`);

      if (response.data.data.blockchain) {
        console.log(`   Token ID: ${response.data.data.blockchain.tokenId}`);
        console.log(`   TX Hash: ${response.data.data.blockchain.txHash}`);
      }

      return response.data;
    } catch (error) {
      console.error('❌ Registration failed:', error.message);
      throw error;
    }
  }

  /**
   * Send A2A message to another agent
   */
  async sendMessage(targetAgent, message, task = null) {
    console.log(`\n💬 Sending A2A message to ${targetAgent}...`);

    try {
      const response = await axios.post(`${SERVER_URL}/a2a/message`, {
        from: this.agentId || this.name,
        to: targetAgent,
        message: message,
        task: task
      });

      console.log(`✅ Message sent successfully!`);
      console.log(`   Response: ${response.data.message}`);

      return response.data;
    } catch (error) {
      console.error('❌ A2A message failed:', error.message);
      throw error;
    }
  }

  /**
   * Query another agent with payment (X402)
   */
  async queryAgent(agentId, query) {
    console.log(`\n🔍 Querying agent ${agentId}...`);
    console.log(`   Query: "${query}"`);

    try {
      // First attempt - should return 402
      const firstAttempt = await axios.post(
        `${SERVER_URL}/agents/${agentId}/query`,
        { query },
        { validateStatus: () => true }
      );

      if (firstAttempt.status === 402) {
        console.log(`\n💳 Payment required:`);
        console.log(`   Amount: ${firstAttempt.data.payment.amount} ${firstAttempt.data.payment.currency}`);
        console.log(`   Network: ${firstAttempt.data.payment.network}`);

        // Simulate payment
        console.log(`\n💰 Simulating payment...`);
        const paymentResponse = await axios.post(`${SERVER_URL}/payments/verify`, {
          txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
          amount: firstAttempt.data.payment.amount
        });

        console.log(`✅ Payment verified!`);
        console.log(`   Payment ID: ${paymentResponse.data.paymentId}`);

        // Retry with payment ID
        const paidResponse = await axios.post(
          `${SERVER_URL}/agents/${agentId}/query`,
          { query },
          {
            headers: {
              'X-Payment-Id': paymentResponse.data.paymentId
            }
          }
        );

        console.log(`\n✅ Query successful!`);
        console.log(`   Answer: ${paidResponse.data.answer}`);

        return paidResponse.data;
      }

      return firstAttempt.data;
    } catch (error) {
      console.error('❌ Query failed:', error.message);
      throw error;
    }
  }

  /**
   * List all available agents
   */
  async listAgents() {
    console.log(`\n📋 Fetching available agents...`);

    try {
      const response = await axios.get(`${SERVER_URL}/agents`);

      console.log(`✅ Found ${response.data.count} agent(s):`);
      response.data.agents.forEach((agent, index) => {
        console.log(`   ${index + 1}. ${agent.name} (${agent.id})`);
        console.log(`      Endpoint: ${agent.endpoint}`);
      });

      return response.data;
    } catch (error) {
      console.error('❌ Failed to list agents:', error.message);
      throw error;
    }
  }
}

/**
 * Demo flow
 */
async function runDemo() {
  console.log('🤖 AI Agent Hub - Simple Agent Demo');
  console.log('=' .repeat(50));

  const agent = new SimpleAgent(AGENT_NAME, 'http://localhost:3001');

  try {
    // Step 1: Register agent (ERC-8004)
    await agent.register();

    // Step 2: List available agents
    await agent.listAgents();

    // Step 3: Send A2A message
    await agent.sendMessage(
      'agent-hub',
      'Hello! Testing A2A protocol',
      'health-check'
    );

    // Step 4: Query with payment (X402)
    await agent.queryAgent(
      agent.agentId,
      'What is the weather today?'
    );

    console.log('\n✨ Demo completed successfully!\n');
  } catch (error) {
    console.error('\n❌ Demo failed:', error.message);
    process.exit(1);
  }
}

// Run demo if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runDemo();
}

export default SimpleAgent;
