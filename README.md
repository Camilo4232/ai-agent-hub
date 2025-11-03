# 🤖 AI Agent Hub

Proyecto completo que integra los 3 protocolos principales para AI Agents en Web3 con **pagos reales on-chain**:

- **ERC-8004**: Registro de identidad descentralizado para agentes (NFTs)
- **A2A (Agent-to-Agent)**: Protocolo de comunicación entre agentes
- **X402**: Sistema de micropagos HTTP con USDC/ETH real

## ✨ Características

✅ **Pagos reales** con USDC en blockchain
✅ **Registro on-chain** de agentes como NFTs
✅ **Comunicación A2A** estandarizada
✅ **Sistema de reputación** con feedback
✅ **Withdrawal** de ganancias para agentes
✅ **Interfaz Web3** con MetaMask
✅ **Dual mode**: Demo (sin blockchain) o Producción (con blockchain)

## 📁 Estructura del Proyecto

```
ai-agent-hub/
├── contracts/              # Smart contracts
│   ├── AgentRegistryV2.sol    # ERC-8004 + Payments
│   ├── PaymentProcessor.sol   # X402 Payment handling
│   └── scripts/
│       └── deploy-all.js      # Deploy completo
├── backend/                # Servidor Node.js
│   ├── server.js              # API REST + A2A + X402
│   └── blockchain.js          # Integración Web3
├── agents/                 # Agentes de ejemplo
│   └── simple-agent.js
├── frontend/               # Interfaces web
│   ├── index.html             # Dashboard básico
│   └── web3-integration.html  # Interfaz Web3 completa
└── docs/
    ├── QUICKSTART.md          # Inicio rápido
    ├── BLOCKCHAIN_SETUP.md    # Setup blockchain
    └── ARCHITECTURE.md        # Arquitectura técnica
```

## 🚀 Quick Start

### Sin Blockchain (Demo Mode)

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor
npm start

# 3. Abrir frontend/index.html en el navegador
```

### Con Blockchain (Pagos Reales)

Ver guía completa en **[BLOCKCHAIN_SETUP.md](./BLOCKCHAIN_SETUP.md)**

Resumen rápido:
```bash
# 1. Configurar .env
cp .env.example .env
# Editar con RPC_URL, PRIVATE_KEY, etc.

# 2. Instalar dependencias
npm install
cd contracts && npm install && cd ..

# 3. Compilar y desplegar contratos
cd contracts
npx hardhat compile
npx hardhat run scripts/deploy-all.js --network sepolia

# 4. Actualizar .env con direcciones de contratos

# 5. Iniciar servidor
npm start

# 6. Abrir frontend/web3-integration.html
```

## 💡 Casos de Uso

### 1. Registrar Agente con Identidad NFT

**Web3 Interface:**
- Conecta MetaMask
- Completa formulario de registro
- Firma transacción
- Recibes NFT como identidad

**API:**
```bash
curl -X POST http://localhost:3000/agents/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Trading Bot",
    "description": "Agente de trading DeFi",
    "endpoint": "https://my-agent.com/a2a",
    "walletAddress": "0x...",
    "pricePerQuery": "0.005"
  }'
```

### 2. Crear Pago On-Chain

**Web3 Interface:**
- Ingresa dirección del agente
- Define monto en USDC
- Aprueba USDC → Crea pago
- Obtén Payment ID

**API:**
```bash
curl -X POST http://localhost:3000/payments/create \
  -H "Content-Type: application/json" \
  -d '{
    "agentAddress": "0x...",
    "amount": "0.001",
    "serviceId": "query_123",
    "currency": "USDC"
  }'
```

### 3. Consultar Agente con Pago

```bash
curl -X POST http://localhost:3000/agents/agent_123/query \
  -H "Content-Type: application/json" \
  -H "X-Payment-Id: pay_xyz..." \
  -d '{"query": "¿Cuál es el precio de ETH?"}'
```

### 4. Comunicación A2A

```bash
curl -X POST http://localhost:3000/a2a/message \
  -H "Content-Type: application/json" \
  -d '{
    "from": "agent_1",
    "to": "agent_2",
    "message": "Request market analysis",
    "task": "analyze_eth_price"
  }'
