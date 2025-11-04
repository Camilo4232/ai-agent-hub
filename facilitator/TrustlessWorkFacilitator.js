import { ethers } from 'ethers';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getChainConfig, DEFAULT_CHAIN } from './config/chains.js';
import EventEmitter from 'events';

/**
 * Trustless Work Protocol Facilitator
 * Multi-chain payment facilitator for AI agents
 * Supports: Ethereum, Polygon, Arbitrum, Solana
 *
 * Based on: https://lxdao.notion.site/Trustless-Agents-CoLearning
 */

class TrustlessWorkFacilitator extends EventEmitter {
    constructor(options = {}) {
        super();

        this.defaultChain = options.defaultChain || DEFAULT_CHAIN;
        this.providers = {};
        this.solanaConnections = {};
        this.wallets = {};

        // Initialize providers
        this.initializeProviders();

        console.log('🤖 Trustless Work Facilitator initialized');
        console.log(`   Default chain: ${this.defaultChain}`);
    }

    /**
     * Initialize blockchain providers for all chains
     */
    initializeProviders() {
        // Initialize EVM providers
        const evmChains = ['ethereum', 'sepolia', 'polygon', 'mumbai', 'arbitrum', 'arbitrumSepolia'];

        for (const chainName of evmChains) {
            try {
                const config = getChainConfig(chainName);
                if (config.type === 'evm') {
                    this.providers[chainName] = new ethers.JsonRpcProvider(config.rpcUrl);
                    console.log(`   ✅ ${config.name} provider ready`);
                }
            } catch (error) {
                console.log(`   ⚠️ ${chainName} provider not configured`);
            }
        }

        // Initialize Solana connections
        const solanaChains = ['solana', 'solanaDevnet'];

        for (const chainName of solanaChains) {
            try {
                const config = getChainConfig(chainName);
                if (config.type === 'solana') {
                    this.solanaConnections[chainName] = new Connection(
                        config.rpcUrl,
                        'confirmed'
                    );
                    console.log(`   ✅ ${config.name} connection ready`);
                }
            } catch (error) {
                console.log(`   ⚠️ ${chainName} connection not configured`);
            }
        }
    }

    /**
     * Create a work request (payment + task)
     * @param {Object} request - Work request details
     * @returns {Promise<Object>} - Transaction details
     */
    async createWorkRequest(request) {
        const {
            chain = this.defaultChain,
            agentAddress,
            amount,
            serviceId,
            metadata = {}
        } = request;

        console.log(`\n📝 [Facilitator] Creating work request`);
        console.log(`   Chain: ${chain}`);
        console.log(`   Agent: ${agentAddress}`);
        console.log(`   Amount: ${amount}`);
        console.log(`   Service: ${serviceId}`);

        const chainConfig = getChainConfig(chain);

        if (chainConfig.type === 'evm') {
            return await this.createEVMWorkRequest(chain, request);
        } else if (chainConfig.type === 'solana') {
            return await this.createSolanaWorkRequest(chain, request);
        } else {
            throw new Error(`Unsupported chain type: ${chainConfig.type}`);
        }
    }

    /**
     * Create EVM work request (Ethereum, Polygon, Arbitrum)
     */
    async createEVMWorkRequest(chain, request) {
        const { agentAddress, amount, serviceId, userAddress, userPrivateKey } = request;

        const chainConfig = getChainConfig(chain);
        const provider = this.providers[chain];

        if (!provider) {
            throw new Error(`Provider not initialized for chain: ${chain}`);
        }

        // Create wallet from private key or use connected wallet
        let wallet;
        if (userPrivateKey) {
            wallet = new ethers.Wallet(userPrivateKey, provider);
        } else {
            throw new Error('User private key or signer required');
        }

        // Payment Processor ABI
        const abi = [
            "function createPaymentUSDC(string paymentId, address agent, uint256 amount, string serviceId) external",
            "function verifyPayment(string paymentId) view returns (bool)"
        ];

        const paymentProcessor = new ethers.Contract(
            chainConfig.contracts.paymentProcessor,
            abi,
            wallet
        );

        // Generate unique payment ID
        const paymentId = `pay_${Date.now()}_${serviceId}`;
        const amountWei = ethers.parseUnits(amount.toString(), 6); // USDC has 6 decimals

        console.log(`   💳 Submitting transaction to ${chainConfig.name}...`);

        try {
            // Send transaction
            const tx = await paymentProcessor.createPaymentUSDC(
                paymentId,
                agentAddress,
                amountWei,
                serviceId,
                chainConfig.gasSettings || {}
            );

            console.log(`   ⏳ Transaction submitted: ${tx.hash}`);
            console.log(`   🔗 ${chainConfig.blockExplorer}/tx/${tx.hash}`);

            // Wait for confirmation
            const receipt = await tx.wait();

            console.log(`   ✅ Transaction confirmed in block ${receipt.blockNumber}`);

            const result = {
                success: true,
                chain,
                paymentId,
                transactionHash: tx.hash,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed.toString(),
                explorer: `${chainConfig.blockExplorer}/tx/${tx.hash}`
            };

            this.emit('workCreated', result);

            return result;

        } catch (error) {
            console.error(`   ❌ Transaction failed:`, error.message);

            const result = {
                success: false,
                chain,
                error: error.message,
                code: error.code
            };

            this.emit('workFailed', result);

            return result;
        }
    }

