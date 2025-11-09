# 🎯 Remix IDE Deployment - Complete Walkthrough

## 📋 Prerequisites Checklist

Before starting, make sure you have:
- [ ] MetaMask installed (browser extension)
- [ ] Base Sepolia network added to MetaMask
- [ ] Some Sepolia ETH for gas (get from faucet)
- [ ] Your 3 contract files ready (`PredictlyCoin.sol`, `PredictlyBetting.sol`, `PredictlyLeaderboard.sol`)

---

## 🚀 Step-by-Step Deployment

### PART 1: Setup MetaMask & Get Test ETH

#### Step 1: Install MetaMask (if not already installed)
1. Go to https://metamask.io
2. Click "Download"
3. Add to your browser (Chrome/Brave/Edge/Firefox)
4. Create new wallet or import existing
5. **IMPORTANT**: Save your seed phrase securely!

#### Step 2: Add Base Sepolia Network
1. Open MetaMask
2. Click network dropdown (top left, probably says "Ethereum Mainnet")
3. Click "Add network" → "Add a network manually"
4. Fill in these details:
   ```
   Network Name: Base Sepolia
   RPC URL: https://sepolia.base.org
   Chain ID: 84532
   Currency Symbol: ETH
   Block Explorer: https://sepolia.basescan.org
   ```
5. Click "Save"
6. Switch to "Base Sepolia" network

#### Step 3: Get Test ETH

**⚠️ Important:** Some faucets require you to already have 0.001 ETH on mainnet. Here are your options:

**Option A: LearnWeb3 Faucet (No ETH required - EASIEST)**
1. Go to https://learnweb3.io/faucets/base_sepolia
2. Connect GitHub account (for verification)
3. Enter wallet address
4. Click "Request"
5. ✅ Receive 0.05 testnet ETH instantly

**Option B: QuickNode Faucet (No ETH required)**
1. Go to https://faucet.quicknode.com/base/sepolia
2. Sign up for free QuickNode account
3. Enter wallet address
4. Complete captcha
5. Click "Request"
6. ✅ Receive testnet ETH

**Option C: Alchemy Faucet (Requires 0.001 mainnet ETH)**
1. Go to https://www.alchemy.com/faucets/base-sepolia
2. Sign up for free Alchemy account
3. Must have 0.001+ ETH on Ethereum mainnet
4. Enter wallet address
5. ✅ Receive 0.1 testnet ETH

**Option C: Base Sepolia Faucet via Coinbase (Requires 0.001 ETH on mainnet)**
1. Go to https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
2. Connect your wallet (must have 0.001+ ETH on Ethereum mainnet)
3. Request testnet ETH

**Option D: Bridge from Ethereum Sepolia (If you have ETH Sepolia)**
1. Get ETH Sepolia from https://sepoliafaucet.com
2. Bridge to Base Sepolia using https://bridge.base.org/deposit
3. Switch network to "Sepolia" before bridging

**Option E: Ask in Discord/Telegram (Community help)**
1. Join Base Discord: https://discord.gg/buildonbase
2. Ask in #faucet channel
3. Community members often help

**Recommended:** Use Alchemy (Option A) - fastest and no requirements!

---

### PART 2: Open Remix & Upload Contracts

#### Step 4: Open Remix IDE
1. Go to https://remix.ethereum.org
2. You'll see a default workspace with example contracts
3. **No login needed** - Remix works directly in browser

#### Step 5: Create New Workspace
1. Look at left sidebar - click "Workspaces" dropdown (top left)
2. Click "+ Create" button
3. Choose "Blank" template
4. Name it: "Predictly"
5. Click "OK"

#### Step 6: Upload Your Contract Files
You have two options:

**Option A: Drag & Drop (Easiest)**
1. Open your project folder: `predictly-quickstart/contracts/`
2. Find these 3 files:
   - `PredictlyCoin.sol`
   - `PredictlyBetting.sol`
   - `PredictlyLeaderboard.sol`
3. Drag all 3 files into Remix file explorer (left sidebar under "contracts" folder)

