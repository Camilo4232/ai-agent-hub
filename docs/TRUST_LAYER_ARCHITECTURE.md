# Trust Layer Architecture: TEE, ZK Proofs & ZKTLS

> **Vision:** In an inevitable future where thousands of AI agents transact autonomously, trust cannot rely on reputation alone. Cryptographic verification at every layer is the only path to true decentralization.

---

## Executive Summary

This document outlines the architecture for implementing a **comprehensive cryptographic trust layer** for the AI Agent Hub, incorporating:

1. **TEE (Trusted Execution Environments)** - Verifiable agent integrity
2. **ZK Proofs (Zero-Knowledge Proofs)** - Private payment verification
3. **ZKTLS (Zero-Knowledge TLS)** - Secure agent-to-agent communication

Each layer solves a fundamental trust problem in the agent economy:

| Problem | Solution | Technology |
|---------|----------|------------|
| "How do I know this agent hasn't been compromised?" | Cryptographic attestation of agent code | TEE (Intel SGX / AWS Nitro) |
| "How do I prove I paid without revealing my identity?" | Zero-knowledge payment proofs | zk-SNARKs (Groth16 / PLONK) |
| "How do agents communicate securely while remaining verifiable?" | Zero-knowledge TLS proofs | ZKTLS (TLSNotary / zkTLS.xyz) |

---

## Part 1: TEE (Trusted Execution Environments)

### The Problem

In the current implementation:
- Agents run on standard servers
- Users have **no way to verify** the agent is running unmodified code
- A malicious operator could:
  - Steal user data
  - Front-run payments
  - Manipulate responses
  - Violate user privacy

**The Trust Gap:** Users must blindly trust agent operators.

### The Solution: TEE Attestation

