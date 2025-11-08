# Predictly Smart Contracts Documentation

**Status:** ✅ Complete

---

## 📋 Overview

Three comprehensive smart contracts power the Predictly betting platform:

1. **PredictlyCoin.sol** - Coin management and user wallet system
2. **PredictlyBetting.sol** - Match and prediction management
3. **PredictlyLeaderboard.sol** - User statistics and rankings

---

## 🏗️ Contract Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Predictly Platform                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │ PredictlyCoin    │  │ PredictlyBetting │                 │
│  ├──────────────────┤  ├──────────────────┤                 │
│  │ - Buy coins      │  │ - Create matches │                 │
│  │ - Place bets     │  │ - Create odds    │                 │
│  │ - Resolve bets   │  │ - Place bets     │                 │
│  │ - Track balance  │  │ - Resolve matches│                 │
│  │ - Withdraw coins │  │ - Track volume   │                 │
│  └──────────────────┘  └──────────────────┘                 │
│           ▲                      ▲                            │
│           │         ┌────────────┘                            │
│           │         │                                         │
│  ┌─────────────────────────────────────┐                     │
│  │  PredictlyLeaderboard               │                     │
│  ├─────────────────────────────────────┤                     │
│  │ - Track user stats                  │                     │
│  │ - Calculate rankings                │                     │
│  │ - Manage badges/achievements        │                     │
│  │ - Update leaderboards               │                     │
│  └─────────────────────────────────────┘                     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📄 Contract Details

### 1. PredictlyCoin.sol

**Purpose:** Manages PDC coins, bets, and user balances

#### Key Functions

**Buying Coins:**
```solidity
buyCoins(address user, uint256 amount)
```
- Called after Base Pay processes payment
- Adds coins to user balance
- Logs transaction
- Emits `CoinsPurchased` event

**Placing Bets:**
```solidity
placeBet(address user, string matchId, uint256 amount, string prediction)
```
- Creates bet with match ID and prediction
- Deducts coins from user balance
- Returns bet ID for tracking
- Emits `BetPlaced` event

**Resolving Bets:**
```solidity
resolveBet(uint256 betId, bool won, uint256 multiplier)
```
- Marks bet as resolved
- If won: calculates winnings with odds multiplier
- Takes 5% fee, gives 95% to winner
- Emits `BetResolved` event

**Checking Balance:**
```solidity
getBalance(address user) → uint256
getUserCoinStats(address user) → (current, purchased, won, withdrawn)
```
- Get current balance
- Get detailed coin statistics

**Withdrawing Coins:**
```solidity
withdrawCoins(address user, uint256 amount)
```
- Convert coins back to USDC
- Reduces total supply
- Tracks withdrawal
- Emits `CoinsWithdrawn` event

#### Key Data Structures

```solidity
// Coin balance mapping
mapping(address => uint256) public coinBalances;

// Bet structure
struct Bet {
    uint256 betId;
    address bettor;
    string matchId;
    uint256 amountBet;
    string prediction;
    uint256 createdAt;
    bool resolved;
    bool won;
    uint256 winnings;
    address payoutRecipient;
}

// Transaction log
struct Transaction {
    uint256 transactionId;
    address user;
    string txType; // "purchase", "bet_placed", "bet_won", etc.
    uint256 amount;
    uint256 timestamp;
    string metadata;
}
```

#### Fee Structure

```
5% Fee on Winnings
Example:
- Bet placed: 10 PDC at 2.0x odds
- Total winnings: 20 PDC
- Fee (5%): 1 PDC → Treasury
- User receives: 19 PDC
```

---

### 2. PredictlyBetting.sol

**Purpose:** Manages sports matches, predictions, and bet outcomes

#### Key Functions

**Match Management:**
```solidity
createMatch(string matchId, string sport, string homeTeam, string awayTeam, uint256 startTime)
updateMatchStatus(string matchId, string newStatus) // "upcoming", "live", "completed", "cancelled"
setMatchResult(string matchId, string result) // "home_win", "away_win", "draw"
```

**Prediction Management:**
```solidity
createPrediction(string predictionId, string matchId, string option, uint256 odds)
updatePredictionOdds(string predictionId, uint256 newOdds)
getMatchPredictions(string matchId) → string[]
```

**Bet Placement:**
```solidity
placeBetOnMatch(address bettor, string matchId, string predictionId, uint256 amount)
```
- Validates match is upcoming
- Calls PredictlyCoin.placeBet()
- Updates prediction statistics
- Tracks bet for match resolution

**Bet Resolution:**
```solidity
resolveMatchBets(string matchId, string winningPredictionId, uint256 multiplier)
```
- Processes all bets for a match
- Determines winners based on prediction
- Calls PredictlyCoin.resolveBet() for each bet
- Emits `MatchResolved` event