**Option B: Manual Upload**
1. Right-click on "contracts" folder in Remix
2. Click "New File"
3. Name it `PredictlyCoin.sol`
4. Open the file in Remix (double-click)
5. Copy-paste contents from your local `PredictlyCoin.sol`
6. Press `Ctrl+S` to save
7. Repeat for the other 2 contracts

---

### PART 3: Compile Contracts

#### Step 7: Compile PredictlyCoin
1. Click "Solidity Compiler" icon (left sidebar, 3rd icon from top - looks like an "S")
2. You'll see:
   ```
   Compiler: [dropdown showing version]
   Language: Solidity
   EVM Version: [dropdown]
   ```
3. Set **Compiler version** to `0.8.20+` (or any 0.8.x version)
4. Click on `PredictlyCoin.sol` in the file explorer to open it
5. Click big blue **"Compile PredictlyCoin.sol"** button
6. Wait 5-10 seconds
7. ✅ You should see green checkmark: "Compilation successful"

#### Step 8: Compile PredictlyBetting
1. Click on `PredictlyBetting.sol` in file explorer
2. Click **"Compile PredictlyBetting.sol"** button
3. ✅ Green checkmark should appear

#### Step 9: Compile PredictlyLeaderboard
1. Click on `PredictlyLeaderboard.sol` in file explorer
2. Click **"Compile PredictlyLeaderboard.sol"** button
3. ✅ Green checkmark should appear

**⚠️ If you see errors:**
- Check compiler version (should be 0.8.20 or higher)
- Make sure you copied entire file contents
- Check for any missing imports

---

### PART 4: Deploy Contracts

#### Step 10: Open Deploy Tab
1. Click "Deploy & Run Transactions" icon (left sidebar, 4th icon - looks like Ethereum logo)
2. You'll see:
   ```
   ENVIRONMENT: [dropdown]
   ACCOUNT: [your address]
   GAS LIMIT: 3000000
   VALUE: 0
   CONTRACT: [dropdown]
   ```

#### Step 11: Connect MetaMask
1. In **ENVIRONMENT** dropdown, select:
   ```
   Injected Provider - MetaMask
   ```
2. MetaMask popup will appear
3. Click "Connect" (or "Next" → "Connect")
4. ✅ You should see your account address under "ACCOUNT"
5. ✅ Should show your ETH balance

#### Step 12: Deploy PredictlyCoin (FIRST)
1. In **CONTRACT** dropdown, select `PredictlyCoin`
2. Look below dropdown - you'll see:
   ```
   Deploy
   _treasuryWallet: [input box]
   ```
3. In the `_treasuryWallet` box, paste your wallet address:
   - Open MetaMask
   - Click on your account name to copy address
   - Should look like: `0x1234...abcd`
   - Paste into `_treasuryWallet` box
4. Click orange **"Deploy"** button
5. MetaMask popup appears → Click "Confirm"
6. Wait 10-30 seconds for transaction
7. ✅ Bottom console shows "Contract deployed at 0x..."

#### Step 13: Copy PredictlyCoin Address
1. Look at bottom console/terminal in Remix
2. Find line: `[vm]from: 0x...to: PredictlyCoin.(constructor)`
3. OR look under "Deployed Contracts" section (below deploy button)
4. You'll see: `PREDICTLYCOIN AT 0x123...` 
5. Click the 📋 copy icon next to the address
6. **SAVE THIS ADDRESS** - paste it somewhere (Notepad/Notes app)
   ```
   PredictlyCoin: 0xYourAddressHere
   ```

#### Step 14: Deploy PredictlyBetting (SECOND)
1. In **CONTRACT** dropdown, select `PredictlyBetting`
2. You'll see:
   ```
   Deploy
   _coinContract: [input box]
   ```
3. In `_coinContract` box, paste the **PredictlyCoin address** from Step 13
4. Click orange **"Deploy"** button
5. MetaMask popup → Click "Confirm"
6. Wait for transaction
7. ✅ Bottom console shows "Contract deployed"

#### Step 15: Copy PredictlyBetting Address
1. Find the new deployed contract address (same process as Step 13)
2. **SAVE THIS ADDRESS**:
   ```
   PredictlyBetting: 0xYourAddressHere
   ```

