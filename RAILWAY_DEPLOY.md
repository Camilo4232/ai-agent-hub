# 🚂 Railway Deployment Guide - AI Agent Hub

**Guía Paso a Paso para Desplegar en Railway.app**

---

## 📋 Pre-requisitos

- Cuenta en [Railway.app](https://railway.app) (gratis para empezar)
- Repositorio Git (GitHub, GitLab, o Bitbucket)
- Variables de entorno configuradas

---

## 🚀 Método 1: Deploy desde GitHub (Recomendado)

### Paso 1: Preparar el Repositorio

1. **Asegúrate de que tu código esté en Git:**
```bash
git init
git add .
git commit -m "feat: Prepare for Railway deployment"
```

2. **Sube a GitHub:**
```bash
# Crear repo en GitHub primero, luego:
git remote add origin https://github.com/TU_USUARIO/ai-agent-hub.git
git branch -M main
git push -u origin main
```

### Paso 2: Conectar con Railway

1. Ve a [railway.app](https://railway.app)
2. Click en **"New Project"**
3. Selecciona **"Deploy from GitHub repo"**
4. Autoriza Railway a acceder a tu GitHub
5. Selecciona el repositorio **ai-agent-hub**
6. Railway detectará automáticamente que es un proyecto Node.js

### Paso 3: Configurar Variables de Entorno

En el dashboard de Railway, ve a **Variables** y agrega:

#### Variables Requeridas:
```env
NODE_ENV=production
PORT=3000

# Blockchain (Sepolia Testnet)
RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
PRIVATE_KEY=tu_private_key_aqui

# Contract Addresses
AGENT_REGISTRY_ADDRESS=0x5a50a736bEea9D7120E3FD915E90d2940B5bF228
PAYMENT_PROCESSOR_ADDRESS=0x97CA3e550b7b6091A652645e89f98946Cda5Ac08
USDC_ADDRESS=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238

# Security
ENCRYPTION_KEY=tu_encryption_key_aqui
JWT_SECRET=tu_jwt_secret_aqui

# Payment
PAYMENT_RECIPIENT=tu_wallet_address_aqui
```

#### Variables Opcionales:
```env
MAX_AGENTS=10
ENABLED_AGENT_TYPES=travel,fashion,food,payment,custom
```

### Paso 4: Deploy!

Railway desplegará automáticamente:
- ✅ Instala dependencias (`npm install`)
- ✅ Ejecuta healthcheck
- ✅ Asigna dominio público
- ✅ Configura HTTPS automáticamente

**Tu app estará lista en ~2 minutos!** 🎉

---

## 🚀 Método 2: Deploy desde Railway CLI

### Paso 1: Instalar Railway CLI

```bash
npm i -g @railway/cli
```

### Paso 2: Login

```bash
railway login
```

### Paso 3: Inicializar Proyecto

```bash
railway init
```

### Paso 4: Configurar Variables de Entorno

```bash
# Opción A: Desde archivo .env
railway variables set --from-env-file .env

# Opción B: Una por una
railway variables set NODE_ENV=production
railway variables set PORT=3000
# ... etc
```

### Paso 5: Deploy

```bash
railway up
```

---

## 🌐 Obtener URL Pública

### Opción A: Dominio Generado por Railway

Railway genera automáticamente un dominio como:
```
https://ai-agent-hub-production.up.railway.app
```

### Opción B: Dominio Custom

1. En Railway dashboard, ve a **Settings**
2. Click en **Domains**
3. Click en **Custom Domain**
4. Ingresa tu dominio (ej: `agents.tudominio.com`)
5. Configura DNS:
   - Tipo: `CNAME`
   - Nombre: `agents`
   - Valor: El dominio de Railway que te dieron

---

## ✅ Verificar Deployment

### 1. Health Check
```bash
curl https://tu-app.up.railway.app/health
```

**Respuesta esperada:**
```json
{
  "status": "ok",
  "uptime": 123.45,
  "timestamp": 1699999999,
  "environment": "production",
  "version": "2.1.0"
}
```

### 2. API Status
```bash
curl https://tu-app.up.railway.app/api/status
```

### 3. Frontend
Abre en el navegador:
```
https://tu-app.up.railway.app/
```

---

## 🔧 Configuración Avanzada

### Archivo `railway.json`

Ya incluido en el proyecto:
```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Auto-Scaling

Railway escala automáticamente basado en:
- CPU usage
- Memory usage
- Request load

**No requiere configuración adicional!** ✨

---

## 📊 Monitoreo

### Logs en Tiempo Real

**Desde Dashboard:**
1. Ve a tu proyecto en Railway
2. Click en **Deployments**
3. Click en el deployment activo
4. Ver logs en tiempo real

**Desde CLI:**
```bash
railway logs
```

### Métricas

Railway provee métricas de:
- 📈 CPU Usage
- 💾 Memory Usage
- 🌐 Request Count
- ⏱️ Response Time
- ❌ Error Rate

---

## 🔄 CI/CD Automático

Railway automáticamente:
- ✅ Detecta cambios en GitHub
- ✅ Ejecuta build
- ✅ Ejecuta tests (si existen)
- ✅ Despliega nueva versión
- ✅ Hace rollback si falla healthcheck

**No necesitas configurar nada!** 🎉

---

## 💰 Costos

### Free Tier (Hobby Plan)
- ✅ $5 USD/mes de crédito gratis
- ✅ 512 MB RAM
- ✅ 1 GB Disco
- ✅ Shared CPU
- ✅ HTTPS automático
- ✅ Ideal para testing y demos

### Pro Plan ($20/mes)
- ⚡ 8 GB RAM
- ⚡ 100 GB Disco
- ⚡ Dedicated CPU
- ⚡ Custom domains ilimitados
- ⚡ Priority support

**Para este proyecto, Free Tier es suficiente!** 💚

---

## 🐛 Troubleshooting

### Error: "Build Failed"

**Solución:**
```bash
# Verificar que el proyecto builde localmente
npm install
npm start

# Si funciona local, revisar logs en Railway
railway logs
```

### Error: "Healthcheck Failed"

**Solución:**
Asegúrate de que `/health` endpoint existe y responde rápido:
```javascript
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});
```

### Error: "Port Already in Use"

**Solución:**
Usa `process.env.PORT` (Railway lo asigna dinámicamente):
```javascript
const PORT = process.env.PORT || 3000;
app.listen(PORT);
```

### Error: "Environment Variables Not Found"

**Solución:**
```bash
# Verificar variables
railway variables

