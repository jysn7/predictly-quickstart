# Predictly Blockchain Integration - Quick Implementation Guide

## ✅ What's Been Created

### 1. API Endpoints
- ✅ `/api/bets/create` - Create new community bets
- ✅ `/api/bets/join` - Counter-bet against existing bets
- ✅ `/api/bets/place` - Place bet on matches (existing)
- ✅ `/api/coins/balance` - Check balance (existing)

### 2. React Hooks
- ✅ `useWallet()` - Wallet connection, balance, account management
- ✅ `useBetting()` - Create bets, join bets, place bets

### 3. UI Components
- ✅ `CreateBetModal` - Modal to create new bets
- ✅ `CounterBetButton` - Button to bet against existing bets

### 4. Smart Contracts (Already Complete)
- ✅ `PredictlyCoin.sol` - Token + betting logic with 5% fee
- ✅ `PredictlyBetting.sol` - Match management

---

## 🚀 How to Integrate

### Step 1: Add Create Bet Button to Predict Page

```tsx
// app/predict/page.tsx
import CreateBetModal from '../components/CreateBetModal';
import { useState } from 'react';

export default function Predict() {
  const [showCreateBet, setShowCreateBet] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);

  const handleOpenCreateBet = (match: any) => {
    setSelectedMatch(match);
    setShowCreateBet(true);
  };

  return (
    <div>
      {/* Your existing match cards */}
      {matches.map(match => (
        <div key={match.matchId}>
          {/* Match details */}
          <button onClick={() => handleOpenCreateBet(match)}>
            Create Bet
          </button>
        </div>
      ))}

      {/* Add modal */}
      {selectedMatch && (
        <CreateBetModal
          isOpen={showCreateBet}
          onClose={() => setShowCreateBet(false)}
          match={selectedMatch}
          onSuccess={(result) => {
            console.log('Bet created:', result);
            // Optionally refresh data
          }}
        />
      )}
    </div>
  );
}
```

### Step 2: Add Counter-Bet to Community Bets

```tsx
// app/community-bets/page.tsx (or wherever you display individual bets)
import CounterBetButton from '../components/CounterBetButton';

export default function CommunityBets() {
  return (
    <div>
      {communityBets.map(bet => (
        <div key={bet.id}>
          {/* Bet details */}
          <p>Creator: {bet.creator}</p>
          <p>Prediction: {bet.prediction}</p>
          <p>Position: {bet.position}</p>
          <p>Amount: {bet.amount} PDC</p>
          
          {/* Add counter-bet button */}
          {bet.status === 'open' && (
            <CounterBetButton
              communityBetId={bet.id}
              originalAmount={bet.amount}
              originalPosition={bet.position}
              originalPrediction={bet.prediction}
              matchInfo={{
                homeTeam: bet.homeTeam,
                awayTeam: bet.awayTeam,
              }}
              onSuccess={(result) => {
                console.log('Counter-bet placed:', result);
                // Refresh bets
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
```

### Step 3: Use Hooks Anywhere

```tsx
// Any component
import { useWallet } from '@/app/hooks/useWallet';
import { useBetting } from '@/app/hooks/useBetting';

function MyComponent() {
  const { address, balance, connect, isConnected } = useWallet();
  const { createBet, joinBet, isPlacingBet } = useBetting();

  const handleCreateBet = async () => {
    const result = await createBet({
      matchId: 'match_123',
      amount: '10',
      prediction: 'Home Win',
      position: 'for',
    });
    
    if (result.success) {
      console.log('Bet created:', result.betId);
    }
  };

  return (
    <div>
      <p>Balance: {balance} PDC</p>
      <button onClick={handleCreateBet}>Create Bet</button>
    </div>
  );
}
```

---

## 📝 Environment Setup

### Required Environment Variables

Update your `.env.local`:

```bash
# Existing variables
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_api_key
NEXT_PUBLIC_BASE_ACCOUNT_CLIENT_ID=your_client_id
NEXT_PUBLIC_BASE_ACCOUNT_CALLBACK_URL=http://localhost:3000/api/auth/callback
GITHUB_TOKEN=your_github_token
NEXT_PUBLIC_USE_STATIC_DEMO=false
NEXT_PUBLIC_TREASURY_WALLET=0xYourTreasuryWallet

# Base Pay Configuration
NEXT_PUBLIC_BASE_NETWORK=testnet
NEXT_PUBLIC_BASE_RPC=https://sepolia.base.org

# NEW: Contract deployment
PRIVATE_KEY=0xYourPrivateKey  # For contract interactions (backend only)

# After deploying contracts, update:
# PREDICTLY_COIN_ADDRESS.TESTNET in contractConfig.ts
```

---

## 🔧 Contract Deployment

### 1. Compile Contracts

```bash
npx hardhat compile
```