A **Trusted Execution Environment (TEE)** is a secure area of a processor that guarantees:
1. Code integrity (agent runs unmodified code)
2. Data confidentiality (encrypted memory)
3. Remote attestation (cryptographic proof of #1 and #2)

#### How It Works

```
┌─────────────────────────────────────────────────────────────┐
│  USER BROWSER                                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. User requests agent's TEE attestation                   │
│     GET /agent/weather/attestation                          │
│                                                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
        ┌────────────────────────────────┐
        │  AGENT (Running in TEE)        │
        │  AWS Nitro Enclave / Intel SGX │
        └────────────────┬───────────────┘
                     │
                     ↓
            Generate attestation report:
            - Hash of agent code
            - TEE measurement (PCR values)
            - Timestamp
            - Signed by TEE private key
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│  USER BROWSER (verification)                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  2. Verify attestation signature                            │
│  3. Check code hash matches expected value                  │
│  4. Validate TEE certificate chain                          │
│  5. If valid → Trust agent                                  │
│     If invalid → REJECT agent                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Implementation Options

#### Option A: AWS Nitro Enclaves (Recommended for MVP)

**Pros:**
- Production-ready
- Integrated with AWS infrastructure
- No specialized hardware required
- Strong attestation guarantees

**Cons:**
- Vendor lock-in (AWS only)
- Additional cost (~$0.06/hour per enclave)

**Architecture:**
```
EC2 Instance (Parent)
  ├── Agent API Server (Express.js)
  └── Nitro Enclave (Isolated)
       ├── Payment Verifier
       ├── AI Model (Claude API calls)
       └── Private Keys
```

**Code Structure:**
```javascript
// agents/weather/tee/enclave-server.js
import { NitroEnclave } from 'aws-nitro-enclaves-sdk';

class WeatherAgentTEE {
    constructor() {
        this.enclave = new NitroEnclave();
    }

    async generateAttestation() {
        // Get attestation document from Nitro
        const attestation = await this.enclave.getAttestationDocument();

        return {
            attestation: attestation.toString('base64'),
            pcrs: attestation.pcrs, // Platform Configuration Registers
            timestamp: Date.now(),
            codeHash: await this.getCodeHash()
        };
    }

    async getCodeHash() {
        // Hash of the enclave image file (.eif)
        const fs = require('fs');
        const crypto = require('crypto');
        const eifFile = fs.readFileSync('./weather-agent.eif');
        return crypto.createHash('sha256').update(eifFile).digest('hex');
    }

    async processPaymentInEnclave(paymentId, query) {
        // All sensitive operations happen inside the enclave
        const verified = await this.verifyPayment(paymentId);
        if (!verified) throw new Error('Payment verification failed');

        const response = await this.generateResponse(query);
        return response;
    }
}
```

**Frontend Verification:**
```javascript
// frontend/tee-verifier.js
class TEEVerifier {
    constructor() {
        // Known good code hashes for each agent
        this.trustedHashes = {
            weather: '0x1234...', // SHA256 of weather agent EIF
            fashion: '0x5678...',
            activities: '0x9abc...'
        };
    }

    async verifyAgentAttestation(agentName, attestation) {
        // 1. Verify attestation signature
        const isValidSignature = await this.verifyNitroSignature(
            attestation.attestation,
            attestation.pcrs
        );

        if (!isValidSignature) {
            throw new Error('Invalid attestation signature');
        }

        // 2. Verify code hash
        const expectedHash = this.trustedHashes[agentName];
        if (attestation.codeHash !== expectedHash) {
            throw new Error(`Code hash mismatch! Expected: ${expectedHash}, Got: ${attestation.codeHash}`);
        }

        // 3. Verify attestation is recent (< 5 minutes old)
        const age = Date.now() - attestation.timestamp;
        if (age > 5 * 60 * 1000) {
            throw new Error('Attestation too old');
        }

        return {
            verified: true,
            message: `Agent ${agentName} is running in a verified TEE`
        };
    }
}
```

#### Option B: Intel SGX (For Maximum Security)

**Pros:**
- Hardware-level security
- Most mature TEE technology
- Works on any cloud provider

**Cons:**
- Requires SGX-capable hardware
- More complex development
- Side-channel vulnerabilities (Spectre/Meltdown variants)

**Use Case:** High-value agents handling sensitive data (medical, financial)

#### Option C: AMD SEV (Confidential Computing)

**Pros:**
- Encrypts entire VM memory
- Protects against cloud provider threats
- Supported by Azure, GCP

**Cons:**
- VM-level isolation (not process-level)
- Newer technology, less battle-tested

### Implementation Roadmap

**Phase 1: Attestation Infrastructure (2 weeks)**
1. Deploy agents in AWS Nitro Enclaves
2. Implement attestation endpoint
3. Create frontend verifier

**Phase 2: On-Chain Attestation Registry (1 week)**
4. Store attestation hashes on AgentRegistryV2 contract
5. Users can verify on-chain before payments

**Phase 3: Continuous Attestation (1 week)**
6. Agents re-attest every hour
7. Frontend monitors and alerts users if attestation changes

---

## Part 2: ZK Proofs (Zero-Knowledge Payment Verification)

### The Problem

Current implementation:
- All payments are **public on-chain**
- Anyone can see:
  - Who paid
  - How much
  - Which agent
  - Timestamp

**The Privacy Gap:** No payment privacy in a transparent agent economy.

### The Solution: ZK-SNARKs for Private Payments

**Zero-Knowledge Proof:** Prove a statement is true without revealing why it's true.

**Applied to payments:**
- **Statement:** "I paid agent X the required amount"
- **Proof:** A cryptographic proof that convinces verifier
- **Privacy:** Verifier learns nothing except the statement is true

#### How It Works

```
┌─────────────────────────────────────────────────────────────┐
│  USER BROWSER                                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. User creates payment on-chain (encrypted amount)        │
│     PaymentProcessor.createPrivatePayment(                  │
│         encryptedAmount,                                    │
│         agentAddress,                                       │
│         zkProofData                                         │
│     )                                                       │
│                                                             │
│  2. Generate ZK proof:                                      │
│     Prove: amount >= agent.pricePerQuery                    │
│     Without revealing: actual amount paid                   │
│                                                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓ (zkProof)
        ┌────────────────────────────────┐
        │  SMART CONTRACT                │
        │  PaymentProcessorZK.sol        │
        └────────────────┬───────────────┘
                     │
                     ↓
            Verify ZK proof on-chain:
            - Proof is valid?
            - Nullifier not used before?
            - Commitment matches?
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│  AGENT                                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  3. Agent verifies proof                                    │
│  4. If valid → Process query                                │
│  5. Return result                                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### ZK Circuit Design

Using **Circom** (most popular ZK circuit language):

```circom
// circuits/payment_verification.circom
pragma circom 2.0.0;

include "circomlib/comparators.circom";
include "circomlib/poseidon.circom";

template PaymentVerification() {
    // Private inputs (known only to user)
    signal input paymentAmount;      // Actual amount paid
    signal input paymentSecret;      // Random secret (for privacy)
    signal input payerAddress;       // User's address

    // Public inputs (visible to everyone)
    signal input minAmount;          // Agent's price
    signal input agentAddress;       // Agent receiving payment
    signal input paymentCommitment;  // Hash of payment details

    // Outputs
    signal output nullifier;         // Prevents double-spending
    signal output isValid;           // 1 if valid, 0 if invalid

    // Constraint 1: Amount >= minAmount
    component amountCheck = GreaterEqThan(64);
    amountCheck.in[0] <== paymentAmount;
    amountCheck.in[1] <== minAmount;
    isValid <== amountCheck.out;

    // Constraint 2: Commitment matches
    component commitmentHash = Poseidon(3);
    commitmentHash.inputs[0] <== paymentAmount;
    commitmentHash.inputs[1] <== paymentSecret;
    commitmentHash.inputs[2] <== payerAddress;
    paymentCommitment === commitmentHash.out;

    // Constraint 3: Generate nullifier (prevent reuse)
    component nullifierHash = Poseidon(2);
    nullifierHash.inputs[0] <== paymentSecret;
    nullifierHash.inputs[1] <== agentAddress;
    nullifier <== nullifierHash.out;
}

component main {public [minAmount, agentAddress, paymentCommitment]} = PaymentVerification();
```

### Smart Contract Integration

```solidity
// contracts/src/PaymentProcessorZK.sol
pragma solidity ^0.8.20;

import "./verifiers/PaymentVerifier.sol"; // Auto-generated from Circom

contract PaymentProcessorZK {
    PaymentVerifier public verifier;

    // Track used nullifiers (prevent double-spending)
    mapping(uint256 => bool) public usedNullifiers;

    // Payment commitments
    mapping(uint256 => bool) public validCommitments;

    struct ZKPayment {
        uint256 commitment;
        uint256 nullifier;
        address agent;
        uint256 timestamp;
        bool verified;
    }

    mapping(string => ZKPayment) public zkPayments;

    event ZKPaymentCreated(
        string indexed paymentId,
        uint256 commitment,
        uint256 nullifier,
        address indexed agent
    );

    function createZKPayment(
        string memory paymentId,
        address agent,
        uint256 commitment,
        uint256 nullifier,
        uint256[2] memory a,      // ZK proof components
        uint256[2][2] memory b,   // (generated by snarkjs)
        uint256[2] memory c,
        uint256[4] memory input   // Public inputs
    ) external {
        // Check nullifier not used
        require(!usedNullifiers[nullifier], "Payment already used");

        // Verify ZK proof
        bool isValid = verifier.verifyProof(a, b, c, input);
        require(isValid, "Invalid ZK proof");

        // Mark nullifier as used
        usedNullifiers[nullifier] = true;
        validCommitments[commitment] = true;

        // Store payment
        zkPayments[paymentId] = ZKPayment({
            commitment: commitment,
            nullifier: nullifier,
            agent: agent,
            timestamp: block.timestamp,
            verified: true
        });

        emit ZKPaymentCreated(paymentId, commitment, nullifier, agent);
    }

    function verifyZKPayment(string memory paymentId)
        external
        view
        returns (bool)
    {
        return zkPayments[paymentId].verified;
    }
}
```

### Frontend ZK Proof Generation

```javascript
// frontend/zk-payment.js
import { groth16 } from 'snarkjs';

class ZKPaymentProver {
    constructor() {
        // Load proving key and WASM circuit
        this.wasmFile = '/circuits/payment_verification.wasm';
        this.zkeyFile = '/circuits/payment_verification_final.zkey';
    }

    async createZKPayment(agentAddress, actualAmount, minAmount) {
        // 1. Generate random secret for privacy
        const paymentSecret = this.generateRandomSecret();
        const payerAddress = userAddress; // From wallet

        // 2. Calculate commitment
        const commitment = await this.poseidonHash([
            actualAmount,
            paymentSecret,
            payerAddress
        ]);

        // 3. Prepare circuit inputs
        const inputs = {
            paymentAmount: actualAmount,
            paymentSecret: paymentSecret,
            payerAddress: payerAddress,
            minAmount: minAmount,
            agentAddress: agentAddress,
            paymentCommitment: commitment
        };

        // 4. Generate ZK proof (takes ~5 seconds in browser)
        console.log('⏳ Generating ZK proof...');
        const { proof, publicSignals } = await groth16.fullProve(
            inputs,
            this.wasmFile,
            this.zkeyFile
        );

        console.log('✅ ZK proof generated!');

        // 5. Format for smart contract
        const calldata = await groth16.exportSolidityCallData(
            proof,
            publicSignals
        );

        return {
            commitment,
            nullifier: publicSignals[0],
            proof: calldata,
            paymentSecret // Save for later if user needs to prove payment
        };
    }

    async poseidonHash(inputs) {
        // Use Poseidon hash (ZK-friendly hash function)
        const poseidon = await buildPoseidon();
        const hash = poseidon(inputs);
        return poseidon.F.toString(hash);
    }

    generateRandomSecret() {
        // Generate cryptographically secure random number
        const array = new Uint32Array(8);
        crypto.getRandomValues(array);
        return BigInt('0x' + Array.from(array, x => x.toString(16).padStart(8, '0')).join(''));
    }
}
```

### User Flow with ZK Payments

```
1. User clicks "Pay with Privacy" (new button)
   ↓
2. Frontend generates ZK proof (~5 seconds)
   ↓
3. User signs transaction with proof data
   ↓
4. Smart contract verifies proof on-chain
   ↓
5. If valid: Payment created privately
   ↓
6. Agent verifies payment via nullifier
   ↓
7. Agent processes query
   ↓
8. User receives response

Observer sees on-chain:
- ✅ A payment was made
- ❌ NOT how much was paid
- ❌ NOT exact payer identity (commitment instead)
- ❌ NOT payment history linkage
```

### Implementation Roadmap

**Phase 1: Circuit Development (1 week)**
1. Write Circom circuit
2. Generate proving/verification keys
3. Test locally

**Phase 2: Smart Contract (1 week)**
4. Deploy PaymentProcessorZK
5. Integrate with AgentRegistry
6. Test on Sepolia

**Phase 3: Frontend Integration (1 week)**
7. Add ZK proof generation
8. Update UI with privacy toggle
9. Test end-to-end flow

---

## Part 3: ZKTLS (Zero-Knowledge TLS)

### The Problem

Current A2A (Agent-to-Agent) communication:
- Plain HTTP requests
- No encryption between agents
- No proof of communication authenticity
- Vulnerable to MITM attacks

**Example scenario:**
```
Activities Agent needs weather data
  → Calls Weather Agent via HTTP
  → Weather Agent responds
  → ❌ No proof this response came from real Weather Agent
  → ❌ Activities Agent could be tricked
```

### The Solution: ZKTLS

**ZKTLS** = Zero-Knowledge Transport Layer Security

**Key Innovation:** Prove you had a TLS conversation with a server, without revealing:
- The content of the conversation
- Your private keys
- Exact timestamps

#### How It Works

```
┌─────────────────────────────────────────────────────────────┐
│  ACTIVITIES AGENT                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Establish ZKTLS connection to Weather Agent             │
│     - Normal TLS handshake                                  │
│     - Generate transcript of communication                  │
│                                                             │
│  2. Request weather data                                    │
│     POST /query { city: "Tokyo" }                           │
│                                                             │
└────────────────────┬────────────────────────────────────────┘
                     │ (TLS encrypted)
                     ↓
        ┌────────────────────────────────┐
        │  WEATHER AGENT                 │
        │  (with ZKTLS prover)           │
        └────────────────┬───────────────┘
                     │
                     ↓
            Process request
            Return: { temp: 22, condition: "Sunny" }
                     │
                     ↓ (TLS encrypted + transcript)
┌─────────────────────────────────────────────────────────────┐
│  ACTIVITIES AGENT (continued)                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  3. Receive response + TLS transcript                       │
│                                                             │
│  4. Generate ZK proof of communication:                     │
│     - Prove: "I communicated with Weather Agent over TLS"  │
│     - Prove: "Response signature is valid"                  │
│     - Without revealing: Exact message contents             │
│                                                             │
│  5. Store proof on-chain (optional)                         │
│     AgentRegistry.recordA2ACommunication(proof)             │
│                                                             │
│  6. Use weather data in response to user                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Implementation with TLSNotary

**TLSNotary** is the leading ZKTLS implementation (used by zkTLS.xyz)

```javascript
// agents/shared/zktls-client.js
import { TLSNotary } from 'tlsnotary-js';

class ZKTLSAgent {
    constructor(agentName) {
        this.agentName = agentName;
        this.notary = new TLSNotary({
            verifierUrl: 'https://notary.pse.dev'
        });
    }

    async queryAgentWithProof(targetAgentUrl, query) {
        console.log(`🔐 [ZKTLS] ${this.agentName} → ${targetAgentUrl}`);

        // 1. Establish TLSNotary session
        const session = await this.notary.createSession({
            targetUrl: targetAgentUrl,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query })
        });

        // 2. Execute request (TLSNotary acts as middleman)
        const response = await session.execute();

        // 3. Generate ZK proof of communication
        const proof = await session.generateProof({
            // Select what to reveal in proof
            revealHeaders: ['Content-Type'], // Reveal header
            redactBody: true,                // Hide actual response
            commitToResponse: true           // Commit to response hash
        });

        // 4. Verify proof locally
        const isValid = await this.notary.verifyProof(proof);

        if (!isValid) {
            throw new Error('ZKTLS proof verification failed!');
        }

        console.log('✅ [ZKTLS] Proof verified!');

        return {
            data: response.body,
            proof: proof,
            verified: true,
            attestation: {
                prover: this.agentName,
                target: targetAgentUrl,
                timestamp: Date.now(),
                responseHash: await this.hashResponse(response.body)
            }
        };
    }

    async hashResponse(data) {
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(JSON.stringify(data));
        const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
}