# Agregar las faltantes
railway variables set VARIABLE_NAME=value
```

---

## 🔒 Seguridad

### Variables de Entorno Sensibles

**NUNCA commitees a Git:**
- ❌ `PRIVATE_KEY`
- ❌ `ENCRYPTION_KEY`
- ❌ `JWT_SECRET`
- ❌ `.env` files

**Siempre usa Railway Variables!** ✅

### HTTPS

Railway provee HTTPS automáticamente:
- ✅ Certificado SSL gratis
- ✅ Auto-renovación
- ✅ HTTP → HTTPS redirect

### Rate Limiting

Ya implementado en `backend/server.js`:
```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
```

---

## 🚀 Actualizar Deployment

### Método A: Push a GitHub

```bash
git add .
git commit -m "feat: Update agents"
git push
```

Railway detecta el push y despliega automáticamente! ✨

### Método B: CLI

```bash
railway up
```

---

## 🌐 Multi-Chain en Producción

### Cambiar a Base Mainnet (Recomendado para producción)

1. **Actualizar variables en Railway:**
```env
# Base Mainnet
RPC_URL=https://mainnet.base.org
USDC_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
```

2. **Re-deploy:**
```bash
railway up
```

### X402 Facilitator

Ya integrado! No requiere configuración adicional.
- ✅ Gasless payments
- ✅ 13+ chains
- ✅ 2-3 segundos de confirmación

---

## 📈 Roadmap Post-Deploy

### Inmediato (Después del deploy)
- [ ] Probar healthcheck
- [ ] Verificar frontend
- [ ] Probar API endpoints
- [ ] Configurar dominio custom

### Corto Plazo (1-2 semanas)
- [ ] Integrar PostgreSQL (Railway Postgres)
- [ ] Configurar monitoreo avanzado
- [ ] Agregar analytics
- [ ] Setup alertas

### Mediano Plazo (1 mes)
- [ ] Integrar Claude API real
- [ ] WebSockets para streaming
- [ ] Sistema de logs centralizado
- [ ] Database backups automáticos

---

## 🔗 Enlaces Útiles

- **Railway Docs:** https://docs.railway.com
- **Railway CLI:** https://docs.railway.com/develop/cli
- **Node.js Guide:** https://docs.railway.com/guides/nodejs
- **Express Guide:** https://docs.railway.com/guides/express
- **Status Page:** https://status.railway.app

---

## 📞 Soporte

### Railway Support
- Discord: https://discord.gg/railway
- Twitter: @Railway
- Email: team@railway.app

### Proyecto Support
- GitHub Issues: Tu repositorio
- Documentación: Ver `TASK_TRACKER.md`

---

## ✅ Checklist Pre-Deploy

- [ ] `.gitignore` configurado
- [ ] Variables de entorno preparadas
- [ ] `railway.json` presente
- [ ] Health endpoint funciona
- [ ] Port usa `process.env.PORT`
- [ ] `npm start` funciona localmente
- [ ] Frontend assets en `/frontend`
- [ ] Contratos desplegados en blockchain
- [ ] USDC de prueba en wallet

---

## 🎉 ¡Listo para Deploy!

**Comando rápido:**
```bash
# Opción 1: Desde GitHub
git push origin main
# Railway detecta y despliega automáticamente

# Opción 2: Desde CLI
railway up
```

**Tu app estará live en ~2 minutos!** 🚀

---

**Última actualización:** 2025-11-04
**Versión:** 2.1.0
