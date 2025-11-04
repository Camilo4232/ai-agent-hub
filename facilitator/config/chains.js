/**
 * Multi-Chain Configuration
 * Integrated with Ultravioleta DAO x402 Facilitator
 * Facilitator URL: https://facilitator.ultravioletadao.xyz/
 *
 * Supports gasless payments across:
 * - EVM: Base, Polygon, Avalanche, Celo, HyperEVM, Optimism
 * - Solana: Mainnet + Devnet
 */

export const CHAINS = {
    // Base (Mainnet) - Supported by x402
    base: {
        chainId: 8453,
        name: 'Base',
        symbol: 'ETH',
        type: 'evm',
        rpcUrl: process.env.BASE_RPC || 'https://mainnet.base.org',
        blockExplorer: 'https://basescan.org',
        x402Supported: true,
        contracts: {
            usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
            facilitatorWallet: '0x103040545AC5031A11E8C03dd11324C7333a13C7'
        }
    },

    // Base Sepolia (Testnet) - Supported by x402
    baseSepolia: {
        chainId: 84532,
        name: 'Base Sepolia',
        symbol: 'ETH',
        type: 'evm',
        rpcUrl: process.env.BASE_SEPOLIA_RPC || 'https://sepolia.base.org',
        blockExplorer: 'https://sepolia.basescan.org',
        x402Supported: true,
        contracts: {
            usdc: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
            facilitatorWallet: '0x34033041a5944B8F10f8E4D8496Bfb84f1A293A8'
        }
    },

    // Ethereum Mainnet (NOT supported by x402 - uses direct contracts)
    ethereum: {
        chainId: 1,
        name: 'Ethereum',
        symbol: 'ETH',
        type: 'evm',
        rpcUrl: process.env.ETHEREUM_RPC || 'https://eth.llamarpc.com',
        blockExplorer: 'https://etherscan.io',
        x402Supported: false,
        contracts: {
            paymentProcessor: process.env.ETH_PAYMENT_PROCESSOR || '',
            agentRegistry: process.env.ETH_AGENT_REGISTRY || '',
            usdc: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
        }
    },

    // Ethereum Sepolia (Testnet)
    sepolia: {
        chainId: 11155111,
        name: 'Sepolia',
        symbol: 'ETH',
        type: 'evm',
        rpcUrl: process.env.SEPOLIA_RPC || 'https://rpc.sepolia.org',
        blockExplorer: 'https://sepolia.etherscan.io',
        contracts: {
            paymentProcessor: '0x231eA77d88603F40C48Ad98f085F5646523bCe74',
            agentRegistry: '0x22265732666ea19B72627593Ff515f5a37b0dc77',
            usdc: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'
        }
    },

    // Polygon (Mainnet) - Supported by x402
    polygon: {
        chainId: 137,
        name: 'Polygon',
        symbol: 'MATIC',
        type: 'evm',
        rpcUrl: process.env.POLYGON_RPC || 'https://polygon-rpc.com',
        blockExplorer: 'https://polygonscan.com',
        x402Supported: true,
        contracts: {
            usdc: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', // USDC native on Polygon
            facilitatorWallet: '0x103040545AC5031A11E8C03dd11324C7333a13C7'
        }
    },

    // Polygon Amoy (Testnet - replaces Mumbai) - Supported by x402
    polygonAmoy: {
        chainId: 80002,
        name: 'Polygon Amoy',
        symbol: 'MATIC',
        type: 'evm',
        rpcUrl: process.env.POLYGON_AMOY_RPC || 'https://rpc-amoy.polygon.technology',
        blockExplorer: 'https://amoy.polygonscan.com',
        x402Supported: true,
        contracts: {
            usdc: '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582',
            facilitatorWallet: '0x34033041a5944B8F10f8E4D8496Bfb84f1A293A8'
        }
    },

    // Optimism (Mainnet) - Supported by x402
    optimism: {
        chainId: 10,
        name: 'Optimism',
        symbol: 'ETH',
        type: 'evm',
        rpcUrl: process.env.OPTIMISM_RPC || 'https://mainnet.optimism.io',
        blockExplorer: 'https://optimistic.etherscan.io',
        x402Supported: true,
        contracts: {
            usdc: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
            facilitatorWallet: '0x103040545AC5031A11E8C03dd11324C7333a13C7'
        }
    },

    // Optimism Sepolia (Testnet) - Supported by x402
    optimismSepolia: {
        chainId: 11155420,
        name: 'Optimism Sepolia',
        symbol: 'ETH',
        type: 'evm',
        rpcUrl: process.env.OP_SEPOLIA_RPC || 'https://sepolia.optimism.io',
        blockExplorer: 'https://sepolia-optimism.etherscan.io',
        x402Supported: true,
        contracts: {
            usdc: '0x5fd84259d66Cd46123540766Be93DFE6D43130D7',
            facilitatorWallet: '0x34033041a5944B8F10f8E4D8496Bfb84f1A293A8'
        }
    },

    // Avalanche C-Chain (Mainnet) - Supported by x402
    avalanche: {
        chainId: 43114,
        name: 'Avalanche C-Chain',
        symbol: 'AVAX',
        type: 'evm',
        rpcUrl: process.env.AVALANCHE_RPC || 'https://api.avax.network/ext/bc/C/rpc',
        blockExplorer: 'https://snowtrace.io',
        x402Supported: true,
        contracts: {
            usdc: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
            facilitatorWallet: '0x103040545AC5031A11E8C03dd11324C7333a13C7'
        }
    },

    // Avalanche Fuji (Testnet) - Supported by x402
    avalancheFuji: {
        chainId: 43113,
        name: 'Avalanche Fuji',
        symbol: 'AVAX',
        type: 'evm',
        rpcUrl: process.env.AVALANCHE_FUJI_RPC || 'https://api.avax-test.network/ext/bc/C/rpc',
        blockExplorer: 'https://testnet.snowtrace.io',
        x402Supported: true,
        contracts: {
            usdc: '0x5425890298aed601595a70AB815c96711a31Bc65',
            facilitatorWallet: '0x34033041a5944B8F10f8E4D8496Bfb84f1A293A8'
        }
    },

    // Celo (Mainnet) - Supported by x402
    celo: {
        chainId: 42220,
        name: 'Celo',
        symbol: 'CELO',
        type: 'evm',
        rpcUrl: process.env.CELO_RPC || 'https://forno.celo.org',
        blockExplorer: 'https://celoscan.io',
        x402Supported: true,
        contracts: {
            usdc: '0xcebA9300f2b948710d2653dD7B07f33A8B32118C',
            facilitatorWallet: '0x103040545AC5031A11E8C03dd11324C7333a13C7'
        }
    },

    // Celo Alfajores (Testnet) - Supported by x402
    celoAlfajores: {
        chainId: 44787,
        name: 'Celo Alfajores',
        symbol: 'CELO',
        type: 'evm',
        rpcUrl: process.env.CELO_ALFAJORES_RPC || 'https://alfajores-forno.celo-testnet.org',
        blockExplorer: 'https://alfajores.celoscan.io',
        x402Supported: true,
        contracts: {
            usdc: '0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B',
            facilitatorWallet: '0x34033041a5944B8F10f8E4D8496Bfb84f1A293A8'
        }
    },

    // HyperEVM (Mainnet) - Supported by x402
    hyperevm: {
        chainId: 998,
        name: 'HyperEVM',
        symbol: 'ETH',
        type: 'evm',
        rpcUrl: process.env.HYPEREVM_RPC || 'https://rpc.hyperliquid.xyz',
        blockExplorer: 'https://explorer.hyperliquid.xyz',
        x402Supported: true,
        contracts: {
            usdc: '0x0000000000000000000000000000000000000000', // TBD
            facilitatorWallet: '0x103040545AC5031A11E8C03dd11324C7333a13C7'
        }
    },

    // HyperEVM Testnet - Supported by x402
    hyperevmTestnet: {
        chainId: 999,
        name: 'HyperEVM Testnet',
        symbol: 'ETH',
        type: 'evm',
        rpcUrl: process.env.HYPEREVM_TESTNET_RPC || 'https://testnet-rpc.hyperliquid.xyz',
        blockExplorer: 'https://testnet-explorer.hyperliquid.xyz',
        x402Supported: true,
        contracts: {
            usdc: '0x0000000000000000000000000000000000000000', // TBD
            facilitatorWallet: '0x34033041a5944B8F10f8E4D8496Bfb84f1A293A8'
        }
    },

    // Solana Mainnet - Supported by x402
    solana: {
        chainId: 'mainnet-beta',
        name: 'Solana',
        symbol: 'SOL',
        type: 'solana',
        rpcUrl: process.env.SOLANA_RPC || 'https://api.mainnet-beta.solana.com',
        blockExplorer: 'https://explorer.solana.com',
        x402Supported: true,
        contracts: {
            usdc: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC SPL token
            feePayer: 'F742C4VfFLQ9zRQyithoj5229ZgtX2WqKCSFKgH2EThq' // x402 fee payer
        }
    },

    // Solana Devnet (Testnet) - Supported by x402
    solanaDevnet: {
        chainId: 'devnet',
        name: 'Solana Devnet',
        symbol: 'SOL',
        type: 'solana',
        rpcUrl: process.env.SOLANA_DEVNET_RPC || 'https://api.devnet.solana.com',
        blockExplorer: 'https://explorer.solana.com?cluster=devnet',
        x402Supported: true,
        contracts: {
            usdc: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU', // USDC-Dev
            feePayer: '6xNPewUdKRbEZDReQdpyfNUdgNg8QRc8Mt263T5GZSRv' // x402 fee payer
        }
    }
};