#### Key Data Structures

```solidity
struct Match {
    string matchId;
    string sport;
    string homeTeam;
    string awayTeam;
    uint256 startTime;
    uint256 endTime;
    string status; // "upcoming", "live", "completed", "cancelled"
    string result;
    uint256 createdAt;
    bool resolved;
    uint256 totalBets;
    uint256 totalVolume;
}

struct Prediction {
    string predictionId;
    string matchId;
    string option; // "Home Win", "Draw", "Away Win"
    uint256 totalBets;
    uint256 totalAmount;
    uint256 odds; // in basis points (2000 = 2.0x)
}
```

#### Odds Format

```
Odds in basis points: 1 = 0.01
Examples:
- 1100 basis points = 1.1x odds
- 2000 basis points = 2.0x odds
- 3500 basis points = 3.5x odds

Validation:
- Minimum: 1100 (1.1x)
- Maximum: 100000 (100x)
```

---

### 3. PredictlyLeaderboard.sol

**Purpose:** Tracks user performance and rankings

#### Key Functions

**User Stats:**
```solidity
initializeUser(address user)
recordBetResult(address user, uint256 betAmount, bool won, uint256 profitCoins)
getUserStats(address user) → UserStats
getUserWinRate(address user) → uint256 // in basis points
getUserAverageBetSize(address user) → uint256
```

**Badge System:**
```solidity
createBadge(string badgeId, string name, string description, string metricType, uint256 requiredMetric)
getUserBadges(address user) → string[]
hasBadge(address user, string badgeId) → bool
```

**Leaderboard:**
```solidity
updateLeaderboard() // Sort and cache top users
getTopUsers(uint256 limit) → LeaderboardEntry[]
getUserRank(address user) → uint256
getLeaderboardByRank(uint256 rank) → LeaderboardEntry
```

#### Key Data Structures

```solidity
struct UserStats {
    address user;
    uint256 totalBets;
    uint256 totalWins;
    uint256 totalLosses;
    uint256 totalProfitCoins;
    uint256 totalBetAmount;
    uint256 joinedAt;
    uint256 lastBetAt;
    uint256 winStreak;
    uint256 loseStreak;
    uint256 accuracy; // in basis points
    bool isActive;
}

struct Badge {
    string badgeId;
    string name;
    string description;
    uint256 requiredMetric;
    string metricType; // "wins", "bets", "profit", "accuracy"
}

struct LeaderboardEntry {
    address user;
    uint256 rank;
    uint256 totalProfitCoins;
    uint256 totalWins;
    uint256 winRate; // in basis points
    uint256 totalBets;
}
```

#### Badge Types

```solidity
1. Wins-based
   - "rookie": 1 win
   - "pro": 10 wins
   - "legend": 100 wins

2. Bets-based
   - "starter": 1 bet
   - "grinder": 50 bets
   - "veteran": 500 bets

3. Profit-based
   - "profitable": 100 PDC profit
   - "wealthy": 1000 PDC profit
   - "rich": 10000 PDC profit

4. Accuracy-based
   - "accurate": 60% win rate
   - "expert": 70% win rate
   - "master": 80% win rate
```

---

## 🔄 User Flow

### Buying Coins
```
Frontend (checkout page)
  ↓
User clicks "Pay with Base"
  ↓
Base Pay processes payment
  ↓
Webhook → Backend
  ↓
Backend calls: PredictlyCoin.buyCoins(user, amount)
  ↓
✅ Coins added to user balance
```

### Placing a Bet
```
User selects match & prediction
  ↓
Frontend sends request
  ↓
Backend calls: PredictlyBetting.placeBetOnMatch(user, matchId, predictionId, amount)
  ↓
PredictlyBetting calls: PredictlyCoin.placeBet()
  ↓
✅ Coins deducted, Bet ID returned
  ↓
Backend calls: PredictlyLeaderboard.recordBetResult() (with pending status)
```

### Resolving a Bet
```
Match completes, result determined
  ↓
Admin calls: PredictlyBetting.setMatchResult(matchId, result)
  ↓
Admin calls: PredictlyBetting.resolveMatchBets(matchId, winningPredictionId, multiplier)
  ↓
For each bet:
  - If won: PredictlyCoin.resolveBet(betId, true, multiplier)
  - If lost: PredictlyCoin.resolveBet(betId, false, 0)
  ↓
✅ Winnings distributed with 5% fee
  ↓
Backend updates: PredictlyLeaderboard.recordBetResult(user, amount, won, profit)
```

### Viewing Leaderboard
```
Frontend requests: getTopUsers(10)
  ↓
Leaderboard contract returns cached top 10
  ↓
If cache stale (>1 hour):
  - Call updateLeaderboard()
  - Re-sort all users by profit
  - Cache results
  ↓
✅ Updated rankings displayed
```

