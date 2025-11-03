# ⚡ Quick Start - 5 Minutos

## Opción 1: Inicio Rápido (Sin Blockchain)

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor
npm start
```

✅ Listo! Abre `http://localhost:3000/health` en tu navegador

## Opción 2: Con Agente de Ejemplo

```bash
# Terminal 1: Servidor
npm start

# Terminal 2: Agente
npm run agent
```

Verás el agente:
1. ✅ Registrarse
2. ✅ Listar agentes disponibles
3. ✅ Enviar mensaje A2A
4. ✅ Hacer consulta con pago X402

## Opción 3: Con Frontend

```bash
# 1. Iniciar servidor
npm start

# 2. Abrir frontend
cd frontend
python -m http.server 8080
# O simplemente abre index.html en Chrome/Firefox
```

Navega a `http://localhost:8080` y usa la interfaz visual.

## Pruebas Rápidas con cURL

### Ver agentes disponibles
```bash
curl http://localhost:3000/agents
```

### Registrar un agente
```bash
curl -X POST http://localhost:3000/agents/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "TestAgent",
    "description": "Mi primer agente",
    "endpoint": "http://localhost:3001",
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
  }'
```

### Enviar mensaje A2A
```bash
curl -X POST http://localhost:3000/a2a/message \
  -H "Content-Type: application/json" \
  -d '{
    "from": "mi-agente",
    "to": "agent-hub",
    "message": "Hola mundo A2A!",
    "task": "test"
  }'
```

### Probar X402 (obtendrás un 402)
```bash
curl -X POST http://localhost:3000/agents/test/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Hola, ¿cómo estás?"}'
```

## 🚀 Siguiente Paso: Blockchain

Cuando estés listo para desplegar el contrato:

```bash
cd contracts
npm install
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
```

## 🎯 Qué Hace Cada Protocolo

| Protocolo | Función | Endpoint |
|-----------|---------|----------|
| **ERC-8004** | Registra identidad del agente como NFT | `POST /agents/register` |
| **A2A** | Permite que agentes se comuniquen | `POST /a2a/message` |
| **X402** | Cobra por servicios de agentes | `POST /agents/:id/query` |

## 💡 Tips

1. **No necesitas blockchain** para empezar - todo funciona en memoria
2. **El dashboard** es la forma más fácil de probar
3. **El agente de ejemplo** muestra cómo integrar los 3 protocolos
4. **Lee README.md** para más detalles

¿Problemas? Verifica que:
- [ ] Node.js instalado (v18+)
- [ ] Puerto 3000 disponible
- [ ] Dependencias instaladas (`npm install`)

---

**¡Empieza ahora y construye tu primera red de agentes en 5 minutos! 🎉**
