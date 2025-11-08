/**
 * Predictly Complete Contract Deployment Script
 * 
 * Deploys all three contracts:
 * 1. PredictlyCoin - Coin management and betting
 * 2. PredictlyBetting - Match and prediction management
 * 3. PredictlyLeaderboard - User stats and rankings
 * 
 * Usage:
 * npx hardhat run scripts/deploy.ts --network base-sepolia
 */

import { ethers } from 'hardhat';

async function main() {
  console.log('🚀 Starting Predictly Contract Deployment...\n');

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log(`� Deploying from account: ${deployer.address}`);
  console.log(`💰 Account balance: ${ethers.formatEther(await deployer.provider.getBalance(deployer.address))} ETH\n`);

  // Treasury wallet address
  const treasuryWallet = process.env.NEXT_PUBLIC_TREASURY_WALLET || deployer.address;
  console.log(`💼 Treasury wallet: ${treasuryWallet}\n`);

  // ==================== 1. DEPLOY PREDICTLY COIN ====================
  
  console.log('📦 Step 1: Deploying PredictlyCoin...');
  const PredictlyCoin = await ethers.getContractFactory('PredictlyCoin');
  const predictlyCoin = await PredictlyCoin.deploy(treasuryWallet);
  await predictlyCoin.waitForDeployment();
  const coinAddress = await predictlyCoin.getAddress();
  
  console.log(`✅ PredictlyCoin deployed to: ${coinAddress}\n`);

  // ==================== 2. DEPLOY PREDICTLY BETTING ====================
  
  console.log('📦 Step 2: Deploying PredictlyBetting...');
  const PredictlyBetting = await ethers.getContractFactory('PredictlyBetting');
  const predictlyBetting = await PredictlyBetting.deploy(coinAddress);
  await predictlyBetting.waitForDeployment();
  const bettingAddress = await predictlyBetting.getAddress();
  
  console.log(`✅ PredictlyBetting deployed to: ${bettingAddress}\n`);

  // ==================== 3. DEPLOY PREDICTLY LEADERBOARD ====================
  
  console.log('📦 Step 3: Deploying PredictlyLeaderboard...');
  const PredictlyLeaderboard = await ethers.getContractFactory('PredictlyLeaderboard');
  const predictlyLeaderboard = await PredictlyLeaderboard.deploy(coinAddress);
  await predictlyLeaderboard.waitForDeployment();
  const leaderboardAddress = await predictlyLeaderboard.getAddress();
  
  console.log(`✅ PredictlyLeaderboard deployed to: ${leaderboardAddress}\n`);

  // ==================== 4. SETUP BADGE SYSTEM ====================
  
  console.log('🏅 Step 4: Setting up badge system...');
  
  const badges = [
    // Wins-based
    { id: 'rookie', name: 'Rookie', desc: 'First win', type: 'wins', value: 1 },
    { id: 'pro', name: 'Pro', desc: '10 wins', type: 'wins', value: 10 },
    { id: 'legend', name: 'Legend', desc: '100 wins', type: 'wins', value: 100 },
    // Bets-based
    { id: 'starter', name: 'Starter', desc: 'First bet', type: 'bets', value: 1 },
    { id: 'grinder', name: 'Grinder', desc: '50 bets', type: 'bets', value: 50 },
    { id: 'veteran', name: 'Veteran', desc: '500 bets', type: 'bets', value: 500 },
    // Profit-based
    { id: 'profitable', name: 'Profitable', desc: '100 PDC profit', type: 'profit', value: 100 },
    { id: 'wealthy', name: 'Wealthy', desc: '1000 PDC profit', type: 'profit', value: 1000 },
    { id: 'rich', name: 'Rich', desc: '10000 PDC profit', type: 'profit', value: 10000 },
    // Accuracy
    { id: 'accurate', name: 'Accurate', desc: '60% accuracy', type: 'accuracy', value: 6000 },
    { id: 'expert', name: 'Expert', desc: '70% accuracy', type: 'accuracy', value: 7000 },
    { id: 'master', name: 'Master', desc: '80% accuracy', type: 'accuracy', value: 8000 },
  ];

  for (const badge of badges) {
    let value = badge.value;
    if (badge.type === 'profit') {
      value = Number(ethers.parseUnits(badge.value.toString(), 18));
    }
    
    const tx = await predictlyLeaderboard.createBadge(
      badge.id,
      badge.name,
      badge.desc,
      badge.type,
      value
    );
    await tx.wait();
    console.log(`  ✅ ${badge.name}`);
  }
  
  console.log('');

  // ==================== 5. DISPLAY SUMMARY ====================
  
  console.log('═══════════════════════════════════════════════════════');
  console.log('✅ DEPLOYMENT COMPLETE!\n');
  
  console.log('📋 CONTRACT ADDRESSES:');
  console.log(`PredictlyCoin:       ${coinAddress}`);
  console.log(`PredictlyBetting:    ${bettingAddress}`);
  console.log(`PredictlyLeaderboard: ${leaderboardAddress}\n`);
  
  console.log('📝 ADD TO .env.local:');
  console.log(`NEXT_PUBLIC_PREDICTLY_COIN_ADDRESS=${coinAddress}`);
  console.log(`NEXT_PUBLIC_PREDICTLY_BETTING_ADDRESS=${bettingAddress}`);
  console.log(`NEXT_PUBLIC_PREDICTLY_LEADERBOARD_ADDRESS=${leaderboardAddress}`);
  console.log(`NEXT_PUBLIC_TREASURY_WALLET=${treasuryWallet}\n`);
  
  console.log('🎯 DEPLOYED:');
  console.log(`✅ 3 Contracts`);
  console.log(`✅ ${badges.length} Badges\n`);
  
  console.log('═══════════════════════════════════════════════════════');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  });
