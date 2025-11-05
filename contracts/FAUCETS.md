# Testnet Faucets

Para desplegar contratos en testnets, necesitas tokens nativos (ETH/MATIC/etc.) para gas.

**Tu dirección de deployment:** `0xda77B09a90Dcb4E1b10CDEaeCaEfa343BA491bc0`

---

## Ethereum Sepolia ✅
**Status:** Ya desplegado

- **Faucet 1:** https://sepoliafaucet.com
- **Faucet 2:** https://www.alchemy.com/faucets/ethereum-sepolia
- **Faucet 3:** https://sepolia-faucet.pk910.de

---

## Base Sepolia ✅
**Status:** Ya desplegado

- **Faucet 1:** https://www.alchemy.com/faucets/base-sepolia
- **Faucet 2:** https://docs.base.org/tools/network-faucets
- **Bridge:** Usa Sepolia Faucet y bridge a Base Sepolia

---

## Polygon Amoy 🔄
**Status:** Pendiente (sin fondos)

- **Faucet 1:** https://faucet.polygon.technology
- **Faucet 2:** https://www.alchemy.com/faucets/polygon-amoy
- **Faucet 3:** https://mumbaifaucet.com (redirect to Amoy)

**Pasos:**
1. Visita https://faucet.polygon.technology
2. Selecciona "Amoy Testnet"
3. Ingresa tu dirección: `0xda77B09a90Dcb4E1b10CDEaeCaEfa343BA491bc0`
4. Obtén 0.5 MATIC

---

## Optimism Sepolia 🔄
**Status:** Pendiente (sin fondos)

- **Faucet 1:** https://www.alchemy.com/faucets/optimism-sepolia
- **Faucet 2:** https://app.optimism.io/faucet
- **Faucet 3:** https://optimismfaucet.xyz

**Pasos:**
1. Visita https://app.optimism.io/faucet
2. Conecta wallet o ingresa dirección
3. Obtén ETH en Optimism Sepolia

---

## Arbitrum Sepolia 🔄
**Status:** Pendiente (sin fondos)

- **Faucet 1:** https://www.alchemy.com/faucets/arbitrum-sepolia
- **Faucet 2:** https://faucet.quicknode.com/arbitrum/sepolia
- **Faucet 3:** https://faucet.triangleplatform.com/arbitrum/sepolia

**Pasos:**
1. Visita https://faucet.quicknode.com/arbitrum/sepolia
2. Ingresa tu dirección: `0xda77B09a90Dcb4E1b10CDEaeCaEfa343BA491bc0`
3. Obtén 0.05 ETH

---

## Celo Alfajores 🔄
**Status:** Pendiente (sin fondos)

- **Faucet 1:** https://faucet.celo.org
- **Faucet 2:** https://celo.org/developers/faucet
- **Faucet 3:** https://stakely.io/en/faucet/celo-alfajores

**Pasos:**
1. Visita https://faucet.celo.org/alfajores
2. Ingresa tu dirección: `0xda77B09a90Dcb4E1b10CDEaeCaEfa343BA491bc0`
3. Obtén 5 CELO

---

## Verificar Balances

Puedes verificar tus balances en:

- **Sepolia:** https://sepolia.etherscan.io/address/0xda77B09a90Dcb4E1b10CDEaeCaEfa343BA491bc0
- **Base Sepolia:** https://sepolia.basescan.org/address/0xda77B09a90Dcb4E1b10CDEaeCaEfa343BA491bc0
- **Polygon Amoy:** https://amoy.polygonscan.com/address/0xda77B09a90Dcb4E1b10CDEaeCaEfa343BA491bc0
- **Optimism Sepolia:** https://sepolia-optimism.etherscan.io/address/0xda77B09a90Dcb4E1b10CDEaeCaEfa343BA491bc0
- **Arbitrum Sepolia:** https://sepolia.arbiscan.io/address/0xda77B09a90Dcb4E1b10CDEaeCaEfa343BA491bc0
- **Celo Alfajores:** https://alfajores.celoscan.io/address/0xda77B09a90Dcb4E1b10CDEaeCaEfa343BA491bc0

---

## Después de Obtener Fondos

Una vez tengas fondos en una red, ejecuta:

```bash
cd contracts
npx hardhat run scripts/deploy-multichain.js --network <network-name>
```

Redes disponibles:
- `polygon-amoy`
- `optimism-sepolia`
- `arbitrum-sepolia`
- `celo-alfajores`

Después de cada deployment, regenera la configuración del frontend:

```bash
node scripts/generate-frontend-config.js
```