// Helper function to get chain config
export function getChainConfig(chainIdOrName) {
    // Try by name first
    if (CHAINS[chainIdOrName]) {
        return CHAINS[chainIdOrName];
    }

    // Try by chainId
    for (const [name, config] of Object.entries(CHAINS)) {
        if (config.chainId === chainIdOrName) {
            return config;
        }
    }

    throw new Error(`Chain not found: ${chainIdOrName}`);
}

// Get all EVM chains
export function getEVMChains() {
    return Object.entries(CHAINS)
        .filter(([_, config]) => config.type === 'evm')
        .reduce((acc, [name, config]) => {
            acc[name] = config;
            return acc;
        }, {});
}

// Get all Solana clusters
export function getSolanaChains() {
    return Object.entries(CHAINS)
        .filter(([_, config]) => config.type === 'solana')
        .reduce((acc, [name, config]) => {
            acc[name] = config;
            return acc;
        }, {});
}

// Get all x402 supported chains
export function getX402SupportedChains() {
    return Object.entries(CHAINS)
        .filter(([_, config]) => config.x402Supported === true)
        .reduce((acc, [name, config]) => {
            acc[name] = config;
            return acc;
        }, {});
}

// Default chain (for backward compatibility with direct contracts)
export const DEFAULT_CHAIN = 'sepolia';

// Default chain for x402 gasless payments
export const DEFAULT_X402_CHAIN = 'baseSepolia';

export default CHAINS;
