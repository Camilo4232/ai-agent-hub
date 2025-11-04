# 🚀 X402 Facilitator Integration Guide

## Overview

This guide explains how to integrate **Ultravioleta DAO's x402 Facilitator** for gasless, multi-chain payments in the AI Agent Hub.

**Facilitator URL:** https://facilitator.ultravioletadao.xyz/

## What is X402?

X402 is a protocol for **stateless, per-request payments over HTTP** that enables:

- **Gasless transactions** - Users don't pay gas fees
- **Multi-chain support** - 13+ blockchain networks
- **EIP-3009 meta-transactions** - Trustless payment execution
- **2-3 second settlement** - Fast payment confirmation
- **No API keys** - Cryptographic signatures for auth

## Supported Chains

### 🌐 EVM Chains (Mainnet)

| Chain | Chain ID | USDC Address | Status |
|-------|----------|--------------|--------|
| Base | 8453 | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` | ✅ Live |
| Polygon | 137 | `0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359` | ✅ Live |
| Optimism | 10 | `0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85` | ✅ Live |
| Avalanche | 43114 | `0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E` | ✅ Live |
| Celo | 42220 | `0xcebA9300f2b948710d2653dD7B07f33A8B32118C` | ✅ Live |
| HyperEVM | 998 | TBD | ✅ Live |

### 🧪 EVM Testnets

| Chain | Chain ID | USDC Address | Status |
|-------|----------|--------------|--------|
| Base Sepolia | 84532 | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` | ✅ Live |
| Polygon Amoy | 80002 | `0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582` | ✅ Live |
| Optimism Sepolia | 11155420 | `0x5fd84259d66Cd46123540766Be93DFE6D43130D7` | ✅ Live |
| Avalanche Fuji | 43113 | `0x5425890298aed601595a70AB815c96711a31Bc65` | ✅ Live |
| Celo Alfajores | 44787 | `0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B` | ✅ Live |

### ⚡ Solana

| Network | USDC Address | Fee Payer | Status |
|---------|--------------|-----------|--------|
| Mainnet | `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` | `F742C4VfFLQ9zRQyithoj5229ZgtX2WqKCSFKgH2EThq` | ✅ Live |
| Devnet | `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU` | `6xNPewUdKRbEZDReQdpyfNUdgNg8QRc8Mt263T5GZSRv` | ✅ Live |

## Architecture

```
┌─────────────┐         ┌──────────────────┐         ┌─────────────┐
│   Frontend  │         │  X402 Facilitator │         │  Blockchain │
│   (User)    │────────▶│  (Ultravioleta)   │────────▶│  (EVM/SOL)  │
└─────────────┘         └──────────────────┘         └─────────────┘
      │                          │                           │
      │ 1. Sign EIP-712         │ 2. Verify signature        │
      │    payment msg          │    & requirements          │
      │                          │                           │
      │                          │ 3. Execute EIP-3009        │
      │                          │    meta-transaction        │
      │                          │    (pays gas)             │
      │                          │                           │
      │                          │ 4. Return tx hash  ◀──────┘
      └──────────────────────────┘
```

## API Endpoints

### 1. Health Check

```bash
GET https://facilitator.ultravioletadao.xyz/health
```

**Response:**
```json
{
  "status": "ok",
  "uptime": 12345
}
```

### 2. Get Supported Chains

```bash
GET https://facilitator.ultravioletadao.xyz/supported
```

**Response:**
```json
{
  "schemes": {
    "base": {
      "type": "evm",
      "chainId": 8453,
      "facilitatorWallet": "0x103040545AC5031A11E8C03dd11324C7333a13C7"
    },
    "polygon": {
      "type": "evm",
      "chainId": 137,
      "facilitatorWallet": "0x103040545AC5031A11E8C03dd11324C7333a13C7"
    },
    "solana": {
      "type": "solana",
      "feePayer": "F742C4VfFLQ9zRQyithoj5229ZgtX2WqKCSFKgH2EThq"
    }
  }
}
```

### 3. Verify Payment

```bash
POST https://facilitator.ultravioletadao.xyz/verify
Content-Type: application/json
```

**Request Body:**
```json
{
  "chain": "base",
  "from": "0xUserAddress",
  "to": "0xAgentAddress",
  "amount": "1.00",
  "nonce": "0x...",
  "validAfter": 1699999999,
  "validBefore": 1700003599,
  "signature": "0x..."
}
```

**Response:**
```json
{
  "verified": true,
  "paymentId": "pay_1234567890"
}
```

