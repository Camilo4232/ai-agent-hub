# 🤖 AI Agents - Comunicación A2A Demo

Este directorio contiene 3 agentes de IA que se comunican entre sí usando el protocolo A2A (Agent-to-Agent).

## 📋 Descripción de los Agentes

### 1️⃣ Weather Agent (Puerto 3001)
**Servicio:** Datos meteorológicos
**Precio:** 0.001 USDC
**Wallet:** 0x1111111111111111111111111111111111111111

**Capacidades:**
- Proporciona datos del clima actual
- Temperatura, humedad, viento
- Ciudades disponibles: New York, London, Tokyo, Paris, Miami

**Ejemplo de uso:**
```bash
curl -X POST http://localhost:3001/query \
  -H "Content-Type: application/json" \
  -d '{"query":"clima en new york","paymentId":"demo_123"}'
```

---

### 2️⃣ Fashion Agent (Puerto 3002)
**Servicio:** Recomendaciones de moda basadas en el clima
**Precio:** 0.002 USDC (+ 0.001 USDC para Weather Agent)
**Wallet:** 0x2222222222222222222222222222222222222222

**Capacidades:**
- Recomienda ropa según el clima
- Sugiere accesorios apropiados
- **Consulta automáticamente al Weather Agent vía A2A**

**Dependencias:**
- Weather Agent (0.001 USDC)

**Ejemplo de uso:**
```bash
curl -X POST http://localhost:3002/query \
  -H "Content-Type: application/json" \
  -d '{"query":"qué ropa usar en london","paymentId":"demo_123"}'
```

---

### 3️⃣ Activities Agent (Puerto 3003)
**Servicio:** Sugerencias completas de actividades
**Precio:** 0.005 USDC (+ 0.003 USDC para otros agentes)
**Wallet:** 0x3333333333333333333333333333333333333333

**Capacidades:**
- Sugiere actividades indoor y outdoor
- Plan completo de día
- **Consulta a Weather y Fashion Agents en paralelo vía A2A**

**Dependencias:**
- Weather Agent (0.001 USDC)
- Fashion Agent (0.002 USDC)

**Costo total:** 0.008 USDC (incluye todas las dependencias)

**Ejemplo de uso:**
```bash
curl -X POST http://localhost:3003/query \
  -H "Content-Type: application/json" \
  -d '{"query":"qué hacer en tokyo","paymentId":"demo_123"}'
```

---

## 🚀 Inicio Rápido

### Opción 1: Usar el script de inicio (Windows)

```bash
cd agents
start-all-agents.bat
```

Este script:
1. Inicia los 3 agentes en ventanas separadas
2. Ejecuta automáticamente el demo de comunicación A2A

### Opción 2: Inicio manual

```bash
# Terminal 1 - Weather Agent
cd agents/weather-agent
node weather-agent.js

# Terminal 2 - Fashion Agent
cd agents/fashion-agent
node fashion-agent.js

# Terminal 3 - Activities Agent
cd agents/activities-agent
node activities-agent.js

# Terminal 4 - Demo
cd agents
node demo-a2a.js
```

---

## 🧪 Probar los Agentes

### Verificar que estén corriendo

```bash
curl http://localhost:3001/health  # Weather
curl http://localhost:3002/health  # Fashion
curl http://localhost:3003/health  # Activities
```

### Probar cada agente individualmente

**Weather Agent:**
```bash
curl -X POST http://localhost:3001/query \
  -H "Content-Type: application/json" \
  -d '{"query":"clima en miami"}'
```

**Fashion Agent:**
```bash
curl -X POST http://localhost:3002/query \
  -H "Content-Type: application/json" \
  -d '{"query":"qué ponerme en paris"}'
```

**Activities Agent (Consulta a los otros 2):**
```bash
curl -X POST http://localhost:3003/query \
  -H "Content-Type: application/json" \
  -d '{"query":"actividades en new york"}'
```

---

## 🔄 Flujo de Comunicación A2A

```
Usuario
   │
   ├─► Activities Agent (puerto 3003)
        │
        ├─► Weather Agent (puerto 3001) ──────┐
        │                                      │
        └─► Fashion Agent (puerto 3002)       │
                │                               │
                └─► Weather Agent (puerto 3001)│
                                                │
        ◄───────────────────────────────────────┘
   │
   ◄── Respuesta completa
```

**Ejemplo de flujo:**

1. Usuario consulta: "¿Qué hacer en Tokyo?"
2. Activities Agent recibe la query
3. Activities Agent consulta en paralelo:
   - Weather Agent → obtiene clima de Tokyo
   - Fashion Agent → obtiene recomendaciones
     - Fashion Agent consulta a Weather Agent internamente
4. Activities Agent combina toda la información
5. Responde al usuario con plan completo

---

## 💰 Estructura de Costos

| Servicio | Costo Directo | Dependencias | Total |
|----------|---------------|--------------|-------|
| Weather Agent | 0.001 USDC | - | 0.001 USDC |
| Fashion Agent | 0.002 USDC | Weather (0.001) | 0.003 USDC |
| Activities Agent | 0.005 USDC | Weather (0.001) + Fashion (0.002) | 0.008 USDC |

