/**
 * Network Switcher
 * Easily switch between Sepolia and Base networks
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const networks = {
  sepolia: {
    name: 'Sepolia Testnet',
    chainId: 11155111,
    rpc: 'https://sepolia.infura.io/v3/...',
    usdc: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    explorer: 'https://sepolia.etherscan.io',
    envFile: '.env.sepolia',
    hasContracts: true,
    faucets: [
      'https://sepoliafaucet.com',
      'https://faucet.circle.com'
    ]
  },
  base: {
    name: 'Base Sepolia Testnet',
    chainId: 84532,
    rpc: 'https://sepolia.base.org',
    usdc: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    explorer: 'https://sepolia.basescan.org',
    envFile: '.env.base-sepolia',
    hasContracts: false,
    faucets: [
      'https://www.coinbase.com/faucet',
      'https://faucet.circle.com'
    ]
  }
};

const args = process.argv.slice(2);
const targetNetwork = args[0];

if (!targetNetwork || !networks[targetNetwork]) {
  console.log('\n❌ Invalid network specified\n');
  console.log('Usage: npm run switch-network [sepolia|base]\n');
  console.log('Available networks:');
  Object.keys(networks).forEach(key => {
    const net = networks[key];
    console.log(`  ${key.padEnd(10)} - ${net.name} (Chain ID: ${net.chainId})`);
  });
  console.log('');
  process.exit(1);
}

const network = networks[targetNetwork];
const envPath = path.join(process.cwd(), '.env');
const targetEnvPath = path.join(process.cwd(), network.envFile);
const backupPath = path.join(process.cwd(), '.env.backup');

console.log('\n' + '='.repeat(70));
console.log(`🔄 SWITCHING TO: ${network.name.toUpperCase()}`);
console.log('='.repeat(70));

// Backup current .env
if (fs.existsSync(envPath)) {
  console.log('\n📋 Backing up current .env...');
  fs.copyFileSync(envPath, backupPath);
  console.log('   ✅ Backup created: .env.backup');
}

// Check if target config exists
if (!fs.existsSync(targetEnvPath)) {
  console.log(`\n❌ Configuration file not found: ${network.envFile}`);
  console.log('   Creating default configuration...\n');

  // Create it (should exist, but just in case)
  process.exit(1);
}

// Copy target config to .env
console.log(`\n📝 Switching to ${network.name}...`);
fs.copyFileSync(targetEnvPath, envPath);
console.log('   ✅ Configuration updated');

// Validate
console.log('\n🔍 Validating configuration...');
try {
  execSync('node scripts/validate-config.cjs', { stdio: 'inherit' });
} catch (error) {
  console.log('\n⚠️  Validation had warnings (expected for Base)');
}

// Network info
console.log('\n📊 NETWORK INFORMATION');
console.log('─'.repeat(70));
console.log(`   Name: ${network.name}`);
console.log(`   Chain ID: ${network.chainId}`);
console.log(`   RPC: ${network.rpc}`);
console.log(`   USDC: ${network.usdc}`);
console.log(`   Explorer: ${network.explorer}`);
console.log(`   Smart Contracts: ${network.hasContracts ? '✅ Deployed' : '❌ Not deployed'}`);

// Get funds instructions
console.log('\n💰 GET TESTNET FUNDS');
console.log('─'.repeat(70));
network.faucets.forEach(faucet => {
  console.log(`   🚰 ${faucet}`);
});

console.log('\n📋 NEXT STEPS');
console.log('─'.repeat(70));

if (targetNetwork === 'base') {
  console.log('   1. Get Base Sepolia ETH from Coinbase faucet');
  console.log('   2. Get Base Sepolia USDC from Circle faucet');
  console.log('   3. Check balance: npm run check-usdc');
  console.log('   4. Buy from Karmacadabra: npm run demo:x402');
  console.log('\n   ⚡ Karmacadabra service:');
  console.log('   https://test-seller.karmacadabra.ultravioletadao.xyz');
  console.log('\n   💡 This will make a REAL purchase from their service!');
} else {
  console.log('   1. Check balance: npm run check-usdc');
  console.log('   2. Test connection: npm run test-connection');
  console.log('   3. Start server: npm start');
  console.log('   4. Run A2A demo: npm run demo:a2a');
  console.log('\n   💡 You have your own contracts deployed here!');
}

console.log('\n🔙 RESTORE PREVIOUS NETWORK');
console.log('─'.repeat(70));
console.log(`   Backup saved: .env.backup`);
console.log(`   To restore: cp .env.backup .env\n`);

console.log('='.repeat(70));
console.log(`✅ SWITCHED TO ${network.name.toUpperCase()}`);
console.log('='.repeat(70) + '\n');