### 4. Settle Payment

```bash
POST https://facilitator.ultravioletadao.xyz/settle
Content-Type: application/json
```

**Request Body:**
```json
{
  "chain": "base",
  "serviceId": "weather_query",
  "from": "0xUserAddress",
  "to": "0xAgentAddress",
  "amount": "1.00",
  "nonce": "0x...",
  "validAfter": 1699999999,
  "validBefore": 1700003599,
  "signature": "0x...",
  "usdcAddress": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
}
```

**Response:**
```json
{
  "success": true,
  "transactionHash": "0xabcdef...",
  "blockNumber": 12345678,
  "paymentId": "pay_1234567890"
}
```

## Integration Steps

### Step 1: Install Dependencies

```bash
npm install ethers
npm install @solana/web3.js  # For Solana support
```

### Step 2: Import X402 Client

```javascript
import { x402Client } from './facilitator/X402FacilitatorClient.js';
import { getChainConfig, getX402SupportedChains } from './facilitator/config/chains.js';
```

### Step 3: Check Facilitator Health

```javascript
const health = await x402Client.getHealth();
console.log('Facilitator status:', health.status);
```

### Step 4: Get Supported Chains

```javascript
const supportedChains = await x402Client.getSupportedChains();
console.log('Supported chains:', Object.keys(supportedChains.schemes));
```

### Step 5: Create Payment Request

```javascript
import { ethers } from 'ethers';

// User's wallet (from MetaMask, etc.)
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

// Create payment request
const paymentRequest = await x402Client.createPaymentRequest({
    chain: 'baseSepolia',
    agentAddress: '0xAgentWalletAddress',
    amount: '1.00', // 1 USDC
    serviceId: 'weather_query_12345',
    userWallet: signer,
    validityWindow: 3600 // 1 hour validity
});

console.log('Payment request created:', paymentRequest);
```

### Step 6: Verify Payment

```javascript
const verification = await x402Client.verifyPayment(paymentRequest);

if (verification.verified) {
    console.log('Payment verified! Payment ID:', verification.paymentId);
} else {
    console.error('Verification failed:', verification.error);
}
```

### Step 7: Settle Payment On-Chain

```javascript
const settlement = await x402Client.settlePayment(paymentRequest);

if (settlement.success) {
    console.log('Payment settled!');
    console.log('Transaction hash:', settlement.transactionHash);
    console.log('Block number:', settlement.blockNumber);
} else {
    console.error('Settlement failed:', settlement.error);
}
```

## Frontend Integration

### Update Agent Payment Flow

```javascript
// In web3-integration.html or payment component

async function payAgent(agent) {
    try {
        // 1. Connect wallet
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        // 2. Get selected chain
        const selectedChain = document.getElementById('chainSelect').value; // e.g., 'baseSepolia'

        // 3. Create x402 payment request
        const paymentRequest = await x402Client.createPaymentRequest({
            chain: selectedChain,
            agentAddress: agent.walletAddress,
            amount: agent.price,
            serviceId: `${agent.id}_${Date.now()}`,
            userWallet: signer,
            validityWindow: 3600
        });

        // 4. Settle payment through facilitator (gasless!)
        const settlement = await x402Client.settlePayment(paymentRequest);

        if (settlement.success) {
            // 5. Make API call to agent with payment proof
            const response = await fetch(agent.endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: userQuery,
                    paymentId: settlement.paymentId,
                    transactionHash: settlement.transactionHash
                })
            });

            const result = await response.json();
            displayResult(result);
        }

    } catch (error) {
        console.error('Payment failed:', error);
        alert('Payment failed: ' + error.message);
    }
}
```

### Add Chain Selector to UI

```html
<select id="chainSelect">
    <option value="baseSepolia">Base Sepolia (Testnet)</option>
    <option value="base">Base (Mainnet)</option>
    <option value="polygon">Polygon</option>
    <option value="optimism">Optimism</option>
    <option value="avalanche">Avalanche</option>
    <option value="celo">Celo</option>
    <option value="solana">Solana</option>
    <option value="solanaDevnet">Solana Devnet</option>
</select>
```

## Agent Backend Integration

### Update Agent to Accept X402 Payments

