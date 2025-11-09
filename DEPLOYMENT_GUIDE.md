# 🚀 Contract Deployment Guide

## ⚠️ The Problem

Your `scripts/deploy.ts` uses **Hardhat**, but your project uses **Viem**. You need to either:
1. Use a visual tool (Remix - easiest)
2. Install Hardhat
3. Use Foundry

---

## ✅ OPTION 1: Remix IDE (Recommended - No setup needed)

### Step 1: Prepare Contracts
1. Open https://remix.ethereum.org
2. Create new workspace
3. Upload your 3 contract files:
   - `contracts/PredictlyCoin.sol`
   - `contracts/PredictlyBetting.sol`
   - `contracts/PredictlyLeaderboard.sol`

### Step 2: Compile
1. Click "Solidity Compiler" tab (left sidebar)
2. Select compiler version: `0.8.20` or higher
3. Click "Compile" for each contract
4. ✅ Should see green checkmarks

### Step 3: Deploy PredictlyCoin
1. Click "Deploy & Run" tab
2. Set Environment: "Injected Provider - MetaMask"
3. Connect your Base Sepolia wallet
4. Select contract: `PredictlyCoin`
5. Constructor args: `TREASURY_WALLET_ADDRESS` (your address or dedicated treasury)
6. Click "Deploy"
7. Confirm transaction in wallet
8. ✅ Copy deployed address

### Step 4: Deploy PredictlyBetting
1. Select contract: `PredictlyBetting`
2. Constructor args: `PREDICTLY_COIN_ADDRESS` (from step 3)
3. Click "Deploy"
4. ✅ Copy deployed address

### Step 5: Deploy PredictlyLeaderboard
1. Select contract: `PredictlyLeaderboard`
2. Constructor args: `PREDICTLY_COIN_ADDRESS` (from step 3)
3. Click "Deploy"
4. ✅ Copy deployed address

### Step 6: Setup Badges
In Remix, call `PredictlyLeaderboard.createBadge()` for each:

```javascript
// Wins badges
createBadge("rookie", "Rookie", "First win", "wins", 1)
createBadge("pro", "Pro", "10 wins", "wins", 10)
createBadge("legend", "Legend", "100 wins", "wins", 100)

// Bets badges
createBadge("starter", "Starter", "First bet", "bets", 1)
createBadge("grinder", "Grinder", "50 bets", "bets", 50)
createBadge("veteran", "Veteran", "500 bets", "bets", 500)

// Profit badges (use parseEther for value)
createBadge("profitable", "Profitable", "100 PDC profit", "profit", "100000000000000000000")
createBadge("wealthy", "Wealthy", "1000 PDC profit", "profit", "1000000000000000000000")
createBadge("rich", "Rich", "10000 PDC profit", "profit", "10000000000000000000000")

// Accuracy badges (60% = 6000, 70% = 7000, 80% = 8000)
createBadge("accurate", "Accurate", "60% accuracy", "accuracy", 6000)
createBadge("expert", "Expert", "70% accuracy", "accuracy", 7000)
createBadge("master", "Master", "80% accuracy", "accuracy", 8000)
```

### Step 7: Update Config
Add to `.env.local`:
```env
NEXT_PUBLIC_PREDICTLY_COIN_ADDRESS=0x...
NEXT_PUBLIC_PREDICTLY_BETTING_ADDRESS=0x...
NEXT_PUBLIC_PREDICTLY_LEADERBOARD_ADDRESS=0x...
NEXT_PUBLIC_TREASURY_WALLET=0x...
```

Update `app/config/contractConfig.ts`:
```typescript
export const PREDICTLY_COIN_ADDRESS = '0x...' as `0x${string}`;
export const PREDICTLY_BETTING_ADDRESS = '0x...' as `0x${string}`;
export const PREDICTLY_LEADERBOARD_ADDRESS = '0x...' as `0x${string}`;
```

---

## OPTION 2: Hardhat (For developers)

### Step 1: Install Hardhat
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat init
# Choose: "Create a TypeScript project"
```

### Step 2: Create hardhat.config.ts
```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require('dotenv').config({ path: '.env.local' });

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    "base-sepolia": {
      url: "https://sepolia.base.org",
      accounts: [process.env.PRIVATE_KEY!],
      chainId: 84532,
    },
    "base": {
      url: "https://mainnet.base.org",
      accounts: [process.env.PRIVATE_KEY!],
      chainId: 8453,
    },
  },
};

export default config;
```

### Step 3: Add Private Key to .env.local
```env
PRIVATE_KEY=0xyourprivatekeyhere
```

### Step 4: Compile & Deploy
```bash
npx hardhat compile
npx hardhat run scripts/deploy.ts --network base-sepolia
```

---

## OPTION 3: Foundry (Advanced)

### Step 1: Install Foundry
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### Step 2: Initialize
```bash
forge init --no-git
```

### Step 3: Build
```bash
forge build
```

### Step 4: Deploy Each Contract
```bash
# PredictlyCoin
forge create --rpc-url https://sepolia.base.org \
  --private-key $PRIVATE_KEY \
  --constructor-args $TREASURY_WALLET \
  contracts/PredictlyCoin.sol:PredictlyCoin

# PredictlyBetting
forge create --rpc-url https://sepolia.base.org \
  --private-key $PRIVATE_KEY \
  --constructor-args $COIN_ADDRESS \
  contracts/PredictlyBetting.sol:PredictlyBetting

# PredictlyLeaderboard
forge create --rpc-url https://sepolia.base.org \
  --private-key $PRIVATE_KEY \
  --constructor-args $COIN_ADDRESS \
  contracts/PredictlyLeaderboard.sol:PredictlyLeaderboard
```

---

## 📝 After Deployment Checklist

- [ ] All 3 contracts deployed
- [ ] Addresses added to `.env.local`
- [ ] Addresses added to `contractConfig.ts`
- [ ] Badges created in Leaderboard contract
- [ ] Test `getBalance()` works
- [ ] Test `buyCoins()` with Base Pay
- [ ] Test `placeBet()` with small amount
- [ ] Verify contracts on Basescan (optional but recommended)

---

## 🔍 Verify on Basescan

After deployment:
1. Go to https://sepolia.basescan.org (or basescan.org for mainnet)
2. Search for your contract address
3. Click "Contract" tab
4. Click "Verify and Publish"
5. Upload source code or use Hardhat/Foundry verification

---

## 💡 Recommendation

**For beginners:** Use Remix IDE (Option 1) - takes 10-15 minutes, zero setup.

**For production:** Use Hardhat (Option 2) - proper tooling, easier to manage.

**For advanced:** Use Foundry (Option 3) - fastest, most powerful.