export { ZKTLSAgent };
```

### Updated Activities Agent with ZKTLS

```javascript
// agents/activities/activities-agent.js
import { ZKTLSAgent } from '../shared/zktls-client.js';

class ActivitiesAgent {
    constructor() {
        this.zkAgent = new ZKTLSAgent('Activities Agent');
    }

    async processQuery(city) {
        // Query Weather Agent with ZKTLS proof
        const weatherResult = await this.zkAgent.queryAgentWithProof(
            'https://weather-agent.agent-hub.xyz/query',
            { city }
        );

        // Now we have:
        // 1. Weather data
        // 2. Cryptographic proof we got it from real Weather Agent
        // 3. Proof is verifiable by anyone

        const activities = this.generateActivities(
            city,
            weatherResult.data
        );

        return {
            activities,
            weatherData: weatherResult.data,
            zktlsProof: weatherResult.proof,
            attestation: weatherResult.attestation
        };
    }
}
```

### On-Chain A2A Communication Registry

```solidity
// contracts/src/A2ACommunicationRegistry.sol
pragma solidity ^0.8.20;

contract A2ACommunicationRegistry {
    struct A2AProof {
        address callerAgent;
        address targetAgent;
        bytes32 responseHash;
        bytes zktlsProof;
        uint256 timestamp;
        bool verified;
    }

    mapping(bytes32 => A2AProof) public a2aProofs;

    event A2ACommunicationRecorded(
        bytes32 indexed proofId,
        address indexed caller,
        address indexed target,
        bytes32 responseHash
    );

    function recordA2ACommunication(
        address targetAgent,
        bytes32 responseHash,
        bytes memory zktlsProof
    ) external returns (bytes32) {
        bytes32 proofId = keccak256(abi.encodePacked(
            msg.sender,
            targetAgent,
            responseHash,
            block.timestamp
        ));

        a2aProofs[proofId] = A2AProof({
            callerAgent: msg.sender,
            targetAgent: targetAgent,
            responseHash: responseHash,
            zktlsProof: zktlsProof,
            timestamp: block.timestamp,
            verified: true
        });

        emit A2ACommunicationRecorded(
            proofId,
            msg.sender,
            targetAgent,
            responseHash
        );

        return proofId;
    }

    function verifyA2ACommunication(bytes32 proofId)
        external
        view
        returns (bool)
    {
        return a2aProofs[proofId].verified;
    }
}
```

### Implementation Roadmap

**Phase 1: TLSNotary Integration (2 weeks)**
1. Set up TLSNotary infrastructure
2. Update agent communication libraries
3. Test A2A communication with proofs

**Phase 2: On-Chain Registry (1 week)**
4. Deploy A2ACommunicationRegistry
5. Integrate with AgentRegistry
6. Test proof storage and verification

**Phase 3: Frontend Visualization (1 week)**
7. Show ZKTLS proofs in UI
8. Allow users to verify A2A communications
9. Create trust score based on proof history

---

## Complete Trust Layer Integration

### Final Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           USER BROWSER                              │
│                                                                     │
│  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────────┐  │
│  │ TEE Verifier     │  │ ZK Proof Gen     │  │ ZKTLS Verifier  │  │
│  │ (Check agents)   │  │ (Private payment)│  │ (A2A comms)     │  │
│  └──────────────────┘  └──────────────────┘  └─────────────────┘  │
│                                                                     │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ↓
        ┌───────────────────────────────────────────────┐
        │        BLOCKCHAIN (Multi-Chain)               │
        │                                               │
        │  ┌──────────────────────────────────────┐    │
        │  │ PaymentProcessorZK (ZK payments)     │    │
        │  │ AgentRegistryV2 (TEE attestations)   │    │
        │  │ A2ACommunicationRegistry (ZKTLS)     │    │
        │  └──────────────────────────────────────┘    │
        │                                               │
        └───────────────────┬───────────────────────────┘
                            │
                            ↓
        ┌───────────────────────────────────────────────┐
        │        AGENT NETWORK                          │
        │                                               │
        │  ┌─────────────────┐  ┌─────────────────┐    │
        │  │ Weather Agent   │←→│ Fashion Agent   │    │
        │  │ (TEE + ZKTLS)   │  │ (TEE + ZKTLS)   │    │
        │  └─────────────────┘  └─────────────────┘    │
        │           ↕ ZKTLS                             │
        │  ┌─────────────────┐                         │
        │  │ Activities Agent│                         │
        │  │ (TEE + ZKTLS)   │                         │
        │  └─────────────────┘                         │
        │                                               │
        └───────────────────────────────────────────────┘

Every interaction is cryptographically verifiable:
✅ Agent code integrity (TEE)
✅ Payment privacy (ZK)
✅ Communication authenticity (ZKTLS)
```

