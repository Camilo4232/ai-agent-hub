const fs = require('fs');
const path = require('path');

function generateFrontendConfig() {
  console.log("🔧 Generating frontend configuration from deployments...\n");

  const deploymentsDir = path.join(__dirname, '../deployments');
  const allDeploymentsFile = path.join(deploymentsDir, 'all-deployments.json');

  if (!fs.existsSync(allDeploymentsFile)) {
    console.error("❌ No deployments found!");
    console.log("   Please deploy contracts first using:");
    console.log("   npx hardhat run scripts/deploy-multichain.js --network <network-name>");
    process.exit(1);
  }

  const allDeployments = JSON.parse(fs.readFileSync(allDeploymentsFile, 'utf8'));

  console.log(`📦 Found deployments for ${Object.keys(allDeployments).length} networks:`);
  Object.keys(allDeployments).forEach(network => {
    console.log(`   - ${allDeployments[network].chainName} (${network})`);
  });

  // Generate frontend config
  const frontendConfig = {
    version: "2.0.0",
    generated: new Date().toISOString(),
    networks: {}
  };

  for (const [networkKey, deployment] of Object.entries(allDeployments)) {
    frontendConfig.networks[networkKey] = {
      chainId: deployment.chainId,
      chainName: deployment.chainName,
      active: true, // All deployed networks are active
      explorer: deployment.explorer,
      contracts: {
        paymentProcessor: deployment.contracts.PaymentProcessor,
        agentRegistry: deployment.contracts.AgentRegistryV2,
        usdc: deployment.contracts.USDC
      },
      deployment: {
        timestamp: deployment.timestamp,
        deployer: deployment.deployer
      }
    };
  }

  // Save to frontend directory
  const frontendConfigPath = path.join(__dirname, '../../frontend/chain-config.json');
  fs.writeFileSync(
    frontendConfigPath,
    JSON.stringify(frontendConfig, null, 2)
  );

  console.log(`\n✅ Frontend configuration generated!`);
  console.log(`   Location: frontend/chain-config.json`);
  console.log(`\n📋 Networks configured:`);

  Object.entries(frontendConfig.networks).forEach(([key, network]) => {
    console.log(`\n   ${network.chainName}:`);
    console.log(`      Chain ID: ${network.chainId}`);
    console.log(`      Payment Processor: ${network.contracts.paymentProcessor}`);
    console.log(`      Agent Registry: ${network.contracts.agentRegistry}`);
    console.log(`      USDC: ${network.contracts.usdc}`);
  });

  console.log("\n🎨 Next step: Update frontend to use this configuration");
  console.log("   The frontend will automatically load contracts for each chain\n");

  return frontendConfig;
}

if (require.main === module) {
  generateFrontendConfig();
}

module.exports = { generateFrontendConfig };
