/**
 * Auto-deployment script that monitors wallet balances and deploys when funds are available
 * This script will continuously check for funds and deploy automatically
 *
 * Run: node scripts/auto-deploy-on-funds.js
 */

const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

const DEPLOYER_ADDRESS = '0xda77B09a90Dcb4E1b10CDEaeCaEfa343BA491bc0';
const CHECK_INTERVAL = 30000; // Check every 30 seconds
const MIN_BALANCE_ETH = '0.01'; // Minimum balance to attempt deployment

const PENDING_NETWORKS = [
    { name: 'polygon-amoy', displayName: 'Polygon Amoy', minBalance: '0.1' },
    { name: 'optimism-sepolia', displayName: 'Optimism Sepolia', minBalance: '0.02' },
    { name: 'arbitrum-sepolia', displayName: 'Arbitrum Sepolia', minBalance: '0.02' },
    { name: 'celo-alfajores', displayName: 'Celo Alfajores', minBalance: '0.5' }
];

const deployedNetworks = new Set();

async function checkBalance(networkName) {
    try {
        // Create a new provider for each network
        const config = hre.config.networks[networkName];
        if (!config || !config.url) {
            throw new Error(`Network ${networkName} not configured`);
        }

        const provider = new hre.ethers.JsonRpcProvider(config.url);
        const balance = await provider.getBalance(DEPLOYER_ADDRESS);
        const balanceInEth = hre.ethers.formatEther(balance);
        return parseFloat(balanceInEth);
    } catch (error) {
        // Return 0 on any error (RPC issues, connection timeouts, etc.)
        return 0;
    }
}

async function deployToNetwork(network) {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`🚀 AUTO-DEPLOYING to ${network.displayName}...`);
    console.log('='.repeat(70));

    try {
        const { execSync } = require('child_process');
        const output = execSync(
            `npx hardhat run scripts/deploy-multichain.js --network ${network.name}`,
            {
                stdio: 'pipe',
                encoding: 'utf-8',
                cwd: path.join(__dirname, '..')
            }
        );

        console.log(output);

        if (output.includes('✨') && output.includes('Deployment Complete')) {
            deployedNetworks.add(network.name);
            console.log(`\n✅ ${network.displayName}: DEPLOYED SUCCESSFULLY\n`);

            // Regenerate frontend config
            console.log('📝 Regenerating frontend configuration...');
            const configOutput = execSync(
                'node scripts/generate-frontend-config.js',
                {
                    stdio: 'pipe',
                    encoding: 'utf-8',
                    cwd: path.join(__dirname, '..')
                }
            );
            console.log(configOutput);

            return true;
        } else {
            console.log(`\n❌ ${network.displayName}: Deployment failed\n`);
            return false;
        }

    } catch (error) {
        console.error(`\n❌ ${network.displayName}: Error during deployment`);
        console.error(`   ${error.message.substring(0, 200)}\n`);
        return false;
    }
}

async function monitorAndDeploy() {
    console.log('\n' + '='.repeat(70));
    console.log('👀 AUTO-DEPLOYMENT MONITOR - ACTIVE');
    console.log('='.repeat(70));
    console.log(`\n📍 Monitoring address: ${DEPLOYER_ADDRESS}`);
    console.log(`⏱️  Check interval: ${CHECK_INTERVAL / 1000} seconds`);
    console.log(`\n🎯 Pending networks: ${PENDING_NETWORKS.length}`);
    PENDING_NETWORKS.forEach(net => {
        console.log(`   - ${net.displayName} (min balance: ${net.minBalance})`);
    });
    console.log('\n💡 Get testnet tokens from faucets while this runs:');
    console.log('   node scripts/get-testnet-tokens.js\n');
    console.log('='.repeat(70));

    let checkCount = 0;

    while (deployedNetworks.size < PENDING_NETWORKS.length) {
        checkCount++;
        const timestamp = new Date().toLocaleTimeString();

        console.log(`\n[${timestamp}] Check #${checkCount} - Scanning for funds...`);

        for (const network of PENDING_NETWORKS) {
            if (deployedNetworks.has(network.name)) {
                console.log(`   ✅ ${network.displayName}: Already deployed`);
                continue;
            }

            try {
                const balance = await checkBalance(network.name);
                const minBalance = parseFloat(network.minBalance);

                if (balance >= minBalance) {
                    console.log(`   💰 ${network.displayName}: ${balance.toFixed(4)} (sufficient!)`);

                    // Deploy immediately
                    const success = await deployToNetwork(network);

                    if (!success) {
                        console.log(`   ⚠️  ${network.displayName}: Deployment failed, will retry on next check`);
                    }
                } else if (balance > 0) {
                    console.log(`   ⏳ ${network.displayName}: ${balance.toFixed(4)} (need ${minBalance})`);
                } else {
                    console.log(`   ⚪ ${network.displayName}: 0.0000 (waiting for funds)`);
                }
            } catch (error) {
                console.log(`   ❌ ${network.displayName}: Error - ${error.message.substring(0, 50)}`);
            }
        }

        if (deployedNetworks.size < PENDING_NETWORKS.length) {
            console.log(`\n💤 Sleeping ${CHECK_INTERVAL / 1000}s... (${deployedNetworks.size}/${PENDING_NETWORKS.length} deployed)`);
            await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
        }
    }

    console.log('\n' + '='.repeat(70));
    console.log('🎉 ALL TESTNETS DEPLOYED!');
    console.log('='.repeat(70));
    console.log(`\n✅ Successfully deployed to ${deployedNetworks.size} networks:`);
    deployedNetworks.forEach(net => {
        const network = PENDING_NETWORKS.find(n => n.name === net);
        console.log(`   - ${network.displayName}`);
    });
    console.log('\n📊 Check deployment status:');
    console.log('   cat DEPLOYMENT_STATUS.md');
    console.log('\n🌐 Test in frontend:');
    console.log('   Open frontend/web3-integration.html');
    console.log('\n✨ Auto-deployment complete!\n');
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n⚠️  Auto-deployment monitor stopped by user');
    console.log(`📊 Deployed ${deployedNetworks.size}/${PENDING_NETWORKS.length} networks before stopping\n`);
    process.exit(0);
});

monitorAndDeploy().catch(error => {
    console.error('\n❌ Auto-deployment monitor error:', error);
    process.exit(1);
});
