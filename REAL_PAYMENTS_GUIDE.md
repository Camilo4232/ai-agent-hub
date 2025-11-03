# 💰 Guía de Pagos Reales con USDC

## 🎉 ¡Los Contratos Ya Están Desplegados!

Tu sistema está listo para hacer **pagos reales en Sepolia testnet**.

### 📍 Contratos Desplegados:

| Contrato | Dirección | Sepolia Etherscan |
|----------|-----------|-------------------|
| **PaymentProcessor** | `0x231eA77d88603F40C48Ad98f085F5646523bCe74` | [Ver contrato](https://sepolia.etherscan.io/address/0x231eA77d88603F40C48Ad98f085F5646523bCe74) |
| **AgentRegistryV2** | `0x22265732666ea19B72627593Ff515f5a37b0dc77` | [Ver contrato](https://sepolia.etherscan.io/address/0x22265732666ea19B72627593Ff515f5a37b0dc77) |
| **USDC (Sepolia)** | `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238` | [Ver contrato](https://sepolia.etherscan.io/address/0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238) |

---

## 🚀 Cómo Funciona el Sistema

### Flujo Completo de Pago:

```
1. Usuario quiere consultar un agente
   ↓
2. Frontend calcula el costo (0.001-0.008 USDC)
   ↓
3. Usuario aprueba USDC para PaymentProcessor
   ↓
4. Sistema crea pago on-chain
   ↓
5. PaymentProcessor transfiere USDC del usuario al agente
   ↓
6. Genera paymentId único
   ↓
7. Frontend consulta al agente con paymentId
   ↓
8. Agente verifica pago on-chain
   ↓
9. Agente responde al usuario
```

---

## 💳 Configuración Inicial

### 1. Obtener ETH de Prueba (para gas)

Tu wallet: `0xda77B09a90Dcb4E1b10CDEaeCaEfa343BA491bc0`

**Faucets de Sepolia ETH:**
- https://sepoliafaucet.com/
- https://faucet.quicknode.com/ethereum/sepolia
- https://www.alchemy.com/faucets/ethereum-sepolia

**Cantidad recomendada:** 0.1 ETH (suficiente para ~100 transacciones)

### 2. Obtener USDC de Prueba

**Opciones:**

**Opción A: Circle Faucet (Oficial)**
1. Ve a: https://faucet.circle.com/
2. Selecciona "Sepolia"
3. Pega tu wallet: `0xda77B09a90Dcb4E1b10CDEaeCaEfa343BA491bc0`
4. Recibirás 10 USDC de prueba

**Opción B: Aave Faucet**
1. Ve a: https://staging.aave.com/faucet/
2. Conecta MetaMask
3. Selecciona Sepolia
4. Request USDC

**Opción C: Deploy tu propio Mock USDC (Avanzado)**
```bash
cd contracts
npx hardhat run scripts/deploy-mock-usdc.js --network sepolia
```

---

## 🔄 Usando el Sistema con Pagos Reales

### Método 1: Vía Backend API (Más Fácil)

El backend ya está configurado con tu private key y puede hacer pagos automáticamente.

**1. Crear un Pago:**
```bash
curl -X POST http://localhost:3000/payments/create \
  -H "Content-Type: application/json" \
  -d '{
    "agentAddress": "0x1111111111111111111111111111111111111111",
    "amount": "0.001",
    "serviceId": "query_weather_tokyo",
    "currency": "USDC"
  }'
```

**Respuesta:**
```json
{
  "success": true,
  "paymentId": "pay_abc123",
  "txHash": "0x...",
  "amount": "0.001",
  "currency": "USDC",
  "agent": "0x1111..."
}
```

**2. Consultar Agente con Pago:**
```bash
curl -X POST http://localhost:3001/query \
  -H "Content-Type: application/json" \
  -H "X-Payment-Id: pay_abc123" \
  -d '{"query": "clima en tokyo"}'
```

---

### Método 2: Vía Frontend con MetaMask (Usuario Firma)

Para que el usuario pague directamente con su wallet:

#### Paso 1: Conectar MetaMask
```javascript
// En el frontend
const provider = new ethers.providers.Web3Provider(window.ethereum);
await provider.send("eth_requestAccounts", []);
const signer = provider.getSigner();
const userAddress = await signer.getAddress();
```

#### Paso 2: Aprobar USDC
```javascript
const usdcAddress = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
const paymentProcessorAddress = "0x231eA77d88603F40C48Ad98f085F5646523bCe74";

const usdcContract = new ethers.Contract(
    usdcAddress,
    ["function approve(address spender, uint256 amount) returns (bool)"],
    signer
);

// Aprobar 1 USDC (suficiente para muchos queries)
const tx = await usdcContract.approve(
    paymentProcessorAddress,
    ethers.utils.parseUnits("1", 6) // USDC tiene 6 decimales
);

await tx.wait();
console.log("USDC aprobado para pagos");
```

#### Paso 3: Crear Pago
```javascript
const paymentId = "pay_" + Date.now();
const agentAddress = "0x1111111111111111111111111111111111111111"; // Weather Agent
const amount = ethers.utils.parseUnits("0.001", 6);
const serviceId = "weather_query_tokyo";

const paymentProcessor = new ethers.Contract(
    paymentProcessorAddress,
    [
        "function createPaymentUSDC(string paymentId, address agent, uint256 amount, string serviceId)"
    ],
    signer
);

const tx = await paymentProcessor.createPaymentUSDC(
    paymentId,
    agentAddress,
    amount,
    serviceId
);

await tx.wait();
console.log("Pago creado:", paymentId);
```

#### Paso 4: Consultar Agente
```javascript
const response = await fetch('http://localhost:3001/query', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-Payment-Id': paymentId
    },
    body: JSON.stringify({
        query: "clima en tokyo"
    })
});

const data = await response.json();
console.log("Respuesta del agente:", data.answer);
```

---

## 🔍 Verificar Pagos

### Opción 1: En el Backend
```bash
curl http://localhost:3000/payments/verify \
  -H "Content-Type: application/json" \
  -d '{"paymentId": "pay_abc123"}'
```

### Opción 2: Directamente en el Contrato
```javascript
const paymentProcessor = new ethers.Contract(
    "0x231eA77d88603F40C48Ad98f085F5646523bCe74",
    ["function verifyPayment(string paymentId) view returns (bool)"],
    provider
);

const isValid = await paymentProcessor.verifyPayment("pay_abc123");
console.log("Pago válido:", isValid);
```

### Opción 3: En Etherscan
1. Ve a: https://sepolia.etherscan.io/address/0x231eA77d88603F40C48Ad98f085F5646523bCe74
2. Haz clic en "Contract" → "Read Contract"
3. Busca la función `verifyPayment`
4. Ingresa el paymentId
5. Verás `true` si el pago es válido

---

## 💰 Retirar Ganancias (Agentes)

Los agentes pueden retirar sus ganancias acumuladas:

### Vía Backend:
```bash
curl -X POST http://localhost:3000/agents/withdraw \
  -H "Content-Type: application/json" \
  -d '{"currency": "USDC"}'
```

### Directamente en el Contrato:
```javascript
const paymentProcessor = new ethers.Contract(
    "0x231eA77d88603F40C48Ad98f085F5646523bCe74",
    ["function withdrawUSDC()"],
    signer
);

const tx = await paymentProcessor.withdrawUSDC();
await tx.wait();
console.log("Ganancias retiradas");
```

### Ver Ganancias Acumuladas:
```javascript
const earnings = await paymentProcessor.agentEarnings(agentAddress);
const usdcAmount = ethers.utils.formatUnits(earnings, 6);
console.log(`Ganancias: ${usdcAmount} USDC`);
```

---

## 📊 Costos de los Agentes

| Agente | Precio Directo | Dependencias | Total |
|--------|---------------|--------------|-------|
| Weather Agent | 0.001 USDC | - | **0.001 USDC** |
| Fashion Agent | 0.002 USDC | Weather: 0.001 | **0.003 USDC** |
| Activities Agent | 0.005 USDC | Weather: 0.001<br>Fashion: 0.002 | **0.008 USDC** |

**Nota:** Cuando consultas Activities Agent, automáticamente se crean 3 pagos:
1. Pago a Activities Agent: 0.005 USDC
2. Pago a Weather Agent: 0.001 USDC (vía A2A)
3. Pago a Fashion Agent: 0.002 USDC (vía A2A)

---

## 🔐 Seguridad

### En Desarrollo (Actual):
✅ Private key en `.env` (protegida por `.gitignore`)
✅ Solo para Sepolia testnet (sin valor real)
✅ USDC de prueba sin valor monetario

### En Producción (Recomendado):
1. **Usar variables de entorno del servidor:**
   ```
   Heroku: heroku config:set PRIVATE_KEY=0x...
   AWS: AWS Secrets Manager
   Vercel: Environment Variables
   ```

2. **Nunca hardcodear keys en el código**

3. **Usar wallets separadas:**
   - Wallet para deployment (con poco ETH)
   - Wallet para operaciones (la principal)
   - Wallet para ganancias (cold storage)

4. **Rotar keys periódicamente**

5. **Monitoreo de transacciones:**
   - Alertas para transacciones sospechosas
   - Límites de gasto diarios
   - Multi-signature para retiros grandes

---

## 🧪 Pruebas Recomendadas

### 1. Prueba de Pago Individual:
```bash
# Weather Agent (más barato)
curl -X POST http://localhost:3000/payments/create \
  -d '{"agentAddress":"0x1111111111111111111111111111111111111111","amount":"0.001","serviceId":"test1","currency":"USDC"}'
```

### 2. Prueba de Verificación:
```bash
curl -X POST http://localhost:3000/payments/verify \
  -d '{"paymentId":"pay_abc123"}'
```

### 3. Prueba de Query Completo:
```bash
# Crear pago
PAYMENT_ID=$(curl -s -X POST http://localhost:3000/payments/create \
  -H "Content-Type: application/json" \
  -d '{"agentAddress":"0x1111...","amount":"0.001","serviceId":"test1","currency":"USDC"}' \
  | jq -r '.paymentId')

# Consultar agente
curl -X POST http://localhost:3001/query \
  -H "X-Payment-Id: $PAYMENT_ID" \
  -d '{"query":"clima en tokyo"}'
```

### 4. Prueba de Retiro:
```bash
curl -X POST http://localhost:3000/agents/withdraw \
  -d '{"currency":"USDC"}'
```

---

## 📈 Monitoreo

### Ver Transacciones en Etherscan:

**Tu Wallet:**
https://sepolia.etherscan.io/address/0xda77B09a90Dcb4E1b10CDEaeCaEfa343BA491bc0

**PaymentProcessor:**
https://sepolia.etherscan.io/address/0x231eA77d88603F40C48Ad98f085F5646523bCe74

**AgentRegistry:**
https://sepolia.etherscan.io/address/0x22265732666ea19B72627593Ff515f5a37b0dc77

### Verificar Balance USDC:
```javascript
const balance = await usdcContract.balanceOf(address);
console.log(`Balance: ${ethers.utils.formatUnits(balance, 6)} USDC`);
```

---

## 🐛 Troubleshooting

### Error: "Insufficient USDC balance"
**Solución:** Obtén USDC de prueba de los faucets mencionados arriba.

### Error: "Insufficient ETH for gas"
**Solución:** Obtén Sepolia ETH de los faucets.

### Error: "ERC20: insufficient allowance"
**Solución:** Aprueba USDC para PaymentProcessor primero:
```javascript
await usdcContract.approve(paymentProcessorAddress, amount);
```

### Error: "Payment already exists"
**Solución:** Usa un paymentId único. Formato recomendado: `pay_${Date.now()}_${random()}`

### Error: "Payment not found"
**Solución:** Verifica que el pago se haya creado correctamente y que el paymentId sea correcto.

---

## 🎯 Próximos Pasos

1. ✅ **Contratos desplegados** - Listo
2. ✅ **Backend configurado** - Listo
3. ✅ **Agentes funcionando** - Listo
4. ⏳ **Obtener USDC de prueba** - Hazlo ahora
5. ⏳ **Hacer primera transacción** - Sigue esta guía
6. ⏳ **Integrar en frontend** - Usa el código de ejemplo
7. ⏳ **Deploy a producción** - Cuando estés listo

---

## 💡 Tips y Mejores Prácticas

1. **Siempre verifica pagos antes de procesar queries**
2. **Usa paymentIds únicos y descriptivos**
3. **Mantén registro de todas las transacciones**
4. **Implementa rate limiting para evitar spam**
5. **Monitorea el balance de tu wallet**
6. **Ten un plan de contingencia si se acaba el ETH**
7. **Prueba primero en testnet antes de mainnet**

---

## 📚 Recursos Adicionales

- **Ethers.js Docs:** https://docs.ethers.org/v5/
- **Sepolia Faucets:** https://faucetlink.to/sepolia
- **Circle USDC:** https://www.circle.com/en/usdc
- **Hardhat Docs:** https://hardhat.org/docs
- **OpenZeppelin Contracts:** https://docs.openzeppelin.com/contracts

---

## ✅ Checklist de Implementación

- [ ] Obtenido Sepolia ETH
- [ ] Obtenido Sepolia USDC
- [ ] Verificado contratos en Etherscan
- [ ] Probado crear pago vía API
- [ ] Probado consultar agente con pago
- [ ] Probado retirar ganancias
- [ ] Integrado en frontend
- [ ] Documentado flujo para usuarios
- [ ] Configurado monitoreo
- [ ] Listo para producción

---

**¡Tu sistema está listo para pagos reales on-chain! 🚀**

Para empezar, simplemente obtén USDC de prueba y sigue los ejemplos de esta guía.
