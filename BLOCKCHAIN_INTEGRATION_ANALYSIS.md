# Predictly Blockchain Integration Analysis & Implementation Guide

## 📊 Current State Analysis

### ✅ What's Already Built

#### 1. **Smart Contracts (Complete)**
- `PredictlyCoin.sol` - ERC-20-like token + betting logic
- `PredictlyBetting.sol` - Match management + bet resolution
- Full ABI definitions in `contractConfig.ts`
- 5% app fee mechanism built-in
- Treasury wallet system implemented

#### 2. **Wallet Integration (Complete)**
- Base Account SDK integration via `rootProvider.tsx`
- Wallet connection with SIWE authentication
- Address synced to localStorage
- Provider available via `useAuth()` hook

#### 3. **API Layer (Partial)**
- ✅ `/api/coins/balance` - Get coin balance
- ✅ `/api/coins/webhook` - Base Pay payment handler
- ✅ `/api/bets/place` - Place bet (writes to blockchain)
- ❌ Missing: Bet creation API for community bets
- ❌ Missing: Bet resolution API (admin only)

#### 4. **Client Utils (Complete)**
- `coinSystem.ts` - Balance, betting, Base Pay integration
- `basePay.ts` - Official Base Pay SDK wrapper
- Helper functions for validation, formatting

#### 5. **UI Components (Partial)**
- ✅ `CoinBalanceDisplay` - Shows balance
- ✅ `PlaceBetButton` - Bets on existing matches
- ✅ `BetCard` - Display community bets
- ❌ Missing: Create bet modal
- ❌ Missing: Counter-bet UI

---

## 🎯 Core Requirements Analysis

### Requirement 1: Users Can Create Bets
**Current State:** Users can only bet on pre-defined matches
**Gap:** No UI or API to create new bet opportunities

### Requirement 2: Other Users Can Bet For or Against
**Current State:** Users select a prediction option (e.g., "Home Win")
**Gap:** No explicit "bet against" mechanism or counter-betting

### Requirement 3: On-Chain Bet Recording
**Current State:** ✅ Implemented via `placeBet()` in contract
**Status:** Working correctly

### Requirement 4: Coin Deduction
**Current State:** ✅ Implemented in `placeBet()` contract function
**Status:** Working correctly

### Requirement 5: Payout After Results
**Current State:** ✅ Implemented via `resolveBet()` in contract
**Gap:** No automated result verification (needs admin trigger)

### Requirement 6: 5% Fee to App
**Current State:** ✅ Implemented in `_distributeWinnings()` internal function
**Status:** Working correctly

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
├─────────────────────────────────────────────────────────────┤
│  Community Bets Page                                        │
│    ├── View All Bets (existing)                             │
│    ├── CREATE BET MODAL (NEW)                               │
│    │     ├── Match selection                                │
│    │     ├── Position: For/Against                          │
│    │     ├── Stake amount                                   │
│    │     └── Submit                                         │
│    │                                                         │
│    └── Bet Detail View (NEW)                                │
│          ├── Bet creator info                               │
│          ├── Current odds                                   │
│          ├── COUNTER-BET BUTTON (NEW)                       │
│          └── Bet history                                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                    API LAYER (Next.js)                      │
├─────────────────────────────────────────────────────────────┤
│  /api/bets/create (NEW)                                     │
│    └── Creates bet on PredictlyCoin contract                │
│                                                             │
│  /api/bets/join (NEW)                                       │
│    └── Counter-bet against existing bet                     │
│                                                             │
│  /api/bets/resolve (NEW - Admin)                            │
│    └── Resolve bet with match result                        │
│                                                             │
│  /api/coins/balance (existing) ✅                           │
│  /api/bets/place (existing) ✅                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│               SMART CONTRACTS (Base Chain)                  │
├─────────────────────────────────────────────────────────────┤
│  PredictlyCoin.sol                                          │
│    ├── placeBet() - Deducts coins, creates bet record      │
│    ├── resolveBet() - Distributes winnings (95/5 split)    │
│    ├── getBet() - Query bet details                        │
│    └── getBalance() - Check user balance                   │
│                                                             │
│  PredictlyBetting.sol (Optional - for advanced features)   │
│    ├── createMatch() - Admin only                          │
│    └── resolveMatchBets() - Batch resolution               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Integration Points