### Trust Score System

```javascript
// frontend/trust-score.js
class AgentTrustScore {
    async calculateTrustScore(agentAddress) {
        const scores = {
            teeAttestation: 0,    // 0-40 points
            paymentHistory: 0,     // 0-30 points
            a2aVerification: 0,    // 0-30 points
        };

        // 1. Check TEE attestation
        const attestation = await this.getAgentAttestation(agentAddress);
        if (attestation && attestation.verified && attestation.age < 3600) {
            scores.teeAttestation = 40; // Full points
        } else if (attestation && attestation.verified) {
            scores.teeAttestation = 20; // Partial (old attestation)
        }

        // 2. Check payment history
        const payments = await this.getPaymentHistory(agentAddress);
        const successRate = payments.successful / payments.total;
        scores.paymentHistory = successRate * 30;

        // 3. Check A2A communications
        const a2aComms = await this.getA2ACommunications(agentAddress);
        const verifiedComms = a2aComms.filter(c => c.zktlsProof).length;
        scores.a2aVerification = Math.min(30, (verifiedComms / 10) * 30);

        const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

        return {
            totalScore,
            breakdown: scores,
            grade: this.getGrade(totalScore)
        };
    }

    getGrade(score) {
        if (score >= 90) return 'A+ (Highly Trusted)';
        if (score >= 75) return 'A (Trusted)';
        if (score >= 60) return 'B (Moderately Trusted)';
        if (score >= 40) return 'C (Low Trust)';
        return 'D (Not Trusted)';
    }
}
```

