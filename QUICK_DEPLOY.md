# ⚡ Quick Deploy Guide - 5 Minutes to Production

**Despliega tu AI Agent Hub en Railway en menos de 5 minutos**

---

## 🚀 Opción 1: Deploy Automático (Más Rápido)

### Windows
```batch
scripts\railway-deploy.bat
```

### Mac/Linux
```bash
chmod +x scripts/railway-deploy.sh
./scripts/railway-deploy.sh
```

El script hace todo automáticamente:
- ✅ Instala Railway CLI si no existe
- ✅ Verifica autenticación
- ✅ Inicializa proyecto
- ✅ Verifica variables de entorno
- ✅ Ejecuta deploy
- ✅ Te da la URL final

---

## 🚀 Opción 2: Deploy Manual (5 pasos)

### 1. Instalar Railway CLI
```bash
npm install -g @railway/cli
```

### 2. Login
```bash
railway login
```

### 3. Inicializar Proyecto
```bash
railway init
```

### 4. Configurar Variables de Entorno

**Método A: Desde archivo .env**
```bash
railway variables set --from-env-file .env
```

**Método B: Manualmente**
```bash
railway variables set NODE_ENV=production
railway variables set RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
railway variables set PRIVATE_KEY=tu_private_key
# ... etc
```

### 5. Deploy!
```bash
railway up
```

✨ **¡Listo!** Tu app estará en `https://ai-agent-hub-production.up.railway.app`

---

## 🚀 Opción 3: Deploy desde GitHub (Click & Deploy)

### 1. Push a GitHub
```bash
git init
git add .
git commit -m "feat: Initial deploy"
git remote add origin https://github.com/TU_USUARIO/ai-agent-hub.git
git push -u origin main
```

### 2. Conectar Railway
1. Ve a https://railway.app
2. Click "New Project"
3. Selecciona "Deploy from GitHub"
4. Autoriza Railway
5. Selecciona tu repo
6. ✨ Railway despliega automáticamente!

### 3. Configurar Variables
En Railway dashboard → Variables → Pega estas variables:
```env
NODE_ENV=production
RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
PRIVATE_KEY=tu_private_key_aqui
AGENT_REGISTRY_ADDRESS=0x5a50a736bEea9D7120E3FD915E90d2940B5bF228
PAYMENT_PROCESSOR_ADDRESS=0x97CA3e550b7b6091A652645e89f98946Cda5Ac08
USDC_ADDRESS=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
ENCRYPTION_KEY=tu_encryption_key
JWT_SECRET=tu_jwt_secret
PAYMENT_RECIPIENT=tu_wallet_address
```

---

## 🚀 Opción 4: Deploy con Docker

### Localmente
```bash
docker build -t ai-agent-hub .
docker run -p 3000:3000 --env-file .env ai-agent-hub
```

### Docker Compose
```bash
docker-compose up -d
```

### Railway con Docker
Railway detecta automáticamente el Dockerfile y lo usa!

---

## ✅ Verificar Deploy

### 1. Health Check
```bash
curl https://tu-app.up.railway.app/health
```

### 2. Abrir en Navegador
```
https://tu-app.up.railway.app/
```

### 3. Ver Logs
```bash
railway logs
```

---

## 🔧 Variables de Entorno Requeridas

Mínimas para funcionar:
```env
NODE_ENV=production
RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
PRIVATE_KEY=tu_private_key_aqui
AGENT_REGISTRY_ADDRESS=0x5a50a736bEea9D7120E3FD915E90d2940B5bF228
PAYMENT_PROCESSOR_ADDRESS=0x97CA3e550b7b6091A652645e89f98946Cda5Ac08
USDC_ADDRESS=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
```

---

## 🎯 URLs Post-Deploy

Después del deploy, tendrás acceso a:

| Endpoint | URL | Descripción |
|----------|-----|-------------|
| **Frontend** | `https://tu-app.railway.app/` | Interfaz principal |
| **Web3** | `https://tu-app.railway.app/web3` | Pagos con wallet |
| **Health** | `https://tu-app.railway.app/health` | Estado del servidor |
| **API Status** | `https://tu-app.railway.app/api/status` | Info de agentes |
| **Weather** | `POST /api/agents/weather/query` | Agente del clima |
| **Fashion** | `POST /api/agents/fashion/query` | Agente de moda |
| **Activities** | `POST /api/agents/activities/query` | Agente de actividades |

---

## 💡 Tips Rápidos

### Ver URL de tu deploy
```bash
railway domain
```

### Ver logs en tiempo real
```bash
railway logs --follow
```

### Abrir en navegador
```bash
railway open
```

### Actualizar variables
```bash
railway variables set VARIABLE_NAME=new_value
```

### Re-deploy
```bash
# Opción 1: Push a GitHub (auto-redeploy)
git push

# Opción 2: CLI
railway up
```

---

## 🐛 Troubleshooting Express

### "Build failed"
```bash
# Verificar localmente
npm install
npm start
```

### "Health check failed"
Asegúrate de tener el endpoint `/health`:
```javascript
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});
```

### "Port already in use"
Usa `process.env.PORT`:
```javascript
const PORT = process.env.PORT || 3000;
```

---

## 💰 Costo Estimado

### Free Tier (Hobby)
- **Costo:** $5 USD/mes de crédito GRATIS
- **RAM:** 512 MB
- **Disco:** 1 GB
- **Suficiente para:** Testing, demos, proyectos personales

**Este proyecto cabe perfectamente en Free Tier!** 💚

---

## 🎉 ¡Ya está!

Tu AI Agent Hub estará live en:
```
https://ai-agent-hub-production.up.railway.app
```

Tiempo estimado: **2-5 minutos** ⚡

---

**Para más detalles:** Ver `RAILWAY_DEPLOY.md`
**Última actualización:** 2025-11-04
