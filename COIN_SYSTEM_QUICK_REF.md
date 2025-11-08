# Predictly Coin System - Quick Reference

## Files Created/Modified

| File | Purpose | Status |
|------|---------|--------|
| `contracts/PredictlyCoin.sol` | Smart contract with full betting logic | ✅ Complete |
| `app/config/contractConfig.ts` | Contract ABI, addresses, network config | ✅ Complete |
| `scripts/deploy.ts` | Hardhat deployment script | ✅ Complete |
| `app/api/coins/webhook.ts` | Base Pay webhook handler | ✅ Complete |
| `app/api/coins/balance.ts` | GET balance endpoint | ✅ Complete |
| `app/api/bets/place.ts` | POST place bet endpoint | ✅ Complete |
| `app/utils/coinSystem.ts` | Client-side utilities | ✅ Complete |
| `COIN_SYSTEM_GUIDE.md` | Full setup & implementation guide | ✅ Complete |

## Environment Variables Required

```env
BASE_NETWORK=testnet
PRIVATE_KEY=0x...
BASE_PAY_WEBHOOK_SECRET=...
PREDICTLY_COIN_ADDRESS=0x...
TREASURY_WALLET=0x...
```

## API Endpoints

### Get Balance
```
GET /api/coins/balance?walletAddress=0x...
Response: { balance, stats: { current, purchased, won, withdrawn } }
```

### Place Bet
```
POST /api/bets/place
Body: { walletAddress, matchId, amount, prediction }
Response: { betId, transactionHash, status }
```

### Webhook
```
POST /api/coins/webhook
(Base Pay sends: payment.confirmed, payment.failed)
```

## Core Functions

### Smart Contract Functions

```solidity
// Buy coins (after Base Pay payment confirmed)
buyCoins(address user, uint256 amount)

// Place bet
placeBet(address user, string matchId, uint256 amount, string prediction) → betId

// Resolve bet (admin only)
resolveBet(uint256 betId, bool won, uint256 multiplier)

// Withdraw coins
withdrawCoins(address user, uint256 amount)

// Read functions
getBalance(address user) → uint256
getUserBets(address user) → uint256[]
getBet(uint256 betId) → Bet
getContractStats() → (totalSupply, treasury, totalBets, totalTxs)
```

### Client Functions

```typescript
// Get balance
const balance = await getBalance(walletAddress);

// Place bet
const bet = await placeBet(walletAddress, matchId, "10", "Home Win");

// Validate bet
const { valid, error } = validateBetAmount("10", balance.balance);

// Get packages
const packages = getCoinPackages();

// Calculate winnings
const gross = calculatePotentialWinnings("10", 2.0); // "20"
const net = calculateNetWinnings(gross); // "19" (after 5% fee)
```

## Fee Structure

**Fees only on winnings (not upfront)**

```
Bet Amount: 10 PDC
Multiplier: 2x
─────────────────────────────
Gross Winnings: 20 PDC
App Fee (5%): 1 PDC
─────────────────────────────
User Receives: 19 PDC ✓
Treasury Gets: 1 PDC ✓
```

## Deployment Steps

```bash
# 1. Set environment variables
# Edit .env.local with Base network config

# 2. Deploy smart contract
npx hardhat run scripts/deploy.ts --network base-sepolia

# 3. Copy contract address to .env.local
PREDICTLY_COIN_ADDRESS=0x...

# 4. Configure Base Pay webhook
# → Base Pay Dashboard → Add webhook endpoint

# 5. Test endpoints
curl "http://localhost:3000/api/coins/balance?walletAddress=0x..."
```

## Transaction Flow

```
User → Buy Coins (Base Pay)
    ↓
Base Pay Webhook → buyCoins() contract call
    ↓
User receives PDC balance

User → Place Bet
    ↓
placeBet() contract call → deduct coins
    ↓
Bet recorded on-chain

Admin → Resolve Bet
    ↓
resolveBet() contract call → check winner
    ↓
Winner: _distributeWinnings() → 95% user + 5% treasury
    ↓
User balance updated

User → Withdraw
    ↓
withdrawCoins() contract call
    ↓
PDC converted back to Base funds
```

## Event Logs

All contract operations emit events:

```solidity
CoinsPurchased(buyer, amount, timestamp)
BetPlaced(bettor, betId, matchId, amount, prediction)
BetResolved(betId, winner, winnings, won)
WinningsDistributed(winner, netWinnings, fee)
CoinsWithdrawn(user, amount, timestamp)
BalanceUpdated(user, newBalance)
TransactionLogged(txId, user, txType, amount)
```

## Testing

### Quick Test Script

```typescript
import { getBalance, placeBet, getCoinPackages } from '@/app/utils/coinSystem';

async function testCoinSystem() {
  const wallet = "0x...";
  
  // 1. Check balance
  const balance = await getBalance(wallet);
  console.log("Balance:", balance.balance);
  
  // 2. Get coin packages
  const packages = getCoinPackages();
  console.log("Packages:", packages);
  
  // 3. Place test bet
  const bet = await placeBet(wallet, "match_123", "10", "Home Win");
  console.log("Bet placed:", bet.betId);
}
```

## Error Handling

```typescript
try {
  await placeBet(walletAddress, matchId, amount, prediction);
} catch (error) {
  if (error.message.includes('Insufficient balance')) {
    // Show: "Not enough coins. Buy more PDC."
  } else if (error.message.includes('Invalid amount')) {
    // Show: "Amount must be a valid number"
  } else {
    // Show: error.message
  }
}
```

## Monitoring

### Contract Events to Watch
- `CoinsPurchased` - User bought coins
- `BetPlaced` - New bet created
- `BetResolved` - Bet finished
- `WinningsDistributed` - Payout processed
- `CoinsWithdrawn` - User withdrew

### Alerts to Set Up
- Transaction reverted (error in contract call)
- Webhook failure (Base Pay payment not processed)
- Treasury balance anomaly (unexpected fees)
- Large withdrawal (fraud detection)

## Common Queries

### Get User Stats
```typescript
const stats = await contract.getUserCoinStats(userAddress);
// [current, purchased, won, withdrawn]
```

### Get All User Bets
```typescript
const betIds = await contract.getUserBets(userAddress);
for (const betId of betIds) {
  const bet = await contract.getBet(betId);
  console.log(bet); // Full bet details
}
```

### Get Treasury Balance
```typescript
const stats = await contract.getContractStats();
const treasuryBalance = stats[1];
```

## Production Checklist

- [ ] Smart contract deployed to Base Mainnet
- [ ] All env vars set securely
- [ ] Base Pay webhooks configured
- [ ] Database set up for transaction logging
- [ ] Admin dashboard for bet resolution
- [ ] Monitoring & alerting enabled
- [ ] Rate limiting on APIs
- [ ] HTTPS enabled
- [ ] Security audit completed
- [ ] Load testing passed

## Support Resources

- Contracts: `contracts/PredictlyCoin.sol` (380+ lines)
- Config: `app/config/contractConfig.ts` (ABI included)
- Integration Guide: `COIN_SYSTEM_GUIDE.md` (full documentation)
- Utilities: `app/utils/coinSystem.ts` (all client functions)

## Next: Frontend Components

Create these components next:
- `CoinPurchaseModal` - Buy coins via Base Pay
- `BetPlacementForm` - Place bet interface
- `CoinBalanceDisplay` - Show current balance
- `TransactionHistory` - Show all transactions
- `AdminBetResolution` - Resolve bets (admin only)