    /**
     * Create Solana work request
     */
    async createSolanaWorkRequest(chain, request) {
        const { agentAddress, amount, serviceId, userPublicKey } = request;

        const chainConfig = getChainConfig(chain);
        const connection = this.solanaConnections[chain];

        if (!connection) {
            throw new Error(`Solana connection not initialized for: ${chain}`);
        }

        console.log(`   💳 Creating Solana transaction...`);

        try {
            const fromPubkey = new PublicKey(userPublicKey);
            const toPubkey = new PublicKey(agentAddress);
            const lamports = amount * LAMPORTS_PER_SOL;

            // Create transaction
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey,
                    toPubkey,
                    lamports
                })
            );

            // Get recent blockhash
            const { blockhash } = await connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = fromPubkey;

            // Note: Transaction needs to be signed by user's wallet
            // This would typically be done on the client side

            const paymentId = `pay_${Date.now()}_${serviceId}`;

            const result = {
                success: true,
                chain,
                paymentId,
                transaction: transaction.serialize({ requireAllSignatures: false }).toString('base64'),
                message: 'Transaction created, awaiting signature',
                explorer: `${chainConfig.blockExplorer}/tx/`
            };

            this.emit('workCreated', result);

            return result;

        } catch (error) {
            console.error(`   ❌ Solana transaction failed:`, error.message);

            const result = {
                success: false,
                chain,
                error: error.message
            };

            this.emit('workFailed', result);

            return result;
        }
    }

    /**
     * Verify work payment
     * @param {string} paymentId - Payment ID to verify
     * @param {string} chain - Blockchain to check
     * @returns {Promise<Object>} - Verification result
     */
    async verifyPayment(paymentId, chain = this.defaultChain) {
        console.log(`\n🔍 [Facilitator] Verifying payment: ${paymentId}`);
        console.log(`   Chain: ${chain}`);

        const chainConfig = getChainConfig(chain);

        if (chainConfig.type === 'evm') {
            return await this.verifyEVMPayment(paymentId, chain);
        } else if (chainConfig.type === 'solana') {
            return await this.verifySolanaPayment(paymentId, chain);
        }
    }

    /**
     * Verify EVM payment
     */
    async verifyEVMPayment(paymentId, chain) {
        const chainConfig = getChainConfig(chain);
        const provider = this.providers[chain];

        if (!provider) {
            throw new Error(`Provider not initialized for chain: ${chain}`);
        }

        const abi = [
            "function verifyPayment(string paymentId) view returns (bool)",
            "function payments(string paymentId) view returns (address payer, address agent, uint256 amount, uint256 timestamp, bool completed)"
        ];

        const paymentProcessor = new ethers.Contract(
            chainConfig.contracts.paymentProcessor,
            abi,
            provider
        );

        try {
            const isVerified = await paymentProcessor.verifyPayment(paymentId);

            if (isVerified) {
                const payment = await paymentProcessor.payments(paymentId);
                const [payer, agent, amount, timestamp, completed] = payment;

                console.log(`   ✅ Payment verified`);
                console.log(`   Payer: ${payer}`);
                console.log(`   Agent: ${agent}`);
                console.log(`   Amount: ${ethers.formatUnits(amount, 6)} USDC`);

                return {
                    verified: true,
                    chain,
                    paymentId,
                    details: {
                        payer,
                        agent,
                        amount: ethers.formatUnits(amount, 6),
                        timestamp: Number(timestamp),
                        completed
                    }
                };
            } else {
                console.log(`   ❌ Payment not found`);
                return {
                    verified: false,
                    chain,
                    paymentId,
                    error: 'Payment not found on-chain'
                };
            }
        } catch (error) {
            console.error(`   ❌ Verification failed:`, error.message);
            return {
                verified: false,
                chain,
                paymentId,
                error: error.message
            };
        }
    }

    /**
     * Verify Solana payment
     */
    async verifySolanaPayment(paymentId, chain) {
        // Solana payment verification would require transaction signature
        // This is a placeholder implementation
        console.log(`   ⚠️ Solana payment verification not yet implemented`);

        return {
            verified: false,
            chain,
            paymentId,
            error: 'Solana verification not yet implemented'
        };
    }

    /**
     * Get supported chains
     */
    getSupportedChains() {
        return Object.keys(this.providers).concat(Object.keys(this.solanaConnections));
    }

    /**
     * Get chain status
     */
    async getChainStatus(chain) {
        const chainConfig = getChainConfig(chain);

        if (chainConfig.type === 'evm') {
            const provider = this.providers[chain];
            if (!provider) return { available: false };

            try {
                const blockNumber = await provider.getBlockNumber();
                const network = await provider.getNetwork();

                return {
                    available: true,
                    type: 'evm',
                    name: chainConfig.name,
                    chainId: Number(network.chainId),
                    blockNumber,
                    symbol: chainConfig.symbol
                };
            } catch (error) {
                return {
                    available: false,
                    error: error.message
                };
            }
        } else if (chainConfig.type === 'solana') {
            const connection = this.solanaConnections[chain];
            if (!connection) return { available: false };

            try {
                const slot = await connection.getSlot();
                const version = await connection.getVersion();

                return {
                    available: true,
                    type: 'solana',
                    name: chainConfig.name,
                    slot,
                    version: version['solana-core'],
                    symbol: chainConfig.symbol
                };
            } catch (error) {
                return {
                    available: false,
                    error: error.message
                };
            }
        }
    }
}

export default TrustlessWorkFacilitator;
