import { ethers } from 'ethers';

/**
 * Payment Verification Module
 * Verifies payments on-chain before processing agent requests
 */

// Use correct deployed contract address from deployment.json
const PAYMENT_PROCESSOR_ADDRESS = process.env.PAYMENT_PROCESSOR_ADDRESS || '0x97CA3e550b7b6091A652645e89f98946Cda5Ac08';
const SEPOLIA_RPC = process.env.RPC_URL || process.env.SEPOLIA_RPC_URL || 'https://rpc.sepolia.org';

const PAYMENT_PROCESSOR_ABI = [
    "function verifyPayment(string paymentId) view returns (bool)",
    "function payments(string paymentId) view returns (address payer, address agent, uint256 amount, uint256 timestamp, bool completed)",
    "event PaymentCreated(string indexed paymentId, address indexed payer, address indexed agent, uint256 amount, string serviceId)"
];

class PaymentVerifier {
    constructor() {
        this.provider = new ethers.JsonRpcProvider(SEPOLIA_RPC);
        this.contract = new ethers.Contract(
            PAYMENT_PROCESSOR_ADDRESS,
            PAYMENT_PROCESSOR_ABI,
            this.provider
        );
        this.verifiedPayments = new Map(); // Cache verified payments
    }

    /**
     * Verify payment on-chain
     * @param {string} paymentId - Payment ID from frontend
     * @param {string} expectedAgent - Agent address that should receive payment
     * @param {string} minimumAmount - Minimum amount in USDC (with decimals)
     * @returns {Promise<{verified: boolean, details?: object, error?: string}>}
     */
    async verifyPayment(paymentId, expectedAgent, minimumAmount) {
        try {
            // Check cache first
            if (this.verifiedPayments.has(paymentId)) {
                console.log(`💰 [Payment Verifier] Using cached verification for ${paymentId}`);
                return this.verifiedPayments.get(paymentId);
            }

            console.log(`🔍 [Payment Verifier] Verifying payment: ${paymentId}`);
            console.log(`   Expected agent: ${expectedAgent}`);
            console.log(`   Minimum amount: ${minimumAmount} USDC`);

            // Verify on-chain
            const isVerified = await this.contract.verifyPayment(paymentId);

            if (!isVerified) {
                return {
                    verified: false,
                    error: 'Payment not found on-chain'
                };
            }

            // Get payment details
            const payment = await this.contract.payments(paymentId);
            const [payer, agent, amount, timestamp, completed] = payment;

            console.log(`   Payer: ${payer}`);
            console.log(`   Agent: ${agent}`);
            console.log(`   Amount: ${ethers.formatUnits(amount, 6)} USDC`);
            console.log(`   Timestamp: ${new Date(timestamp.toNumber() * 1000).toISOString()}`);
            console.log(`   Completed: ${completed}`);

            // Verify agent address matches
            if (agent.toLowerCase() !== expectedAgent.toLowerCase()) {
                return {
                    verified: false,
                    error: `Payment is for different agent. Expected: ${expectedAgent}, Got: ${agent}`
                };
            }

            // Verify minimum amount
            const minAmountWei = ethers.parseUnits(minimumAmount, 6);
            if (amount < minAmountWei) {
                return {
                    verified: false,
                    error: `Insufficient payment. Expected: ${minimumAmount} USDC, Got: ${ethers.formatUnits(amount, 6)} USDC`
                };
            }

            // Check if payment already completed (prevent replay)
            if (completed) {
                return {
                    verified: false,
                    error: 'Payment already used'
                };
            }

            const result = {
                verified: true,
                details: {
                    paymentId,
                    payer,
                    agent,
                    amount: ethers.formatUnits(amount, 6),
                    timestamp: Number(timestamp),
                    completed
                }
            };

            // Cache result (for 10 minutes)
            this.verifiedPayments.set(paymentId, result);
            setTimeout(() => this.verifiedPayments.delete(paymentId), 10 * 60 * 1000);

            console.log(`✅ [Payment Verifier] Payment verified successfully!`);
            return result;

        } catch (error) {
            console.error(`❌ [Payment Verifier] Error:`, error.message);
            return {
                verified: false,
                error: `Verification failed: ${error.message}`
            };
        }
    }

    /**
     * Check if payment is verified (for quick checks)
     * @param {string} paymentId
     * @returns {Promise<boolean>}
     */
    async isPaymentVerified(paymentId) {
        try {
            return await this.contract.verifyPayment(paymentId);
        } catch (error) {
            console.error(`❌ [Payment Verifier] Quick check failed:`, error.message);
            return false;
        }
    }

    /**
     * Listen for new payment events
     * @param {Function} callback - Called when new payment detected
     */
    listenForPayments(callback) {
        this.contract.on('PaymentCreated', (paymentId, payer, agent, amount, serviceId, event) => {
            console.log(`📨 [Payment Verifier] New payment detected: ${paymentId}`);
            callback({
                paymentId,
                payer,
                agent,
                amount: ethers.formatUnits(amount, 6),
                serviceId,
                transactionHash: event.log.transactionHash
            });
        });
    }
}

// Singleton instance
const paymentVerifier = new PaymentVerifier();

export {
    PaymentVerifier,
    paymentVerifier
};