---

## 📊 Key Metrics

### On-Chain Tracking

```
Per User:
- Total coins purchased
- Total coins won
- Total coins withdrawn
- Total bets placed
- Win/loss record
- Profit/loss amount
- Win streak
- Accuracy percentage

Per Match:
- Total bets placed
- Total volume (coins bet)
- Number of predictions
- Status (upcoming/live/completed)
- Result

Per Prediction:
- Total bets
- Total amount wagered
- Odds
- Winning bets count
```

---

## 🔐 Security Features

### Access Control
```solidity
modifier onlyOwner() {
    require(msg.sender == owner, "Only owner can call this function");
    _;
}
```

### State Validation
```solidity
modifier matchExistsCheck(string memory matchId) {
    require(matchExists[matchId], "Match does not exist");
    _;
}

modifier betNotResolved(uint256 betId) {
    require(!bets[betId].resolved, "Bet already resolved");
    _;
}
```

### Balance Validation
```solidity
modifier hasBalance(address user, uint256 amount) {
    require(coinBalances[user] >= amount, "Insufficient coin balance");
    _;
}
```

---

## 🚀 Deployment

### Prerequisites
```
- Solidity 0.8.0+
- Base Sepolia (testnet) or Base Mainnet
- Treasury wallet address
```

### Deployment Order

```bash
# 1. Deploy PredictlyCoin
PredictlyCoin coin = new PredictlyCoin(treasuryWallet);

# 2. Deploy PredictlyBetting (with coin address)
PredictlyBetting betting = new PredictlyBetting(coin.address);

# 3. Deploy PredictlyLeaderboard (with coin address)
PredictlyLeaderboard leaderboard = new PredictlyLeaderboard(coin.address);

# 4. Setup interop
coin.setBettingContractAddress(betting.address);
```

### Treasury Wallet
```
Set during PredictlyCoin deployment
Receives 5% fees from all winning bets
Can be changed by owner
Can transfer fees to wallet
```

---

## 💾 Storage Optimization

### Mappings Used
- `coinBalances`: O(1) lookup
- `userBets`: Array for iteration
- `bets`: O(1) lookup
- `matches`: O(1) lookup
- `userStats`: O(1) lookup

### Leaderboard Caching
- Cached every 1 hour
- Sorted by profit (descending)
- Quick lookups by rank
- Reduces computation on each query

---

## 📝 Events

### PredictlyCoin Events
```solidity
CoinsPurchased(address user, uint256 amount, uint256 timestamp)
BetPlaced(address user, uint256 betId, string matchId, uint256 amount, string prediction)
BetResolved(uint256 betId, address winner, uint256 winnings, bool won)
WinningsDistributed(address winner, uint256 netWinnings, uint256 fee)
CoinsWithdrawn(address user, uint256 amount, uint256 timestamp)
BalanceUpdated(address user, uint256 newBalance)
TransactionLogged(uint256 txId, address user, string txType, uint256 amount)
```

### PredictlyBetting Events
```solidity
MatchCreated(string matchId, string sport, string homeTeam, string awayTeam, uint256 startTime)
MatchStatusUpdated(string matchId, string newStatus, uint256 timestamp)
MatchResultSet(string matchId, string result, uint256 timestamp)
PredictionCreated(string predictionId, string matchId, string option, uint256 odds)
BetPlacedOnMatch(string matchId, uint256 betId, address bettor, string prediction, uint256 amount)
MatchResolved(string matchId, string winningPrediction, uint256 totalWinnings)
OddsUpdated(string predictionId, uint256 newOdds, uint256 timestamp)
```

### PredictlyLeaderboard Events
```solidity
UserStatsUpdated(address user, uint256 totalBets, uint256 totalWins, uint256 totalProfit)
BetResultRecorded(address user, bool won, uint256 amount, uint256 timestamp)
BadgeUnlocked(address user, string badgeId, uint256 timestamp)
LeaderboardUpdated(uint256 timestamp, uint256 topUserCount)
BadgeCreated(string badgeId, string name, string metricType, uint256 requiredMetric)
```

---

## 🧪 Testing Checklist

- [ ] Deploy all three contracts
- [ ] Buy coins via PredictlyCoin
- [ ] Create match and predictions via PredictlyBetting
- [ ] Place bets and verify balance deduction
- [ ] Resolve bets and verify fee calculation
- [ ] Check leaderboard updates
- [ ] Verify badge unlocks
- [ ] Test edge cases (insufficient balance, invalid matches, etc.)
- [ ] Verify transaction history
- [ ] Check admin functions

---

## 📚 Additional Resources

- Solidity Docs: https://docs.soliditylang.org/
- Base Network: https://www.base.org/
- OpenZeppelin: https://docs.openzeppelin.com/

---

**Status:** Ready for deployment! ✅