### 1. Wallet Connection ✅
**Location:** `app/rootProvider.tsx`
**Status:** Complete
```tsx
const { address, isConnected, connect, provider } = useAuth();
```

### 2. Coin Balance Display ✅
**Location:** `app/components/CoinBalanceDisplay.tsx`
**Status:** Complete
```tsx
<CoinBalanceDisplay walletAddress={address} />
```

### 3. Place Bet on Existing Match ✅
**Location:** `app/api/bets/place.ts`
**Status:** Complete - writes to blockchain
```typescript
// API call
await placeBet(walletAddress, matchId, amount, prediction);

// Blockchain call
walletClient.writeContract({
  functionName: 'placeBet',
  args: [walletAddress, matchId, amount, prediction],
});
```

### 4. Create New Bet ❌ MISSING
**Needed:** API + UI for users to create bets

### 5. Counter-Bet ❌ MISSING
**Needed:** Join existing bet with opposite position

---

## 📝 Implementation Plan

### Phase 1: Create Bet System (NEW)

#### A. Database Schema Update
Add bet tracking to link blockchain bets with community features:

```typescript
// Type definition
interface CommunityBet {
  id: string;                    // Frontend ID
  betId: number;                 // Blockchain bet ID
  creator: string;               // Wallet address
  matchId: string;
  position: 'for' | 'against';   // Bet position
  amount: string;                // PDC amount
  prediction: string;            // e.g., "Home Win"
  odds: number;                  // e.g., 2.0
  status: 'open' | 'matched' | 'resolved';
  counterBets: CounterBet[];     // Bets against this one
  resolved: boolean;
  won: boolean | null;
  createdAt: number;
}

interface CounterBet {
  betId: number;                 // Blockchain bet ID
  bettor: string;                // Wallet address
  amount: string;
  position: 'for' | 'against';
  createdAt: number;
}
```

#### B. New API Endpoint: `/api/bets/create`

```typescript
// POST /api/bets/create
// Body: { walletAddress, matchId, amount, prediction, position }
// Returns: { betId, transactionHash }

export async function POST(request: NextRequest) {
  const { walletAddress, matchId, amount, prediction, position } = await request.json();
  
  // 1. Validate balance
  const balance = await getBalance(walletAddress);
  if (parseFloat(balance.balance) < parseFloat(amount)) {
    return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
  }
  
  // 2. Call smart contract
  const hash = await walletClient.writeContract({
    address: PREDICTLY_COIN_ADDRESS,
    abi: PREDICTLY_COIN_ABI,
    functionName: 'placeBet',
    args: [walletAddress, matchId, parseUnits(amount, 18), prediction],
  });
  
  // 3. Wait for confirmation
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  
  // 4. Get bet ID from contract
  const userBets = await publicClient.readContract({
    functionName: 'getUserBets',
    args: [walletAddress],
  });
  const betId = userBets[userBets.length - 1];
  
  // 5. Store in database (or JSON file for now)
  const communityBet = {
    id: `bet_${Date.now()}`,
    betId: Number(betId),
    creator: walletAddress,
    matchId,
    position,
    amount,
    prediction,
    odds: 2.0, // Calculate based on total pool
    status: 'open',
    counterBets: [],
    resolved: false,
    createdAt: Date.now(),
  };
  
  // Store in database
  await storeBet(communityBet);
  
  return NextResponse.json({ 
    success: true, 
    betId: Number(betId),
    communityBetId: communityBet.id,
    transactionHash: hash 
  });
}
```

#### C. New API Endpoint: `/api/bets/join`