### 2. Deploy to Base Sepolia (Testnet)

```bash
npx hardhat run scripts/deploy.ts --network base-sepolia
```

### 3. Update Contract Address

After deployment, update `app/config/contractConfig.ts`:

```typescript
export const PREDICTLY_COIN_ADDRESS = {
  MAINNET: '0x0000000000000000000000000000000000000000',
  TESTNET: '0xYourDeployedContractAddress', // ← Update this
};

export const TREASURY_WALLET = {
  MAINNET: '0x0000000000000000000000000000000000000000',
  TESTNET: '0xYourTreasuryWalletAddress', // ← Update this
};
```

### 4. Test the Integration

```bash
# Start development server
npm run dev

# Go to http://localhost:3000
# 1. Connect wallet
# 2. Buy coins
# 3. Create a bet
# 4. Counter-bet (from another account)
```

---

## 🎯 Usage Examples

### Example 1: User Creates a Bet

```typescript
// Alice creates a bet
const { createBet } = useBetting();

const result = await createBet({
  matchId: 'match_123',        // Man Utd vs Liverpool
  amount: '50',                 // 50 PDC
  prediction: 'Home Win',       // Man Utd wins
  position: 'for',              // Betting FOR Home Win
});

// Result:
{
  success: true,
  betId: 1,                     // Blockchain bet ID
  communityBetId: 'bet_abc',    // Frontend ID
  transactionHash: '0x...',
}
```

### Example 2: User Counter-Bets

```typescript
// Bob bets against Alice
const { joinBet } = useBetting();

const result = await joinBet({
  communityBetId: 'bet_abc',    // Alice's bet
  amount: '50',                  // Match Alice's amount
  position: 'against',           // Opposite position
});

// Result:
{
  success: true,
  betId: 2,                     // Bob's blockchain bet ID
  transactionHash: '0x...',
}
```

### Example 3: Admin Resolves Bet

```typescript
// After match ends (admin only)
// Result: Man Utd wins (Home Win)

// For Alice's bet (betId: 1)
await walletClient.writeContract({
  functionName: 'resolveBet',
  args: [1, true, 2],  // betId, won=true, multiplier=2x
});

// Alice receives:
// - Original: 50 PDC
// - Winnings: 50 PDC
// - Total: 100 PDC
// - Fee (5%): 5 PDC deducted
// - Final: 95 PDC credited

// For Bob's bet (betId: 2)
await walletClient.writeContract({
  functionName: 'resolveBet',
  args: [2, false, 0],  // betId, won=false, multiplier=0
});

// Bob receives: 0 PDC (lost bet)
```

---

## 🗂️ File Structure

```
predictly-quickstart/
├── app/
│   ├── api/
│   │   ├── bets/
│   │   │   ├── create/
│   │   │   │   └── route.ts          ✅ NEW
│   │   │   ├── join/
│   │   │   │   └── route.ts          ✅ NEW
│   │   │   └── place.ts              (existing)
│   │   └── coins/
│   │       ├── balance.ts            (existing)
│   │       └── webhook.ts            (existing)
│   │
│   ├── components/
│   │   ├── CreateBetModal.tsx        ✅ NEW
│   │   ├── CounterBetButton.tsx      ✅ NEW
│   │   ├── BetCard.tsx               (existing)
│   │   └── CoinBalanceDisplay.tsx    (existing)
│   │
│   ├── hooks/
│   │   ├── useWallet.ts              ✅ NEW
│   │   └── useBetting.ts             ✅ NEW
│   │
│   ├── utils/
│   │   ├── coinSystem.ts             (existing)
│   │   └── basePay.ts                (existing)
│   │
│   ├── config/
│   │   └── contractConfig.ts         (existing)
│   │
│   └── rootProvider.tsx              (existing)
│
├── contracts/
│   ├── PredictlyCoin.sol             (existing)
│   └── PredictlyBetting.sol          (existing)
│
├── data/
│   └── community-bets.json           ✅ Created by API
│
└── BLOCKCHAIN_INTEGRATION_ANALYSIS.md ✅ NEW
```

---

## ✅ Integration Checklist

### Backend Setup
- [ ] Add `PRIVATE_KEY` to `.env.local`
- [ ] Deploy contracts to Base Sepolia
- [ ] Update contract addresses in `contractConfig.ts`
- [ ] Test API endpoints with Postman/curl

### Frontend Integration
- [ ] Import hooks in components
- [ ] Add `CreateBetModal` to predict page
- [ ] Add `CounterBetButton` to community bets
- [ ] Test wallet connection
- [ ] Test bet creation flow
- [ ] Test counter-betting flow

### Testing
- [ ] Connect wallet successfully
- [ ] Buy coins via Base Pay
- [ ] Create a bet (check blockchain)
- [ ] Counter-bet from another account
- [ ] Verify balances update correctly
- [ ] Check transaction history

