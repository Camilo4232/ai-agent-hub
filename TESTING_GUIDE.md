# 🧪 Guía Completa de Pruebas - AI Agent Hub

## Estado Actual del Sistema

✅ **Todos los servicios están funcionando:**

- **Backend API**: http://localhost:3000
- **Weather Agent**: http://localhost:3001
- **Fashion Agent**: http://localhost:3002
- **Activities Agent**: http://localhost:3003
- **Frontend**: http://localhost:8080

---

## 1️⃣ Opción 1: Interfaz Web (Más Fácil)

### Demo sin Blockchain

Abre tu navegador en:
```
http://localhost:8080/agents-demo.html
```

**Qué puedes hacer:**
- Ver el estado de todos los agentes en tiempo real
- Probar cada agente individualmente
- Probar la comunicación A2A completa
- Ver el desglose de costos
- No necesitas MetaMask ni blockchain

**Ciudades disponibles:**
- New York
- London
- Tokyo
- Paris
- Miami

### Integración con Blockchain

Abre tu navegador en:
```
http://localhost:8080/web3-integration.html
```

**Qué puedes hacer:**
- Conectar tu wallet MetaMask
- Ver balance de ETH y USDC
- Registrar agentes en blockchain
- Crear pagos reales con USDC
- Ver transacciones en Sepolia Etherscan

---

## 2️⃣ Opción 2: Pruebas con curl (Terminal)

### Prueba Individual de Agentes

#### Weather Agent
```bash
curl -X POST http://localhost:3001/query \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"clima en tokyo\"}"
```

**Respuesta esperada:**
```json
{
  "success": true,
  "agentName": "Weather Agent",
  "answer": "🌤️ Datos meteorológicos:\n\nCondición: Lluvioso\nTemperatura: 28°C\nHumedad: 85%\nViento: 10 km/h",
  "cost": "0.001 USDC"
}
```

#### Fashion Agent
```bash
curl -X POST http://localhost:3002/query \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"que ropa usar en paris\"}"
```

**Respuesta esperada:**
- Recomendaciones de vestimenta
- Accesorios
- Calzado
- Incluye datos del Weather Agent (comunicación A2A)
- Costo: 0.003 USDC (0.002 Fashion + 0.001 Weather)

#### Activities Agent
```bash
curl -X POST http://localhost:3003/query \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"que hacer en miami\"}"
```

**Respuesta esperada:**
- Plan completo del día
- Actividades basadas en el clima
- Recomendaciones de moda
- Consulta a Weather y Fashion agents en paralelo
- Costo: 0.008 USDC (0.005 Activities + 0.002 Fashion + 0.001 Weather)

---

## 3️⃣ Opción 3: API del Backend (Con Blockchain)

### Ver Agentes Registrados
```bash
curl http://localhost:3000/agents
```

### Ver Info de un Agente
```bash
curl http://localhost:3001/info
```

### Crear un Pago (Backend firma con tu private key)
```bash
curl -X POST http://localhost:3000/payments/create \
  -H "Content-Type: application/json" \
  -d "{
    \"agentAddress\": \"0x1111111111111111111111111111111111111111\",
    \"amount\": \"0.001\",
    \"serviceId\": \"weather_query_tokyo\",
    \"currency\": \"USDC\"
  }"
```

**Respuesta esperada:**
```json
{
  "success": true,
  "paymentId": "pay_1234567890",
  "txHash": "0x...",
  "amount": "0.001",
  "currency": "USDC"
}
```

### Verificar un Pago
```bash
curl -X POST http://localhost:3000/payments/verify \
  -H "Content-Type: application/json" \
  -d "{\"paymentId\": \"pay_1234567890\"}"
```

### Consultar Agente con Pago Verificado
```bash
curl -X POST http://localhost:3001/query \
  -H "Content-Type: application/json" \
  -H "X-Payment-Id: pay_1234567890" \
  -d "{\"query\": \"clima en tokyo\"}"
```

---

## 4️⃣ Verificar en Blockchain (Sepolia Etherscan)

### Contratos Desplegados

