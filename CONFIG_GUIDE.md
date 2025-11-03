# ⚙️ Guía de Configuración Completa

Esta guía te ayudará a configurar el proyecto paso a paso.

## 🚀 Inicio Rápido (2 minutos)

### Opción 1: Setup Automático

```bash
# 1. Clonar/descargar el proyecto
cd ai-agent-hub

# 2. Ejecutar setup wizard
npm run setup

# 3. Instalar dependencias
npm run install:all

# 4. Verificar configuración
npm run check

# 5. Iniciar servidor
npm start
```

### Opción 2: Manual (Demo Mode)

```bash
# 1. Instalar dependencias
npm install

# 2. Crear .env (ya existe por defecto en modo demo)
# No requiere configuración adicional

# 3. Iniciar
npm start
```

## 📋 Comandos Disponibles

### Proyecto Principal

```bash
# Desarrollo
npm start                # Iniciar servidor
npm run dev             # Iniciar con hot-reload
npm run agent           # Ejecutar agente de ejemplo

# Setup
npm run setup           # Wizard de configuración
npm run check           # Verificar configuración
npm run install:all     # Instalar todas las dependencias

# Contratos (si usas blockchain)
npm run contracts:install   # Instalar deps de contratos
npm run contracts:compile   # Compilar contratos
npm run contracts:deploy    # Desplegar a Sepolia
npm run contracts:test      # Ejecutar tests
```

### Contratos (dentro de /contracts)

```bash
cd contracts

npm run compile         # Compilar contratos
npm run deploy          # Desplegar a Sepolia
npm run deploy:local    # Desplegar a localhost
npm run test            # Ejecutar tests
npm run node            # Iniciar nodo local Hardhat
npm run clean           # Limpiar artifacts
```

## 🔧 Configuración Detallada

### 1. Archivo .env

El archivo `.env` controla el comportamiento del proyecto.

#### Modo Demo (Por defecto)

```bash
# Demo Mode - No blockchain required
PORT=3000
AGENT_PORT=3001
```

En este modo:
- ✅ No requiere blockchain
- ✅ Pagos simulados
- ✅ Todo funciona localmente
- ❌ Sin NFTs reales
- ❌ Sin pagos USDC reales

#### Modo Blockchain (Producción)

```bash
# Blockchain Configuration
RPC_URL=https://sepolia.infura.io/v3/TU_API_KEY
PRIVATE_KEY=tu_clave_privada_sin_0x

# Contract Addresses (después de deployment)
AGENT_REGISTRY_ADDRESS=0x...
PAYMENT_PROCESSOR_ADDRESS=0x...
USDC_ADDRESS=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238

# Server
PORT=3000
AGENT_PORT=3001

# Payment
PAYMENT_RECIPIENT=0xTU_WALLET_ADDRESS
```

En este modo:
- ✅ Pagos USDC reales
- ✅ NFTs en blockchain
- ✅ Registro on-chain
- ✅ Sistema completo
- ⚠️ Requiere setup adicional

### 2. Obtener RPC_URL

**Opción A: Infura**
1. Ve a https://infura.io
2. Crea cuenta gratuita
3. Crea nuevo proyecto
4. Copia la URL de Sepolia
5. Formato: `https://sepolia.infura.io/v3/TU_API_KEY`

**Opción B: Alchemy**
1. Ve a https://alchemy.com
2. Crea cuenta gratuita
3. Crea app para Sepolia
4. Copia la HTTPS URL
5. Formato: `https://eth-sepolia.g.alchemy.com/v2/TU_API_KEY`

### 3. Obtener PRIVATE_KEY

⚠️ **IMPORTANTE**: Nunca compartas tu clave privada real con fondos.

**Para testing (Sepolia):**

1. Abre MetaMask
2. Selecciona la cuenta de prueba
3. Click en los 3 puntos → Detalles de la cuenta
4. Click en "Exportar clave privada"
5. Ingresa contraseña
6. Copia la clave (SIN el 0x)

**Seguridad:**
- Usa wallet separada solo para testing
- Nunca uses wallet con fondos reales
- Nunca subas .env a Git (ya está en .gitignore)

### 4. Obtener Fondos de Prueba

**Sepolia ETH (para gas):**
- https://sepoliafaucet.com
- https://sepolia-faucet.pk910.de
- https://faucet.quicknode.com/ethereum/sepolia

**Sepolia USDC (para pagos):**
- https://faucet.circle.com
- Conecta wallet
- Solicita USDC de prueba

### 5. Desplegar Contratos

```bash
# 1. Compilar
npm run contracts:compile

# Deberías ver:
# ✓ Compiled 2 Solidity files successfully

# 2. Desplegar a Sepolia
npm run contracts:deploy

# Deberías ver:
# ✅ PaymentProcessor deployed to: 0xABC...
# ✅ AgentRegistryV2 deployed to: 0xDEF...
# 📄 Deployment info saved to: contracts/deployment.json

# 3. Actualizar .env
# Copia las direcciones al archivo .env
```

### 6. Verificar Configuración

```bash
npm run check
```

