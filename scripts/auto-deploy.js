import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║     🤖 AI Agent Hub - Automatic Deployment Script            ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`);

async function checkPrerequisites() {
  console.log('\n📋 Checking prerequisites...\n');

  // Check if .env exists
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env file not found');
    console.log('   Creating default .env for demo mode...\n');

    const envContent = `# Demo Mode - No blockchain required
PORT=3000
AGENT_PORT=3001

# For blockchain mode, configure these:
# RPC_URL=https://sepolia.infura.io/v3/YOUR_API_KEY
# PRIVATE_KEY=your_private_key_here
# AGENT_REGISTRY_ADDRESS=
# PAYMENT_PROCESSOR_ADDRESS=
# USDC_ADDRESS=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
# PAYMENT_RECIPIENT=your_wallet_address
`;

    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env created in demo mode\n');
  } else {
    console.log('✅ .env file found\n');
  }

  // Check if node_modules exists
  const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    console.log('❌ Dependencies not installed');
    console.log('   Installing dependencies...\n');
    try {
      execSync('npm install', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
      console.log('\n✅ Dependencies installed\n');
    } catch (error) {
      console.error('❌ Failed to install dependencies');
      return false;
    }
  } else {
    console.log('✅ Dependencies installed\n');
  }

  // Check contracts dependencies
  const contractsNodeModules = path.join(__dirname, '..', 'contracts', 'node_modules');
  if (!fs.existsSync(contractsNodeModules)) {
    console.log('⚙️  Installing contract dependencies...\n');
    try {
      execSync('npm install', { cwd: path.join(__dirname, '..', 'contracts'), stdio: 'inherit' });
      console.log('\n✅ Contract dependencies installed\n');
    } catch (error) {
      console.error('❌ Failed to install contract dependencies');
      return false;
    }
  } else {
    console.log('✅ Contract dependencies installed\n');
  }

  return true;
}

function checkBlockchainConfig() {
  console.log('\n🔗 Checking blockchain configuration...\n');

  const hasRPC = !!process.env.RPC_URL;
  const hasPrivateKey = !!process.env.PRIVATE_KEY;

  if (hasRPC && hasPrivateKey) {
    console.log('✅ Blockchain configuration found');
    console.log('   Mode: PRODUCTION (Real payments)\n');
    return 'production';
  } else {
    console.log('⚠️  No blockchain configuration found');
    console.log('   Mode: DEMO (Simulated payments)\n');
    return 'demo';
  }
}

function compileContracts() {
  console.log('\n🔨 Compiling smart contracts...\n');

  try {
    execSync('npx hardhat compile', {
      cwd: path.join(__dirname, '..', 'contracts'),
      stdio: 'inherit'
    });
    console.log('\n✅ Contracts compiled successfully\n');
    return true;
  } catch (error) {
    console.error('\n❌ Contract compilation failed\n');
    return false;
  }
}

async function main() {
  try {
    // Step 1: Check prerequisites
    const prereqsOk = await checkPrerequisites();
    if (!prereqsOk) {
      console.log('\n❌ Prerequisites check failed. Please fix the issues and try again.\n');
      process.exit(1);
    }

    // Step 2: Check blockchain config
    const mode = checkBlockchainConfig();

    // Step 3: Compile contracts (optional for demo mode)
    if (mode === 'production') {
      const compiled = compileContracts();
      if (!compiled) {
        console.log('\n⚠️  Contract compilation failed, but continuing in demo mode...\n');
      }
    } else {
      console.log('💡 Running in DEMO mode - skipping contract compilation');
      console.log('   To enable blockchain:\n');
      console.log('   1. Run: npm run setup');
      console.log('   2. Or manually configure .env with RPC_URL and PRIVATE_KEY\n');
    }

    // Step 4: Final summary
    console.log('\n' + '═'.repeat(63));
    console.log('✅ SETUP COMPLETE!\n');

    if (mode === 'demo') {
      console.log('🎮 Demo Mode Active');
      console.log('   - Payments are simulated');
      console.log('   - No blockchain required');
      console.log('   - Perfect for testing\n');
    } else {
      console.log('🔗 Production Mode Active');
      console.log('   - Real USDC payments');
      console.log('   - Blockchain integration enabled');
      console.log('   - Ready to deploy contracts\n');

      console.log('📝 Next steps for production:');
      console.log('   1. npm run contracts:deploy');
      console.log('   2. Update .env with contract addresses');
      console.log('   3. npm start\n');
    }

    console.log('🚀 To start the server:');
    console.log('   npm start\n');

    console.log('📚 Documentation:');
    console.log('   - START_HERE.md - Quick start guide');
    console.log('   - README.md - Full documentation');
    console.log('   - BLOCKCHAIN_SETUP.md - Blockchain setup\n');

    console.log('═'.repeat(63) + '\n');

  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

main();