#### Step 16: Deploy PredictlyLeaderboard (THIRD)
1. In **CONTRACT** dropdown, select `PredictlyLeaderboard`
2. You'll see:
   ```
   Deploy
   _coinContract: [input box]
   ```
3. In `_coinContract` box, paste the **PredictlyCoin address** from Step 13
4. Click orange **"Deploy"** button
5. MetaMask popup → Click "Confirm"
6. Wait for transaction
7. ✅ Contract deployed!

#### Step 17: Copy PredictlyLeaderboard Address
1. Copy the deployed address
2. **SAVE THIS ADDRESS**:
   ```
   PredictlyLeaderboard: 0xYourAddressHere
   ```

---

### PART 5: Setup Badges (Important!)

#### Step 18: Expand Leaderboard Contract
1. Under "Deployed Contracts" section
2. Find `PREDICTLYLEADERBOARD AT 0x...`
3. Click the `>` arrow to expand it
4. You'll see all the contract functions listed

#### Step 19: Create Badges (Call createBadge 12 times)

For each badge below, do this:
1. Find the `createBadge` function in the expanded contract
2. Click the `>` arrow next to `createBadge` to expand inputs
3. Fill in the 5 boxes with values from list below
4. Click orange `transact` button
5. Confirm in MetaMask
6. Wait for transaction
7. Repeat for next badge

**Badge 1: Rookie**
```
_badgeId: rookie
_name: Rookie
_description: First win
_requirementType: wins
_thresholdValue: 1
```
Click `transact` → Confirm in MetaMask

**Badge 2: Pro**
```
_badgeId: pro
_name: Pro
_description: 10 wins
_requirementType: wins
_thresholdValue: 10
```
Click `transact` → Confirm in MetaMask

**Badge 3: Legend**
```
_badgeId: legend
_name: Legend
_description: 100 wins
_requirementType: wins
_thresholdValue: 100
```
Click `transact` → Confirm in MetaMask

**Badge 4: Starter**
```
_badgeId: starter
_name: Starter
_description: First bet
_requirementType: bets
_thresholdValue: 1
```
Click `transact` → Confirm in MetaMask

**Badge 5: Grinder**
```
_badgeId: grinder
_name: Grinder
_description: 50 bets
_requirementType: bets
_thresholdValue: 50
```
Click `transact` → Confirm in MetaMask

**Badge 6: Veteran**
```
_badgeId: veteran
_name: Veteran
_description: 500 bets
_requirementType: bets
_thresholdValue: 500
```
Click `transact` → Confirm in MetaMask

**Badge 7: Profitable** (⚠️ Use big number for profit)
```
_badgeId: profitable
_name: Profitable
_description: 100 PDC profit
_requirementType: profit
_thresholdValue: 100000000000000000000
```
Click `transact` → Confirm in MetaMask

**Badge 8: Wealthy**
```
_badgeId: wealthy
_name: Wealthy
_description: 1000 PDC profit
_requirementType: profit
_thresholdValue: 1000000000000000000000
```
Click `transact` → Confirm in MetaMask

**Badge 9: Rich**
```
_badgeId: rich
_name: Rich
_description: 10000 PDC profit
_requirementType: profit
_thresholdValue: 10000000000000000000000
```
Click `transact` → Confirm in MetaMask

**Badge 10: Accurate** (⚠️ Accuracy is in basis points: 60% = 6000)
```
_badgeId: accurate
_name: Accurate
_description: 60% accuracy
_requirementType: accuracy
_thresholdValue: 6000
```
Click `transact` → Confirm in MetaMask

**Badge 11: Expert**
```
_badgeId: expert
_name: Expert
_description: 70% accuracy
_requirementType: accuracy
_thresholdValue: 7000
```
Click `transact` → Confirm in MetaMask

**Badge 12: Master**
```
_badgeId: master
_name: Master
_description: 80% accuracy
_requirementType: accuracy
_thresholdValue: 8000
```
Click `transact` → Confirm in MetaMask

✅ **All 12 badges created!**

---

### PART 6: Update Your Project