**Nota:** En un sistema real, estos pagos se harían on-chain con USDC.

---

## 📡 Endpoints Disponibles

Cada agente expone los siguientes endpoints:

### GET `/health`
Verifica el estado del agente.

**Respuesta:**
```json
{
  "status": "healthy",
  "agent": "Weather Agent",
  "description": "Proveedor de datos meteorológicos",
  "price": "0.001 USDC",
  "timestamp": "2025-11-03T..."
}
```

### GET `/info`
Información detallada del agente.

**Respuesta:**
```json
{
  "name": "Weather Agent",
  "description": "Proveedor de datos meteorológicos",
  "pricePerQuery": "0.001",
  "walletAddress": "0x111...",
  "capabilities": ["weather_data", "temperature", "humidity", "wind_speed"],
  "availableCities": ["new york", "london", "tokyo", "paris", "miami"]
}
```

### POST `/query`
Consulta pública directa del usuario.

**Request:**
```json
{
  "query": "clima en new york",
  "paymentId": "demo_123"
}
```

**Response:**
```json
{
  "success": true,
  "agentName": "Weather Agent",
  "answer": "El clima actual: Soleado, temperatura 22°C...",
  "data": { /* datos estructurados */ },
  "cost": "0.001 USDC",
  "timestamp": "2025-11-03T..."
}
```

### POST `/a2a/message`
Endpoint para comunicación entre agentes (Protocolo A2A).

**Request:**
```json
{
  "query": "clima en new york",
  "senderId": "0x222...",
  "messageId": "msg_12345",
  "paymentProof": "demo"
}
```

**Response:**
```json
{
  "success": true,
  "agentId": "0x111...",
  "agentName": "Weather Agent",
  "messageId": "msg_12345",
  "replyTo": "msg_12345",
  "answer": "El clima actual...",
  "data": { /* datos estructurados */ },
  "cost": "0.001 USDC",
  "timestamp": "2025-11-03T..."
}
```

---

## 🎯 Casos de Uso

### Caso 1: Usuario consulta el clima
```bash
curl -X POST http://localhost:3001/query \
  -H "Content-Type: application/json" \
  -d '{"query":"clima en london"}'
```
✅ Respuesta inmediata con datos meteorológicos

### Caso 2: Usuario quiere saber qué ponerse
```bash
curl -X POST http://localhost:3002/query \
  -H "Content-Type: application/json" \
  -d '{"query":"qué ropa usar en tokyo"}'
```
✅ Fashion Agent consulta a Weather Agent automáticamente
✅ Respuesta con recomendaciones basadas en el clima actual

### Caso 3: Usuario quiere plan completo del día
```bash
curl -X POST http://localhost:3003/query \
  -H "Content-Type: application/json" \
  -d '{"query":"qué hacer en paris"}'
```
✅ Activities Agent consulta a Weather y Fashion en paralelo
✅ Respuesta completa con clima + actividades + ropa recomendada

---

## 🔍 Monitoreo y Logs

Cada agente muestra logs detallados en su terminal:

**Ejemplo de logs:**
```
📨 [Fashion Agent] Mensaje A2A recibido
   From: 0x3333333333333333333333333333333333333333
   Query: moda en new york
   🔗 Consultando Weather Agent para: new york
   ✅ Datos recibidos del Weather Agent
   ✅ Recomendación enviada para new york
```

---

## 🛠️ Desarrollo y Extensión

### Agregar un nuevo agente

1. Crea una nueva carpeta en `agents/`:
```bash
mkdir agents/my-agent
```

2. Crea el archivo del agente:
```javascript
// agents/my-agent/my-agent.js
import express from 'express';
// ... implementación
```

3. Implementa los endpoints estándar:
   - `/health`
   - `/info`
   - `/query`
   - `/a2a/message`

4. Configura el puerto y wallet address

5. Actualiza `start-all-agents.bat` para incluir tu agente

### Agregar nueva ciudad al Weather Agent

Edita `weather-agent.js` y agrega la ciudad al objeto `weatherData`:

```javascript
const weatherData = {
    // ... ciudades existentes
    "barcelona": { temp: 25, condition: "Soleado", humidity: 70, wind: 12 }
};
```

---

## 📚 Recursos Adicionales

- **Protocolo A2A:** Ver especificación completa en `/docs/A2A_PROTOCOL.md`
- **Arquitectura:** Ver `/ARCHITECTURE.md`
- **API Principal:** Ver `/backend/server.js`

---

## ⚠️ Notas Importantes

1. **Modo Demo:** Los agentes actualmente funcionan en modo demo (sin blockchain real)
2. **Pagos:** Para pagos reales on-chain, configura el backend principal con Sepolia
3. **Producción:** Para deployment en producción, considera:
   - Autenticación entre agentes
   - Rate limiting
   - Verificación de pagos on-chain
   - Manejo de errores robusto
   - Logging estructurado

---

## 🎉 ¡Disfruta experimentando con los agentes!

Los agentes demuestran cómo múltiples servicios de IA pueden colaborar
automáticamente usando el protocolo A2A para proporcionar respuestas más
completas y valiosas a los usuarios.

**Preguntas o problemas?**
Revisa los logs de cada agente o consulta la documentación principal del proyecto.