---

## Cost Analysis

### TEE (AWS Nitro)
- **Setup Cost:** $0 (free tier available)
- **Runtime Cost:** ~$0.06/hour per enclave
- **Monthly Cost:** ~$43/month per agent (24/7)

### ZK Proofs
- **Setup Cost:** ~$500 (trusted setup ceremony)
- **Proof Generation:** Free (done in browser)
- **On-Chain Verification:** ~0.0005 ETH per verification (~$1.50 on L2)

### ZKTLS
- **Setup Cost:** $0 (open source)
- **Runtime Cost:** ~$0.001 per A2A communication
- **Monthly Cost:** ~$30/month (10k A2A calls)

**Total Monthly Cost per Agent:** ~$75/month

**Revenue Required to Break Even:** ~250 queries/month at $0.30/query

---

## Security Considerations

### TEE Risks
1. **Side-channel attacks** (Spectre/Meltdown variants)
   - Mitigation: Use latest Intel/AMD microcode
   - Mitigation: Implement constant-time algorithms

2. **Supply chain attacks** (compromised hardware)
   - Mitigation: Verify attestation chains
   - Mitigation: Use multiple TEE providers

### ZK Proof Risks
1. **Trusted setup compromise** (if using Groth16)
   - Mitigation: Use PLONK (no trusted setup) or
   - Mitigation: Large MPC ceremony (>100 participants)

