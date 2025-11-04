/**
 * Test blockchain connection
 */

const { ethers } = require('ethers');
require('dotenv').config();

async function testConnection() {
  console.log('\n🔗 Testing Blockchain Connection...\n');

  try {
    // Create provider
    console.log('📡 Connecting to RPC endpoint...');
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

    // Test connection
    const network = await provider.getNetwork();
    console.log(`✅ Connected to network: ${network.name} (chainId: ${network.chainId})\n`);

    // Create wallet
    console.log('🔑 Loading wallet from private key...');
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    console.log(`✅ Wallet address: ${wallet.address}\n`);

    // Check if wallet matches payment recipient
    if (wallet.address.toLowerCase() === process.env.PAYMENT_RECIPIENT.toLowerCase()) {
      console.log('✅ Wallet address matches PAYMENT_RECIPIENT\n');
    } else {
      console.log('⚠️  WARNING: Wallet address does not match PAYMENT_RECIPIENT');
      console.log(`   Wallet: ${wallet.address}`);
      console.log(`   Payment Recipient: ${process.env.PAYMENT_RECIPIENT}\n`);
    }

    // Get balance
    console.log('💰 Checking wallet balance...');
    const balance = await provider.getBalance(wallet.address);
    const balanceInEth = ethers.formatEther(balance);
    console.log(`   Balance: ${balanceInEth} ETH\n`);

    if (parseFloat(balanceInEth) === 0) {
      console.log('⚠️  WARNING: Wallet has zero balance!');
      console.log('   Get testnet ETH from: https://sepoliafaucet.com\n');
    } else if (parseFloat(balanceInEth) < 0.01) {
      console.log('⚠️  WARNING: Low balance! Consider getting more testnet ETH.\n');
    } else {
      console.log('✅ Wallet has sufficient balance for testing\n');
    }

    // Test signing
    console.log('✍️  Testing transaction signing...');
    const message = 'AI Agent Hub Test';
    const signature = await wallet.signMessage(message);
    console.log(`✅ Successfully signed message\n`);

    // Get block number
    console.log('📊 Fetching latest block...');
    const blockNumber = await provider.getBlockNumber();
    console.log(`✅ Current block: ${blockNumber}\n`);

    console.log('='.repeat(50) + '\n');
    console.log('✅ ALL TESTS PASSED!\n');
    console.log('🚀 Your blockchain connection is ready.\n');
    console.log('Next steps:');
    console.log('  1. Deploy contracts: npm run contracts:deploy');
    console.log('  2. Start server: npm start\n');

  } catch (error) {
    console.log('='.repeat(50) + '\n');
    console.log('❌ CONNECTION TEST FAILED!\n');
    console.error('Error:', error.message);
    console.log('\nTroubleshooting:');
    console.log('  - Check your RPC_URL in .env');
    console.log('  - Verify your PRIVATE_KEY is correct');
    console.log('  - Check your internet connection');
    console.log('  - Try a different RPC endpoint\n');
    process.exit(1);
  }
}

testConnection();
