# 🔗 Configuración Blockchain - Pagos Reales

Esta guía te ayudará a desplegar los smart contracts y configurar pagos reales con USDC en Sepolia.

## 📋 Pre-requisitos

1. **MetaMask** instalado
2. **Sepolia ETH** para gas ([Faucet](https://sepoliafaucet.com))
3. **Sepolia USDC** para pagos ([Circle Faucet](https://faucet.circle.com))
4. **Node.js** v18+ instalado
5. **Cuenta en Infura** o Alchemy para RPC

## 🚀 Paso 1: Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env
```

Edita `.env`:

```bash
# 1. Obtén tu RPC URL de Infura/Alchemy
RPC_URL=https://sepolia.infura.io/v3/TU_API_KEY

# 2. Tu clave privada (sin 0x)
PRIVATE_KEY=tu_clave_privada_aqui

# 3. USDC en Sepolia
USDC_ADDRESS=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238

# 4. Tu dirección de wallet
PAYMENT_RECIPIENT=0xTU_WALLET_ADDRESS
```

⚠️ **IMPORTANTE**: Nunca subas tu `.env` a Git. Ya está en `.gitignore`.

## 📦 Paso 2: Instalar Dependencias

```bash
# Dependencias del proyecto
npm install

# Dependencias de contratos
cd contracts
npm install
cd ..
```

## 🔨 Paso 3: Compilar Contratos

```bash
cd contracts
npx hardhat compile
```

Deberías ver:
```
✓ Compiled 5 Solidity files successfully
```

## 🚢 Paso 4: Desplegar Contratos a Sepolia

```bash
cd contracts
npx hardhat run scripts/deploy-all.js --network sepolia
```

El script desplegará:
1. **PaymentProcessor** (gestiona pagos USDC/ETH)
2. **AgentRegistryV2** (registro de agentes)

Ejemplo de output:
```
🚀 Deploying AI Agent Hub Contracts...

1️⃣  Deploying PaymentProcessor...
✅ PaymentProcessor deployed to: 0xABC123...

2️⃣  Deploying AgentRegistryV2...
✅ AgentRegistryV2 deployed to: 0xDEF456...

=======================================================
🎉 DEPLOYMENT COMPLETE!
=======================================================

📋 Contract Addresses:
   PaymentProcessor: 0xABC123...
   AgentRegistryV2: 0xDEF456...
   USDC Token: 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
```

## ✏️ Paso 5: Actualizar .env con Direcciones

Copia las direcciones desplegadas a tu `.env`:

```bash
AGENT_REGISTRY_ADDRESS=0xDEF456...
PAYMENT_PROCESSOR_ADDRESS=0xABC123...
```

## ✅ Paso 6: Verificar Contratos (Opcional)

```bash
# Verificar PaymentProcessor
npx hardhat verify --network sepolia 0xABC123... 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238

# Verificar AgentRegistryV2
npx hardhat verify --network sepolia 0xDEF456... 0xABC123...
```

## 🎯 Paso 7: Iniciar el Servidor

```bash
npm start
```

Deberías ver:
```
✅ Blockchain integration enabled
✅ AgentRegistry connected: 0xDEF456...
✅ PaymentProcessor connected: 0xABC123...
✅ USDC Token connected: 0x1c7D4B...

🚀 AI Agent Hub running on http://localhost:3000
```

## 🌐 Paso 8: Usar la Interfaz Web3

Abre `frontend/web3-integration.html` en tu navegador.

### Funcionalidades Disponibles:

1. **Conectar MetaMask**
   - Click en "Conectar MetaMask"
   - Aprueba la conexión
   - Verás tu balance de USDC

2. **Registrar Agente**
   - Completa el formulario
   - Firma la transacción en MetaMask
   - Recibirás un NFT (Token ID)

3. **Crear Pago**
   - Ingresa dirección del agente
   - Define monto en USDC
   - Aprueba USDC + Crea pago
   - Recibirás un Payment ID

4. **Consultar Agente**
   - Usa el Payment ID recibido
   - Envía tu consulta
   - El agente responderá

5. **Retirar Ganancias**
   - Los agentes pueden retirar USDC ganado
   - Click en "Retirar"

## 💳 Obtener Sepolia USDC

### Opción 1: Circle Faucet
1. Ve a https://faucet.circle.com
2. Conecta tu wallet
3. Solicita USDC de prueba

### Opción 2: Uniswap Sepolia
1. Obtén ETH en Sepolia
2. Swap ETH → USDC en Uniswap

## 🧪 Probar el Sistema Completo

### 1. Registrar Agente (Terminal)

```bash
curl -X POST http://localhost:3000/agents/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "TestAgent",
    "description": "Mi primer agente",
    "endpoint": "http://localhost:3001",
    "walletAddress": "0xTU_WALLET",
    "pricePerQuery": "0.001"
  }'
```

### 2. Crear Pago On-Chain

Usa la interfaz Web3 o llama directamente al contrato desde Etherscan.

### 3. Verificar Pago

```bash
curl -X POST http://localhost:3000/payments/verify \
  -H "Content-Type: application/json" \
  -d '{"paymentId": "pay_123..."}'
```

### 4. Hacer Consulta

```bash
curl -X POST http://localhost:3000/agents/agent_123/query \
  -H "Content-Type: application/json" \
  -H "X-Payment-Id: pay_123..." \
  -d '{"query": "Hola agente!"}'
```

## 🔍 Verificar en Blockchain

### Ver transacciones:
https://sepolia.etherscan.io/address/0xTU_CONTRACT_ADDRESS

### Ver tu agente NFT:
https://sepolia.etherscan.io/token/0xAGENT_REGISTRY_ADDRESS?a=TOKEN_ID

### Ver pagos:
https://sepolia.etherscan.io/address/0xPAYMENT_PROCESSOR_ADDRESS

## 📊 Arquitectura de Pagos

```
Usuario
  │
  ├─> 1. Aprueba USDC al PaymentProcessor
  │
  ├─> 2. Llama createPaymentUSDC()
  │       │
  │       └─> Transfiere USDC al contrato
  │           Emite evento PaymentCreated
  │
  ├─> 3. Obtiene Payment ID
  │
  ├─> 4. Consulta agente con Payment ID
  │       │
  │       └─> Backend verifica pago on-chain
  │           Si válido, procesa consulta
  │           Llama settlePayment()
  │
  └─> 5. Agente puede retirar earnings
          └─> withdrawUSDC() transfiere fondos
```

## 💰 Fee Structure

- **Platform Fee**: 2.5% (configurable por el owner)
- **Minimum Payment**: 0.001 USDC
- **Gas Costs** (aproximados):
  - Register Agent: ~200,000 gas (~$2-5 en Sepolia)
  - Create Payment: ~150,000 gas
  - Settle Payment: ~100,000 gas
  - Withdraw: ~80,000 gas

## 🔒 Seguridad

### ✅ Implementado:
- ReentrancyGuard en todos los métodos sensibles
- Verificación de ownership
- Validación de montos mínimos
- Platform fee límite (max 10%)

### ⚠️ Advertencias:
- Esto es un proyecto educativo
- No audited
- No usar en mainnet sin auditoría profesional

## 🐛 Troubleshooting

### Error: "insufficient funds for gas"
- Necesitas más Sepolia ETH
- Faucet: https://sepoliafaucet.com

### Error: "USDC transfer failed"
- Aprueba USDC primero
- Verifica tu balance de USDC

### Error: "Payment not verified"
- Asegúrate que el Payment ID existe on-chain
- Verifica que no haya sido settled

### Backend no conecta a blockchain
- Verifica RPC_URL en .env
- Chequea PRIVATE_KEY
- Asegúrate que las direcciones de contratos sean correctas

## 📚 Recursos Útiles

- [Sepolia Faucet](https://sepoliafaucet.com)
- [Circle USDC Faucet](https://faucet.circle.com)
- [Sepolia Etherscan](https://sepolia.etherscan.io)
- [Hardhat Docs](https://hardhat.org/docs)
- [Ethers.js Docs](https://docs.ethers.org)

## 🎓 Próximos Pasos

1. **Integrar IA real** (OpenAI, Anthropic)
2. **Base de datos** para persistencia
3. **Sistema de reputación** avanzado
4. **Multi-chain** (Polygon, Arbitrum)
5. **Marketplace** completo de agentes

---

**¿Listo para crear tu red de AI Agents con pagos reales? 🚀**