2. **Circuit bugs** (incorrect constraints)
   - Mitigation: Formal verification of circuits
   - Mitigation: Multiple audits

### ZKTLS Risks
1. **TLS downgrade attacks**
   - Mitigation: Enforce TLS 1.3+
   - Mitigation: Certificate pinning

2. **Notary compromise**
   - Mitigation: Use multiple notaries
   - Mitigation: Implement notary rotation

---

## Conclusion

This trust layer architecture transforms the AI Agent Hub from a **demo project** into a **production-grade trustless agent economy**.

**Key Achievements:**
1. **Verifiable agents** - Users know agents aren't compromised
2. **Private payments** - Financial privacy without sacrificing security
3. **Authenticated A2A** - Agents communicate securely and provably

**Competitive Advantages:**
- No other agent payment system has this level of cryptographic verification
- Strong foundation for enterprise adoption
- Opens path to regulated markets (finance, healthcare)

**Next Steps:**
1. Implement TEE attestation (highest ROI)
2. Deploy ZK payment circuits (best UX improvement)
3. Roll out ZKTLS for A2A (differentiator)

---

*"The best way to predict the future is to invent it."* - Alan Kay

We're not just building an agent payment system. We're building the **cryptographic infrastructure for the inevitable agent economy**.

---

## Appendix: Resources

### TEE
- [AWS Nitro Enclaves Docs](https://docs.aws.amazon.com/enclaves/)
- [Intel SGX Developer Guide](https://www.intel.com/content/www/us/en/developer/tools/software-guard-extensions/overview.html)

### ZK Proofs
- [Circom Documentation](https://docs.circom.io/)
- [snarkjs GitHub](https://github.com/iden3/snarkjs)
- [ZK Security Audits](https://github.com/trailofbits/publications/tree/master/reviews)

### ZKTLS
- [TLSNotary Documentation](https://docs.tlsnotary.org/)
- [zkTLS.xyz](https://zktls.xyz/)
- [ZKTLS Paper](https://eprint.iacr.org/2011/219.pdf)

### General
- [Awesome Zero Knowledge](https://github.com/matter-labs/awesome-zero-knowledge-proofs)
- [Trusted Computing Resources](https://confidentialcomputing.io/)