Esto te mostrará:
- ✅ Estado de archivos de configuración
- ✅ Variables de entorno configuradas
- ✅ Modo de operación (Demo/Blockchain)
- ✅ Estado de contratos
- ⚠️ Advertencias si falta algo

## 📊 Estructura de Configuración

```
ai-agent-hub/
├── .env                    # Configuración principal (NO subir a Git)
├── .env.example            # Plantilla de ejemplo
├── package.json            # Dependencias y scripts
│
├── contracts/
│   ├── .env               # Compartido con raíz (symlink)
│   ├── package.json       # Dependencias de Hardhat
│   ├── hardhat.config.js  # Configuración de Hardhat
│   └── deployment.json    # Direcciones desplegadas (auto-generado)
│
└── scripts/
    ├── setup.js           # Wizard de configuración
    └── check-config.js    # Verificación de config
```

## 🔍 Troubleshooting

### Error: "Cannot find module"

```bash
# Solución
npm install
cd contracts && npm install
```

### Error: "Invalid RPC URL"

```bash
# Verificar que RPC_URL esté correcto
# Debe empezar con https://
# No debe tener espacios
# Debe incluir tu API key
```

### Error: "Insufficient funds"

```bash
# Necesitas más Sepolia ETH
# Usa los faucets mencionados arriba
```

### Error: "USDC transfer failed"

```bash
# 1. Verifica que tengas USDC en Sepolia
# 2. Verifica la dirección del contrato USDC
# 3. Aprueba USDC antes de crear pago
```

### Warning: "Blockchain not available"

Esto es normal si:
- No configuraste RPC_URL
- No configuraste PRIVATE_KEY
- Estás en modo demo

El proyecto funcionará en modo simulación.

### Error: "Contract not deployed"

```bash
# 1. Verifica que compilaste los contratos
npm run contracts:compile

# 2. Verifica que desplegaste
npm run contracts:deploy

# 3. Verifica que actualizaste .env con las direcciones
```

## 🎯 Escenarios Comunes

### Escenario 1: Solo quiero probar rápido

```bash
npm install
npm start
# Abre frontend/index.html
```

### Escenario 2: Quiero desarrollo local completo

```bash
# Terminal 1: Nodo Hardhat local
cd contracts
npx hardhat node

# Terminal 2: Desplegar a local
npm run contracts:deploy:local

# Terminal 3: Servidor
npm start

# Terminal 4: Agente de ejemplo
npm run agent
```

### Escenario 3: Quiero usar Sepolia testnet

```bash
# 1. Configurar .env con RPC_URL y PRIVATE_KEY
npm run setup

# 2. Obtener fondos de prueba (ETH + USDC)

# 3. Desplegar contratos
npm run contracts:compile
npm run contracts:deploy

# 4. Actualizar .env con direcciones de contratos

# 5. Iniciar
npm start
```

### Escenario 4: Quiero contribuir/desarrollar

```bash
# 1. Fork del repo
git clone tu-fork

# 2. Setup completo
npm run install:all
npm run setup

# 3. Crear rama
git checkout -b feature/mi-feature

# 4. Desarrollar
npm run dev  # Hot-reload

# 5. Tests
npm run contracts:test

# 6. Commit y PR
```

## 📚 Variables de Entorno Completas

| Variable | Requerido | Descripción | Ejemplo |
|----------|-----------|-------------|---------|
| `PORT` | No | Puerto del servidor | `3000` |
| `AGENT_PORT` | No | Puerto para agentes | `3001` |
| `RPC_URL` | Sí (blockchain) | URL del RPC de Ethereum | `https://sepolia.infura.io/v3/...` |
| `PRIVATE_KEY` | Sí (blockchain) | Clave privada (sin 0x) | `abc123...` |
| `AGENT_REGISTRY_ADDRESS` | Sí (blockchain) | Dirección del contrato AgentRegistry | `0x123...` |
| `PAYMENT_PROCESSOR_ADDRESS` | Sí (blockchain) | Dirección del contrato PaymentProcessor | `0x456...` |
| `USDC_ADDRESS` | Sí (blockchain) | Dirección del token USDC en Sepolia | `0x1c7D4B...` |
| `PAYMENT_RECIPIENT` | No | Tu dirección de wallet | `0x789...` |

## 🔐 Seguridad

### ✅ Buenas Prácticas

- Usar wallet de prueba separada
- No compartir PRIVATE_KEY
- No subir .env a Git
- Verificar contratos en Etherscan
- Usar HTTPS para RPC

### ❌ Evitar

- Usar wallet con fondos reales en testnet
- Hardcodear claves en el código
- Compartir tu .env
- Desplegar a mainnet sin auditoría

## 🆘 Soporte

Si tienes problemas:

1. Ejecuta `npm run check` para diagnóstico
2. Lee los mensajes de error completos
3. Consulta BLOCKCHAIN_SETUP.md
4. Revisa issues en GitHub
5. Abre un nuevo issue con detalles

---

**¿Listo para comenzar? Ejecuta:**

```bash
npm run setup
```
