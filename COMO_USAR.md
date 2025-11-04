# 🚀 Cómo Usar el AI Agent Hub

## ✅ Estado Actual del Sistema

**Todos los servicios están corriendo:**

### 🤖 Agentes (Backend)
- ✅ **Weather Agent** - Puerto 3001
- ✅ **Fashion Agent** - Puerto 3002
- ✅ **Activities Agent** - Puerto 3003
- ✅ **Weather Agent Enhanced** - Puerto 3004 (con verificación de pagos on-chain)

### 🌐 Frontend
- ✅ **Interfaz Web** - http://localhost:8000

---

## 📖 Instrucciones de Uso

### Opción 1: Usar la Interfaz Web (Recomendado)

1. **Abre tu navegador** en:
   ```
   http://localhost:8000/web3-integration.html
   ```

2. **Conecta tu wallet**:
   - Haz clic en "Conectar Wallet"
   - Selecciona MetaMask u otra wallet EVM
   - Autoriza la conexión

3. **Selecciona un agente**:
   - Weather Agent (0.001 USDC) - Información del clima
   - Fashion Agent (0.003 USDC) - Recomendaciones de moda
   - Activities Agent (0.008 USDC) - Plan completo del día

4. **Haz tu consulta**:
   - Escribe tu pregunta (ej: "clima en tokyo", "que hacer en paris")
   - Haz clic en el agente deseado
   - Aprueba el pago USDC
   - Recibe tu respuesta!

### Opción 2: Demo Interactivo (Sin Pagos Reales)

1. **Abre el demo** en:
   ```
   http://localhost:8000/
   ```

2. **Prueba los agentes**:
   - Escribe tu consulta
   - Los agentes interactúan entre sí automáticamente
   - Sin pagos reales (modo demo)

### Opción 3: API Directa (Para Desarrolladores)

#### Weather Agent
```bash
curl -X POST http://localhost:3001/query \
  -H "Content-Type: application/json" \
  -d '{"query": "clima en tokyo"}'
```

#### Fashion Agent
```bash
curl -X POST http://localhost:3002/query \
  -H "Content-Type: application/json" \
  -d '{"query": "moda en paris"}'
```

#### Activities Agent
```bash
curl -X POST http://localhost:3003/query \
  -H "Content-Type: application/json" \
  -d '{"query": "que hacer en london"}'
```

---

## 💰 Configuración de Pagos

### Testnet Sepolia (Configuración Actual)

**Red:** Sepolia Testnet (Chain ID: 11155111)

**Contratos Desplegados:**
- Payment Processor: `0x231eA77d88603F40C48Ad98f085F5646523bCe74`
- Agent Registry: `0x22265732666ea19B72627593Ff515f5a37b0dc77`
- USDC Mock: `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`

**Cómo obtener USDC de prueba:**
1. Ve a: https://faucet.circle.com/
2. Selecciona "Sepolia"
3. Ingresa tu wallet address
4. Recibe USDC de prueba gratis

**Cómo obtener ETH Sepolia (para gas):**
1. Ve a: https://sepoliafaucet.com/
2. O usa: https://www.alchemy.com/faucets/ethereum-sepolia
3. Ingresa tu wallet address
4. Recibe ETH de prueba gratis

---

## 🌐 Integración Multi-Chain (X402 - NUEVO)

### Facilitar Gasless en 13+ Chains

**Facilitador:** https://facilitator.ultravioletadao.xyz/

**Chains Soportadas:**
- ✅ Base (Mainnet + Sepolia)
- ✅ Polygon (Mainnet + Amoy)
- ✅ Optimism (Mainnet + Sepolia)
- ✅ Avalanche (C-Chain + Fuji)
- ✅ Celo (Mainnet + Alfajores)
- ✅ Solana (Mainnet + Devnet)
- ✅ HyperEVM

**Ventajas:**
- 🆓 **$0 gas fees** para usuarios
- ⚡ **2-3 segundos** de confirmación
- 🔒 **Trustless** (EIP-3009 meta-transactions)

**Documentación:** Lee `X402_INTEGRATION_GUIDE.md`

---

## 🔄 Flujo de Interacción A2A

Los agentes se comunican entre sí automáticamente:

```
Usuario: "que hacer en miami"
    ↓
Activities Agent (Puerto 3003)
    ↓
    ├──→ Weather Agent (Puerto 3001)
    │    Respuesta: "Soleado 30°C"
    │
    └──→ Fashion Agent (Puerto 3002)
         ├──→ Weather Agent (consulta interna)
         Respuesta: "Ropa ligera, shorts, lentes de sol"
    ↓
Respuesta Final: "Plan completo del día en Miami"
```

---

## 📊 Verificar Estado de los Agentes

### Health Checks

```bash
# Weather Agent
curl http://localhost:3001/health

# Fashion Agent
curl http://localhost:3002/health

# Activities Agent
curl http://localhost:3003/health
```

