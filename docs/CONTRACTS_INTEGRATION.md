# Smart Contracts Integration Guide

**Status:** ✅ Complete

---

## 🔗 Integration Overview

This guide shows how the frontend integrates with the three smart contracts.

---

## 📦 Required Contract ABIs

### 1. PredictlyCoin ABI

```typescript
// Essential functions to call
const PredictlyCoinABI = [
  // Buying coins
  "function buyCoins(address user, uint256 amount)",
  
  // Checking balance
  "function getBalance(address user) view returns (uint256)",
  "function getUserCoinStats(address user) view returns (uint256, uint256, uint256, uint256)",
  
  // Placing bets
  "function placeBet(address user, string matchId, uint256 amount, string prediction) returns (uint256)",
  
  // Getting bet info
  "function getBet(uint256 betId) view returns (tuple)",
  "function getUserBets(address user) view returns (uint256[])",
  
  // Admin functions
  "function resolveBet(uint256 betId, bool won, uint256 multiplier)",
  "function withdrawCoins(address user, uint256 amount)",
];
```

### 2. PredictlyBetting ABI

```typescript
const PredictlyBettingABI = [
  // Match management
  "function createMatch(string matchId, string sport, string homeTeam, string awayTeam, uint256 startTime)",
  "function updateMatchStatus(string matchId, string newStatus)",
  "function setMatchResult(string matchId, string result)",
  "function getMatch(string matchId) view returns (tuple)",
  "function getAllMatches() view returns (string[])",
  
  // Predictions
  "function createPrediction(string predictionId, string matchId, string option, uint256 odds)",
  "function updatePredictionOdds(string predictionId, uint256 newOdds)",
  "function getPrediction(string predictionId) view returns (tuple)",
  "function getMatchPredictions(string matchId) view returns (string[])",
  
  // Betting
  "function placeBetOnMatch(address bettor, string matchId, string predictionId, uint256 amount) returns (uint256)",
  "function getMatchBets(string matchId) view returns (tuple[])",
  
  // Resolution
  "function resolveMatchBets(string matchId, string winningPredictionId, uint256 multiplier)",
];
```

### 3. PredictlyLeaderboard ABI

```typescript
const PredictlyLeaderboardABI = [
  // User stats
  "function initializeUser(address user)",
  "function recordBetResult(address user, uint256 betAmount, bool won, uint256 profitCoins)",
  "function getUserStats(address user) view returns (tuple)",
  "function getUserWinRate(address user) view returns (uint256)",
  
  // Badges
  "function createBadge(string badgeId, string name, string description, string metricType, uint256 requiredMetric)",
  "function getUserBadges(address user) view returns (string[])",
  "function hasBadge(address user, string badgeId) view returns (bool)",
  
  // Leaderboard
  "function updateLeaderboard()",
  "function getTopUsers(uint256 limit) view returns (tuple[])",
  "function getUserRank(address user) view returns (uint256)",
  "function getLeaderboardSize() view returns (uint256)",
];
```

---

## 🔄 Integration Points

### 1. Coin Purchase Flow

**File:** `app/api/coins/webhook.ts`

```typescript
// When Base Pay webhook fires:
import { createWalletClient, parseUnits } from 'viem';

async function processCoinPurchase(userId: string, amount: string, walletAddress: string) {
  // 1. Call PredictlyCoin.buyCoins()
  const hash = await walletClient.writeContract({
    address: PREDICTLY_COIN_ADDRESS,
    abi: PREDICTLY_COIN_ABI,
    functionName: 'buyCoins',
    args: [walletAddress, parseUnits(amount, 18)],
  });
  
  // 2. Wait for confirmation
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  
  // 3. Log success
  console.log(`✅ ${amount} PDC purchased for ${userId}`);
}
```

### 2. Balance Checking

**File:** `app/api/coins/balance.ts`

