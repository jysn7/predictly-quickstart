// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title PredictlyCoin
 * @dev A comprehensive betting and coin management system for Predictly
 * Users can buy coins, place bets, and withdraw winnings with transparent on-chain tracking
 */

contract PredictlyCoin {
    // ==================== STATE VARIABLES ====================
    
    string public name = "Predictly Coin";
    string public symbol = "PDC";
    uint8 public decimals = 18;
    
    // Total supply tracking
    uint256 public totalSupply;
    
    // Treasury wallet that receives app fees (5% of winnings)
    address public treasuryWallet;
    
    // Owner/admin address
    address public owner;
    
    // Fee percentage (5% = 5)
    uint256 public constant APP_FEE_PERCENTAGE = 5;
    
    // Mapping: user address => coin balance
    mapping(address => uint256) public coinBalances;
    
    // Mapping: user address => total spent on coins (for tracking)
    mapping(address => uint256) public totalCoinsPurchased;
    
    // Mapping: user address => total coins won from bets
    mapping(address => uint256) public totalCoinsWon;
    
    // Mapping: user address => total coins withdrawn
    mapping(address => uint256) public totalCoinsWithdrawn;
    
    // Bet structure
    struct Bet {
        uint256 betId;
        address bettor;
        string matchId;
        uint256 amountBet;
        string prediction; // e.g., "Home Win", "Draw", "Away Win"
        uint256 createdAt;
        bool resolved;
        bool won;
        uint256 winnings; // 0 if lost, amount if won (before fee)
        address payoutRecipient;
    }
    
    // Mapping: betId => Bet
    mapping(uint256 => Bet) public bets;
    
    // Counter for bet IDs
    uint256 public betCounter;
    
    // Mapping: user address => array of their bet IDs
    mapping(address => uint256[]) public userBets;
    
    // Transaction log for transparency
    struct Transaction {
        uint256 transactionId;
        address user;
        string txType; // "purchase", "bet_placed", "bet_won", "fee_deducted", "withdrawal"
        uint256 amount;
        uint256 timestamp;
        string metadata; // Additional info like matchId, betId
    }
    
    // Mapping: transactionId => Transaction
    mapping(uint256 => Transaction) public transactions;
    
    // Transaction counter
    uint256 public transactionCounter;
    
    // Mapping: user address => array of their transaction IDs
    mapping(address => uint256[]) public userTransactions;
    
    // Total treasury balance
    uint256 public treasuryBalance;
    
    // ==================== EVENTS ====================
    
    event CoinsPurchased(address indexed buyer, uint256 amount, uint256 timestamp);
    event BetPlaced(address indexed bettor, uint256 betId, string matchId, uint256 amount, string prediction);
    event BetResolved(uint256 indexed betId, address indexed winner, uint256 winnings, bool won);
    event WinningsDistributed(address indexed winner, uint256 netWinnings, uint256 fee);
    event CoinsWithdrawn(address indexed user, uint256 amount, uint256 timestamp);
    event BalanceUpdated(address indexed user, uint256 newBalance);
    event TransactionLogged(uint256 indexed transactionId, address indexed user, string txType, uint256 amount);
    
    // ==================== MODIFIERS ====================
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier hasBalance(address user, uint256 amount) {
        require(coinBalances[user] >= amount, "Insufficient coin balance");
        _;
    }
    
    modifier betExists(uint256 betId) {
        require(bets[betId].bettor != address(0), "Bet does not exist");
        _;
    }
    
    modifier betNotResolved(uint256 betId) {
        require(!bets[betId].resolved, "Bet already resolved");
        _;
    }
    
    // ==================== CONSTRUCTOR ====================
    
    constructor(address _treasuryWallet) {
        owner = msg.sender;
        treasuryWallet = _treasuryWallet;
        betCounter = 1;
        transactionCounter = 1;
    }
    
    // ==================== COIN PURCHASE FUNCTIONS ====================
    
    /**
     * @dev Buy coins with specified amount
     * In production, this would be called after Base Pay processes the payment
     * @param user Address of the user buying coins
     * @param amount Amount of coins to add (in wei/smallest unit)
     */
    function buyCoins(address user, uint256 amount) external onlyOwner {
        require(user != address(0), "Invalid user address");
        require(amount > 0, "Amount must be greater than 0");
        
        // Add coins to user balance
        coinBalances[user] += amount;
        totalSupply += amount;
        totalCoinsPurchased[user] += amount;
        
        // Log transaction
        _logTransaction(user, "purchase", amount, "Coins purchased via Base Pay");
        
        emit CoinsPurchased(user, amount, block.timestamp);
        emit BalanceUpdated(user, coinBalances[user]);
    }
    
    /**
     * @dev Get user's current coin balance
     */
    function getBalance(address user) external view returns (uint256) {
        return coinBalances[user];
    }
    
    /**
     * @dev Get user's coin statistics
     */
    function getUserCoinStats(address user) external view returns (
        uint256 current,
        uint256 purchased,
        uint256 won,
        uint256 withdrawn
    ) {
        return (
            coinBalances[user],
            totalCoinsPurchased[user],
            totalCoinsWon[user],
            totalCoinsWithdrawn[user]
        );
    }
    
    // ==================== BET PLACEMENT FUNCTIONS ====================
    
    /**
     * @dev Place a bet on a match
     * @param user Address of the bettor
     * @param matchId ID of the match
     * @param amount Amount of coins to bet
     * @param prediction The prediction (e.g., "Home Win")
     */
    function placeBet(
        address user,
        string memory matchId,
        uint256 amount,
        string memory prediction
    ) external onlyOwner hasBalance(user, amount) returns (uint256) {
        require(user != address(0), "Invalid user address");
        require(amount > 0, "Bet amount must be greater than 0");
        require(bytes(matchId).length > 0, "Match ID required");
        require(bytes(prediction).length > 0, "Prediction required");
        
        // Create bet
        uint256 newBetId = betCounter;
        bets[newBetId] = Bet({
            betId: newBetId,
            bettor: user,
            matchId: matchId,
            amountBet: amount,
            prediction: prediction,
            createdAt: block.timestamp,
            resolved: false,
            won: false,
            winnings: 0,
            payoutRecipient: user
        });
        
        // Deduct amount from user balance
        coinBalances[user] -= amount;
        
        // Add to user's bets
        userBets[user].push(newBetId);
        
        // Log transaction
        _logTransaction(user, "bet_placed", amount, string(abi.encodePacked("Bet on match: ", matchId)));
        
        // Increment counter
        betCounter++;
        
        emit BetPlaced(user, newBetId, matchId, amount, prediction);
        emit BalanceUpdated(user, coinBalances[user]);
        
        return newBetId;
    }
    
    /**
     * @dev Get bet details
     */
    function getBet(uint256 betId) external view betExists(betId) returns (Bet memory) {
        return bets[betId];
    }
    
    /**
     * @dev Get all bets for a user
     */
    function getUserBets(address user) external view returns (uint256[] memory) {
        return userBets[user];
    }
    
    /**
     * @dev Get number of bets for a user
     */
    function getUserBetCount(address user) external view returns (uint256) {
        return userBets[user].length;
    }
    
    // ==================== BET RESOLUTION FUNCTIONS ====================
    
    /**
     * @dev Resolve a bet and mark it as won or lost
     * @param betId ID of the bet to resolve
     * @param won Whether the bettor won
     * @param multiplier Payout multiplier (e.g., 2 for 2x winnings)
     */
    function resolveBet(
        uint256 betId,
        bool won,
        uint256 multiplier
    ) external onlyOwner betExists(betId) betNotResolved(betId) {
        require(multiplier > 0, "Multiplier must be greater than 0");
        
        Bet storage bet = bets[betId];
        bet.resolved = true;
        bet.won = won;
        
        if (won) {
            // Calculate total winnings (principal + profit)
            uint256 totalWinnings = bet.amountBet * multiplier;
            bet.winnings = totalWinnings;
            
            // Distribute winnings
            _distributeWinnings(bet.bettor, totalWinnings);
        }
        
        emit BetResolved(betId, bet.bettor, bet.winnings, won);
    }
    
    /**
     * @dev Distribute winnings to bettor
     * Takes 5% fee for treasury, gives 95% to winner
     * @param winner Address of the winning bettor
     * @param totalWinnings Total winnings amount (before fee)
     */
    function _distributeWinnings(address winner, uint256 totalWinnings) internal {
        require(winner != address(0), "Invalid winner address");
        require(totalWinnings > 0, "Winnings must be greater than 0");
        
        // Calculate fee (5%)
        uint256 fee = (totalWinnings * APP_FEE_PERCENTAGE) / 100;
        
        // Calculate net winnings (95%)
        uint256 netWinnings = totalWinnings - fee;
        
        // Add net winnings to user balance
        coinBalances[winner] += netWinnings;
        
        // Add fee to treasury
        treasuryBalance += fee;
        
        // Update stats
        totalCoinsWon[winner] += netWinnings;
        
        // Log fee transaction
        _logTransaction(winner, "fee_deducted", fee, "App fee (5%) on winnings");
        
        // Log winning transaction
        _logTransaction(winner, "bet_won", netWinnings, "Bet winnings (after 5% fee)");
        
        emit WinningsDistributed(winner, netWinnings, fee);
        emit BalanceUpdated(winner, coinBalances[winner]);
    }
    
    /**
     * @dev Get treasury balance and stats
     */
    function getTreasuryStats() external view onlyOwner returns (uint256) {
        return treasuryBalance;
    }
    
    // ==================== WITHDRAWAL FUNCTIONS ====================
    
    /**
     * @dev Withdraw coins (convert back to Base)
     * In production, this would trigger a Base Pay refund
     * @param user Address of the user withdrawing
     * @param amount Amount of coins to withdraw
     */
    function withdrawCoins(address user, uint256 amount) external onlyOwner hasBalance(user, amount) {
        require(user != address(0), "Invalid user address");
        require(amount > 0, "Withdrawal amount must be greater than 0");
        
        // Deduct from balance
        coinBalances[user] -= amount;
        
        // Reduce total supply
        totalSupply -= amount;
        
        // Track withdrawal
        totalCoinsWithdrawn[user] += amount;
        
        // Log transaction
        _logTransaction(user, "withdrawal", amount, "Coins withdrawn to Base wallet");
        
        emit CoinsWithdrawn(user, amount, block.timestamp);
        emit BalanceUpdated(user, coinBalances[user]);
    }
    
    // ==================== TRANSACTION TRACKING ====================
    
    /**
     * @dev Log a transaction for transparency
     */
    function _logTransaction(
        address user,
        string memory txType,
        uint256 amount,
        string memory metadata
    ) internal {
        uint256 txId = transactionCounter;
        
        transactions[txId] = Transaction({
            transactionId: txId,
            user: user,
            txType: txType,
            amount: amount,
            timestamp: block.timestamp,
            metadata: metadata
        });
        
        userTransactions[user].push(txId);
        transactionCounter++;
        
        emit TransactionLogged(txId, user, txType, amount);
    }
    
    /**
     * @dev Get transaction details
     */
    function getTransaction(uint256 txId) external view returns (Transaction memory) {
        return transactions[txId];
    }
    
    /**
     * @dev Get user's transaction history
     */
    function getUserTransactions(address user) external view returns (uint256[] memory) {
        return userTransactions[user];
    }
    
    /**
     * @dev Get number of transactions for a user
     */
    function getUserTransactionCount(address user) external view returns (uint256) {
        return userTransactions[user].length;
    }
    
    /**
     * @dev Get paginated transactions for a user
     */
    function getUserTransactionsPaginated(
        address user,
        uint256 offset,
        uint256 limit
    ) external view returns (Transaction[] memory) {
        uint256[] memory txIds = userTransactions[user];
        uint256 count = txIds.length;
        
        if (offset >= count) {
            return new Transaction[](0);
        }
        
        uint256 end = offset + limit;
        if (end > count) {
            end = count;
        }
        
        uint256 resultCount = end - offset;
        Transaction[] memory result = new Transaction[](resultCount);
        
        for (uint256 i = 0; i < resultCount; i++) {
            result[i] = transactions[txIds[count - 1 - (offset + i)]]; // Reverse order (newest first)
        }
        
        return result;
    }
    
    // ==================== ADMIN FUNCTIONS ====================
    
    /**
     * @dev Set treasury wallet (admin only)
     */
    function setTreasuryWallet(address newTreasuryWallet) external onlyOwner {
        require(newTreasuryWallet != address(0), "Invalid treasury wallet");
        treasuryWallet = newTreasuryWallet;
    }
    
    /**
     * @dev Transfer treasury balance to treasury wallet (admin only)
     */
    function transferTreasuryToWallet() external onlyOwner {
        require(treasuryBalance > 0, "No treasury balance to transfer");
        uint256 amount = treasuryBalance;
        treasuryBalance = 0;
        coinBalances[treasuryWallet] += amount;
        
        _logTransaction(treasuryWallet, "treasury_transfer", amount, "Treasury fees transferred");
    }
    
    /**
     * @dev Get contract statistics
     */
    function getContractStats() external view returns (
        uint256 totalSupplyAmount,
        uint256 treasuryBalanceAmount,
        uint256 totalBets,
        uint256 totalTransactions
    ) {
        return (
            totalSupply,
            treasuryBalance,
            betCounter - 1,
            transactionCounter - 1
        );
    }
}
