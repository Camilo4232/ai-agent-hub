import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║           🤖 AI Agent Hub - Setup Wizard                      ║
║                                                               ║
║   Configuración automática del proyecto                       ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`);

async function setup() {
  try {
    console.log('\n📋 Paso 1: Configuración del entorno\n');

    const mode = await question('¿Deseas usar blockchain real (Sepolia) o modo demo? (blockchain/demo) [demo]: ');
    const useBlockchain = mode.toLowerCase() === 'blockchain';

    let envContent = '';

    if (useBlockchain) {
      console.log('\n🔗 Configuración Blockchain\n');

      const rpcUrl = await question('RPC URL (Infura/Alchemy): ');
      const privateKey = await question('Private Key (sin 0x): ');
      const paymentRecipient = await question('Tu dirección de wallet: ');

      envContent = `# Blockchain Configuration
RPC_URL=${rpcUrl}
PRIVATE_KEY=${privateKey}

# Deployed Contract Addresses (actualizar después del deploy)
AGENT_REGISTRY_ADDRESS=
PAYMENT_PROCESSOR_ADDRESS=
USDC_ADDRESS=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238

# Server Configuration
PORT=3000
AGENT_PORT=3001

# Payment Configuration
PAYMENT_RECIPIENT=${paymentRecipient}
`;

      console.log('\n✅ Configuración blockchain guardada');
      console.log('\n⚠️  IMPORTANTE:');
      console.log('1. Necesitas Sepolia ETH: https://sepoliafaucet.com');
      console.log('2. Necesitas Sepolia USDC: https://faucet.circle.com');
      console.log('3. Después del deploy, actualiza las direcciones de contratos en .env');

    } else {
      envContent = `# Demo Mode - No blockchain required
# Server Configuration
PORT=3000
AGENT_PORT=3001

# For blockchain mode, uncomment and configure:
# RPC_URL=https://sepolia.infura.io/v3/YOUR_API_KEY
# PRIVATE_KEY=your_private_key_here
# AGENT_REGISTRY_ADDRESS=
# PAYMENT_PROCESSOR_ADDRESS=
# USDC_ADDRESS=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
# PAYMENT_RECIPIENT=your_wallet_address
`;

      console.log('\n✅ Configuración demo guardada');
      console.log('\n💡 En modo demo, los pagos son simulados (no reales)');
    }

    // Guardar .env
    const envPath = path.join(__dirname, '..', '.env');
    fs.writeFileSync(envPath, envContent);

    console.log('\n📋 Paso 2: Instalación de dependencias\n');

    const install = await question('¿Instalar dependencias ahora? (sí/no) [sí]: ');

    if (!install || install.toLowerCase() === 'sí' || install.toLowerCase() === 'si' || install.toLowerCase() === 's' || install.toLowerCase() === 'y' || install.toLowerCase() === 'yes') {
      console.log('\n📦 Instalando dependencias del proyecto...');
      console.log('   Esto puede tomar algunos minutos...\n');
      console.log('   Ejecuta manualmente: npm install');

      if (useBlockchain) {
        console.log('   Y luego: npm run contracts:install');
      }
    }

    console.log('\n📋 Paso 3: Próximos pasos\n');

    if (useBlockchain) {
      console.log('Para desplegar los smart contracts:');
      console.log('  1. npm run contracts:compile');
      console.log('  2. npm run contracts:deploy');
      console.log('  3. Actualiza .env con las direcciones de los contratos');
      console.log('  4. npm start\n');
    } else {
      console.log('Para iniciar el servidor:');
      console.log('  npm start\n');
    }

    console.log('Para más información:');
    console.log('  - README.md - Documentación general');
    console.log('  - QUICKSTART.md - Inicio rápido');
    if (useBlockchain) {
      console.log('  - BLOCKCHAIN_SETUP.md - Guía blockchain completa\n');
    }

    console.log('✨ Configuración completada!\n');

    rl.close();
  } catch (error) {
    console.error('\n❌ Error durante setup:', error.message);
    rl.close();
    process.exit(1);
  }
}

setup();