### Información de los Agentes

```bash
# Weather Agent
curl http://localhost:3001/info

# Fashion Agent
curl http://localhost:3002/info

# Activities Agent
curl http://localhost:3003/info
```

---

## 🛠️ Comandos Útiles

### Ver Logs en Tiempo Real

Como los agentes están corriendo en background, puedes ver sus logs:

```bash
# Ver todos los procesos Node.js
tasklist | findstr node

# Detener todos los agentes (si necesitas)
taskkill /F /IM node.exe
```

### Reiniciar el Sistema

```bash
# 1. Detener agentes
taskkill /F /IM node.exe

# 2. Detener servidor Python
taskkill /F /IM python.exe

# 3. Reiniciar agentes
cd agents/weather-agent && node weather-agent.js &
cd agents/fashion-agent && node fashion-agent.js &
cd agents/activities-agent && node activities-agent.js &

# 4. Reiniciar frontend
cd frontend && python -m http.server 8000 &
```

---

## 🧪 Ejemplos de Consultas

### Weather Agent
```
"clima en tokyo"
"temperatura en new york"
"que tiempo hace en london"
"clima en miami"
```

### Fashion Agent
```
"moda en paris"
"que ropa usar en tokyo"
"outfit para london"
"que ponerme en miami"
```

### Activities Agent
```
"que hacer en paris"
"plan para tokyo"
"actividades en london"
"itinerario en miami"
```

---

## 💡 Tips

1. **Primera vez usando?**
   - Usa el modo demo sin pagos: http://localhost:8000/
   - Prueba con consultas simples primero

2. **Con pagos reales?**
   - Consigue USDC y ETH de prueba en Sepolia
   - Conecta tu wallet en: http://localhost:8000/web3-integration.html
   - Empieza con Weather Agent (más barato: 0.001 USDC)

3. **Desarrollador?**
   - Lee `AGENT_DEVELOPMENT_GUIDE.md` para crear tus propios agentes
   - Lee `X402_INTEGRATION_GUIDE.md` para integrar pagos gasless
   - Revisa `IMPROVEMENTS.md` para entender las mejoras del sistema

---

## 📁 Estructura del Proyecto

```
ai-agent-hub/
├── agents/
│   ├── weather-agent/          # Agente del clima
│   ├── fashion-agent/          # Agente de moda
│   ├── activities-agent/       # Agente de actividades
│   └── shared/                 # Código compartido
│       ├── payment-verifier.js # Verificación on-chain
│       └── cache.js           # Sistema de caché
│
├── frontend/
│   ├── index.html             # Demo interactivo
│   └── web3-integration.html  # UI con pagos reales
│
├── facilitator/
│   ├── X402FacilitatorClient.js # Cliente x402
│   └── config/chains.js        # Configuración multi-chain
│
├── contracts/                  # Smart contracts Solidity
│
└── docs/
    ├── COMO_USAR.md           # Esta guía
    ├── X402_INTEGRATION_GUIDE.md
    ├── AGENT_DEVELOPMENT_GUIDE.md
    └── IMPROVEMENTS.md
```

---

## 🆘 Troubleshooting

### "No se conecta la wallet"
- Verifica que usas `http://localhost:8000` (no `file://`)
- Asegúrate de tener MetaMask instalado
- Cambia a red Sepolia en MetaMask

### "Payment failed"
- Verifica que tienes USDC en Sepolia
- Verifica que tienes ETH para gas
- Asegúrate de aprobar el gasto de USDC primero

### "Agent no responde"
- Verifica que el agente esté corriendo: `curl http://localhost:3001/health`
- Revisa si hay errores en la consola
- Reinicia el agente si es necesario

### "Error de RPC"
- El RPC de Sepolia puede estar lento
- Espera unos segundos y reintenta
- Considera usar tu propio RPC de Alchemy/Infura

---

## 🎯 URLs Importantes

| Servicio | URL |
|----------|-----|
| **Frontend Demo** | http://localhost:8000/ |
| **Frontend Web3** | http://localhost:8000/web3-integration.html |
| **Weather Agent** | http://localhost:3001 |
| **Fashion Agent** | http://localhost:3002 |
| **Activities Agent** | http://localhost:3003 |
| **X402 Facilitator** | https://facilitator.ultravioletadao.xyz/ |
| **Sepolia Explorer** | https://sepolia.etherscan.io/ |
| **Payment Contract** | https://sepolia.etherscan.io/address/0x231eA77d88603F40C48Ad98f085F5646523bCe74 |

---

## 📞 Soporte

Para más información:
- Lee la documentación en `/docs`
- Revisa los contratos en `/contracts`
- Consulta ejemplos en `/frontend`

---

**¡Disfruta usando el AI Agent Hub! 🚀**

*Sistema v2.1 con X402 Gasless Payments*