```typescript
// POST /api/bets/join
// Body: { walletAddress, communityBetId, amount, position }
// Returns: { betId, transactionHash }

export async function POST(request: NextRequest) {
  const { walletAddress, communityBetId, amount, position } = await request.json();
  
  // 1. Get original bet
  const originalBet = await getBet(communityBetId);
  if (!originalBet) {
    return NextResponse.json({ error: 'Bet not found' }, { status: 404 });
  }
  
  // 2. Determine prediction based on position
  const prediction = position === originalBet.position 
    ? originalBet.prediction 
    : getOppositePrediction(originalBet.prediction);
  
  // 3. Place bet on blockchain
  const hash = await walletClient.writeContract({
    address: PREDICTLY_COIN_ADDRESS,
    abi: PREDICTLY_COIN_ABI,
    functionName: 'placeBet',
    args: [walletAddress, originalBet.matchId, parseUnits(amount, 18), prediction],
  });
  
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  
  // 4. Get bet ID
  const userBets = await publicClient.readContract({
    functionName: 'getUserBets',
    args: [walletAddress],
  });
  const betId = userBets[userBets.length - 1];
  
  // 5. Update community bet
  originalBet.counterBets.push({
    betId: Number(betId),
    bettor: walletAddress,
    amount,
    position,
    createdAt: Date.now(),
  });
  
  // Update status
  originalBet.status = 'matched';
  await updateBet(originalBet);
  
  return NextResponse.json({
    success: true,
    betId: Number(betId),
    transactionHash: hash,
  });
}
```

### Phase 2: UI Components (NEW)

#### A. Create Bet Modal

```tsx
// app/components/CreateBetModal.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '../rootProvider';
import { placeBet as placeBetAPI } from '../utils/coinSystem';

interface CreateBetModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: {
    matchId: string;
    homeTeam: string;
    awayTeam: string;
  };
}

export default function CreateBetModal({ isOpen, onClose, match }: CreateBetModalProps) {
  const { address } = useAuth();
  const [amount, setAmount] = useState('10');
  const [prediction, setPrediction] = useState('Home Win');
  const [position, setPosition] = useState<'for' | 'against'>('for');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    if (!address) {
      alert('Please connect wallet');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/bets/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          matchId: match.matchId,
          amount,
          prediction,
          position,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(`Bet created! Bet ID: ${data.betId}`);
        onClose();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error creating bet:', error);
      alert('Failed to create bet');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Create Bet</h2>
        
        <div className="bet-details">
          <p>{match.homeTeam} vs {match.awayTeam}</p>
        </div>

        <div className="form-group">
          <label>Your Prediction</label>
          <select value={prediction} onChange={(e) => setPrediction(e.target.value)}>
            <option value="Home Win">Home Win</option>
            <option value="Draw">Draw</option>
            <option value="Away Win">Away Win</option>
          </select>
        </div>

        <div className="form-group">
          <label>Position</label>
          <div className="position-selector">
            <button
              className={position === 'for' ? 'active' : ''}
              onClick={() => setPosition('for')}
            >
              👍 For (I think this will happen)
            </button>
            <button
              className={position === 'against' ? 'active' : ''}
              onClick={() => setPosition('against')}
            >
              👎 Against (I think this won't happen)
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>Stake Amount (PDC)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="1"
          />
        </div>

        <div className="modal-actions">
          <button onClick={onClose} disabled={isLoading}>
            Cancel
          </button>
          <button onClick={handleCreate} disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Bet'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

#### B. Counter-Bet Button Component

```tsx
// app/components/CounterBetButton.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '../rootProvider';

interface CounterBetButtonProps {
  communityBetId: string;
  originalAmount: string;
  originalPosition: 'for' | 'against';
  originalPrediction: string;
}

export default function CounterBetButton({
  communityBetId,
  originalAmount,
  originalPosition,
  originalPrediction,
}: CounterBetButtonProps) {
  const { address } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState(originalAmount);

  const oppositePosition = originalPosition === 'for' ? 'against' : 'for';

  const handleCounterBet = async () => {
    if (!address) {
      alert('Please connect wallet');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/bets/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          communityBetId,
          amount,
          position: oppositePosition,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(`Counter-bet placed! Bet ID: ${data.betId}`);
        window.location.reload(); // Refresh to show updated bet
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error placing counter-bet:', error);
      alert('Failed to place counter-bet');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="counter-bet-section">
      <h4>Think {originalPrediction} won't happen?</h4>
      <p>Bet against this prediction:</p>
      
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        min="1"
        placeholder="Amount (PDC)"
      />

      <button onClick={handleCounterBet} disabled={isLoading}>
        {isLoading ? 'Placing...' : `Bet ${oppositePosition.toUpperCase()} (${amount} PDC)`}
      </button>
    </div>
  );
}
```

### Phase 3: Hooks for Contract Interaction

#### A. `useWallet` Hook

```tsx
// app/hooks/useWallet.ts
'use client';

import { useAuth } from '../rootProvider';
import { getBalance } from '../utils/coinSystem';
import { useState, useEffect } from 'react';

export function useWallet() {
  const { address, isConnected, connect, provider } = useAuth();
  const [balance, setBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (address) {
      loadBalance();
    }
  }, [address]);

  const loadBalance = async () => {
    if (!address) return;
    
    try {
      const result = await getBalance(address);
      setBalance(result.balance);
    } catch (error) {
      console.error('Failed to load balance:', error);
    }
  };

  const refreshBalance = async () => {
    setIsLoading(true);
    await loadBalance();
    setIsLoading(false);
  };

  return {
    address,
    isConnected,
    connect,
    balance,
    refreshBalance,
    isLoading,
    provider,
  };
}
```

#### B. `useBetting` Hook

```tsx
// app/hooks/useBetting.ts
'use client';

