const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying AI Agent Hub Contracts...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  console.log("💰 Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString(), "\n");

  // 1. Deploy PaymentProcessor
  console.log("1️⃣  Deploying PaymentProcessor...");

  // Sepolia USDC address (mock or actual)
  const USDC_ADDRESS = process.env.USDC_ADDRESS || "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"; // Sepolia USDC

  const PaymentProcessor = await hre.ethers.getContractFactory("PaymentProcessor");
  const paymentProcessor = await PaymentProcessor.deploy(USDC_ADDRESS);
  await paymentProcessor.waitForDeployment();

  const paymentProcessorAddress = await paymentProcessor.getAddress();
  console.log("✅ PaymentProcessor deployed to:", paymentProcessorAddress);

  // 2. Deploy AgentRegistryV2
  console.log("\n2️⃣  Deploying AgentRegistryV2...");

  const AgentRegistryV2 = await hre.ethers.getContractFactory("AgentRegistryV2");
  const agentRegistry = await AgentRegistryV2.deploy(paymentProcessorAddress);
  await agentRegistry.waitForDeployment();

  const agentRegistryAddress = await agentRegistry.getAddress();
  console.log("✅ AgentRegistryV2 deployed to:", agentRegistryAddress);

  // Print summary
  console.log("\n" + "=".repeat(60));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("=".repeat(60));
  console.log("\n📋 Contract Addresses:");
  console.log("   PaymentProcessor:", paymentProcessorAddress);
  console.log("   AgentRegistryV2:", agentRegistryAddress);
  console.log("   USDC Token:", USDC_ADDRESS);

  console.log("\n⚙️  Next Steps:");
  console.log("1. Update your .env file with these addresses:");
  console.log(`   PAYMENT_PROCESSOR_ADDRESS=${paymentProcessorAddress}`);
  console.log(`   AGENT_REGISTRY_ADDRESS=${agentRegistryAddress}`);
  console.log(`   USDC_ADDRESS=${USDC_ADDRESS}`);

  console.log("\n2. Verify contracts on Etherscan (optional):");
  console.log(`   npx hardhat verify --network sepolia ${paymentProcessorAddress} ${USDC_ADDRESS}`);
  console.log(`   npx hardhat verify --network sepolia ${agentRegistryAddress} ${paymentProcessorAddress}`);

  console.log("\n3. Fund your wallet with:");
  console.log("   - Sepolia ETH (for gas): https://sepoliafaucet.com");
  console.log("   - Sepolia USDC (for payments): https://faucet.circle.com");

  console.log("\n4. Start the backend server:");
  console.log("   npm start");

  console.log("\n💡 Save these addresses - you'll need them to interact with the contracts!\n");

  // Save to file
  const fs = require('fs');
  const deploymentInfo = {
    network: hre.network.name,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      PaymentProcessor: paymentProcessorAddress,
      AgentRegistryV2: agentRegistryAddress,
      USDC: USDC_ADDRESS
    }
  };

  fs.writeFileSync(
    'deployment.json',
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("📄 Deployment info saved to: contracts/deployment.json\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