**PaymentProcessor:**
https://sepolia.etherscan.io/address/0x231eA77d88603F40C48Ad98f085F5646523bCe74

**AgentRegistry:**
https://sepolia.etherscan.io/address/0x22265732666ea19B72627593Ff515f5a37b0dc77

**USDC (Sepolia):**
https://sepolia.etherscan.io/address/0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238

**Tu Wallet:**
https://sepolia.etherscan.io/address/0xda77B09a90Dcb4E1b10CDEaeCaEfa343BA491bc0

### Qué verificar:
- Transacciones de pago
- Balance de USDC
- Eventos emitidos por los contratos
- Ganancias acumuladas de los agentes

---

## 5️⃣ Pruebas Avanzadas con JavaScript

### Ejemplo de Flujo Completo

```javascript
// 1. Conectar wallet
const provider = new ethers.providers.Web3Provider(window.ethereum);
await provider.send("eth_requestAccounts", []);
const signer = provider.getSigner();

// 2. Aprobar USDC
const usdcContract = new ethers.Contract(
    "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    ["function approve(address spender, uint256 amount) returns (bool)"],
    signer
);

const tx = await usdcContract.approve(
    "0x231eA77d88603F40C48Ad98f085F5646523bCe74",
    ethers.utils.parseUnits("1", 6)
);
await tx.wait();

// 3. Crear pago
const paymentId = "pay_" + Date.now();
const paymentProcessor = new ethers.Contract(
    "0x231eA77d88603F40C48Ad98f085F5646523bCe74",
    ["function createPaymentUSDC(string paymentId, address agent, uint256 amount, string serviceId)"],
    signer
);

const tx2 = await paymentProcessor.createPaymentUSDC(
    paymentId,
    "0x1111111111111111111111111111111111111111",
    ethers.utils.parseUnits("0.001", 6),
    "weather_query"
);
await tx2.wait();

// 4. Consultar agente
const response = await fetch('http://localhost:3001/query', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-Payment-Id': paymentId
    },
    body: JSON.stringify({ query: "clima en tokyo" })
});

const data = await response.json();
console.log(data.answer);
```

---

## 6️⃣ Tabla de Costos

| Agente | Precio Directo | Dependencias | **Total** |
|--------|---------------|--------------|-----------|
| **Weather Agent** | 0.001 USDC | - | **0.001 USDC** |
| **Fashion Agent** | 0.002 USDC | Weather: 0.001 | **0.003 USDC** |
| **Activities Agent** | 0.005 USDC | Weather: 0.001<br>Fashion: 0.002 | **0.008 USDC** |

---

## 7️⃣ Troubleshooting

### Error: "Cannot connect to agent"

**Solución:** Verifica que todos los servicios estén corriendo:
```bash
# Verificar puertos
netstat -ano | findstr ":300"

# Deberías ver:
# 3000 - Backend
# 3001 - Weather Agent
# 3002 - Fashion Agent
# 3003 - Activities Agent
```

### Error: "Insufficient USDC balance"

**Solución:** Obtén USDC de prueba:
1. Ve a https://faucet.circle.com/
2. Selecciona "Sepolia"
3. Pega tu wallet: `0xda77B09a90Dcb4E1b10CDEaeCaEfa343BA491bc0`
4. Recibirás 10 USDC de prueba

### Error: "Insufficient ETH for gas"

**Solución:** Obtén Sepolia ETH:
- https://sepoliafaucet.com/
- https://faucet.quicknode.com/ethereum/sepolia

### Error: "Payment not found"

**Solución:**
1. Verifica que el pago se haya creado correctamente
2. Espera a que la transacción se confirme (2-3 bloques)
3. Usa el paymentId correcto

---

## 8️⃣ Scripts de Prueba Automatizados

### Prueba Rápida de Todos los Agentes

