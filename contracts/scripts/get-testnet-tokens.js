/**
 * Script to automatically request testnet tokens from faucets
 * Run: node scripts/get-testnet-tokens.js
 */

const https = require('https');

const DEPLOYER_ADDRESS = '0xda77B09a90Dcb4E1b10CDEaeCaEfa343BA491bc0';

console.log('🪙 Requesting testnet tokens...\n');
console.log(`Address: ${DEPLOYER_ADDRESS}\n`);
console.log('='.repeat(70));

// Polygon Amoy Faucet
async function requestPolygonAmoy() {
    console.log('\n🟣 Polygon Amoy Testnet');
    console.log('   Manual faucet required: https://faucet.polygon.technology');
    console.log(`   Paste address: ${DEPLOYER_ADDRESS}`);
    console.log('   Select: Amoy Testnet');
    console.log('   Amount: 0.5 MATIC');
}

// Optimism Sepolia Faucet
async function requestOptimismSepolia() {
    console.log('\n🔴 Optimism Sepolia Testnet');
    console.log('   Manual faucet required: https://app.optimism.io/faucet');
    console.log(`   Or use: https://www.alchemy.com/faucets/optimism-sepolia`);
    console.log(`   Paste address: ${DEPLOYER_ADDRESS}`);
}

// Arbitrum Sepolia Faucet
async function requestArbitrumSepolia() {
    console.log('\n🔵 Arbitrum Sepolia Testnet');
    console.log('   Faucet: https://faucet.quicknode.com/arbitrum/sepolia');
    console.log(`   Paste address: ${DEPLOYER_ADDRESS}`);
    console.log('   Amount: 0.05 ETH');
}

// Celo Alfajores Faucet
async function requestCeloAlfajores() {
    console.log('\n🟡 Celo Alfajores Testnet');
    console.log('   Faucet: https://faucet.celo.org/alfajores');
    console.log(`   Paste address: ${DEPLOYER_ADDRESS}`);
    console.log('   Amount: 5 CELO');
}

// Check balance function
function checkBalance(network, explorerUrl) {
    console.log(`\n   ✅ After receiving, check balance:`);
    console.log(`      ${explorerUrl}/address/${DEPLOYER_ADDRESS}`);
}

async function main() {
    await requestPolygonAmoy();
    checkBalance('Polygon Amoy', 'https://amoy.polygonscan.com');

    await requestOptimismSepolia();
    checkBalance('Optimism Sepolia', 'https://sepolia-optimism.etherscan.io');

    await requestArbitrumSepolia();
    checkBalance('Arbitrum Sepolia', 'https://sepolia.arbiscan.io');

    await requestCeloAlfajores();
    checkBalance('Celo Alfajores', 'https://alfajores.celoscan.io');

    console.log('\n' + '='.repeat(70));
    console.log('\n📝 NEXT STEPS:');
    console.log('\n1. Visit the faucets above and request tokens');
    console.log('2. Wait 1-2 minutes for tokens to arrive');
    console.log('3. Check balances using the explorer links');
    console.log('4. Once you have tokens, run:');
    console.log('   cd contracts');
    console.log('   npx hardhat run scripts/deploy-multichain.js --network polygon-amoy');
    console.log('   npx hardhat run scripts/deploy-multichain.js --network optimism-sepolia');
    console.log('   npx hardhat run scripts/deploy-multichain.js --network arbitrum-sepolia');
    console.log('   npx hardhat run scripts/deploy-multichain.js --network celo-alfajores');
    console.log('\n5. After all deployments, regenerate frontend config:');
    console.log('   node scripts/generate-frontend-config.js\n');
}

main();
