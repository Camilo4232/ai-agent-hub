# 🦊 Guía para Probar MetaMask

## Requisitos Previos

1. **Instalar MetaMask**
   - Chrome/Brave/Edge: https://metamask.io/download/
   - Firefox: Busca "MetaMask" en Add-ons

2. **Configurar MetaMask**
   - Crea una wallet o importa una existente
   - Asegúrate de tener algo de ETH en Sepolia testnet (opcional)

## Pasos para Probar la Conexión

### 1. Inicia el Servidor Backend
```bash
cd ai-agent-hub
npm start
```

Deberías ver: `✓ Server running on port 3000`

### 2. Abre el Frontend
```
Abre en tu navegador: frontend/web3-integration.html
```

**IMPORTANTE:** Debes abrir el archivo usando:
- `file:///...` (funciona para demo básico)
- O mejor aún, desde un servidor local:
  ```bash
  # Opción 1: Python
  cd frontend
  python -m http.server 8080
  # Abre: http://localhost:8080/web3-integration.html

  # Opción 2: Node
  npx http-server frontend -p 8080
  # Abre: http://localhost:8080/web3-integration.html
  ```

### 3. Abre la Consola del Navegador
```
Presiona F12 o clic derecho → "Inspeccionar" → Pestaña "Console"
```

### 4. Verifica los Logs Iniciales
Deberías ver en la consola:
```
Página cargada
ethers disponible: true
ethers.js versión: 5.7.2
Sistema listo para conectar MetaMask
MetaMask detectado y listo
```

### 5. Haz Clic en "Conectar MetaMask"

**Lo que debería pasar:**
1. Se abre popup de MetaMask
2. Seleccionas la cuenta
3. Autorizas la conexión
4. El botón cambia a "✓ Conectado" (verde)
5. Se muestra tu dirección de wallet
6. Se intenta obtener el balance de USDC

**En la consola verás:**
```
Intentando conectar wallet...
MetaMask detectado: true
Solicitando cuentas...
Cuentas recibidas: ["0x..."]
Provider creado: ...
Dirección del usuario: 0x...
Actualizando balance USDC...
Datos del servidor: {...}
Conexión completada exitosamente!
```

## ❌ Solución de Problemas

### Error: "MetaMask no detectado"
- **Solución:** Instala MetaMask desde https://metamask.io
- Reinicia el navegador después de instalar

### Error: "ethers is not defined"
- **Solución:** Verifica tu conexión a internet
- El CDN de ethers.js debe cargar correctamente
- Intenta recargar la página (Ctrl+F5)

### Error: "User rejected the request"
- **Solución:** Hiciste clic en "Cancelar" en MetaMask
- Vuelve a intentar conectar

### El balance USDC muestra "0.00 USDC (Demo)"
- **Normal:** Esto significa que estás en modo demo (sin blockchain real)
- Para usar blockchain real, necesitas configurar el backend:
  ```bash
  npm run setup
  # Configura RPC_URL y PRIVATE_KEY
  npm run contracts:deploy
  ```

### Error en la consola al obtener balance
- **Normal si no tienes blockchain configurado**
- El sistema funciona en modo demo sin problema
- Los pagos serán simulados localmente

## ✅ Verificación Exitosa

Si ves esto, **¡funciona correctamente!**:
- ✓ Botón cambia a "✓ Conectado" (verde)
- ✓ Dirección de wallet visible (0x...)
- ✓ Balance USDC muestra algún valor
- ✓ No hay errores rojos en la consola

## 🎯 Próximos Pasos

Una vez conectado, puedes:

1. **Registrar un Agente**
   - Completa el formulario
   - Clic en "Registrar Agente"

2. **Ver Agentes Activos**
   - Clic en "Actualizar Lista"
   - Se cargan desde el backend

3. **Probar con Blockchain Real** (Avanzado)
   - Configura Sepolia testnet
   - Obtén ETH de prueba: https://sepoliafaucet.com/
   - Ejecuta: `npm run contracts:deploy`

## 🐛 Debug Avanzado

Si aún tienes problemas, ejecuta esto en la consola del navegador:

```javascript
// Verificar ethers
console.log('ethers:', typeof ethers);
console.log('ethers.version:', ethers?.version);

// Verificar MetaMask
console.log('ethereum:', typeof window.ethereum);
console.log('isMetaMask:', window.ethereum?.isMetaMask);

// Probar conexión manual
window.ethereum.request({ method: 'eth_requestAccounts' })
  .then(accounts => console.log('Cuentas:', accounts))
  .catch(err => console.error('Error:', err));
```

## 📞 Soporte

Si nada funciona:
1. Verifica que MetaMask esté instalado y desbloqueado
2. Revisa la consola del navegador para errores específicos
3. Asegúrate de que el backend esté corriendo (`npm start`)
4. Intenta con otro navegador (Chrome/Brave recomendados)

---

**Archivo actualizado:** `frontend/web3-integration.html`
**Cambios:** ✅ Migrado a ethers v5 + Logs mejorados + Mejor manejo de errores