#### Step 20: Update .env.local
1. Open your project in VS Code
2. Open (or create) `.env.local` file in root folder
3. Add these lines (replace with YOUR addresses):
   ```env
   NEXT_PUBLIC_PREDICTLY_COIN_ADDRESS=0xYourCoinAddressHere
   NEXT_PUBLIC_PREDICTLY_BETTING_ADDRESS=0xYourBettingAddressHere
   NEXT_PUBLIC_PREDICTLY_LEADERBOARD_ADDRESS=0xYourLeaderboardAddressHere
   NEXT_PUBLIC_TREASURY_WALLET=0xYourWalletAddressHere
   NEXT_PUBLIC_BASE_NETWORK=testnet
   ```

#### Step 21: Update contractConfig.ts
1. Open `app/config/contractConfig.ts`
2. Find the address constants (probably at top of file)
3. Update with your deployed addresses:
   ```typescript
   export const PREDICTLY_COIN_ADDRESS = '0xYourCoinAddressHere' as `0x${string}`;
   export const PREDICTLY_BETTING_ADDRESS = '0xYourBettingAddressHere' as `0x${string}`;
   export const PREDICTLY_LEADERBOARD_ADDRESS = '0xYourLeaderboardAddressHere' as `0x${string}`;
   ```

#### Step 22: Restart Dev Server
1. Stop your dev server (Ctrl+C in terminal)
2. Run: `npm run dev`
3. Open http://localhost:3000

---

### PART 7: Test Your Deployment

#### Step 23: Test Wallet Connection
1. Open your app in browser
2. Click "Connect Wallet" button
3. Sign in with MetaMask
4. ✅ Should connect successfully

#### Step 24: Test Balance Check
1. Once connected, you should see "0 PDC" balance
2. Open browser console (F12)
3. Type: `console.log('Testing balance...')`
4. Check for any errors

#### Step 25: Test Coin Purchase (Base Pay)
1. Find "Buy Coins" button in your app
2. Click it
3. Try to purchase coins
4. Should open Base Pay modal
5. Complete purchase
6. ✅ Balance should update after transaction

#### Step 26: Test Bet Creation
1. Navigate to predict page
2. Click "Create Bet"
3. Fill in:
   - Match: Select any
   - Prediction: Home Win
   - Position: For
   - Amount: 1 PDC
4. Click "Create Bet"
5. Confirm MetaMask transaction
6. ✅ Should see success message

---

## 🎉 Success Checklist

You're done when:
- [x] All 3 contracts deployed
- [x] All 12 badges created
- [x] Addresses updated in `.env.local`
- [x] Addresses updated in `contractConfig.ts`
- [x] App connects to wallet
- [x] Can buy coins
- [x] Can create bet
- [x] No console errors

---

## 🆘 Troubleshooting

### "Insufficient funds" error
- Get more testnet ETH from faucet
- Wait for previous transactions to complete

### "Transaction failed" in MetaMask
- Increase gas limit in MetaMask (Advanced settings)
- Make sure you're on Base Sepolia network

### "Contract deployment failed"
- Check compiler version (0.8.20+)
- Make sure all files compiled with green checkmark
- Try increasing gas limit

### Can't see deployed contract
- Scroll down in Remix to "Deployed Contracts" section
- Make sure MetaMask is on Base Sepolia

### Badge creation fails
- Make sure you deployed PredictlyLeaderboard successfully
- Check you're calling createBadge on the right contract
- Verify profit values have enough zeros (18 zeros = 1 token)

### App can't connect to contracts
- Double-check addresses in `.env.local` match deployed addresses
- Restart dev server after changing .env.local
- Clear browser cache

---

## 📚 Next Steps After Deployment

1. Test all features thoroughly on testnet
2. Create some test bets with multiple accounts
3. Verify contracts on Basescan (optional but recommended)
4. When ready for production:
   - Switch MetaMask to Base Mainnet
   - Get real ETH for gas
   - Re-deploy all contracts to mainnet
   - Update addresses in config

---

## 🔗 Helpful Links

- Remix IDE: https://remix.ethereum.org
- Base Sepolia Faucet: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
- Base Sepolia Explorer: https://sepolia.basescan.org
- MetaMask Support: https://support.metamask.io

---

**Time Estimate:** 30-45 minutes for first-time deployment (including badge creation)

**Cost:** FREE (testnet uses fake ETH)
