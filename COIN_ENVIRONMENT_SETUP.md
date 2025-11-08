# Predictly Coin System - Environment Setup

Complete environment configuration guide for the coin system.

## Step 1: Get Base Network Details

### Base Sepolia Testnet (Recommended for Testing)
- **Network ID:** 84532
- **Chain ID:** 84532
- **RPC URL:** https://sepolia.base.org
- **Block Explorer:** https://sepolia.basescan.org
- **Get Testnet ETH:** https://faucet.circle.io/base-ethereum-goerli

### Base Mainnet (Production)
- **Network ID:** 8453
- **Chain ID:** 8453
- **RPC URL:** https://mainnet.base.org
- **Block Explorer:** https://basescan.org
- **Get Mainnet ETH:** Purchase on exchange

---

## Step 2: Create Private Key

### For Testnet Testing (Dev Only)
```bash
# Generate a new private key
openssl rand -hex 32

# Or use Web3.py
python3 -c "from eth_account import Account; acc = Account.create(); print(f'Address: {acc.address}\nPrivate: {acc.key.hex()}')"
```

### For Production (DO NOT EXPOSE)
1. Use a hardware wallet (Ledger, Trezor)
2. Or use a dedicated service account via secret manager
3. **NEVER** commit private keys to version control
4. **NEVER** expose in client-side code

---

## Step 3: Fund Your Account

### Testnet
```bash
# Option 1: Circle Faucet
# Visit: https://faucet.circle.io/base-ethereum-goerli
# Enter wallet address, receive 5 testnet ETH

# Option 2: Coinbase Faucet
# Visit: https://www.coinbase.com/faucets
# Select Base Sepolia

# Verify funding
cast balance 0xYourAddress --rpc-url https://sepolia.base.org
```

### Mainnet
```bash
# Purchase ETH from exchange (Coinbase, Kraken, etc.)
# Transfer to your account
# Keep at least 0.5 ETH for gas fees

# Verify funding
cast balance 0xYourAddress --rpc-url https://mainnet.base.org
```

---

## Step 4: Create .env.local

```bash
cd predictly-quickstart
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
# ============================================
# BASE NETWORK CONFIGURATION
# ============================================

# Network selection
BASE_NETWORK=testnet

# For testnet - use PRIVATE_KEY
# For mainnet - use hardware wallet or secrets manager
PRIVATE_KEY=0xYourPrivateKeyHere

# Treasury wallet (receives app fees)
TREASURY_WALLET=0xTreasuryWalletAddress

# ============================================
# BASE PAY CONFIGURATION
# ============================================

# Webhook secret from Base Pay dashboard
BASE_PAY_WEBHOOK_SECRET=your_webhook_secret_123abc

# Base Pay API key (if using Base Pay SDK)
BASE_PAY_API_KEY=pk_base_...

# ============================================
# CONTRACT ADDRESSES
# ============================================

# After deployment, fill these in
PREDICTLY_COIN_ADDRESS=0x...
BASE_SEPOLIA_RPC=https://sepolia.base.org
BASE_MAINNET_RPC=https://mainnet.base.org

# ============================================
# DEBUGGING
# ============================================

DEBUG=false
LOG_LEVEL=info
```

---

## Step 5: Create Hardhat Configuration

Create `hardhat.config.ts`:

```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require("dotenv").config();

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    "base-sepolia": {
      url: process.env.BASE_SEPOLIA_RPC || "https://sepolia.base.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 84532,
    },
    "base-mainnet": {
      url: process.env.BASE_MAINNET_RPC || "https://mainnet.base.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 8453,
    },
  },
  etherscan: {
    apiKey: {
      base: process.env.BASESCAN_API_KEY || "",
    },
  },
};

export default config;
```

Create `hardhat.config.js` if using JavaScript:

```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.24",
  networks: {
    "base-sepolia": {
      url: process.env.BASE_SEPOLIA_RPC || "https://sepolia.base.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 84532,
    },
    "base-mainnet": {
      url: process.env.BASE_MAINNET_RPC || "https://mainnet.base.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 8453,
    },
  },
};
```

---

## Step 6: Install Required Packages

```bash
# Install Hardhat
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Install Viem (already in project)
npm list viem

# Install other dependencies
npm install dotenv
npm install --save-dev typescript @types/node

# Verify installations
npm list hardhat viem typescript
```

---

## Step 7: Deploy Contract

### Step 7a: Compile

```bash
npx hardhat compile
```

Expected output:
```
Compiling 1 file with 0.8.24
PredictlyCoin.sol compiled successfully
```

### Step 7b: Deploy to Testnet

```bash
npx hardhat run scripts/deploy.ts --network base-sepolia
```

