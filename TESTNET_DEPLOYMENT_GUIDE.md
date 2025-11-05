# Testnet Deployment Guide - IMMEDIATE ACTIONS REQUIRED

**Last Updated:** November 5, 2025
**Status:** 2/6 Testnets Deployed - Need Manual Faucet Access

---

## ⚠️ CRITICAL ISSUE: Faucets Require Manual Access

All remaining testnet faucets require **manual interaction** (wallet connection, captchas, social media verification). Programmatic API access is NOT available for:
- Polygon Amoy
- Optimism Sepolia
- Arbitrum Sepolia
- Celo Alfajores

---

## 🎯 IMMEDIATE ACTION PLAN

### Step 1: Get Testnet Tokens (MANUAL - Required Now)

**Your Deployment Address:** `0xda77B09a90Dcb4E1b10CDEaeCaEfa343BA491bc0`

Visit each faucet and manually request tokens:

#### 1. Polygon Amoy (Need 0.1+ MATIC)
- **Primary Faucet:** https://faucet.polygon.technology
- **Alternative:** https://www.alchemy.com/faucets/polygon-amoy
- **Alternative:** https://faucet.quicknode.com/polygon/amoy
- **Amount:** Request 0.5 MATIC
- **Wait Time:** 1-2 minutes

#### 2. Optimism Sepolia (Need 0.02+ ETH)
- **Primary Faucet:** https://app.optimism.io/faucet
- **Alternative:** https://www.alchemy.com/faucets/optimism-sepolia
- **Alternative:** https://faucet.quicknode.com/optimism/sepolia
- **Amount:** Request 0.1 ETH
- **Wait Time:** 1-2 minutes

#### 3. Arbitrum Sepolia (Need 0.02+ ETH)
- **Primary Faucet:** https://faucet.quicknode.com/arbitrum/sepolia
- **Alternative:** https://www.alchemy.com/faucets/arbitrum-sepolia
- **Alternative:** https://faucets.chain.link/arbitrum-sepolia
- **Amount:** Request 0.05 ETH
- **Wait Time:** 1-2 minutes

#### 4. Celo Alfajores (Need 0.5+ CELO)
- **Primary Faucet:** https://faucet.celo.org/alfajores
- **Alternative:** https://stakely.io/en/faucet/celo-alfajores
- **Amount:** Request 5 CELO
- **Wait Time:** 1-2 minutes

---

### Step 2: Verify Funds Arrived

Check your balances in block explorers:

```bash
# Polygon Amoy
https://amoy.polygonscan.com/address/0xda77B09a90Dcb4E1b10CDEaeCaEfa343BA491bc0

# Optimism Sepolia
https://sepolia-optimism.etherscan.io/address/0xda77B09a90Dcb4E1b10CDEaeCaEfa343BA491bc0

# Arbitrum Sepolia
https://sepolia.arbiscan.io/address/0xda77B09a90Dcb4E1b10CDEaeCaEfa343BA491bc0

# Celo Alfajores
https://alfajores.celoscan.io/address/0xda77B09a90Dcb4E1b10CDEaeCaEfa343BA491bc0
```

---

### Step 3: AUTOMATED DEPLOYMENT (Run After Getting Tokens)

Once you have tokens, the system will AUTO-DEPLOY. You have TWO OPTIONS:

#### OPTION A: Auto-Monitor Script (Recommended)
This script continuously checks for funds and deploys automatically when available:

```bash
cd contracts
node scripts/auto-deploy-on-funds.js
```

**What it does:**
- Checks balances every 30 seconds
- Automatically deploys when sufficient funds detected
- Regenerates frontend config after each deployment
- Reports progress in real-time
- Stops when all networks deployed

**Keep this running while you visit faucets!**

#### OPTION B: Manual Deployment (If preferred)
Deploy to each network manually after getting tokens:

