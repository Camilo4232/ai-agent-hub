# 🏗️ Arquitectura del Sistema

## Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│                     (Dashboard HTML/JS)                          │
│                                                                  │
│  [Registrar Agente] [Listar] [A2A Test] [X402 Test]           │
└────────────────┬────────────────────────────────────────────────┘
                 │ HTTP/REST
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND SERVER                                │
│                   (Express.js/Node.js)                          │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   A2A        │  │    X402      │  │  Agent       │         │
│  │  Protocol    │  │  Payments    │  │  Registry    │         │
│  │              │  │              │  │              │         │
│  │ /a2a/message │  │ /payments/*  │  │ /agents/*    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
│  In-Memory Storage (puede ser DB en producción)                │
└────────┬────────────────────────────────────┬──────────────────┘
         │                                     │
         │ Blockchain Interaction             │ Agent Communication
         ▼                                     ▼
┌─────────────────────┐            ┌─────────────────────┐
│   BLOCKCHAIN        │            │   AI AGENTS         │
│   (Sepolia/Mainnet) │            │                     │
│                     │            │ ┌─────────────────┐ │
│ ┌─────────────────┐ │            │ │ Simple Agent    │ │
│ │ AgentRegistry   │ │            │ │                 │ │
│ │  (ERC-8004)     │ │            │ │ - Register      │ │
│ │                 │ │            │ │ - A2A Comm      │ │
│ │ - registerAgent │ │            │ │ - Query+Pay     │ │
│ │ - updateAgent   │ │            │ └─────────────────┘ │
│ │ - getAgentInfo  │ │            │                     │
│ │ - reputation    │ │            │ [Custom Agents...]  │
│ └─────────────────┘ │            └─────────────────────┘
└─────────────────────┘
```

## Flujo de Datos

### 1. Registro de Agente (ERC-8004)

```
Agent → Backend → Smart Contract → Blockchain
  │        │           │              │
  │        │           │              └─ Mint NFT (Token ID)
  │        │           └─ Store metadata URI
  │        └─ Store in local registry
  └─ Receive agent ID + NFT token
```

### 2. Comunicación A2A

```
Agent A → POST /a2a/message → Backend → Agent B
   │            │                │          │
   │            │                │          └─ Process message
   │            │                └─ Route message
   │            └─ Validate sender
   └─ Receive response
```

### 3. Pago X402

```
Client → Query Agent → Server → 402 Payment Required
   │                      │
   │                      └─ Return payment details
   │
   ├─ Create Payment → Blockchain
   │                      │
   │                      └─ Transaction hash
   │
   └─ Verify Payment → Server → Access granted
                         │
                         └─ Return query result
```

## Componentes Principales

### 1. Smart Contract (contracts/AgentRegistry.sol)

**Responsabilidades:**
- Gestionar identidades de agentes (ERC-721)
- Almacenar metadata (URI)
- Validar ownership
- Tracking de reputación (futuro)

**Funciones clave:**
```solidity
registerAgent(name, description, endpoint, metadataURI)
updateAgent(tokenId, newEndpoint, active)
getAgentInfo(tokenId)
getActiveAgents()
```

### 2. Backend Server (backend/server.js)

**Responsabilidades:**
- API REST para agentes
- Implementación A2A
- Gestión de pagos X402
- Validación de requests

**Endpoints:**
```javascript
GET  /health           // Health check
GET  /agents           // List agents
POST /agents/register  // Register agent
POST /agents/:id/query // Query agent (paid)
POST /a2a/message      // A2A communication
POST /payments/verify  // Verify payment
```

### 3. AI Agent (agents/simple-agent.js)

**Responsabilidades:**
- Auto-registro en el hub
- Comunicación con otros agentes (A2A)
- Manejo de pagos (X402)
- Ejecución de tareas

**Métodos:**
```javascript
register()               // Register identity
sendMessage(to, msg)     // A2A communication
queryAgent(id, query)    // Query with payment
listAgents()             // Discover agents
```

### 4. Frontend (frontend/index.html)

**Responsabilidades:**
- Interfaz visual
- Formularios de registro
- Visualización de agentes
- Testing de protocolos

## Protocolos Integrados

### ERC-8004 (Identity)
```
┌─────────────────────────────────┐
│  Agent Identity (NFT)           │
│                                 │
│  - Token ID: Unique identifier  │
│  - Metadata URI: IPFS/HTTP      │
│  - Owner: Wallet address        │
│  - Endpoint: A2A URL            │
│  - Active: Boolean              │
└─────────────────────────────────┘
```

### A2A Protocol (Communication)
```
{
  "from": "agent_123",
  "to": "agent_456",
  "message": "Request data",
  "task": "fetch_prices",
  "timestamp": "2025-01-15T10:00:00Z"
}
```

### X402 (Payment)
```
Request → 402 Payment Required
Response: {
  "amount": "0.001",
  "currency": "USDC",
  "recipient": "0x...",
  "instructions": "..."
}

Payment Verified → Access Granted
```

## Seguridad

### Capas de Seguridad

1. **Blockchain (ERC-8004)**
   - Identidades inmutables
   - Ownership verificable
   - Historial on-chain

2. **Payment Verification (X402)**
   - Validación de transacciones
   - Prevención de replay attacks
   - Rate limiting

3. **Agent Authentication (A2A)**
   - Firma de mensajes
   - Verificación de endpoints
   - Timeout handling

## Escalabilidad

### Actual (Demo)
- In-memory storage
- Single server
- Mock payments

### Producción

```
┌──────────────┐
│ Load Balancer│
└──────┬───────┘
       │
   ┌───┴────┐
   │        │
┌──▼──┐  ┌──▼──┐
│Node1│  │Node2│
└──┬──┘  └──┬──┘
   │        │
   └───┬────┘
       │
┌──────▼────────┐
│   Database    │
│  (PostgreSQL) │
└───────────────┘
```

**Mejoras:**
- Redis para caché
- PostgreSQL para persistencia
- Queue (RabbitMQ) para mensajes A2A
- Real blockchain verification
- CDN para frontend

## Extensiones Futuras

### Corto Plazo
- [ ] Base de datos real
- [ ] Verificación real de pagos on-chain
- [ ] Sistema de reputación
- [ ] Rate limiting

### Mediano Plazo
- [ ] Integración con OpenAI/Anthropic
- [ ] Multi-chain support (Polygon, Arbitrum)
- [ ] Advanced A2A routing
- [ ] Agent marketplace

### Largo Plazo
- [ ] DAO de agentes
- [ ] Validación zkML/TEE
- [ ] Cross-chain identity
- [ ] Monetización automática

## Stack Tecnológico

```
Frontend:    HTML5, CSS3, Vanilla JS
Backend:     Node.js, Express.js
Blockchain:  Solidity, Hardhat, Ethers.js
Protocols:   ERC-8004, A2A, X402
Storage:     In-memory → PostgreSQL
Testing:     Mocha, Chai (futuro)
Deploy:      Render, Railway, Vercel
```

## Flujo Completo de Ejemplo

```
1. Usuario crea agente
   └─ Frontend → POST /agents/register → Backend
      └─ Backend → Smart Contract → Mint NFT
         └─ Return agent ID + NFT token

2. Agente se comunica con otro
   └─ Agent A → POST /a2a/message → Backend
      └─ Backend → Route to Agent B
         └─ Agent B processes and responds

3. Usuario consulta agente
   └─ Client → POST /agents/:id/query → Backend
      └─ Backend → 402 Payment Required
         └─ Client → Verify Payment → Backend
            └─ Backend → Process query → AI Response
               └─ Return result to client
```

---

Esta arquitectura permite:
✅ Identidades descentralizadas (ERC-8004)
✅ Comunicación estandarizada (A2A)
✅ Monetización directa (X402)
✅ Escalabilidad horizontal
✅ Extensibilidad modular
