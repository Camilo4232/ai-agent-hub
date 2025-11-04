/**
 * Validate .env configuration
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 Validating Configuration...\n');

// Load .env file
const envPath = path.join(process.cwd(), '.env');

if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found!');
  console.log('\n💡 Run: npm run setup-env\n');
  process.exit(1);
}

require('dotenv').config();

const errors = [];
const warnings = [];

// Validation functions
function validatePrivateKey(key) {
  if (!key) return false;
  if (key.includes('YOUR_') || key.includes('HERE')) return false;
  return key.length === 64 && /^[a-fA-F0-9]+$/.test(key);
}

function validateAddress(address) {
  if (!address) return false;
  if (address.includes('YOUR_') || address.includes('HERE')) return false;
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

function validateUrl(url) {
  if (!url) return false;
  if (url.includes('YOUR_') || url.includes('HERE')) return false;
  return url.startsWith('http://') || url.startsWith('https://');
}

function validateHex(value, length) {
  if (!value) return false;
  return value.length === length && /^[a-fA-F0-9]+$/.test(value);
}

// Check required fields
console.log('📋 Checking required fields...\n');

// Private Key
if (!process.env.PRIVATE_KEY) {
  errors.push('PRIVATE_KEY is missing');
} else if (!validatePrivateKey(process.env.PRIVATE_KEY)) {
  errors.push('PRIVATE_KEY is invalid (must be 64 hex characters without 0x)');
} else {
  console.log('✅ PRIVATE_KEY is valid');
}

// RPC URL
if (!process.env.RPC_URL) {
  errors.push('RPC_URL is missing');
} else if (!validateUrl(process.env.RPC_URL)) {
  errors.push('RPC_URL is invalid (must be a valid HTTP/HTTPS URL)');
} else {
  console.log('✅ RPC_URL is valid');
  if (process.env.RPC_URL.includes('rpc.sepolia.org')) {
    warnings.push('Using public RPC - consider Infura for better reliability');
  }
}

// Payment Recipient
if (!process.env.PAYMENT_RECIPIENT) {
  errors.push('PAYMENT_RECIPIENT is missing');
} else if (!validateAddress(process.env.PAYMENT_RECIPIENT)) {
  errors.push('PAYMENT_RECIPIENT is invalid (must be a valid Ethereum address)');
} else {
  console.log('✅ PAYMENT_RECIPIENT is valid');
}

// Check optional but recommended
console.log('\n🔒 Checking security configuration...\n');

if (!process.env.ENCRYPTION_KEY) {
  warnings.push('ENCRYPTION_KEY is not set - sensitive data cannot be encrypted');
} else if (!validateHex(process.env.ENCRYPTION_KEY, 64)) {
  errors.push('ENCRYPTION_KEY is invalid (must be 64 hex characters)');
} else {
  console.log('✅ ENCRYPTION_KEY is set');
}

if (!process.env.JWT_SECRET) {
  warnings.push('JWT_SECRET is not set - API authentication will not work');
} else {
  console.log('✅ JWT_SECRET is set');
}

// Check contract addresses
console.log('\n📝 Checking contract addresses...\n');

if (!process.env.AGENT_REGISTRY_ADDRESS) {
  warnings.push('AGENT_REGISTRY_ADDRESS not set - deploy contracts first');
} else if (!validateAddress(process.env.AGENT_REGISTRY_ADDRESS)) {
  errors.push('AGENT_REGISTRY_ADDRESS is invalid');
} else {
  console.log('✅ AGENT_REGISTRY_ADDRESS is set');
}

if (!process.env.PAYMENT_PROCESSOR_ADDRESS) {
  warnings.push('PAYMENT_PROCESSOR_ADDRESS not set - deploy contracts first');
} else if (!validateAddress(process.env.PAYMENT_PROCESSOR_ADDRESS)) {
  errors.push('PAYMENT_PROCESSOR_ADDRESS is invalid');
} else {
  console.log('✅ PAYMENT_PROCESSOR_ADDRESS is set');
}

// Check server configuration
console.log('\n⚙️  Checking server configuration...\n');

const port = parseInt(process.env.PORT || '3000');
const agentPort = parseInt(process.env.AGENT_PORT || '3001');

if (port === agentPort) {
  errors.push('PORT and AGENT_PORT must be different');
} else {
  console.log(`✅ Server ports: ${port} (HTTP), ${agentPort} (Agents)`);
}

const maxAgents = parseInt(process.env.MAX_AGENTS || '10');
if (maxAgents < 1 || maxAgents > 100) {
  warnings.push('MAX_AGENTS should be between 1 and 100');
} else {
  console.log(`✅ MAX_AGENTS: ${maxAgents}`);
}

// Print results
console.log('\n' + '='.repeat(50) + '\n');

if (errors.length > 0) {
  console.log('❌ ERRORS:\n');
  errors.forEach(error => console.log(`  ❌ ${error}`));
  console.log('');
}

if (warnings.length > 0) {
  console.log('⚠️  WARNINGS:\n');
  warnings.forEach(warning => console.log(`  ⚠️  ${warning}`));
  console.log('');
}

if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ All configuration is valid!\n');
  console.log('🚀 You can now start the application.\n');
  process.exit(0);
} else if (errors.length === 0) {
  console.log('✅ Configuration is valid but has warnings.\n');
  console.log('💡 Address warnings before production deployment.\n');
  process.exit(0);
} else {
  console.log('❌ Configuration has errors. Please fix them.\n');
  console.log('💡 Run: npm run setup-env\n');
  process.exit(1);
}
