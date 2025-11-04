import { ethers } from 'ethers';

/**
 * X402 Protocol Client for Ultravioleta DAO Facilitator
 * Enables gasless, multi-chain payments using EIP-3009 meta-transactions
 *
 * Facilitator: https://facilitator.ultravioletadao.xyz/
 *
 * Supported chains:
 * - EVM: Base, Polygon, Avalanche, Celo, HyperEVM, Optimism (+ testnets)
 * - Solana: Mainnet + Devnet
 */

const FACILITATOR_URL = 'https://facilitator.ultravioletadao.xyz';

class X402FacilitatorClient {
    constructor() {
        this.facilitatorUrl = FACILITATOR_URL;
        this.supportedChains = null;
    }

    /**
     * Get facilitator health status
     * @returns {Promise<Object>}
     */
    async getHealth() {
        try {
            const response = await fetch(`${this.facilitatorUrl}/health`);
            return await response.json();
        } catch (error) {
            console.error('❌ [X402] Health check failed:', error.message);
            throw error;
        }
    }

    /**
     * Get supported chains and payment schemes
     * @returns {Promise<Object>}
     */
    async getSupportedChains() {
        try {
            if (this.supportedChains) {
                return this.supportedChains;
            }

            const response = await fetch(`${this.facilitatorUrl}/supported`);
            this.supportedChains = await response.json();

            console.log('✅ [X402] Loaded supported chains:', Object.keys(this.supportedChains.schemes || {}));

            return this.supportedChains;
        } catch (error) {
            console.error('❌ [X402] Failed to get supported chains:', error.message);
            throw error;
        }
    }

