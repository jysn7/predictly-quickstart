/**
 * ⚠️ DEPLOYMENT INSTRUCTIONS ⚠️
 * 
 * Your contracts need to be compiled first using a Solidity compiler.
 * This project uses Viem (not Hardhat), so you have two options:
 * 
 * OPTION 1: Use Remix IDE (Easiest)
 * 1. Go to https://remix.ethereum.org
 * 2. Upload your .sol files from /contracts folder
 * 3. Compile each contract
 * 4. Deploy manually using Remix + MetaMask/Base wallet
 * 5. Copy deployed addresses to contractConfig.ts
 * 
 * OPTION 2: Install Hardhat (for this script)
 * 1. Run: npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
 * 2. Run: npx hardhat init (choose "Create a TypeScript project")
 * 3. Compile: npx hardhat compile
 * 4. Deploy: npx hardhat run scripts/deploy.ts --network base-sepolia
 * 
 * OPTION 3: Use Foundry
 * 1. Install Foundry: https://book.getfoundry.sh/getting-started/installation
 * 2. Run: forge build
 * 3. Run: forge create --rpc-url https://sepolia.base.org --private-key $PRIVATE_KEY contracts/PredictlyCoin.sol:PredictlyCoin
 */

import { createWalletClient, createPublicClient, http, formatEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';

async function main() {
  console.log('\n⚠️  CONTRACT COMPILATION REQUIRED ⚠️\n');
  console.log('This script requires compiled contract bytecode.');
  console.log('See instructions at the top of this file.\n');
  console.log('Recommended: Use Remix IDE for easy deployment:');
  console.log('👉 https://remix.ethereum.org\n');
  
  // Verify environment
  const privateKey = process.env.PRIVATE_KEY as `0x${string}`;
  if (!privateKey) {
    console.error('❌ PRIVATE_KEY not found in .env.local');
    console.log('\nAdd to .env.local:');
    console.log('PRIVATE_KEY=0xyourprivatekeyhere');
    process.exit(1);
  }

  const account = privateKeyToAccount(privateKey);
  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(),
  });

  console.log(`📍 Deployer address: ${account.address}`);
  const balance = await publicClient.getBalance({ address: account.address });
  console.log(`💰 Balance: ${formatEther(balance)} ETH`);
  
  if (balance === 0n) {
    console.log('\n❌ No ETH balance. Get testnet ETH from:');
    console.log('👉 https://www.coinbase.com/faucets/base-ethereum-goerli-faucet');
  }
}

main().catch(console.error);