```

### 5. Retirar Ganancias

**Web3 Interface:**
- Verifica tus earnings
- Click "Retirar"
- Firma transacción
- USDC transferido a tu wallet

## 📚 Documentación

- **[QUICKSTART.md](./QUICKSTART.md)** - Inicio en 5 minutos
- **[BLOCKCHAIN_SETUP.md](./BLOCKCHAIN_SETUP.md)** - Setup completo blockchain
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Arquitectura técnica detallada

## 🔗 Endpoints de API

### Agentes
```
GET  /agents                      # Listar agentes
POST /agents/register             # Registrar agente
GET  /agents/:tokenId/info        # Info del agente (blockchain)
POST /agents/:id/query            # Consultar (requiere pago)
GET  /agents/:address/earnings    # Ver ganancias
POST /agents/withdraw             # Retirar ganancias
```

### Pagos (X402)
```
POST /payments/create             # Crear pago on-chain
POST /payments/verify             # Verificar pago
```

### A2A Communication
```
POST /a2a/message                 # Enviar mensaje entre agentes
```

### Utilidades
```
GET  /health                      # Health check + config
```

## 🛠️ Stack Tecnológico

**Smart Contracts:**
- Solidity 0.8.20
- Hardhat
- OpenZeppelin Contracts
- ERC-721 (NFTs)
- ERC-20 (USDC)

**Backend:**
- Node.js + Express
- Ethers.js v6
- In-memory storage (expandible a PostgreSQL)

**Frontend:**
- HTML5 + CSS3 + Vanilla JS
- Ethers.js (Web3)
- MetaMask integration

**Blockchain:**
- Ethereum Sepolia Testnet
- USDC (Circle)
- Infura/Alchemy RPC

## 💰 Modelo de Negocio

### Para Agentes:
- Establecen su propio precio por consulta
- Reciben pagos directos en USDC
- Retiran ganancias cuando quieran
- 2.5% platform fee

### Para Usuarios:
- Pagan solo por lo que usan
- Pagos instantáneos on-chain
- Sin suscripciones
- Transparencia total

### Para la Plataforma:
- 2.5% de cada transacción
- Configurable por el owner
- Máximo 10% (hardcoded)

## 🔐 Seguridad

### Implementado:
✅ ReentrancyGuard en todos los métodos críticos
✅ Verificación de ownership
✅ Validación de montos mínimos
✅ Platform fee con límite máximo
✅ Payment verification on-chain

### Advertencias:
⚠️ Proyecto educativo - NO AUDITED
⚠️ No usar en mainnet sin auditoría profesional
⚠️ Proteger claves privadas (.env nunca en Git)

## 🧪 Testing

```bash
cd contracts
npx hardhat test
```

## 📈 Roadmap

### v1.0 (Actual)
- [x] Smart contracts básicos
- [x] Pagos USDC on-chain
- [x] Registro de agentes (NFT)
- [x] API REST completa
- [x] Frontend Web3

### v1.1 (Próximo)
- [ ] Sistema de reputación avanzado
- [ ] Integración con OpenAI/Anthropic
- [ ] Base de datos PostgreSQL
- [ ] Tests unitarios completos

### v2.0 (Futuro)
- [ ] Multi-chain (Polygon, Arbitrum, Base)
- [ ] Marketplace de agentes
- [ ] DAO governance
- [ ] Validación zkML/TEE
- [ ] Mobile app

## 🤝 Contribuir

¡Contribuciones bienvenidas!

1. Fork el repo
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit: `git commit -m 'Add nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

## 📝 Licencia

MIT License - Ver [LICENSE](./LICENSE) para detalles

## 🆘 Soporte

**¿Problemas?**
1. Revisa [BLOCKCHAIN_SETUP.md](./BLOCKCHAIN_SETUP.md) troubleshooting
2. Abre un issue en GitHub
3. Consulta la documentación de cada protocolo

**Recursos útiles:**
- [EIP-8004](https://eips.ethereum.org/EIPS/eip-8004)
- [A2A Protocol](https://a2a-protocol.org/)
- [X402 Docs](https://www.x402.org/)
- [Sepolia Faucet](https://sepoliafaucet.com)
- [Circle USDC Faucet](https://faucet.circle.com)

## 🌟 Ejemplos de Agentes

### Trading Bot
```javascript
// Agente que ejecuta estrategias de trading
- Precio: 0.01 USDC por señal
- Endpoint: https://trading-bot.com/a2a
- Especialidad: DeFi, DEX arbitrage
```

### Data Analyst
```javascript
// Análisis on-chain de datos
- Precio: 0.005 USDC por análisis
- Endpoint: https://data-agent.com/a2a
- Especialidad: Análisis de transacciones, NFTs
```

### Content Moderator
```javascript
// Moderación de contenido con IA
- Precio: 0.001 USDC por validación
- Endpoint: https://moderator.com/a2a
- Especialidad: Text classification, sentiment
```

## 📊 Métricas del Proyecto

- **Contratos**: 2 (AgentRegistryV2, PaymentProcessor)
- **Líneas de código**: ~2,500
- **Gas optimizado**: ✅
- **Tests**: En desarrollo
- **Documentación**: Completa

---

**¿Listo para construir la economía de AI Agents? 🚀**

Empieza ahora con:
```bash
npm install && npm start
```

Luego abre `frontend/web3-integration.html` para experiencia completa Web3!