```typescript
async function getBalance(walletAddress: string) {
  // Call PredictlyCoin.getBalance()
  const balance = await publicClient.readContract({
    address: PREDICTLY_COIN_ADDRESS,
    abi: PREDICTLY_COIN_ABI,
    functionName: 'getBalance',
    args: [walletAddress],
  });
  
  return formatUnits(balance, 18); // 18 decimals
}
```

### 3. Bet Placement

**File:** `app/api/bets/place.ts` (NEW - to create)

```typescript
async function placeBet(
  walletAddress: string,
  matchId: string,
  predictionId: string,
  amount: string
) {
  // 1. Call PredictlyBetting.placeBetOnMatch()
  const amountInWei = parseUnits(amount, 18);
  
  const hash = await walletClient.writeContract({
    address: PREDICTLY_BETTING_ADDRESS,
    abi: PREDICTLY_BETTING_ABI,
    functionName: 'placeBetOnMatch',
    args: [walletAddress, matchId, predictionId, amountInWei],
  });
  
  // 2. Get bet ID from transaction logs
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  const logs = parseEventLogs({
    abi: PREDICTLY_BETTING_ABI,
    eventName: 'BetPlacedOnMatch',
    logs: receipt.logs,
  });
  
  const betId = logs[0].args.betId;
  
  // 3. Record in leaderboard
  await recordBetResult(walletAddress, amount, false, 0);
  
  return betId;
}
```

### 4. Getting Matches

**File:** `app/predict/page.tsx` (INTEGRATION POINT)

```typescript
async function getMatches() {
  // Call PredictlyBetting.getAllMatches()
  const matchIds = await publicClient.readContract({
    address: PREDICTLY_BETTING_ADDRESS,
    abi: PREDICTLY_BETTING_ABI,
    functionName: 'getAllMatches',
  });
  
  // Get details for each match
  const matches = await Promise.all(
    matchIds.map(id => getMatch(id))
  );
  
  return matches;
}

async function getMatch(matchId: string) {
  const match = await publicClient.readContract({
    address: PREDICTLY_BETTING_ADDRESS,
    abi: PREDICTLY_BETTING_ABI,
    functionName: 'getMatch',
    args: [matchId],
  });
  
  // Get predictions for this match
  const predictionIds = await publicClient.readContract({
    address: PREDICTLY_BETTING_ADDRESS,
    abi: PREDICTLY_BETTING_ABI,
    functionName: 'getMatchPredictions',
    args: [matchId],
  });
  
  return { ...match, predictions: predictionIds };
}
```

### 5. Getting Leaderboard

**File:** `app/leaderboard/page.tsx` (INTEGRATION POINT)

```typescript
async function getLeaderboard(limit: number = 10) {
  // Call PredictlyLeaderboard.updateLeaderboard() (if needed)
  // Then get top users
  
  const topUsers = await publicClient.readContract({
    address: PREDICTLY_LEADERBOARD_ADDRESS,
    abi: PREDICTLY_LEADERBOARD_ABI,
    functionName: 'getTopUsers',
    args: [limit],
  });
  
  return topUsers;
}

async function getUserStats(userAddress: string) {
  const stats = await publicClient.readContract({
    address: PREDICTLY_LEADERBOARD_ADDRESS,
    abi: PREDICTLY_LEADERBOARD_ABI,
    functionName: 'getUserStats',
    args: [userAddress],
  });
  
  const rank = await publicClient.readContract({
    address: PREDICTLY_LEADERBOARD_ADDRESS,
    abi: PREDICTLY_LEADERBOARD_ABI,
    functionName: 'getUserRank',
    args: [userAddress],
  });
  
  return { ...stats, rank };
}
```

### 6. User Profile

**File:** `app/profile/[userId]/page.tsx` (INTEGRATION POINT)