    /**
     * Verify payment signature and requirements
     * @param {Object} paymentRequest - Payment request with signature
     * @returns {Promise<Object>} - Verification result
     */
    async verifyPayment(paymentRequest) {
        try {
            console.log('🔍 [X402] Verifying payment...');

            const response = await fetch(`${this.facilitatorUrl}/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(paymentRequest)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Verification failed');
            }

            const result = await response.json();
            console.log('✅ [X402] Payment verified');

            return result;
        } catch (error) {
            console.error('❌ [X402] Verification failed:', error.message);
            throw error;
        }
    }

    /**
     * Settle payment on-chain via EIP-3009 meta-transaction
     * @param {Object} settlementRequest - Settlement request with all required data
     * @returns {Promise<Object>} - Settlement result with transaction hash
     */
    async settlePayment(settlementRequest) {
        try {
            console.log('💳 [X402] Settling payment on-chain...');

            const response = await fetch(`${this.facilitatorUrl}/settle`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(settlementRequest)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Settlement failed');
            }

            const result = await response.json();

            console.log('✅ [X402] Payment settled successfully');
            console.log(`   Transaction: ${result.transactionHash || result.signature}`);

            return result;
        } catch (error) {
            console.error('❌ [X402] Settlement failed:', error.message);
            throw error;
        }
    }

    /**
     * Create EIP-712 typed signature for USDC transfer
     * @param {Object} params - Transfer parameters
     * @returns {Promise<Object>} - Signature data
     */
    async createTransferWithAuthorizationSignature(params) {
        const {
            from,
            to,
            value,
            validAfter,
            validBefore,
            nonce,
            chainId,
            usdcAddress,
            signer
        } = params;

        // EIP-3009 TransferWithAuthorization domain and types
        const domain = {
            name: 'USD Coin',
            version: '2',
            chainId,
            verifyingContract: usdcAddress
        };

        const types = {
            TransferWithAuthorization: [
                { name: 'from', type: 'address' },
                { name: 'to', type: 'address' },
                { name: 'value', type: 'uint256' },
                { name: 'validAfter', type: 'uint256' },
                { name: 'validBefore', type: 'uint256' },
                { name: 'nonce', type: 'bytes32' }
            ]
        };

        const message = {
            from,
            to,
            value,
            validAfter,
            validBefore,
            nonce
        };

        // Sign with EIP-712
        const signature = await signer.signTypedData(domain, types, message);

        return {
            domain,
            types,
            message,
            signature
        };
    }

    /**
     * Helper: Check if chain is supported
     * @param {string} chainName - Chain name (e.g., 'polygon', 'base', 'solana')
     * @returns {Promise<boolean>}
     */
    async isChainSupported(chainName) {
        const supported = await this.getSupportedChains();
        return chainName.toLowerCase() in supported.schemes;
    }

    /**
     * Helper: Get facilitator wallet address for chain
     * @param {string} chainName - Chain name
     * @returns {Promise<string>} - Facilitator wallet address
     */
    async getFacilitatorWallet(chainName) {
        const supported = await this.getSupportedChains();
        const scheme = supported.schemes[chainName.toLowerCase()];

        if (!scheme) {
            throw new Error(`Chain not supported: ${chainName}`);
        }

        return scheme.feePayer || scheme.facilitatorWallet;
    }

    /**
     * Create a payment request for agent service
     * @param {Object} params - Payment parameters
     * @returns {Promise<Object>} - Complete payment request
     */
    async createPaymentRequest(params) {
        const {
            chain,
            agentAddress,
            amount, // in USDC (e.g., "1.00")
            serviceId,
            userWallet, // ethers Wallet or signer
            validityWindow = 3600 // 1 hour default
        } = params;

        console.log('\n📝 [X402] Creating payment request');
        console.log(`   Chain: ${chain}`);
        console.log(`   Agent: ${agentAddress}`);
        console.log(`   Amount: ${amount} USDC`);

        // Check if chain is supported
        const isSupported = await this.isChainSupported(chain);
        if (!isSupported) {
            throw new Error(`Chain not supported by facilitator: ${chain}`);
        }

        // Get chain configuration
        const supported = await this.getSupportedChains();
        const chainScheme = supported.schemes[chain.toLowerCase()];

        if (chainScheme.type === 'solana') {
            // Solana payment flow (different from EVM)
            return await this.createSolanaPaymentRequest({
                chain,
                agentAddress,
                amount,
                serviceId,
                userWallet,
                feePayer: chainScheme.feePayer
            });
        }

        // EVM payment flow (EIP-3009)
        const provider = userWallet.provider;
        const network = await provider.getNetwork();
        const chainId = Number(network.chainId);

        // Get USDC contract address for this chain
        const usdcAddress = chainScheme.tokenAddress; // Would need to be added to supported response

        // Generate nonce
        const nonce = ethers.hexlify(ethers.randomBytes(32));

        // Validity period
        const validAfter = Math.floor(Date.now() / 1000);
        const validBefore = validAfter + validityWindow;

        // Convert amount to wei (USDC has 6 decimals)
        const value = ethers.parseUnits(amount, 6);

        // Create signature
        const signatureData = await this.createTransferWithAuthorizationSignature({
            from: await userWallet.getAddress(),
            to: agentAddress,
            value,
            validAfter,
            validBefore,
            nonce,
            chainId,
            usdcAddress,
            signer: userWallet
        });

        const paymentRequest = {
            chain,
            serviceId,
            from: await userWallet.getAddress(),
            to: agentAddress,
            amount: amount,
            nonce,
            validAfter,
            validBefore,
            signature: signatureData.signature,
            usdcAddress
        };

        console.log('✅ [X402] Payment request created');

        return paymentRequest;
    }

    /**
     * Create Solana payment request
     * @param {Object} params
     * @returns {Promise<Object>}
     */
    async createSolanaPaymentRequest(params) {
        const { chain, agentAddress, amount, serviceId, userWallet, feePayer } = params;

        // Solana payment flow would be different
        // This is a placeholder - actual implementation would use @solana/web3.js
        console.log('⚠️ [X402] Solana payment creation not yet fully implemented');

        return {
            chain,
            serviceId,
            from: userWallet.publicKey?.toString(),
            to: agentAddress,
            amount,
            feePayer,
            type: 'solana'
        };
    }
}

// Singleton instance
const x402Client = new X402FacilitatorClient();

export {
    X402FacilitatorClient,
    x402Client
};