import { useState } from 'react';
import { placeBet } from '../utils/coinSystem';
import { useWallet } from './useWallet';

export function useBetting() {
  const { address, refreshBalance } = useWallet();
  const [isPlacingBet, setIsPlacingBet] = useState(false);

  const createBet = async (
    matchId: string,
    amount: string,
    prediction: string,
    position: 'for' | 'against'
  ) => {
    if (!address) throw new Error('Wallet not connected');

    setIsPlacingBet(true);
    try {
      const response = await fetch('/api/bets/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          matchId,
          amount,
          prediction,
          position,
        }),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error);

      // Refresh balance after bet
      await refreshBalance();

      return data;
    } finally {
      setIsPlacingBet(false);
    }
  };

  const joinBet = async (
    communityBetId: string,
    amount: string,
    position: 'for' | 'against'
  ) => {
    if (!address) throw new Error('Wallet not connected');

    setIsPlacingBet(true);
    try {
      const response = await fetch('/api/bets/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          communityBetId,
          amount,
          position,
        }),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error);

      await refreshBalance();

      return data;
    } finally {
      setIsPlacingBet(false);
    }
  };

  return {
    createBet,
    joinBet,
    isPlacingBet,
  };
}
```

---

## 🎨 Transaction Flow Examples

### Example 1: Alice Creates a Bet

```typescript
// 1. Alice connects wallet
const { connect } = useAuth();
await connect();
// Address: 0xAlice...

// 2. Alice creates bet
const { createBet } = useBetting();
const result = await createBet(
  'match_123',      // Manchester United vs Liverpool
  '50',             // 50 PDC
  'Home Win',       // Prediction
  'for'             // Position: betting FOR Home Win
);

// Blockchain:
// - placeBet() called
// - 50 PDC deducted from Alice
// - Bet ID: 1
// - Status: Open

// 3. Database stores:
{
  id: 'bet_abc',
  betId: 1,
  creator: '0xAlice...',
  matchId: 'match_123',
  position: 'for',
  amount: '50',
  prediction: 'Home Win',
  status: 'open',
  counterBets: [],
}
```

### Example 2: Bob Bets Against Alice

```typescript
// 1. Bob sees Alice's bet
const aliceBet = {
  creator: '0xAlice...',
  prediction: 'Home Win',
  amount: '50 PDC',
  position: 'for',
};

// 2. Bob clicks "Bet Against"
const { joinBet } = useBetting();
await joinBet(
  'bet_abc',        // Alice's bet
  '50',             // Match Alice's amount
  'against'         // Opposite position
);

// Blockchain:
// - placeBet() called with "Away Win" prediction
// - 50 PDC deducted from Bob
// - Bet ID: 2
// - Status: Open

// 3. Database updates:
{
  id: 'bet_abc',
  betId: 1,
  creator: '0xAlice...',
  status: 'matched',  // ← Updated
  counterBets: [
    {
      betId: 2,
      bettor: '0xBob...',
      amount: '50',
      position: 'against',
    }
  ],
}
```

### Example 3: Match Resolves (Admin)

```typescript
// Admin resolves match after it ends
// Result: Manchester United wins (Home Win)

// API call (admin only)
await fetch('/api/bets/resolve', {
  method: 'POST',
  body: JSON.stringify({
    matchId: 'match_123',
    result: 'Home Win',
    adminKey: process.env.ADMIN_KEY,
  }),
});