```typescript
async function getUserProfile(userAddress: string) {
  // Get coin balance
  const balance = await publicClient.readContract({
    address: PREDICTLY_COIN_ADDRESS,
    abi: PREDICTLY_COIN_ABI,
    functionName: 'getUserCoinStats',
    args: [userAddress],
  });
  
  // Get stats
  const stats = await publicClient.readContract({
    address: PREDICTLY_LEADERBOARD_ADDRESS,
    abi: PREDICTLY_LEADERBOARD_ABI,
    functionName: 'getUserStats',
    args: [userAddress],
  });
  
  // Get badges
  const badges = await publicClient.readContract({
    address: PREDICTLY_LEADERBOARD_ADDRESS,
    abi: PREDICTLY_LEADERBOARD_ABI,
    functionName: 'getUserBadges',
    args: [userAddress],
  });
  
  return { balance, stats, badges };
}
```

---

## 🔐 Environment Variables

Add to `.env.local`:

```env
# Contract Addresses (after deployment)
NEXT_PUBLIC_PREDICTLY_COIN_ADDRESS=0x...
NEXT_PUBLIC_PREDICTLY_BETTING_ADDRESS=0x...
NEXT_PUBLIC_PREDICTLY_LEADERBOARD_ADDRESS=0x...

# Treasury wallet
NEXT_PUBLIC_TREASURY_WALLET=0x...

# Private key for admin operations (backend only!)
PRIVATE_KEY=0x...

# Base network
NEXT_PUBLIC_BASE_NETWORK=testnet
NEXT_PUBLIC_BASE_RPC=https://sepolia.base.org
```

---

## 📝 Configuration File

**File:** `app/config/contractConfig.ts`

```typescript
import { BASE_SEPOLIA, BASE_MAINNET } from 'viem/chains';

export const PREDICTLY_COIN_ADDRESS = {
  MAINNET: process.env.NEXT_PUBLIC_PREDICTLY_COIN_ADDRESS_MAINNET || '0x',
  TESTNET: process.env.NEXT_PUBLIC_PREDICTLY_COIN_ADDRESS_TESTNET || '0x',
} as const;

export const PREDICTLY_BETTING_ADDRESS = {
  MAINNET: process.env.NEXT_PUBLIC_PREDICTLY_BETTING_ADDRESS_MAINNET || '0x',
  TESTNET: process.env.NEXT_PUBLIC_PREDICTLY_BETTING_ADDRESS_TESTNET || '0x',
} as const;

export const PREDICTLY_LEADERBOARD_ADDRESS = {
  MAINNET: process.env.NEXT_PUBLIC_PREDICTLY_LEADERBOARD_ADDRESS_MAINNET || '0x',
  TESTNET: process.env.NEXT_PUBLIC_PREDICTLY_LEADERBOARD_ADDRESS_TESTNET || '0x',
} as const;

// ABIs
export const PREDICTLY_COIN_ABI = [
  // ... ABI definition ...
] as const;

export const PREDICTLY_BETTING_ABI = [
  // ... ABI definition ...
] as const;

export const PREDICTLY_LEADERBOARD_ABI = [
  // ... ABI definition ...
] as const;

// Network config
export const BASE_SEPOLIA_CONFIG = {
  chainId: 84532,
  name: 'Base Sepolia',
  rpc: 'https://sepolia.base.org',
};

export const BASE_MAINNET_CONFIG = {
  chainId: 8453,
  name: 'Base Mainnet',
  rpc: 'https://mainnet.base.org',
};
```

---

## 🚀 API Endpoints to Create

### New Endpoints Needed

**1. `POST /api/bets/place`** - Place a bet
```typescript
{
  walletAddress: string,
  matchId: string,
  predictionId: string,
  amount: string
}
```

**2. `GET /api/matches`** - Get all matches
```typescript
{
  matches: Match[]
}
```

**3. `GET /api/matches/[matchId]`** - Get match details
```typescript
{
  match: Match,
  predictions: Prediction[]
}
```

