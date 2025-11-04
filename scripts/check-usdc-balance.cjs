/**
 * Check USDC balance
 */

const { ethers } = require('ethers');
require('dotenv').config();

const USDC_ABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

async function checkBalance() {
  console.log('\n💰 Checking USDC Balance...\n');

  try {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    const usdcContract = new ethers.Contract(
      process.env.USDC_ADDRESS,
      USDC_ABI,
      provider
    );

    const balance = await usdcContract.balanceOf(wallet.address);
    const decimals = await usdcContract.decimals();
    const symbol = await usdcContract.symbol();

    const balanceFormatted = ethers.formatUnits(balance, decimals);

    console.log(`📍 Wallet: ${wallet.address}`);
    console.log(`💵 ${symbol} Balance: ${balanceFormatted} ${symbol}\n`);

    if (parseFloat(balanceFormatted) === 0) {
      console.log('⚠️  WARNING: You have 0 USDC!\n');
      console.log('📥 Get test USDC from Circle faucet:');
      console.log('   https://faucet.circle.com\n');
      console.log('   1. Select "Sepolia" network');
      console.log(`   2. Enter your wallet: ${wallet.address}`);
      console.log('   3. Request USDC (you\'ll receive 10 USDC)\n');
      return false;
    } else {
      console.log('✅ You have USDC! Ready for transactions.\n');
      return true;
    }

  } catch (error) {
    console.error('❌ Error checking balance:', error.message);
    return false;
  }
}

checkBalance();
