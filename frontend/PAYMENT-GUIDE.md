# 💳 Guía de Pagos - AI Agent Hub

## 🎯 Proceso Completo (Paso a Paso)

### ✅ Preparación Inicial

#### 1. Obtener ETH de Sepolia (para gas)
- Ve a: https://sepoliafaucet.com/
- O: https://www.alchemy.com/faucets/ethereum-sepolia
- Conecta tu wallet
- Solicita 0.5 ETH (gratis)
- Espera ~30 segundos

#### 2. Obtener USDC de Sepolia
- Ve a: https://faucet.circle.com/
- Conecta tu wallet
- Selecciona "Sepolia Testnet"
- Solicita USDC (gratis)
- Espera la confirmación

---

## 🔐 Proceso de Aprobación (IMPORTANTE)

### ¿Por qué necesito aprobar?

Los contratos inteligentes **NO pueden** mover tus tokens sin tu permiso explícito. Esta es una **característica de seguridad** del estándar ERC-20.

### ¿Qué es la aprobación?

Es una transacción que le dice al contrato USDC:
> "Permito que el contrato PaymentProcessor mueva hasta X cantidad de mis USDC"

### Paso a paso:

1. **Conecta tu wallet** → Haz clic en "Conectar Wallet"

2. **Verifica que tienes USDC** → Mira tu "Balance USDC" en la parte superior

3. **Ve a la sección de aprobación** → Busca "✅ Paso IMPORTANTE: Aprobar USDC"

4. **Elige cuánto aprobar:**
   - **0.01 USDC** → ~10 consultas al Weather Agent
   - **0.1 USDC** → ~100 consultas
   - **1 USDC** → ~1000 consultas (recomendado para testing)

5. **Haz clic en "💳 Aprobar USDC"**

6. **Confirma en tu wallet** (MetaMask mostrará los detalles)

7. **Espera la confirmación** (~15 segundos en Sepolia)

8. **¡Listo!** Ahora puedes hacer pagos

---

## 💰 Hacer un Pago

Una vez que aprobaste USDC:

1. **Elige un agente:**
   - 🌤️ Weather Agent: 0.001 USDC
   - 👔 Fashion Agent: 0.003 USDC
   - 🎯 Activities Agent: 0.008 USDC

2. **Selecciona una ciudad** del dropdown

3. **Haz clic en "💳 Pagar y Consultar"**

4. **Confirma la transacción** en tu wallet

5. **Espera:** La app hará dos cosas:
   - ✅ Crear el pago on-chain (~15s)
   - ✅ Consultar al agente (~3s)

6. **Ver resultado:** La respuesta aparecerá en la tarjeta del agente

---

## ❌ Errores Comunes

### Error: "ERC20: transfer amount exceeds allowance"

**Causa:** No aprobaste USDC o la aprobación no es suficiente.

**Solución:**
1. Ve a la sección "Aprobar USDC"
2. Aprueba al menos la cantidad que necesitas
3. Espera la confirmación
4. Intenta el pago nuevamente

---

### Error: "Balance insuficiente"

**Causa:** No tienes suficiente USDC.

**Solución:**
1. Ve a https://faucet.circle.com/
2. Solicita más USDC
3. Recarga la página
4. Intenta nuevamente

---

### Error: "Insufficient funds for gas"

**Causa:** No tienes suficiente ETH para pagar el gas.

**Solución:**
1. Ve a https://sepoliafaucet.com/
2. Solicita más ETH
3. Espera ~30 segundos
4. Intenta nuevamente

---

### Error: "User rejected the transaction"

**Causa:** Rechazaste la transacción en tu wallet.

**Solución:**
- Simplemente haz clic en "Pagar y Consultar" nuevamente
- Acepta la transacción en tu wallet

---

## 🔍 Verificar Transacciones

Todas las transacciones se muestran con un link a Sepolia Etherscan.

Ejemplo:
```
✅ Pago confirmado!
TX: 0x1234...abcd
```

Haz clic en el hash de la transacción para ver:
- Estado de la transacción
- Gas usado
- Eventos emitidos
- Detalles del contrato

---

## 💡 Tips y Mejores Prácticas

### Para Development/Testing:

1. **Aprueba una cantidad generosa** (1-10 USDC)
   - Así no tienes que aprobar cada vez
   - Puedes hacer múltiples pruebas

2. **Guarda el hash de transacción**
   - Útil para debugging
   - Puedes ver exactamente qué pasó on-chain

3. **Verifica el evento PaymentCreated**
   - Abre la transacción en Etherscan
   - Ve a la pestaña "Logs"
   - Deberías ver el evento con todos los detalles

### Para Producción:

1. **Aprueba solo lo necesario**
   - Mejor seguridad
   - Menos riesgo si hay un bug

2. **Verifica el contrato primero**
   - Revisa el código en Etherscan
   - Verifica que esté verificado y audited

3. **Usa un límite de gas razonable**
   - La app lo calcula automáticamente
   - Pero puedes ajustarlo manualmente en MetaMask

---

## 📊 Costos Estimados (Sepolia Testnet)

| Operación | Costo USDC | Costo Gas (ETH) | Tiempo |
|-----------|-----------|----------------|---------|
| Aprobar USDC | 0 | ~0.0001 | ~15s |
| Weather Agent | 0.001 | ~0.0002 | ~15s |
| Fashion Agent | 0.003 | ~0.0002 | ~15s |
| Activities Agent | 0.008 | ~0.0002 | ~15s |

**Total para empezar:** ~0.5 ETH + 0.1 USDC (gratis en testnet)

---

## 🔗 Enlaces Útiles

- **Sepolia ETH Faucet:** https://sepoliafaucet.com/
- **Circle USDC Faucet:** https://faucet.circle.com/
- **Sepolia Etherscan:** https://sepolia.etherscan.io/
- **PaymentProcessor Contract:** https://sepolia.etherscan.io/address/0x231eA77d88603F40C48Ad98f085F5646523bCe74
- **USDC Contract:** https://sepolia.etherscan.io/address/0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238

---

## ❓ FAQ

**P: ¿Tengo que aprobar antes de cada pago?**
R: No. Una sola aprobación te permite hacer múltiples pagos hasta que se agote el monto aprobado.

**P: ¿Puedo aprobar una cantidad ilimitada?**
R: Técnicamente sí (usando `type(uint256).max`), pero no es recomendable por seguridad.

**P: ¿Qué pasa si apruebo 1 USDC pero solo necesito 0.001?**
R: El contrato solo usará 0.001 USDC. Los 0.999 restantes quedan aprobados para futuros pagos.

**P: ¿Puedo revocar la aprobación?**
R: Sí. Simplemente aprueba 0 USDC y el contrato ya no podrá mover tus tokens.

**P: ¿Por qué necesito ETH si pago con USDC?**
R: El ETH se usa para pagar el "gas" (costo de procesamiento) de las transacciones en la red Ethereum.

**P: ¿Los agentes realmente funcionan?**
R: Sí! Una vez confirmado el pago on-chain, el agente procesa tu consulta y devuelve una respuesta real.