```javascript
import { x402Client } from '../../facilitator/X402FacilitatorClient.js';

app.post('/query', async (req, res) => {
    const { query, paymentId, transactionHash, chain } = req.body;

    try {
        // Verify payment was settled on-chain
        const verification = await x402Client.verifyPayment({
            paymentId,
            transactionHash,
            chain,
            expectedAgent: AGENT_WALLET_ADDRESS,
            minimumAmount: PRICE_PER_QUERY
        });

        if (!verification.verified) {
            return res.status(402).json({
                error: 'Payment verification failed',
                details: verification.error
            });
        }

        // Payment verified - process request
        const result = await processQuery(query);

        res.json({
            success: true,
            result,
            paymentVerified: true,
            chain
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});
```

## Benefits of X402 Integration

### ✅ For Users
- **No gas fees** - Facilitator pays transaction costs
- **Faster payments** - 2-3 second settlement
- **Multi-chain** - Use any supported blockchain
- **Simpler UX** - Just sign, no gas estimation

### ✅ For Agents
- **Guaranteed payments** - On-chain settlement
- **Multi-chain revenue** - Accept payments from 13+ chains
- **Lower barriers** - Users more likely to pay without gas fees
- **Standard interface** - One integration for all chains

### ✅ For Developers
- **Clean API** - Simple REST endpoints
- **No smart contract deployment** - Use existing infrastructure
- **TypeScript support** - Fully typed interfaces
- **Well documented** - Clear examples and guides

## Cost Comparison

### Without X402 (Direct On-Chain)
```
User pays:
- Service fee: 1.00 USDC
- Gas fee: 0.50 USDC (Ethereum) or 0.01 USDC (L2)
Total: 1.50 USDC (Ethereum) or 1.01 USDC (L2)
```

### With X402 (Gasless)
```
User pays:
- Service fee: 1.00 USDC
- Gas fee: 0.00 USDC (paid by facilitator)
Total: 1.00 USDC
```

**Savings:** 50% on Ethereum, 1% on L2s

## Testing

### Test on Base Sepolia

```javascript
// 1. Get test USDC from faucet
// Visit: https://faucet.circle.com/ (select Base Sepolia)

// 2. Create test payment
const testPayment = await x402Client.createPaymentRequest({
    chain: 'baseSepolia',
    agentAddress: '0xYourTestAgentAddress',
    amount: '0.01', // 0.01 test USDC
    serviceId: 'test_payment_001',
    userWallet: signer
});

// 3. Settle payment
const result = await x402Client.settlePayment(testPayment);
console.log('Test payment result:', result);
```

### Verify on Block Explorer

```javascript
// After settlement, check transaction:
const explorerUrl = `https://sepolia.basescan.org/tx/${result.transactionHash}`;
console.log('View transaction:', explorerUrl);
```

## Troubleshooting

### Error: "Chain not supported"

**Solution:** Check if chain is in x402 supported list:

```javascript
const supported = await x402Client.getSupportedChains();
console.log('Supported:', Object.keys(supported.schemes));
```

### Error: "Insufficient USDC balance"

**Solution:** Ensure user has USDC on the selected chain:

```javascript
const usdcAddress = getChainConfig(chain).contracts.usdc;
const usdc = new ethers.Contract(usdcAddress, ['function balanceOf(address) view returns (uint256)'], provider);
const balance = await usdc.balanceOf(userAddress);
console.log('USDC balance:', ethers.formatUnits(balance, 6));
```

### Error: "Signature expired"

**Solution:** Increase validity window or regenerate signature:

```javascript
const paymentRequest = await x402Client.createPaymentRequest({
    // ...
    validityWindow: 7200 // 2 hours instead of 1
});
```

## Migration from Direct Contracts

### Before (Direct USDC Transfer)

```javascript
// Old way - user pays gas
const usdc = new ethers.Contract(usdcAddress, usdcAbi, signer);
await usdc.approve(agentAddress, amount);
await usdc.transfer(agentAddress, amount);
```

### After (X402 Gasless)

```javascript
// New way - facilitator pays gas
const paymentRequest = await x402Client.createPaymentRequest({
    chain: 'base',
    agentAddress,
    amount: '1.00',
    serviceId,
    userWallet: signer
});

await x402Client.settlePayment(paymentRequest);
```

## Resources

- **Facilitator:** https://facilitator.ultravioletadao.xyz/
- **LXDAO Co-Learning:** https://lxdao.notion.site/Trustless-Agents-CoLearning
- **Ultravioleta DAO:** https://ultravioletadao.xyz/
- **EIP-3009:** https://eips.ethereum.org/EIPS/eip-3009
- **EIP-712:** https://eips.ethereum.org/EIPS/eip-712

---

**Generated with ❤️ by Claude Code**
*Version 1.0 - November 2025*
