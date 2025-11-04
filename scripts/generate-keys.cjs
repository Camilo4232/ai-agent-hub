/**
 * Generate security keys for .env file
 */

const crypto = require('crypto');

console.log('\n🔐 Security Keys Generator\n');
console.log('Copy these keys to your .env file:\n');

console.log('# Encryption Key (32 bytes)');
const encryptionKey = crypto.randomBytes(32).toString('hex');
console.log(`ENCRYPTION_KEY=${encryptionKey}\n`);

console.log('# JWT Secret (64 bytes)');
const jwtSecret = crypto.randomBytes(64).toString('base64');
console.log(`JWT_SECRET=${jwtSecret}\n`);

console.log('# API Key (optional, for external access)');
const apiKey = crypto.randomBytes(32).toString('hex');
console.log(`API_KEY=${apiKey}\n`);

console.log('⚠️  Keep these keys secure and never commit them to version control!\n');
