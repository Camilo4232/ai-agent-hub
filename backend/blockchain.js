import { ethers } from 'ethers';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

/**
 * Blockchain utilities for interacting with smart contracts
 */
class BlockchainService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.agentRegistry = null;
    this.paymentProcessor = null;
    this.usdcToken = null;

    this.initialized = false;
  }

  /**
   * Initialize blockchain connection
   */
  async initialize() {
    try {
      // Setup provider
      const rpcUrl = process.env.RPC_URL;
      if (!rpcUrl) {
        console.warn('⚠️  RPC_URL not set, blockchain features disabled');
        return false;
      }

      this.provider = new ethers.JsonRpcProvider(rpcUrl);

      // Setup signer if private key exists
      if (process.env.PRIVATE_KEY) {
        this.signer = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
        console.log('✅ Wallet connected:', await this.signer.getAddress());
      }

      // Load contract ABIs
      const agentRegistryABI = this.loadABI('AgentRegistryV2');
      const paymentProcessorABI = this.loadABI('PaymentProcessor');
      const erc20ABI = this.loadABI('ERC20');

      // Initialize contracts
      if (process.env.AGENT_REGISTRY_ADDRESS && agentRegistryABI) {
        this.agentRegistry = new ethers.Contract(
          process.env.AGENT_REGISTRY_ADDRESS,
          agentRegistryABI,
          this.signer || this.provider
        );
        console.log('✅ AgentRegistry connected:', process.env.AGENT_REGISTRY_ADDRESS);
      }

      if (process.env.PAYMENT_PROCESSOR_ADDRESS && paymentProcessorABI) {
        this.paymentProcessor = new ethers.Contract(
          process.env.PAYMENT_PROCESSOR_ADDRESS,
          paymentProcessorABI,
          this.signer || this.provider
        );
        console.log('✅ PaymentProcessor connected:', process.env.PAYMENT_PROCESSOR_ADDRESS);
      }

      if (process.env.USDC_ADDRESS && erc20ABI) {
        this.usdcToken = new ethers.Contract(
          process.env.USDC_ADDRESS,
          erc20ABI,
          this.signer || this.provider
        );
        console.log('✅ USDC Token connected:', process.env.USDC_ADDRESS);
      }

      this.initialized = true;
      return true;
    } catch (error) {
      console.error('❌ Blockchain initialization failed:', error.message);
      return false;
    }
  }

  /**
   * Load contract ABI from artifacts
   */
  loadABI(contractName) {
    try {
      const artifactPath = path.join(
        process.cwd(),
        'contracts',
        'artifacts',
        `${contractName}.sol`,
        `${contractName}.json`
      );

      if (fs.existsSync(artifactPath)) {
        const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
        return artifact.abi;
      }

      // Fallback to minimal ABIs
      return this.getMinimalABI(contractName);
    } catch (error) {
      console.warn(`⚠️  Could not load ABI for ${contractName}`);
      return null;
    }
  }

  /**
   * Get minimal ABI for common contracts
   */
  getMinimalABI(contractName) {
    const abis = {
      ERC20: [
        'function balanceOf(address) view returns (uint256)',
        'function transfer(address to, uint256 amount) returns (bool)',
        'function approve(address spender, uint256 amount) returns (bool)',
        'function allowance(address owner, address spender) view returns (uint256)'
      ],
      PaymentProcessor: [
        'function createPaymentUSDC(string paymentId, address agent, uint256 amount, string serviceId)',
        'function createPaymentETH(string paymentId, address agent, string serviceId) payable',
        'function settlePayment(string paymentId)',
        'function verifyPayment(string paymentId) view returns (bool)',
        'function getPayment(string paymentId) view returns (tuple(address payer, address agent, uint256 amount, string paymentId, string serviceId, uint256 timestamp, bool verified, bool settled))',
        'function withdrawUSDC()',
        'function withdrawETH()',
        'function agentEarnings(address) view returns (uint256)'
      ],
      AgentRegistryV2: [
        'function registerAgent(string name, string description, string endpoint, string metadataURI, uint256 pricePerQuery) returns (uint256)',
        'function updateAgent(uint256 tokenId, string newEndpoint, uint256 newPrice, bool active)',
        'function recordQuery(uint256 tokenId, string paymentId)',
        'function submitFeedback(uint256 tokenId, uint256 rating, string comment)',
        'function getAgentInfo(uint256 tokenId) view returns (tuple(string name, string description, string endpoint, address owner, uint256 pricePerQuery, uint256 registeredAt, bool active, uint256 totalQueries, uint256 totalEarnings))',
        'function getActiveAgents() view returns (uint256[])',
        'function totalAgents() view returns (uint256)'
      ]
    };

    return abis[contractName] || null;
  }

  /**
   * Register agent on-chain
   */
  async registerAgentOnChain(name, description, endpoint, metadataURI, pricePerQuery) {
    if (!this.agentRegistry || !this.signer) {
      throw new Error('AgentRegistry not initialized or no signer');
    }

    const priceInUSDC = ethers.parseUnits(pricePerQuery.toString(), 6);

    const tx = await this.agentRegistry.registerAgent(
      name,
      description,
      endpoint,
      metadataURI,
      priceInUSDC
    );

    const receipt = await tx.wait();

    // Extract tokenId from events
    const event = receipt.logs.find(log => {
      try {
        const parsed = this.agentRegistry.interface.parseLog(log);
        return parsed.name === 'AgentRegistered';
      } catch {
        return false;
      }
    });

    const tokenId = event ? this.agentRegistry.interface.parseLog(event).args.tokenId : null;

    return {
      success: true,
      txHash: receipt.hash,
      tokenId: tokenId ? tokenId.toString() : null,
      blockNumber: receipt.blockNumber
    };
  }

  /**
   * Create payment on-chain (USDC)
   */
  async createPaymentUSDC(paymentId, agentAddress, amount, serviceId) {
    if (!this.paymentProcessor || !this.signer) {
      throw new Error('PaymentProcessor not initialized or no signer');
    }

    const amountInUSDC = ethers.parseUnits(amount.toString(), 6);

    // First approve USDC
    const approveTx = await this.usdcToken.approve(
      await this.paymentProcessor.getAddress(),
      amountInUSDC
    );
    await approveTx.wait();

    // Create payment
    const tx = await this.paymentProcessor.createPaymentUSDC(
      paymentId,
      agentAddress,
      amountInUSDC,
      serviceId
    );

    const receipt = await tx.wait();

    return {
      success: true,
      txHash: receipt.hash,
      paymentId,
      blockNumber: receipt.blockNumber
    };
  }

  /**
   * Create payment on-chain (ETH)
   */
  async createPaymentETH(paymentId, agentAddress, amount, serviceId) {
    if (!this.paymentProcessor || !this.signer) {
      throw new Error('PaymentProcessor not initialized or no signer');
    }

    const amountInWei = ethers.parseEther(amount.toString());

    const tx = await this.paymentProcessor.createPaymentETH(
      paymentId,
      agentAddress,
      serviceId,
      { value: amountInWei }
    );

    const receipt = await tx.wait();

    return {
      success: true,
      txHash: receipt.hash,
      paymentId,
      blockNumber: receipt.blockNumber
    };
  }

  /**
   * Verify payment on-chain
   */
  async verifyPaymentOnChain(paymentId) {
    if (!this.paymentProcessor) {
      throw new Error('PaymentProcessor not initialized');
    }

    const isValid = await this.paymentProcessor.verifyPayment(paymentId);

    if (isValid) {
      const payment = await this.paymentProcessor.getPayment(paymentId);
      return {
        valid: true,
        payment: {
          payer: payment.payer,
          agent: payment.agent,
          amount: payment.amount.toString(),
          paymentId: payment.paymentId,
          serviceId: payment.serviceId,
          timestamp: payment.timestamp.toString(),
          verified: payment.verified,
          settled: payment.settled
        }
      };
    }

    return { valid: false };
  }

  /**
   * Settle payment
   */
  async settlePayment(paymentId) {
    if (!this.paymentProcessor || !this.signer) {
      throw new Error('PaymentProcessor not initialized or no signer');
    }

    const tx = await this.paymentProcessor.settlePayment(paymentId);
    const receipt = await tx.wait();

    return {
      success: true,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber
    };
  }

  /**
   * Get agent info from blockchain
   */
  async getAgentInfo(tokenId) {
    if (!this.agentRegistry) {
      throw new Error('AgentRegistry not initialized');
    }

    const info = await this.agentRegistry.getAgentInfo(tokenId);

    return {
      name: info.name,
      description: info.description,
      endpoint: info.endpoint,
      owner: info.owner,
      pricePerQuery: ethers.formatUnits(info.pricePerQuery, 6),
      registeredAt: info.registeredAt.toString(),
      active: info.active,
      totalQueries: info.totalQueries.toString(),
      totalEarnings: ethers.formatUnits(info.totalEarnings, 6)
    };
  }

  /**
   * Get all active agents
   */
  async getActiveAgents() {
    if (!this.agentRegistry) {
      throw new Error('AgentRegistry not initialized');
    }

    const tokenIds = await this.agentRegistry.getActiveAgents();

    const agents = await Promise.all(
      tokenIds.map(async (tokenId) => {
        const info = await this.getAgentInfo(tokenId);
        return {
          tokenId: tokenId.toString(),
          ...info
        };
      })
    );

    return agents;
  }

  /**
   * Get agent earnings
   */
  async getAgentEarnings(agentAddress) {
    if (!this.paymentProcessor) {
      throw new Error('PaymentProcessor not initialized');
    }

    const earnings = await this.paymentProcessor.agentEarnings(agentAddress);
    return ethers.formatUnits(earnings, 6);
  }

  /**
   * Withdraw earnings
   */
  async withdrawEarnings(currency = 'USDC') {
    if (!this.paymentProcessor || !this.signer) {
      throw new Error('PaymentProcessor not initialized or no signer');
    }

    const tx = currency === 'USDC'
      ? await this.paymentProcessor.withdrawUSDC()
      : await this.paymentProcessor.withdrawETH();

    const receipt = await tx.wait();

    return {
      success: true,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber
    };
  }

  /**
   * Check if blockchain is available
   */
  isAvailable() {
    return this.initialized;
  }
}

// Export singleton instance
export const blockchain = new BlockchainService();
export default blockchain;
