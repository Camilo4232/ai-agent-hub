import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║           🔍 AI Agent Hub - Configuration Check               ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`);

let hasErrors = false;
let hasWarnings = false;

// Check .env file exists
console.log('\n📋 Verificando configuración...\n');

const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ Archivo .env no encontrado');
  console.log('   Ejecuta: npm run setup\n');
  hasErrors = true;
} else {
  console.log('✅ Archivo .env encontrado');
}

// Check node_modules
const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('❌ Dependencias no instaladas');
  console.log('   Ejecuta: npm install\n');
  hasErrors = true;
} else {
  console.log('✅ Dependencias instaladas');
}

// Check environment variables
console.log('\n📋 Variables de entorno:\n');

const requiredForBlockchain = ['RPC_URL', 'PRIVATE_KEY'];
const optional = ['AGENT_REGISTRY_ADDRESS', 'PAYMENT_PROCESSOR_ADDRESS', 'USDC_ADDRESS', 'PAYMENT_RECIPIENT'];

let blockchainMode = false;

if (process.env.RPC_URL && process.env.PRIVATE_KEY) {
  blockchainMode = true;
  console.log('🔗 Modo: BLOCKCHAIN (Pagos reales)\n');

  requiredForBlockchain.forEach(key => {
    if (process.env[key]) {
      const value = key === 'PRIVATE_KEY' ? '***' : process.env[key];
      console.log(`✅ ${key}: ${value}`);
    } else {
      console.log(`❌ ${key}: No configurado`);
      hasErrors = true;
    }
  });

  console.log('\n📋 Contratos desplegados:\n');

  optional.forEach(key => {
    if (process.env[key]) {
      console.log(`✅ ${key}: ${process.env[key]}`);
    } else {
      console.log(`⚠️  ${key}: No configurado`);
      if (key === 'AGENT_REGISTRY_ADDRESS' || key === 'PAYMENT_PROCESSOR_ADDRESS') {
        hasWarnings = true;
      }
    }
  });

  if (hasWarnings) {
    console.log('\n💡 Para desplegar contratos:');
    console.log('   npm run contracts:compile');
    console.log('   npm run contracts:deploy');
  }

} else {
  console.log('💻 Modo: DEMO (Pagos simulados)\n');
  console.log('✅ No se requiere configuración blockchain');
  console.log('\n💡 Para habilitar blockchain:');
  console.log('   Ejecuta: npm run setup');
}

// Check contracts compiled
if (blockchainMode) {
  console.log('\n📋 Smart Contracts:\n');

  const artifactsPath = path.join(__dirname, '..', 'contracts', 'artifacts');
  if (fs.existsSync(artifactsPath)) {
    console.log('✅ Contratos compilados');
  } else {
    console.log('⚠️  Contratos no compilados');
    console.log('   Ejecuta: npm run contracts:compile');
    hasWarnings = true;
  }
}

// Check ports
console.log('\n📋 Configuración del servidor:\n');

const port = process.env.PORT || '3000';
console.log(`✅ Puerto API: ${port}`);

// Summary
console.log('\n' + '═'.repeat(63));

if (hasErrors) {
  console.log('❌ CONFIGURACIÓN INCOMPLETA');
  console.log('\n🔧 Acciones requeridas:');
  console.log('   1. Ejecuta: npm run setup');
  console.log('   2. Ejecuta: npm install');
} else if (hasWarnings) {
  console.log('⚠️  CONFIGURACIÓN PARCIAL');
  console.log('\n💡 Recomendaciones:');
  if (blockchainMode) {
    console.log('   1. Compila contratos: npm run contracts:compile');
    console.log('   2. Despliega contratos: npm run contracts:deploy');
    console.log('   3. Actualiza .env con las direcciones');
  }
} else {
  console.log('✅ CONFIGURACIÓN COMPLETA');
  console.log('\n🚀 Listo para iniciar:');
  console.log('   npm start');
}

console.log('\n' + '═'.repeat(63) + '\n');

// Check for common issues
console.log('💡 Recursos útiles:\n');
console.log('   📖 README.md - Documentación general');
console.log('   ⚡ QUICKSTART.md - Inicio rápido (5 minutos)');
if (blockchainMode) {
  console.log('   🔗 BLOCKCHAIN_SETUP.md - Guía blockchain completa');
  console.log('   💧 Sepolia ETH: https://sepoliafaucet.com');
  console.log('   💵 Sepolia USDC: https://faucet.circle.com');
}
console.log('   🏗️  ARCHITECTURE.md - Arquitectura técnica\n');

if (hasErrors) {
  process.exit(1);
}
