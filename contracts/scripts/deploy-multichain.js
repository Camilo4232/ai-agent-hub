const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

// Load chain configuration
const chainConfig = require('../chain-config.json');

async function deployToChain(networkName, chainInfo) {
  console.log(`\n${"=".repeat(70)}`);
  console.log(`🚀 Deploying to ${chainInfo.name} (${networkName})`);
  console.log(`${"=".repeat(70)}\n`);

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  if (balance === 0n) {
    console.error("❌ ERROR: Account has no balance! Please fund your wallet first.");
    console.log(`   Faucet: Get testnet tokens for ${chainInfo.name}`);
    return null;
  }

  // 1. Deploy PaymentProcessor
  console.log("1️⃣  Deploying PaymentProcessor...");
  console.log(`   Using USDC: ${chainInfo.usdc}`);

  const PaymentProcessor = await hre.ethers.getContractFactory("PaymentProcessor");
  const paymentProcessor = await PaymentProcessor.deploy(chainInfo.usdc);
  await paymentProcessor.waitForDeployment();

  const paymentProcessorAddress = await paymentProcessor.getAddress();
  console.log("✅ PaymentProcessor deployed to:", paymentProcessorAddress);
  console.log(`   View on explorer: ${chainInfo.explorer}/address/${paymentProcessorAddress}`);

  // 2. Deploy AgentRegistryV2
  console.log("\n2️⃣  Deploying AgentRegistryV2...");

  const AgentRegistryV2 = await hre.ethers.getContractFactory("AgentRegistryV2");
  const agentRegistry = await AgentRegistryV2.deploy(paymentProcessorAddress);
  await agentRegistry.waitForDeployment();

  const agentRegistryAddress = await agentRegistry.getAddress();
  console.log("✅ AgentRegistryV2 deployed to:", agentRegistryAddress);
  console.log(`   View on explorer: ${chainInfo.explorer}/address/${agentRegistryAddress}`);

  // Print summary
  console.log("\n" + "-".repeat(70));
  console.log(`✨ ${chainInfo.name} Deployment Complete!`);
  console.log("-".repeat(70));
  console.log("\n📋 Contract Addresses:");
  console.log(`   PaymentProcessor: ${paymentProcessorAddress}`);
  console.log(`   AgentRegistryV2:  ${agentRegistryAddress}`);
  console.log(`   USDC Token:       ${chainInfo.usdc}`);
  console.log(`   Chain ID:         ${chainInfo.chainId}`);

  return {
    network: networkName,
    chainId: chainInfo.chainId,
    chainName: chainInfo.name,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    explorer: chainInfo.explorer,
    contracts: {
      PaymentProcessor: paymentProcessorAddress,
      AgentRegistryV2: agentRegistryAddress,
      USDC: chainInfo.usdc
    }
  };
}

async function main() {
  const networkName = hre.network.name;

  console.log("\n" + "=".repeat(70));
  console.log("🌐 AI Agent Hub - Multi-Chain Deployment");
  console.log("=".repeat(70));
  console.log(`Network: ${networkName}`);
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  // Determine if testnet or mainnet
  let chainInfo;
  let isTestnet = false;

  if (chainConfig.testnets[networkName]) {
    chainInfo = chainConfig.testnets[networkName];
    isTestnet = true;
  } else if (chainConfig.mainnets[networkName]) {
    chainInfo = chainConfig.mainnets[networkName];
    isTestnet = false;
  } else {
    console.error(`❌ ERROR: Network "${networkName}" not found in chain-config.json`);
    console.log("\nAvailable networks:");
    console.log("Testnets:", Object.keys(chainConfig.testnets).join(", "));
    console.log("Mainnets:", Object.keys(chainConfig.mainnets).join(", "));
    process.exit(1);
  }

  if (!isTestnet) {
    console.log("⚠️  WARNING: You are deploying to MAINNET!");
    console.log("   This will use REAL tokens and incur REAL costs.");
    console.log("   Make sure you know what you're doing!\n");

    // Add 5 second delay for mainnet deployments
    console.log("   Waiting 5 seconds before continuing...");
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  // Deploy
  const deploymentInfo = await deployToChain(networkName, chainInfo);

  if (!deploymentInfo) {
    console.error("\n❌ Deployment failed!");
    process.exit(1);
  }

  // Save deployment info
  const deploymentsDir = path.join(__dirname, '../deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(deploymentsDir, `${networkName}.json`);
  fs.writeFileSync(
    deploymentFile,
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log(`\n📄 Deployment info saved to: contracts/deployments/${networkName}.json`);

  // Update or create consolidated deployments file
  const allDeploymentsFile = path.join(deploymentsDir, 'all-deployments.json');
  let allDeployments = {};

  if (fs.existsSync(allDeploymentsFile)) {
    allDeployments = JSON.parse(fs.readFileSync(allDeploymentsFile, 'utf8'));
  }

  allDeployments[networkName] = deploymentInfo;

  fs.writeFileSync(
    allDeploymentsFile,
    JSON.stringify(allDeployments, null, 2)
  );

  console.log(`📄 Updated consolidated deployments: contracts/deployments/all-deployments.json`);

  // Print next steps
  console.log("\n" + "=".repeat(70));
  console.log("📝 NEXT STEPS");
  console.log("=".repeat(70));

  if (isTestnet) {
    console.log("\n1. Get testnet tokens:");
    console.log(`   ${chainInfo.name} Faucet - Search for "${chainInfo.name} faucet"`);

    console.log("\n2. Verify contracts (optional):");
    console.log(`   npx hardhat verify --network ${networkName} ${deploymentInfo.contracts.PaymentProcessor} ${chainInfo.usdc}`);
    console.log(`   npx hardhat verify --network ${networkName} ${deploymentInfo.contracts.AgentRegistryV2} ${deploymentInfo.contracts.PaymentProcessor}`);
  } else {
    console.log("\n1. ⚠️  IMPORTANT: Save your private keys securely!");
    console.log("2. ⚠️  Fund your contracts with real USDC");
    console.log("3. ⚠️  Test thoroughly before announcing");
  }

  console.log("\n3. Update frontend configuration:");
  console.log("   Run: node scripts/generate-frontend-config.js");

  console.log("\n4. Test the deployment:");
  console.log(`   Visit: ${chainInfo.explorer}/address/${deploymentInfo.contracts.PaymentProcessor}`);

  console.log("\n✨ Deployment complete!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment error:", error);
    process.exit(1);
  });
