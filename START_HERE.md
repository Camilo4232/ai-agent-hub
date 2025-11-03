# 🎯 EMPIEZA AQUÍ - AI Agent Hub

## ⚡ Inicio Súper Rápido (30 segundos)

```bash
cd ai-agent-hub
npm install
npm start
```

Abre `http://localhost:3000/health` en tu navegador.

✅ **¡Ya está funcionando!** (en modo demo)

---

## 🎮 ¿Qué puedo hacer ahora?

### 1️⃣ Probar la API

```bash
# Ver estado del servidor
curl http://localhost:3000/health

# Registrar un agente
curl -X POST http://localhost:3000/agents/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "MiAgente",
    "description": "Mi primer agente",
    "endpoint": "http://localhost:3001",
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
  }'

# Listar agentes
curl http://localhost:3000/agents
```

### 2️⃣ Probar el Agente de Ejemplo

```bash
# Terminal 1 (si no está corriendo)
npm start

# Terminal 2
npm run agent
```

Verás el agente:
- ✅ Registrarse
- ✅ Enviar mensaje A2A
- ✅ Hacer consulta con pago simulado

### 3️⃣ Usar la Interfaz Web

Abre en tu navegador:
- `frontend/index.html` - Dashboard básico
- `frontend/web3-integration.html` - Interfaz Web3 (requiere MetaMask)

---

## 🚀 Siguiente Nivel: Blockchain Real

¿Quieres pagos USDC reales on-chain?

```bash
npm run setup
```

Sigue el wizard interactivo que te preguntará:
1. ¿Modo blockchain o demo?
2. Tu RPC URL (Infura/Alchemy)
3. Tu clave privada de prueba
4. Tu dirección de wallet

Después:

```bash
# Instalar dependencias de contratos
npm run contracts:install

# Compilar contratos
npm run contracts:compile

# Desplegar a Sepolia
npm run contracts:deploy

# Actualizar .env con las direcciones de contratos

# Iniciar servidor
npm start
```

---

## 📚 Documentación

| Archivo | Para qué sirve |
|---------|---------------|
| **START_HERE.md** | 👈 Estás aquí - Inicio rápido |
| **README.md** | Documentación completa del proyecto |
| **QUICKSTART.md** | Guía de inicio en 5 minutos |
| **CONFIG_GUIDE.md** | Configuración detallada paso a paso |
| **BLOCKCHAIN_SETUP.md** | Setup blockchain completo |
| **ARCHITECTURE.md** | Arquitectura técnica |

---

## 🎯 Rutas de Aprendizaje

### 🟢 Principiante: Solo quiero ver cómo funciona

```bash
npm install
npm start
# Abre frontend/index.html
```

Lee: `QUICKSTART.md`

### 🟡 Intermedio: Quiero usar blockchain de prueba

```bash
npm run setup  # Selecciona "blockchain"
# Sigue las instrucciones
npm run contracts:deploy
npm start
```

Lee: `BLOCKCHAIN_SETUP.md`

### 🔴 Avanzado: Quiero desarrollar/contribuir

```bash
npm run install:all
npm run setup
# Configura todo
npm run dev
```

Lee: `ARCHITECTURE.md` + `CONFIG_GUIDE.md`

---

## 🛠️ Comandos Útiles

```bash
# Verificar configuración
npm run check

# Iniciar en modo desarrollo (hot-reload)
npm run dev

# Ver todos los comandos disponibles
npm run

# Ejecutar agente de ejemplo
npm run agent
```

---

## ❓ FAQ Rápido

**P: ¿Necesito blockchain para empezar?**
R: No, funciona en modo demo sin blockchain.

**P: ¿Es gratis?**
R: Sí, totalmente gratis. Sepolia es testnet (no dinero real).

**P: ¿Cuánto tarda el setup?**
R: 30 segundos modo demo, 10 minutos modo blockchain.

**P: ¿Qué necesito para blockchain?**
R: MetaMask + Sepolia ETH + Sepolia USDC (todo gratis en faucets).

**P: ¿Funciona en Windows/Mac/Linux?**
R: Sí, en todos.

---

## 🆘 ¿Problemas?

### El servidor no inicia
```bash
# Verifica que instalaste dependencias
npm install

# Verifica que el puerto 3000 esté libre
# Cambia PORT en .env si es necesario
```

### "Cannot find module"
```bash
npm install
npm run contracts:install
```

### Blockchain no funciona
```bash
# Es normal si no configuraste RPC_URL
# El proyecto funciona en modo demo
# Para habilitar blockchain: npm run setup
```

---

## 🎉 ¡Siguiente Paso!

Ahora que tienes el proyecto funcionando:

1. **Experimenta** con la API y el frontend
2. **Lee** `README.md` para entender la arquitectura
3. **Sigue** `BLOCKCHAIN_SETUP.md` si quieres pagos reales
4. **Desarrolla** tu propio agente de IA

---

## 📞 Recursos

- 📖 [README.md](./README.md) - Documentación completa
- ⚡ [QUICKSTART.md](./QUICKSTART.md) - Inicio en 5 min
- ⚙️ [CONFIG_GUIDE.md](./CONFIG_GUIDE.md) - Configuración detallada
- 🔗 [BLOCKCHAIN_SETUP.md](./BLOCKCHAIN_SETUP.md) - Setup blockchain
- 🏗️ [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitectura técnica

**Faucets (fondos de prueba):**
- 💧 Sepolia ETH: https://sepoliafaucet.com
- 💵 Sepolia USDC: https://faucet.circle.com

**Protocolos:**
- 🔐 [EIP-8004](https://eips.ethereum.org/EIPS/eip-8004)
- 💬 [A2A Protocol](https://a2a-protocol.org/)
- 💳 [X402](https://www.x402.org/)

---

**¿Todo listo? ¡Construye tu red de AI Agents! 🚀**

```bash
npm start
```

Abre `frontend/web3-integration.html` para la experiencia completa.
