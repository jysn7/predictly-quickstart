# Predictly Coin System Implementation Guide

## Overview

The Predictly coin system enables users to:
1. **Buy PDC coins** via Base Pay
2. **Place bets** using coins
3. **Receive payouts** on winning bets (95% winnings, 5% app fee)
4. **Withdraw coins** back to Base network

All transactions are on-chain for transparency and security.

---

## Architecture

### Smart Contract Layer
- **File:** `contracts/PredictlyCoin.sol`
- **Network:** Base (Sepolia testnet or Mainnet)
- **Core Functions:**
  - `buyCoins(user, amount)` - Add coins after Base Pay confirms
  - `placeBet(user, matchId, amount, prediction)` - Create bet, deduct coins
  - `resolveBet(betId, won, multiplier)` - Resolve bet, trigger payout if won
  - `withdrawCoins(user, amount)` - Convert coins to Base
  - `_distributeWinnings(winner, totalWinnings)` - Split: 95% winner, 5% treasury

### API Layer
- **Webhook Handler:** `/api/coins/webhook.ts`
  - Receives Base Pay confirmation
  - Calls `buyCoins` on smart contract
  
- **Balance Endpoint:** `/api/coins/balance.ts`
  - `GET /api/coins/balance?walletAddress=0x...`
  - Returns current balance and statistics
  
- **Bet Placement:** `/api/bets/place.ts`
  - `POST /api/bets/place`
  - Creates bet, checks balance, records transaction

### Client Layer
- **Utilities:** `app/utils/coinSystem.ts`
  - `getBalance()` - Fetch balance from API
  - `placeBet()` - Place bet via API
  - `getCoinPackages()` - Available coin amounts
  - `validateBetAmount()` - Validate bet against balance

---

## Setup Instructions

### 1. Environment Variables

Add to `.env.local`:

```env
# Base Network
BASE_NETWORK=testnet  # or 'mainnet' for production
PRIVATE_KEY=0x...     # Private key for contract transactions (owner wallet)

# Base Pay Configuration
BASE_PAY_WEBHOOK_SECRET=your_webhook_secret_here

# Contract Addresses (after deployment)
PREDICTLY_COIN_ADDRESS=0x...
TREASURY_WALLET=0x...
```

### 2. Deploy Smart Contract

```bash
# Compile contract
npx hardhat compile

# Deploy to Base Sepolia testnet
npx hardhat run scripts/deploy.ts --network base-sepolia

# Or deploy to Base Mainnet
npx hardhat run scripts/deploy.ts --network base-mainnet
```

After deployment:
1. Copy contract address from console output
2. Update `PREDICTLY_COIN_ADDRESS` in `.env.local`
3. Verify contract on Basescan (optional)

### 3. Configure Base Pay Webhook

