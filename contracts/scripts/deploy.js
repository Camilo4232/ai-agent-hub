const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying AgentRegistry contract...\n");

  // Get the contract factory
  const AgentRegistry = await hre.ethers.getContractFactory("AgentRegistry");

  // Deploy the contract
  console.log("📝 Deploying contract...");
  const agentRegistry = await AgentRegistry.deploy();

  await agentRegistry.waitForDeployment();

  const address = await agentRegistry.getAddress();

  console.log("✅ AgentRegistry deployed to:", address);
  console.log("\n📋 Next steps:");
  console.log("1. Update CONTRACT_ADDRESS in .env file");
  console.log("2. Verify contract on Etherscan (optional):");
  console.log(`   npx hardhat verify --network sepolia ${address}`);
  console.log("\n💡 Save this address to interact with the contract!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
