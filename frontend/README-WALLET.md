# 🔧 Solución de Problemas - Detección de Wallet

## ⚠️ Problema: "No se detecta ninguna wallet"

### Causa más común: Archivo abierto con `file://`

Las extensiones de wallets (MetaMask, Coinbase, etc.) **NO funcionan** cuando abres archivos HTML directamente desde el explorador de archivos (protocolo `file://`).

### ✅ Solución: Usar un servidor HTTP local

## 🚀 Inicio Rápido

### Opción 1: Usar el script (Windows)

1. Abre `start-server.bat` (doble clic)
2. Abre tu navegador en: http://localhost:8000/web3-integration.html

### Opción 2: Python (Windows/Mac/Linux)

```bash
cd frontend
python -m http.server 8000
```

Luego abre: http://localhost:8000/web3-integration.html

### Opción 3: Node.js

```bash
cd frontend
npx http-server -p 8000
```

Luego abre: http://localhost:8000/web3-integration.html

### Opción 4: PHP

```bash
cd frontend
php -S localhost:8000
```

Luego abre: http://localhost:8000/web3-integration.html

## 🔍 Diagnóstico

Para ver información detallada sobre la detección de tu wallet:

1. Inicia el servidor (cualquier opción de arriba)
2. Abre: http://localhost:8000/test-wallet-detection.html
3. Verás un diagnóstico completo que muestra:
   - Si tu wallet está instalada
   - Qué wallet es
   - Si está funcionando correctamente
   - Prueba de conexión

## ✅ Checklist de Solución de Problemas

- [ ] **Usar HTTP, no file://** - El archivo DEBE abrirse con http://localhost, NO con file://
- [ ] **Wallet instalada** - Verifica que MetaMask u otra wallet esté instalada
- [ ] **Extensión habilitada** - Verifica que la extensión no esté deshabilitada
- [ ] **Navegador compatible** - Chrome, Firefox, Brave, Edge (NO Internet Explorer)
- [ ] **Recarga la página** - Presiona F5 después de instalar la wallet
- [ ] **Revisa la consola** - Presiona F12 y busca errores

## 🎯 Wallets Soportadas

Las siguientes wallets son compatibles con esta aplicación:

- ✅ **MetaMask** (navegador y móvil)
- ✅ **Coinbase Wallet** (navegador y móvil)
- ✅ **Brave Wallet** (integrada en Brave Browser)
- ✅ **Rainbow Wallet**
- ✅ **Trust Wallet**
- ✅ **Rabby Wallet**
- ✅ Cualquier wallet compatible con EIP-1193 (Ethereum Provider API)

## 📝 Notas Adicionales

### Si tienes múltiples wallets instaladas

Si tienes varias wallets instaladas, el navegador puede tener conflictos. La aplicación detectará esto y te lo mostrará en la consola.

**Solución:** Desactiva temporalmente las wallets que no vas a usar.

### Si usas Brave Browser

Brave tiene una wallet integrada que puede entrar en conflicto con MetaMask u otras extensiones.

**Solución:**
1. Ve a `brave://settings/wallet`
2. Cambia "Default cryptocurrency wallet" a la wallet que quieras usar

### Si el problema persiste

1. Abre la consola del navegador (F12)
2. Busca mensajes en rojo (errores)
3. Copia el error y reporta el issue

## 🔗 Enlaces Útiles

- [Descargar MetaMask](https://metamask.io)
- [Descargar Coinbase Wallet](https://www.coinbase.com/wallet)
- [Descargar Rainbow](https://rainbow.me)
- [Sepolia Faucet (ETH)](https://sepoliafaucet.com/)
- [Circle Faucet (USDC)](https://faucet.circle.com/)

## ⚡ Resumen Ejecutivo

```
SI TIENES ESTE ERROR: "No se detectó ninguna wallet"

1. NO abras el archivo directamente desde Windows Explorer
2. Ejecuta: start-server.bat
3. Abre: http://localhost:8000/web3-integration.html
4. ¡Listo!
```
