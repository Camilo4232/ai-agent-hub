# 🚀 Inicio Rápido - Web3 Integration

## ⚡ El problema: Wallet no se detecta

Si estás viendo este mensaje: **"No se detectó ninguna wallet"**, es porque estás abriendo el archivo HTML directamente.

## ✅ Solución en 3 pasos:

### Windows:

```bash
# Opción 1: Servidor Python (más fácil)
cd frontend
python -m http.server 8000

# Opción 2: Script automático
cd frontend
start-server.bat

# Opción 3: Node.js (más rápido)
cd frontend
node server.js
```

### Mac/Linux:

```bash
# Hacer el script ejecutable (solo la primera vez)
chmod +x start-server.sh

# Iniciar servidor
./start-server.sh
```

## 🌐 Abrir en el navegador:

Una vez que el servidor esté corriendo, abre:

- **App principal:** http://localhost:8000/web3-integration.html
- **Diagnóstico:** http://localhost:8000/test-wallet-detection.html

## 🎯 ¿Qué hacer ahora?

1. **Instala una wallet** (si no tienes):
   - [MetaMask](https://metamask.io)
   - [Coinbase Wallet](https://www.coinbase.com/wallet)
   - [Rainbow](https://rainbow.me)

2. **Inicia el servidor** (comandos de arriba)

3. **Abre** http://localhost:8000/web3-integration.html

4. **Haz clic** en "Conectar Wallet"

5. **¡Listo!** 🎉

## 🔧 Diagnóstico

Si sigues teniendo problemas, abre:

http://localhost:8000/test-wallet-detection.html

Esta página te mostrará:
- ✓ Si tu wallet está instalada
- ✓ Qué wallet detectó
- ✓ Información de depuración completa

## 📚 Más ayuda

Lee `README-WALLET.md` para solución detallada de problemas.