Expected output:
```
🚀 Starting PredictlyCoin deployment to Base...
📍 Deploying from account: 0x...
💰 Account balance: 5.0 ETH

⏳ Deploying PredictlyCoin contract...
✅ PredictlyCoin deployed to: 0x1234567890...

📊 Initial Contract Stats:
   Total Supply: 0 PDC
   Treasury Balance: 0 PDC
   Total Bets: 0
   Total Transactions: 0

✅ Deployment info saved to: contracts/deployment/PredictlyCoin.deployment.json
```

### Step 7c: Save Contract Address

```bash
# Copy the contract address
PREDICTLY_COIN_ADDRESS=0x1234567890...

# Update .env.local
# Add: PREDICTLY_COIN_ADDRESS=0x...
```

---

## Step 8: Configure Base Pay Webhook

### 8.1 Create Webhook in Base Pay Dashboard

1. Go to https://pay.coinbase.com/dashboard
2. Navigate to "Webhooks"
3. Click "Create Webhook"
4. Set webhook URL:
   - **Testnet:** `http://localhost:3000/api/coins/webhook` (local testing)
   - **Production:** `https://yourdomain.com/api/coins/webhook`
5. Select events:
   - ✅ `payment.confirmed`
   - ✅ `payment.failed`
6. Copy webhook secret

### 8.2 Add Secret to Environment

```env
BASE_PAY_WEBHOOK_SECRET=whsec_test_1234567890abcdef
```

### 8.3 Test Webhook Locally

```bash
# If using ngrok for local tunnel
ngrok http 3000

# Update webhook URL in Base Pay with ngrok URL:
# https://xxxx-xxxx-xxxx-xxxx.ngrok.io/api/coins/webhook
```

---

## Step 9: Start Development Server

```bash
# Install dependencies
npm install

# Start Next.js dev server
npm run dev

# Expected output:
# - Local: http://localhost:3000
# - API Routes available
```

---

## Step 10: Test Integration

### Test 1: Check Balance Endpoint

```bash
# Get a test address balance
curl "http://localhost:3000/api/coins/balance?walletAddress=0x1234567890abcdef"

# Expected response:
# {
#   "success": true,
#   "balance": "0",
#   "stats": { ... }
# }
```

### Test 2: Simulate Base Pay Webhook

```bash
# Create test payload
curl -X POST http://localhost:3000/api/coins/webhook \
  -H "Content-Type: application/json" \
  -H "x-webhook-signature: your_signature" \
  -d '{
    "event": "payment.confirmed",
    "data": {
      "paymentId": "pay_123",
      "amount": 100,
      "currency": "USD",
      "metadata": {
        "userId": "user_123",
        "walletAddress": "0x..."
      }
    }
  }'
```

### Test 3: Place Test Bet

```bash
curl -X POST http://localhost:3000/api/bets/place \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x...",
    "matchId": "match_123",
    "amount": "10",
    "prediction": "Home Win"
  }'
```

---

## Security Best Practices

### Development

✅ Use testnet with test ETH only
✅ Keep `.env.local` in `.gitignore`
✅ Use weak private keys for testing
✅ Enable debug logging

### Production

❌ DO NOT use same private key across environments
❌ DO NOT expose private keys in code/logs
❌ DO NOT commit `.env.local` to git
✅ Use secrets manager (AWS Secrets, HashiCorp Vault)
✅ Use hardware wallet for mainnet
✅ Enable rate limiting on APIs
✅ Use HTTPS only
✅ Monitor all transactions

---

## Troubleshooting

### "Insufficient gas"
```bash
# Check gas price
cast gas-price --rpc-url https://sepolia.base.org

# Increase gas limit in deployment script
```

### "Account has no code"
```bash
# Contract not deployed yet
# Run deployment script first
npx hardhat run scripts/deploy.ts --network base-sepolia
```

### "Invalid private key"
```bash
# Check format - must be 0x prefixed hex
# Must be 32 bytes (64 hex chars after 0x)
# Example: 0xaabbccdd...
```

### "RPC Error: invalid json rpc response"
```bash
# RPC URL down or invalid
# Try alternative RPC:
# - https://base-sepolia-rpc.publicnode.com
# - https://base-rpc.publicnode.com (mainnet)
```

---

## Environment Verification

Run this to verify setup:

```bash
# Check Hardhat
npx hardhat --version

# Check contract compiles
npx hardhat compile

# Check network connection
cast net-id --rpc-url https://sepolia.base.org

# Check account balance
cast balance 0xYourAddress --rpc-url https://sepolia.base.org

# Check contract deployed
cast code 0xContractAddress --rpc-url https://sepolia.base.org
```

---

## Next Steps

1. ✅ Environment configured
2. ✅ Smart contract deployed
3. ⏳ Create UI components
4. ⏳ Set up database for transactions
5. ⏳ Launch to production

See `COIN_SYSTEM_GUIDE.md` for full implementation details.