```bash
cd contracts

# Deploy to Polygon Amoy
npx hardhat run scripts/deploy-multichain.js --network polygon-amoy

# Deploy to Optimism Sepolia
npx hardhat run scripts/deploy-multichain.js --network optimism-sepolia

# Deploy to Arbitrum Sepolia
npx hardhat run scripts/deploy-multichain.js --network arbitrum-sepolia

# Deploy to Celo Alfajores
npx hardhat run scripts/deploy-multichain.js --network celo-alfajores

# Regenerate frontend config
node scripts/generate-frontend-config.js
```

---

### Step 4: Verify Deployments

After deployments complete, check:

```bash
# View deployment status
cat DEPLOYMENT_STATUS.md

# Check deployment files
ls deployments/

# View frontend configuration
cat frontend/chain-config.json
```

---

## 📋 WORKFLOW SUMMARY

1. **NOW:** Visit faucets manually and request tokens for all 4 networks
2. **WHILE WAITING:** Run `node scripts/auto-deploy-on-funds.js` in contracts folder
3. **AUTOMATIC:** Script deploys as funds arrive
4. **VERIFY:** Check DEPLOYMENT_STATUS.md when complete
5. **TEST:** Open frontend/web3-integration.html and test each network

---

## 🚀 EXPECTED TIMELINE

- **Getting Tokens:** 15-30 minutes (manual faucet interaction)
- **Auto-Deployment:** 5-10 minutes per network (once funded)
- **Total Time:** ~1 hour to complete all testnets

---

## ⏭️ AFTER ALL TESTNETS DEPLOYED

### Next Phase: Mainnet Deployment

Once all testnets are functional and tested:

1. **Security Review:** Audit contracts before mainnet
2. **Get Mainnet Private Key:** Separate from testnet key
3. **Fund Mainnet Address:** Real ETH/MATIC/AVAX for gas
4. **Deploy to Mainnets:** Use same scripts with mainnet networks
5. **Monitor Liquidity:** Ensure sufficient USDC in PaymentProcessor

**Mainnet Networks Ready:**
- Base Mainnet (Chain ID: 8453)
- Polygon Mainnet (Chain ID: 137)
- Optimism Mainnet (Chain ID: 10)
- Arbitrum Mainnet (Chain ID: 42161)
- Avalanche C-Chain (Chain ID: 43114)
- Celo Mainnet (Chain ID: 42220)

---

## 🔧 TROUBLESHOOTING

### "Account has no balance"
**Solution:** Get tokens from faucets (see Step 1 above)

### "Network connection timeout"
**Solution:** Celo RPC has been updated with longer timeout (fixed in hardhat.config.js)

### "Deployment failed"
**Solution:** Check gas limits, RPC endpoint, and retry

### Frontend not loading contracts
**Solution:** Run `node scripts/generate-frontend-config.js`

---

## 📊 CURRENT STATUS

```
✅ Sepolia: DEPLOYED
✅ Base Sepolia: DEPLOYED
⏳ Polygon Amoy: WAITING FOR TOKENS
⏳ Optimism Sepolia: WAITING FOR TOKENS
⏳ Arbitrum Sepolia: WAITING FOR TOKENS
⏳ Celo Alfajores: WAITING FOR TOKENS (RPC fixed)

Progress: 2/6 testnets (33%)
Blocking: Manual faucet access required
```

---

## 💡 WHY MANUAL FAUCETS?

Modern testnet faucets implement anti-bot measures:
- Wallet connection required
- Social media verification (Twitter/GitHub)
- Captcha challenges
- Rate limiting per IP/address
- No public APIs available

This prevents abuse but requires manual interaction.

---

## ✅ READY TO START?

1. Open 4 faucet links in browser tabs
2. Run auto-deployment script: `cd contracts && node scripts/auto-deploy-on-funds.js`
3. Visit each faucet and request tokens
4. Watch automatic deployments happen
5. Verify all networks functional

**Estimated Total Time: 1 hour**

---

**Questions?** Check DEPLOYMENT_STATUS.md or FAUCETS.md for details.