Crea un archivo `test-all.bat`:
```batch
@echo off
echo.
echo ====================================
echo   PRUEBAS DE AGENTES
echo ====================================
echo.

echo [1/3] Weather Agent...
curl -X POST http://localhost:3001/query -H "Content-Type: application/json" -d "{\"query\": \"clima en tokyo\"}"
echo.
echo.

echo [2/3] Fashion Agent...
curl -X POST http://localhost:3002/query -H "Content-Type: application/json" -d "{\"query\": \"moda en paris\"}"
echo.
echo.

echo [3/3] Activities Agent...
curl -X POST http://localhost:3003/query -H "Content-Type: application/json" -d "{\"query\": \"que hacer en miami\"}"
echo.
echo.

echo ====================================
echo   PRUEBAS COMPLETADAS
echo ====================================
pause
```

Ejecuta:
```bash
test-all.bat
```

---

## 9️⃣ Monitoreo en Tiempo Real

### Ver logs de los agentes

Los agentes están corriendo en background. Para ver sus logs:

```bash
# Ver procesos
netstat -ano | findstr ":300"

# Los logs se muestran en las ventanas donde iniciaste los agentes
```

### Verificar Health de Todos los Servicios

```bash
curl http://localhost:3000/health && ^
curl http://localhost:3001/health && ^
curl http://localhost:3002/health && ^
curl http://localhost:3003/health
```

---

## 🎯 Prueba Recomendada para Empezar

### Opción A: Demo Visual (Sin Blockchain)

1. Abre: http://localhost:8080/agents-demo.html
2. Haz clic en "Test Activities Agent"
3. Selecciona una ciudad
4. Observa cómo se comunican los 3 agentes en paralelo
5. Ve el desglose de costos

### Opción B: Prueba con curl (Terminal)

```bash
# Prueba simple
curl -X POST http://localhost:3001/query \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"clima en tokyo\"}"

# Prueba completa (A2A)
curl -X POST http://localhost:3003/query \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"que hacer en miami\"}"
```

### Opción C: Prueba con Blockchain Real

1. Obtén Sepolia ETH y USDC (ver sección 7)
2. Abre: http://localhost:8080/web3-integration.html
3. Conecta MetaMask
4. Crea un pago de 0.001 USDC
5. Consulta al Weather Agent
6. Verifica la transacción en Etherscan

---

## 📊 Endpoints Disponibles

### Backend API (Puerto 3000)
- `GET /health` - Estado del sistema
- `GET /agents` - Lista de agentes registrados
- `POST /payments/create` - Crear pago on-chain
- `POST /payments/verify` - Verificar pago
- `POST /agents/register` - Registrar nuevo agente
- `GET /agents/:address/earnings` - Ver ganancias
- `POST /agents/withdraw` - Retirar ganancias

### Weather Agent (Puerto 3001)
- `GET /health` - Estado del agente
- `GET /info` - Información del agente
- `POST /query` - Consulta pública
- `POST /a2a/message` - Protocolo A2A

### Fashion Agent (Puerto 3002)
- `GET /health` - Estado del agente
- `GET /info` - Información del agente
- `POST /query` - Consulta pública
- `POST /a2a/message` - Protocolo A2A

### Activities Agent (Puerto 3003)
- `GET /health` - Estado del agente
- `GET /info` - Información del agente
- `POST /query` - Consulta pública
- `POST /a2a/message` - Protocolo A2A

---

## ✅ Checklist de Pruebas

- [ ] Todos los servicios responden al health check
- [ ] Weather Agent responde correctamente
- [ ] Fashion Agent consulta a Weather Agent (A2A)
- [ ] Activities Agent consulta a ambos agentes en paralelo
- [ ] Frontend demo muestra todos los agentes
- [ ] Conexión a MetaMask funciona
- [ ] Creación de pagos on-chain funciona
- [ ] Verificación de pagos funciona
- [ ] Transacciones visibles en Etherscan
- [ ] Retiro de ganancias funciona

---

## 📚 Documentación Adicional

- **REAL_PAYMENTS_GUIDE.md** - Guía completa de pagos con USDC
- **agents/AGENTS_README.md** - Documentación de los agentes
- **READY.md** - Estado del proyecto y setup
- **README.md** - Visión general del proyecto

---

**¡Todo listo para probar! Empieza con la opción que prefieras.** 🚀