**4. `GET /api/leaderboard`** - Get top users
```typescript
{
  topUsers: LeaderboardEntry[]
}
```

**5. `GET /api/users/[userAddress]/stats`** - Get user stats
```typescript
{
  stats: UserStats,
  rank: number,
  badges: Badge[]
}
```

---

## 🔧 Utilities to Create

**File:** `app/utils/contracts.ts`

```typescript
import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { BASE_SEPOLIA } from 'viem/chains';

export const publicClient = createPublicClient({
  chain: BASE_SEPOLIA,
  transport: http(),
});

// Admin wallet for writing to contracts
export const adminWallet = createWalletClient({
  account: privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`),
  chain: BASE_SEPOLIA,
  transport: http(),
});

// Helper functions
export async function readFromContract(
  address: `0x${string}`,
  abi: any,
  functionName: string,
  args: any[] = []
) {
  return publicClient.readContract({
    address,
    abi,
    functionName,
    args,
  });
}

export async function writeToContract(
  address: `0x${string}`,
  abi: any,
  functionName: string,
  args: any[] = []
) {
  const hash = await adminWallet.writeContract({
    address,
    abi,
    functionName,
    args,
  });
  
  return publicClient.waitForTransactionReceipt({ hash });
}
```

---

## 📊 Data Flow Diagram

```
Frontend                Backend                  Blockchain
─────────────────────────────────────────────────────────────

User clicks "Buy Coins"
         │
         ├─→ Opens Base Pay
         │
User completes payment
         │
         ├─→ Base Pay webhook
         │
         │      ├─→ Webhook Handler
         │      │
         │      ├─→ PredictlyCoin.buyCoins()
         │      │
         │      ├─→ Transaction confirmed
         │      │
         ├─→ Success notification
         │
User navigates to predict page
         │
         ├─→ GET /api/matches
         │
         │      ├─→ PredictlyBetting.getAllMatches()
         │      │
         │      ├─→ PredictlyBetting.getMatch()
         │      │
         │      ├─→ PredictlyBetting.getMatchPredictions()
         │      │
         ├─→ Display matches with odds
         │

User selects match and places bet
         │
         ├─→ POST /api/bets/place
         │
         │      ├─→ PredictlyBetting.placeBetOnMatch()
         │      │
         │      ├─→ PredictlyCoin.placeBet()
         │      │
         │      ├─→ PredictlyLeaderboard.recordBetResult()
         │      │
         │      ├─→ Transaction confirmed
         │      │
         ├─→ Show bet confirmation
         │

Match ends
         │
         │      ├─→ Admin: PredictlyBetting.setMatchResult()
         │      │
         │      ├─→ Admin: PredictlyBetting.resolveMatchBets()
         │      │
         │      ├─→ PredictlyCoin.resolveBet() (for each bet)
         │      │
         │      ├─→ Transaction confirmed
         │      │

User checks leaderboard
         │
         ├─→ GET /api/leaderboard
         │
         │      ├─→ PredictlyLeaderboard.updateLeaderboard()
         │      │
         │      ├─→ PredictlyLeaderboard.getTopUsers()
         │      │
         ├─→ Display rankings
```

---

## ✅ Implementation Checklist

- [ ] Deploy all three contracts to Base Sepolia
- [ ] Add contract addresses to `.env.local`
- [ ] Create contract config file with ABIs
- [ ] Create contract utility functions
- [ ] Create `/api/bets/place` endpoint
- [ ] Create `/api/matches` endpoint
- [ ] Create `/api/leaderboard` endpoint
- [ ] Create `/api/users/[userId]/stats` endpoint
- [ ] Integrate with predict page
- [ ] Integrate with leaderboard page
- [ ] Integrate with profile page
- [ ] Test full flow: buy coins → place bet → resolve → check stats
- [ ] Verify leaderboard updates
- [ ] Check badge unlocks

---

**Status:** Ready for implementation! ✅
