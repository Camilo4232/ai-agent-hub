/**
 * Secrets Manager - Secure handling of environment variables and sensitive data
 * Provides encryption, validation, and secure access to secrets
 */

import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

interface SecretConfig {
  key: string;
  required: boolean;
  encrypted?: boolean;
  validator?: (value: string) => boolean;
}

class SecretsManager {
  private static instance: SecretsManager;
  private secrets: Map<string, string> = new Map();
  private encryptionKey: Buffer | null = null;
  private readonly ALGORITHM = 'aes-256-gcm';

  private constructor() {
    this.loadSecrets();
  }

  public static getInstance(): SecretsManager {
    if (!SecretsManager.instance) {
      SecretsManager.instance = new SecretsManager();
    }
    return SecretsManager.instance;
  }

  /**
   * Load secrets from .env file with validation
   */
  private loadSecrets(): void {
    const envPath = path.join(process.cwd(), '.env');

    if (!fs.existsSync(envPath)) {
      console.warn('⚠️  .env file not found. Please create one from .env.example');
      return;
    }

    // Load environment variables
    require('dotenv').config();

    // Initialize encryption key if provided
    if (process.env.ENCRYPTION_KEY) {
      this.encryptionKey = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
    }

    // Define secret configurations
    const secretConfigs: SecretConfig[] = [
      {
        key: 'PRIVATE_KEY',
        required: true,
        validator: (val) => val.length === 64 && /^[a-fA-F0-9]+$/.test(val)
      },
      {
        key: 'RPC_URL',
        required: true,
        validator: (val) => val.startsWith('http://') || val.startsWith('https://')
      },
      {
        key: 'PAYMENT_RECIPIENT',
        required: true,
        validator: (val) => /^0x[a-fA-F0-9]{40}$/.test(val)
      },
      {
        key: 'ENCRYPTION_KEY',
        required: false,
        validator: (val) => val.length === 64 && /^[a-fA-F0-9]+$/.test(val)
      },
      {
        key: 'JWT_SECRET',
        required: false
      }
    ];

    // Validate and store secrets
    for (const config of secretConfigs) {
      const value = process.env[config.key];

      if (!value || value.includes('YOUR_') || value.includes('HERE')) {
        if (config.required) {
          console.error(`❌ Missing required secret: ${config.key}`);
          console.error(`   Please set this in your .env file`);
        }
        continue;
      }

      if (config.validator && !config.validator(value)) {
        console.error(`❌ Invalid format for ${config.key}`);
        continue;
      }

      this.secrets.set(config.key, value);
    }
  }

  /**
   * Get a secret value
   */
  public getSecret(key: string): string | undefined {
    return this.secrets.get(key) || process.env[key];
  }

  /**
   * Get a required secret (throws if missing)
   */
  public getRequiredSecret(key: string): string {
    const value = this.getSecret(key);
    if (!value) {
      throw new Error(`Required secret ${key} is not set`);
    }
    return value;
  }

  /**
   * Encrypt sensitive data
   */
  public encrypt(data: string): string {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not set. Add ENCRYPTION_KEY to .env');
    }

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.ALGORITHM, this.encryptionKey, iv);

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypt sensitive data
   */
  public decrypt(encryptedData: string): string {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not set. Add ENCRYPTION_KEY to .env');
    }

    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];

    const decipher = crypto.createDecipheriv(this.ALGORITHM, this.encryptionKey, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Generate a new encryption key
   */
  public static generateEncryptionKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate a new JWT secret
   */
  public static generateJWTSecret(): string {
    return crypto.randomBytes(64).toString('base64');
  }

  /**
   * Validate private key format
   */
  public validatePrivateKey(key: string): boolean {
    return key.length === 64 && /^[a-fA-F0-9]+$/.test(key);
  }

  /**
   * Validate Ethereum address format
   */
  public validateAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  /**
   * Check if all required secrets are configured
   */
  public validateConfiguration(): { valid: boolean; missing: string[] } {
    const required = ['PRIVATE_KEY', 'RPC_URL', 'PAYMENT_RECIPIENT'];
    const missing: string[] = [];

    for (const key of required) {
      if (!this.getSecret(key)) {
        missing.push(key);
      }
    }

    return {
      valid: missing.length === 0,
      missing
    };
  }

  /**
   * Securely clear secrets from memory
   */
  public clearSecrets(): void {
    this.secrets.clear();
    if (this.encryptionKey) {
      this.encryptionKey.fill(0);
      this.encryptionKey = null;
    }
  }
}

export default SecretsManager;
export const secretsManager = SecretsManager.getInstance();