// Blockchain calls for each bet:
// 1. resolveBet(1, true, 2) - Alice wins
//    - Winnings: 50 * 2 = 100 PDC
//    - Fee: 100 * 0.05 = 5 PDC
//    - Alice receives: 95 PDC
//    - Treasury receives: 5 PDC

// 2. resolveBet(2, false, 0) - Bob loses
//    - Winnings: 0
//    - Bob receives: 0
```

---

## 🔒 Security Considerations

### 1. Contract Access Control ✅
```solidity
modifier onlyOwner() {
    require(msg.sender == owner, "Only owner");
    _;
}
```
**Status:** Implemented correctly

### 2. Balance Validation ✅
```solidity
modifier hasBalance(address user, uint256 amount) {
    require(coinBalances[user] >= amount, "Insufficient balance");
    _;
}
```
**Status:** Implemented correctly

### 3. Reentrancy Protection ⚠️
**Recommendation:** Add `nonReentrant` modifier to `_distributeWinnings()`
```solidity
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

function _distributeWinnings(...) internal nonReentrant {
    // ...
}
```

### 4. Bet Resolution
**Current:** Admin-triggered (centralized)
**Future:** Integrate oracle (Chainlink) for automated results

### 5. Front-Running Prevention
**Risk:** Users see pending bets and front-run with counter-bet
**Mitigation:** 
- Add time delay between bet creation and counter-bet acceptance
- Implement commit-reveal scheme for bet amounts

---

## 📦 Deployment Checklist

### Pre-Deployment
- [ ] Update `.env.local` with production values
- [ ] Set `PREDICTLY_COIN_ADDRESS` in `contractConfig.ts`
- [ ] Set `TREASURY_WALLET` address
- [ ] Deploy contracts to Base mainnet
- [ ] Verify contracts on Basescan

### Contract Deployment
```bash
# 1. Compile contracts
npx hardhat compile

# 2. Deploy to Base Sepolia (testnet)
npx hardhat run scripts/deploy.ts --network base-sepolia

# 3. Update config with addresses
# contractConfig.ts → PREDICTLY_COIN_ADDRESS.TESTNET

# 4. Test thoroughly

# 5. Deploy to Base mainnet
npx hardhat run scripts/deploy.ts --network base-mainnet
```

### Post-Deployment
- [ ] Test wallet connection
- [ ] Test coin purchase (Base Pay)
- [ ] Test bet creation
- [ ] Test counter-betting
- [ ] Test bet resolution
- [ ] Monitor treasury balance
- [ ] Set up event listeners for contract events

---

## 🚀 Next Steps

### Immediate (Phase 1)
1. Create `/api/bets/create` endpoint
2. Create `/api/bets/join` endpoint
3. Add database/storage for community bets
4. Deploy contracts to Base Sepolia

### Short-Term (Phase 2)
1. Build `CreateBetModal` component
2. Build `CounterBetButton` component
3. Update `community-bets/page.tsx` with new features
4. Add "Create Bet" button to predict page

### Long-Term (Phase 3)
1. Integrate Chainlink oracles for automated results
2. Add liquidity pools for better odds
3. Implement peer-to-peer bet matching
4. Add bet marketplace (buy/sell bets before resolution)
5. NFT receipts for winning bets

---

## 📚 Resources

### Documentation
- Base Chain: https://docs.base.org
- Base Account: https://docs.base.org/base-account
- Base Pay: https://docs.base.org/base-account/guides/accept-payments
- Viem: https://viem.sh

### Smart Contract Libraries
- OpenZeppelin: https://docs.openzeppelin.com/contracts
- Hardhat: https://hardhat.org/docs

### Testing
- Sepolia Base Faucet: https://faucet.base.org
- Circle USDC Faucet: https://faucet.circle.com

---

## ✅ Summary

**Current Integration Level: 70%**

✅ Smart contracts complete
✅ Wallet integration complete
✅ Base Pay integration complete
✅ Coin balance system complete
✅ Basic betting functional
❌ Community bet creation missing
❌ Counter-betting missing
❌ Bet resolution UI missing

**Estimated Development Time:**
- Phase 1 (APIs): 4-6 hours
- Phase 2 (UI): 6-8 hours
- Phase 3 (Hooks): 2-3 hours
- Testing: 4-6 hours
**Total: ~20 hours**