### Production Deployment
- [ ] Deploy contracts to Base Mainnet
- [ ] Update `NEXT_PUBLIC_BASE_NETWORK=mainnet`
- [ ] Update contract addresses for mainnet
- [ ] Set up monitoring for contract events
- [ ] Set up admin wallet for bet resolution

---

## 🔍 Testing Guide

### Test Scenario 1: Create Bet

1. **Connect Wallet**
   - Click "Connect Wallet"
   - Approve in Base Account wallet
   - Verify address shown

2. **Buy Coins**
   - Go to buy-coins page
   - Select 100 PDC package
   - Complete Base Pay checkout
   - Verify balance updates

3. **Create Bet**
   - Go to predict page
   - Select a match
   - Click "Create Bet"
   - Fill in:
     - Prediction: "Home Win"
     - Position: "For"
     - Amount: 10 PDC
   - Submit
   - Check transaction on Basescan
   - Verify balance decreased by 10

### Test Scenario 2: Counter-Bet

1. **Switch Account**
   - Disconnect wallet
   - Connect with different account
   - Buy coins for new account

2. **Find Bet**
   - Go to community-bets page
   - Find the bet created in Test 1

3. **Counter-Bet**
   - Click "Bet Against This"
   - Enter amount: 10 PDC
   - Confirm
   - Check transaction on Basescan
   - Verify balance decreased

### Test Scenario 3: Bet Resolution (Admin)

1. **After Match Ends**
   - Use admin wallet (has PRIVATE_KEY)
   - Call `resolveBet(betId, won, multiplier)`
   - Verify winner receives payout
   - Check 5% fee went to treasury

---

## 📚 API Reference

### POST /api/bets/create

Create a new community bet.

**Request:**
```json
{
  "walletAddress": "0x...",
  "matchId": "match_123",
  "amount": "10",
  "prediction": "Home Win",
  "position": "for"
}
```

**Response:**
```json
{
  "success": true,
  "betId": 1,
  "communityBetId": "bet_abc123",
  "transactionHash": "0x...",
  "status": "confirmed"
}
```

### POST /api/bets/join

Join an existing bet (counter-bet).

**Request:**
```json
{
  "walletAddress": "0x...",
  "communityBetId": "bet_abc123",
  "amount": "10",
  "position": "against"
}
```

**Response:**
```json
{
  "success": true,
  "betId": 2,
  "communityBetId": "bet_abc123",
  "transactionHash": "0x...",
  "status": "confirmed"
}
```

---

## 🎨 UI Integration Examples

### Add to Match Card

```tsx
<div className="match-card">
  <h3>{match.homeTeam} vs {match.awayTeam}</h3>
  
  <div className="actions">
    {/* Existing bet button */}
    <button onClick={() => placeBet(match)}>
      Quick Bet
    </button>
    
    {/* NEW: Create bet button */}
    <button onClick={() => openCreateBet(match)}>
      Create Community Bet
    </button>
  </div>
</div>
```

### Add to Community Bet Card

```tsx
<div className="bet-card">
  <div className="bet-header">
    <p>{bet.creator}</p>
    <p>{bet.prediction}</p>
  </div>
  
  <div className="bet-amount">
    {bet.amount} PDC ({bet.position})
  </div>
  
  {/* NEW: Counter-bet section */}
  {bet.status === 'open' && (
    <div className="counter-bet-section">
      <CounterBetButton
        communityBetId={bet.id}
        originalAmount={bet.amount}
        originalPosition={bet.position}
        originalPrediction={bet.prediction}
      />
    </div>
  )}
</div>
```

---

## 🚨 Troubleshooting

### Error: "PRIVATE_KEY not configured"
**Solution:** Add `PRIVATE_KEY=0x...` to `.env.local`

### Error: "Insufficient balance"
**Solution:** Buy coins via Base Pay first

### Error: "Bet not found"
**Solution:** Check that `data/community-bets.json` exists and contains the bet

### Error: "Transaction failed"
**Solution:** 
1. Check contract address is correct
2. Verify network is Base Sepolia
3. Ensure user has enough balance
4. Check gas fees

### Balance not updating
**Solution:** Call `refreshBalance()` after transaction

---

## 🎉 You're Ready!

Your blockchain betting system is now fully integrated with:
- ✅ Wallet connection
- ✅ Coin balance management  
- ✅ Bet creation (users can create)
- ✅ Counter-betting (bet for/against)
- ✅ On-chain transactions
- ✅ 5% app fee automatically
- ✅ Base Pay for purchasing coins

**Next Steps:**
1. Deploy contracts to testnet
2. Test all flows thoroughly
3. Add admin panel for bet resolution
4. Integrate Chainlink oracles (optional)
5. Deploy to production!