1. Log in to [Base Pay Dashboard](https://pay.coinbase.com)
2. Add webhook endpoint: `https://yourdomain.com/api/coins/webhook`
3. Select events: `payment.confirmed`, `payment.failed`
4. Copy webhook secret → Add to `BASE_PAY_WEBHOOK_SECRET`
5. Test webhook delivery

### 4. Test API Endpoints

#### Get Balance
```bash
curl "http://localhost:3000/api/coins/balance?walletAddress=0xYourAddress"
```

Response:
```json
{
  "success": true,
  "walletAddress": "0x...",
  "balance": "100.50",
  "stats": {
    "current": "100.50",
    "purchased": "150.00",
    "won": "50.00",
    "withdrawn": "99.50"
  }
}
```

#### Place Bet
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

Response:
```json
{
  "success": true,
  "message": "Bet placed successfully",
  "betId": 1,
  "transactionHash": "0x...",
  "status": "confirmed"
}
```

---

## User Flow

### 1. Buy Coins
```typescript
import { initiateBasePay, getCoinPackages } from '@/app/utils/coinSystem';

// Show coin packages
const packages = getCoinPackages();
// [
//   { amount: "10", usdPrice: 1, label: "10 PDC" },
//   { amount: "100", usdPrice: 10, label: "100 PDC", popular: true },
//   ...
// ]

// User selects package and pays via Base Pay
await initiateBasePay(walletAddress, "100", 10);

// Webhook automatically calls buyCoins() on smart contract
// User receives 100 PDC in their balance
```

### 2. Place Bet
```typescript
import { placeBet, validateBetAmount, getBalance } from '@/app/utils/coinSystem';

// Check balance
const balance = await getBalance(walletAddress);
// { balance: "100", stats: { ... } }

// Validate bet
const validation = validateBetAmount("10", balance.balance);
// { valid: true }

// Place bet
const result = await placeBet(walletAddress, "match_123", "10", "Home Win");
// {
//   betId: 1,
//   transactionHash: "0x...",
//   status: "confirmed"
// }
```

### 3. Bet Resolves (Admin/Oracle)
```typescript
// Admin calls resolveBet on smart contract (or via API endpoint)
// contract.resolveBet(betId, won, multiplier)

// If won:
// - Winnings = betAmount * multiplier = 10 * 2 = 20 PDC
// - Fee = 20 * 0.05 = 1 PDC
// - User receives = 20 - 1 = 19 PDC
// - Treasury receives = 1 PDC

// User's balance updates automatically
```

### 4. Withdraw Coins
```typescript
// User converts coins back to Base network
const withdrawal = await withdrawCoins(walletAddress, "50");
// Transaction sent to smart contract
// 50 PDC converted to Base funds
```

---

## Fee Structure

### How Fees Work

**Fees are only charged on winnings (not upfront):**

- User bets: 10 PDC
- Bet multiplier: 2x
- Gross winnings: 20 PDC
- App fee (5%): 1 PDC
- **User receives: 19 PDC**

### Fee Calculation
```typescript
const fee = (totalWinnings * 5) / 100;  // 5% of winnings
const netWinnings = totalWinnings - fee;  // 95% to user
const treasuryFee = fee;  // 5% to app treasury
```

### Treasury Management
- Fees accumulate in `treasuryBalance`
- Admin can withdraw via `transferTreasuryToWallet()`
- Transparent event logging: `WinningsDistributed` event emitted for each payout

---

## Contract Functions Reference

### User Functions

**buyCoins(user, amount)**
- Adds coins to user balance
- Called after Base Pay webhook confirms payment
- Emits: `CoinsPurchased`, `BalanceUpdated`, `TransactionLogged`

**placeBet(user, matchId, amount, prediction)**
- Deducts coins from user balance
- Creates bet record
- Returns: betId
- Emits: `BetPlaced`, `BalanceUpdated`, `TransactionLogged`

**resolveBet(betId, won, multiplier)**
- Marks bet as resolved
- If won: triggers `_distributeWinnings()`
- Emits: `BetResolved`, events from `_distributeWinnings()`

**withdrawCoins(user, amount)**
- Deducts coins from balance
- Transfers to user wallet
- Emits: `CoinsWithdrawn`, `BalanceUpdated`, `TransactionLogged`

### Admin Functions

**setTreasuryWallet(newWallet)**
- Changes treasury wallet address
- Only owner can call

**transferTreasuryToWallet()**
- Sends accumulated fees to treasury wallet
- Only owner can call

### Read Functions

**getBalance(user)**
- Returns current coin balance

**getUserCoinStats(user)**
- Returns: [current, purchased, won, withdrawn]

**getBet(betId)**
- Returns full bet details

**getUserBets(user)**
- Returns array of user's bet IDs

**getContractStats()**
- Returns: [totalSupply, treasuryBalance, totalBets, totalTransactions]

---

## Event Logging

All operations emit events for on-chain transparency:

```solidity
event CoinsPurchased(address indexed buyer, uint256 amount, uint256 timestamp);
event BetPlaced(address indexed bettor, uint256 betId, string matchId, uint256 amount, string prediction);
event BetResolved(uint256 indexed betId, address indexed winner, uint256 winnings, bool won);
event WinningsDistributed(address indexed winner, uint256 netWinnings, uint256 fee);
event CoinsWithdrawn(address indexed user, uint256 amount, uint256 timestamp);
event BalanceUpdated(address indexed user, uint256 newBalance);
event TransactionLogged(uint256 indexed transactionId, address indexed user, string txType, uint256 amount);
```

---

## Testing Checklist

### Unit Tests
- [ ] `buyCoins` increases balance correctly
- [ ] `placeBet` decreases balance and creates bet
- [ ] `resolveBet` calculates winnings (95/5 split)
- [ ] `withdrawCoins` decreases balance
- [ ] Invalid operations revert with proper errors

### Integration Tests
- [ ] Full flow: buy → bet → resolve → withdraw
- [ ] Balance tracking across transactions
- [ ] Fee distribution to treasury
- [ ] Event logging working correctly
- [ ] API endpoints return correct responses

### Edge Cases
- [ ] Insufficient balance for bet
- [ ] Bet resolve with 0 multiplier (loss)
- [ ] Multiple concurrent bets
- [ ] Withdraw more than balance
- [ ] Invalid wallet addresses

---

## Deployment Checklist

### Pre-Production
- [ ] Smart contract audited (recommended for mainnet)
- [ ] All environment variables set
- [ ] API endpoints tested locally
- [ ] Webhook tested with Base Pay sandbox
- [ ] Error handling verified

### Production (Mainnet)
- [ ] Contract deployed to Base Mainnet
- [ ] Treasury wallet set up with sufficient funds
- [ ] Base Pay webhook configured for production
- [ ] Admin monitoring dashboard set up
- [ ] Rate limiting on API endpoints
- [ ] Database backup configured
- [ ] Monitoring and alerting enabled

---

## Database Schema (Recommended)

```sql
-- Coin purchases (from Base Pay)
CREATE TABLE coin_purchases (
  id SERIAL PRIMARY KEY,
  payment_id VARCHAR(255) UNIQUE,
  user_id VARCHAR(255),
  wallet_address VARCHAR(255),
  amount DECIMAL(20, 18),
  currency VARCHAR(10),
  tx_hash VARCHAR(255),
  status VARCHAR(50),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Bets placed
CREATE TABLE bets (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255),
  bet_id BIGINT,
  match_id VARCHAR(255),
  amount DECIMAL(20, 18),
  prediction TEXT,
  status VARCHAR(50),
  winnings DECIMAL(20, 18),
  tx_hash VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);

-- All transactions (for audit trail)
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255),
  tx_id BIGINT,
  tx_type VARCHAR(50), -- 'purchase', 'bet', 'payout', 'withdrawal'
  amount DECIMAL(20, 18),
  tx_hash VARCHAR(255),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- User balances (cache)
CREATE TABLE user_balances (
  user_id VARCHAR(255) PRIMARY KEY,
  balance DECIMAL(20, 18),
  purchased DECIMAL(20, 18),
  won DECIMAL(20, 18),
  withdrawn DECIMAL(20, 18),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## Next Steps

1. **Deploy Smart Contract** - Run deployment script on testnet first
2. **Configure Base Pay** - Set up webhook and API keys
3. **Create UI Components** - Build coin purchase and betting interfaces
4. **Set Up Monitoring** - Add transaction tracking and alerts
5. **User Testing** - Test full flow with testnet coins
6. **Audit & Launch** - Security review before mainnet deployment

---

## Support & Troubleshooting

### Common Issues

**"Insufficient balance" error**
- Check contract balance with `getBalance()`
- Verify coins were purchased (check events)

**Webhook not firing**
- Verify webhook URL is correct and public
- Check webhook secret in environment variables
- Test webhook manually from Base Pay dashboard

**Transaction reverted**
- Check gas estimation
- Verify user has sufficient funds
- Review error message in transaction receipt

### Debugging

Enable debug logging:
```typescript
// Add to .env.local
DEBUG=true

// In code:
if (process.env.DEBUG) {
  console.log('Debug info:', { ... });
}
```

Check smart contract events:
```bash
# Get all events for a bet
cast logs "BetResolved" --rpc-url https://sepolia.base.org
```

---

## Security Considerations

1. **Private Key Storage**
   - Never commit `.env.local` to version control
   - Use secrets manager for production
   - Rotate keys regularly

2. **Webhook Security**
   - Always verify webhook signatures
   - Use HTTPS only
   - Rate limit webhook endpoints

3. **Smart Contract**
   - Only owner can call sensitive functions
   - Balance checks before operations
   - Reentrancy guards in place

4. **API Security**
   - Validate all inputs
   - Implement rate limiting
   - Add CORS restrictions
   - Use HTTPS in production

---

## Support & Documentation

- **Base Network Docs:** https://docs.base.org
- **Base Pay Integration:** https://docs.coinbase.com/pay/docs
- **Viem Docs:** https://viem.sh
- **Smart Contract ABI:** See `app/config/contractConfig.ts`

