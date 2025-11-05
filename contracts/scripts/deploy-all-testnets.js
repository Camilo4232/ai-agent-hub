const { execSync } = require('child_process');
const fs = require('fs');

const testnets = [
    { name: 'polygon-amoy', displayName: 'Polygon Amoy' },
    { name: 'optimism-sepolia', displayName: 'Optimism Sepolia' },
    { name: 'arbitrum-sepolia', displayName: 'Arbitrum Sepolia' },
    { name: 'celo-alfajores', displayName: 'Celo Alfajores' }
];

console.log('\n' + '='.repeat(70));
console.log('🚀 Batch Deployment to All Testnets');
console.log('='.repeat(70) + '\n');

const results = {
    successful: [],
    failed: [],
    noFunds: []
};

async function deployToNetwork(network) {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`Attempting deployment to ${network.displayName}...`);
    console.log('='.repeat(70));

    try {
        const output = execSync(
            `npx hardhat run scripts/deploy-multichain.js --network ${network.name}`,
            {
                stdio: 'pipe',
                encoding: 'utf-8',
                cwd: __dirname + '/..'
            }
        );

        console.log(output);

        if (output.includes('✨') && output.includes('Deployment Complete')) {
            results.successful.push(network);
            console.log(`\n✅ ${network.displayName}: SUCCESS\n`);
            return true;
        } else {
            results.failed.push(network);
            console.log(`\n❌ ${network.displayName}: FAILED\n`);
            return false;
        }

    } catch (error) {
        const errorMessage = error.message || error.toString();

        if (errorMessage.includes('Account has no balance') ||
            errorMessage.includes('insufficient funds')) {
            results.noFunds.push(network);
            console.log(`\n⚠️  ${network.displayName}: NO FUNDS (need testnet tokens)\n`);
        } else {
            results.failed.push(network);
            console.log(`\n❌ ${network.displayName}: ERROR`);
            console.log(`   ${errorMessage.substring(0, 200)}\n`);
        }
        return false;
    }
}

async function main() {
    for (const network of testnets) {
        await deployToNetwork(network);

        // Small delay between deployments
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Generate frontend config if at least one deployment succeeded
    if (results.successful.length > 0) {
        console.log('\n' + '='.repeat(70));
        console.log('📝 Generating frontend configuration...');
        console.log('='.repeat(70));

        try {
            const configOutput = execSync(
                'node scripts/generate-frontend-config.js',
                {
                    stdio: 'pipe',
                    encoding: 'utf-8',
                    cwd: __dirname + '/..'
                }
            );
            console.log(configOutput);
        } catch (error) {
            console.error('Error generating frontend config:', error.message);
        }
    }

    // Print summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 DEPLOYMENT SUMMARY');
    console.log('='.repeat(70));

    console.log(`\n✅ Successful Deployments: ${results.successful.length}`);
    if (results.successful.length > 0) {
        results.successful.forEach(net => {
            console.log(`   - ${net.displayName}`);
        });
    }

    console.log(`\n⚠️  Needs Testnet Tokens: ${results.noFunds.length}`);
    if (results.noFunds.length > 0) {
        results.noFunds.forEach(net => {
            console.log(`   - ${net.displayName}`);
        });
        console.log('\n   💡 Get testnet tokens:');
        console.log('      node scripts/get-testnet-tokens.js');
    }

    console.log(`\n❌ Failed Deployments: ${results.failed.length}`);
    if (results.failed.length > 0) {
        results.failed.forEach(net => {
            console.log(`   - ${net.displayName}`);
        });
    }

    console.log('\n' + '='.repeat(70));

    // Total networks deployed (including previously deployed)
    const allDeploymentsFile = __dirname + '/../deployments/all-deployments.json';
    if (fs.existsSync(allDeploymentsFile)) {
        const allDeployments = JSON.parse(fs.readFileSync(allDeploymentsFile, 'utf8'));
        const totalNetworks = Object.keys(allDeployments).length;

        console.log(`\n🌐 Total Networks Deployed: ${totalNetworks}`);
        console.log('   Networks:');
        Object.keys(allDeployments).forEach(network => {
            const deployment = allDeployments[network];
            console.log(`   - ${deployment.chainName} (Chain ID: ${deployment.chainId})`);
        });
    }

    console.log('\n✨ Batch deployment complete!\n');
}

main().catch(error => {
    console.error('\n❌ Batch deployment error:', error);
    process.exit(1);
});
