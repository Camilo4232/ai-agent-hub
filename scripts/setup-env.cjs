/**
 * Interactive .env setup script
 * Helps users configure their environment securely
 */

const readline = require('readline');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function validatePrivateKey(key) {
  return key.length === 64 && /^[a-fA-F0-9]+$/.test(key);
}

function validateAddress(address) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

function validateUrl(url) {
  return url.startsWith('http://') || url.startsWith('https://');
}

async function main() {
  console.log('\n🔐 AI Agent Hub - Environment Configuration\n');
  console.log('This script will help you configure your .env file securely.\n');

  const config = {};

  // RPC URL
  console.log('📡 STEP 1: Configure RPC Endpoint\n');
  console.log('Options:');
  console.log('  1. Infura (recommended) - https://sepolia.infura.io/v3/YOUR_KEY');
  console.log('  2. Public Sepolia RPC - https://rpc.sepolia.org');
  console.log('  3. Custom RPC URL\n');

  const rpcChoice = await question('Choose option (1-3): ');

  if (rpcChoice === '1') {
    const infuraKey = await question('Enter your Infura API key: ');
    config.RPC_URL = `https://sepolia.infura.io/v3/${infuraKey}`;
  } else if (rpcChoice === '2') {
    config.RPC_URL = 'https://rpc.sepolia.org';
    console.log('⚠️  Warning: Public RPCs are less reliable. Consider using Infura for production.\n');
  } else {
    config.RPC_URL = await question('Enter your custom RPC URL: ');
  }

  if (!validateUrl(config.RPC_URL)) {
    console.error('❌ Invalid RPC URL format!');
    process.exit(1);
  }

  console.log('✅ RPC URL configured\n');

  // Private Key
  console.log('🔑 STEP 2: Configure Private Key\n');
  console.log('⚠️  SECURITY WARNING:');
  console.log('   - Never share your private key');
  console.log('   - This key will be stored in .env (already in .gitignore)');
  console.log('   - Remove the 0x prefix if present\n');

  const useTestKey = await question('Use a test key for development? (y/n): ');

  if (useTestKey.toLowerCase() === 'y') {
    config.PRIVATE_KEY = crypto.randomBytes(32).toString('hex');
    console.log(`✅ Generated test private key: ${config.PRIVATE_KEY}\n`);
    console.log('⚠️  This is a NEW wallet. Fund it with testnet tokens!\n');
  } else {
    let privateKey = await question('Enter your private key (without 0x): ');

    // Remove 0x if present
    if (privateKey.startsWith('0x')) {
      privateKey = privateKey.slice(2);
    }

    if (!validatePrivateKey(privateKey)) {
      console.error('❌ Invalid private key format! Must be 64 hexadecimal characters.');
      process.exit(1);
    }

    config.PRIVATE_KEY = privateKey;
    console.log('✅ Private key configured\n');
  }

  // Payment Recipient
  console.log('💰 STEP 3: Configure Payment Recipient\n');

  const paymentAddress = await question('Enter your wallet address (0x...): ');

  if (!validateAddress(paymentAddress)) {
    console.error('❌ Invalid Ethereum address format!');
    process.exit(1);
  }

  config.PAYMENT_RECIPIENT = paymentAddress;
  console.log('✅ Payment recipient configured\n');

  // Contract Addresses (optional)
  console.log('📝 STEP 4: Contract Addresses (Optional)\n');
  console.log('Leave blank if you haven\'t deployed contracts yet.\n');

  config.AGENT_REGISTRY_ADDRESS = await question('Agent Registry Address (or press Enter): ') || '';
  config.PAYMENT_PROCESSOR_ADDRESS = await question('Payment Processor Address (or press Enter): ') || '';
  config.USDC_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'; // Sepolia USDC

  // Security Keys
  console.log('\n🔒 STEP 5: Generate Security Keys\n');

  config.ENCRYPTION_KEY = crypto.randomBytes(32).toString('hex');
  config.JWT_SECRET = crypto.randomBytes(64).toString('base64');

  console.log('✅ Encryption key generated');
  console.log('✅ JWT secret generated\n');

  // Server Configuration
  console.log('⚙️  STEP 6: Server Configuration\n');

  config.PORT = await question('HTTP server port (default: 3000): ') || '3000';
  config.AGENT_PORT = await question('Agent server port (default: 3001): ') || '3001';

  // Agent Configuration
  config.MAX_AGENTS = await question('Maximum concurrent agents (default: 10): ') || '10';
  config.ENABLED_AGENT_TYPES = 'travel,fashion,food,payment,custom';

  // Optional services
  console.log('\n🔧 STEP 7: Optional Services (press Enter to skip)\n');

  config.DATABASE_URL = await question('PostgreSQL URL: ') || 'postgresql://user:password@localhost:5432/agent_hub';
  config.REDIS_URL = await question('Redis URL: ') || 'redis://localhost:6379';

  // Write .env file
  console.log('\n📝 Writing .env file...\n');

  const envContent = `# ============================================
# BLOCKCHAIN CONFIGURATION
# ============================================
RPC_URL=${config.RPC_URL}
PRIVATE_KEY=${config.PRIVATE_KEY}

# ============================================
# DEPLOYED CONTRACT ADDRESSES
# ============================================
AGENT_REGISTRY_ADDRESS=${config.AGENT_REGISTRY_ADDRESS}
PAYMENT_PROCESSOR_ADDRESS=${config.PAYMENT_PROCESSOR_ADDRESS}
USDC_ADDRESS=${config.USDC_ADDRESS}

# ============================================
# SERVER CONFIGURATION
# ============================================
PORT=${config.PORT}
AGENT_PORT=${config.AGENT_PORT}

# ============================================
# PAYMENT CONFIGURATION
# ============================================
PAYMENT_RECIPIENT=${config.PAYMENT_RECIPIENT}

# ============================================
# ENCRYPTION & SECURITY
# ============================================
ENCRYPTION_KEY=${config.ENCRYPTION_KEY}
JWT_SECRET=${config.JWT_SECRET}

# ============================================
# AGENT MANAGEMENT SYSTEM
# ============================================
MAX_AGENTS=${config.MAX_AGENTS}
ENABLED_AGENT_TYPES=${config.ENABLED_AGENT_TYPES}
AGENT_DISCOVERY_URL=http://localhost:3002

# ============================================
# OPTIONAL: DATABASE & CACHE
# ============================================
DATABASE_URL=${config.DATABASE_URL}
REDIS_URL=${config.REDIS_URL}
`;

  const envPath = path.join(process.cwd(), '.env');
  fs.writeFileSync(envPath, envContent);

  console.log('✅ .env file created successfully!\n');

  // Summary
  console.log('📊 Configuration Summary:\n');
  console.log(`  RPC URL: ${config.RPC_URL}`);
  console.log(`  Payment Recipient: ${config.PAYMENT_RECIPIENT}`);
  console.log(`  Server Port: ${config.PORT}`);
  console.log(`  Agent Port: ${config.AGENT_PORT}`);
  console.log(`  Max Agents: ${config.MAX_AGENTS}\n`);

  // Next steps
  console.log('🚀 Next Steps:\n');
  console.log('  1. Review your .env file');
  console.log('  2. Get testnet tokens from https://sepoliafaucet.com');
  console.log('  3. Deploy smart contracts: npm run deploy');
  console.log('  4. Start the server: npm start\n');

  console.log('📚 Documentation:');
  console.log('  - Configuration Guide: CONFIGURATION_GUIDE.md');
  console.log('  - Agent Development: AGENT_DEVELOPMENT_GUIDE.md\n');

  rl.close();
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  rl.close();
  process.exit(1);
});
