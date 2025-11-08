// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title PredictlyLeaderboard
 * @dev Manages user statistics, rankings, and leaderboards
 * 
 * This contract handles:
 * - User statistics tracking (wins, losses, profit)
 * - Ranking and leaderboard management
 * - Achievement badges
 * - Performance metrics
 */

interface IPredictlyCoin {
    function getUserCoinStats(address user) external view returns (
        uint256 current,
        uint256 purchased,
        uint256 won,
        uint256 withdrawn
    );
}

contract PredictlyLeaderboard {
    // ==================== STATE VARIABLES ====================
    
    address public owner;
    address public coinContractAddress;
    
    IPredictlyCoin public coinContract;
    
    // User statistics structure
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
        uint256 accuracy; // in basis points (5000 = 50%)
        bool isActive;
    }
    
    // Achievement badge structure
    struct Badge {
        string badgeId;
        string name;
        string description;
        uint256 requiredMetric; // e.g., 10 for "10 wins"
        string metricType; // "wins", "bets", "profit", "accuracy"
    }
    
    // User badge tracking
    struct UserBadge {
        address user;
        string badgeId;
        uint256 unlockedAt;
    }
    
    // Leaderboard entry (cached for efficiency)
    struct LeaderboardEntry {
        address user;
        uint256 rank;
        uint256 totalProfitCoins;
        uint256 totalWins;
        uint256 winRate; // in basis points
        uint256 totalBets;
    }
    
    // Mapping: user address => UserStats
    mapping(address => UserStats) public userStats;
    
    // Mapping: badgeId => Badge
    mapping(string => Badge) public badges;
    
    // Mapping: user => badgeId => UserBadge
    mapping(address => mapping(string => UserBadge)) public userBadges;
    
    // Mapping: user => array of badge IDs they own
    mapping(address => string[]) public userBadgesList;
    
    // Array of active users (for leaderboard)
    address[] public activeUsers;
    
    // Mapping to check if user is already in active list
    mapping(address => bool) public isActiveUser;
    
    // Array of all badge IDs
    string[] public badgeIds;
    
    // Cached leaderboard
    LeaderboardEntry[] public leaderboardCache;
    uint256 public lastLeaderboardUpdate;
    uint256 public constant LEADERBOARD_UPDATE_INTERVAL = 1 hours;
    
    // Stats for the platform
    uint256 public totalBetsPlaced;
    uint256 public totalProfitDistributed;
    
    // ==================== EVENTS ====================
    
    event UserStatsUpdated(
        address indexed user,
        uint256 totalBets,
        uint256 totalWins,
        uint256 totalProfit
    );
    
    event BetResultRecorded(
        address indexed user,
        bool won,
        uint256 amount,
        uint256 timestamp
    );
    
    event BadgeUnlocked(
        address indexed user,
        string badgeId,
        uint256 timestamp
    );
    
    event LeaderboardUpdated(
        uint256 timestamp,
        uint256 topUserCount
    );
    
    event BadgeCreated(
        string badgeId,
        string name,
        string metricType,
        uint256 requiredMetric
    );
    
    // ==================== MODIFIERS ====================
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier badgeExists(string memory badgeId) {
        require(bytes(badges[badgeId].badgeId).length > 0, "Badge does not exist");
        _;
    }
    
    // ==================== CONSTRUCTOR ====================
    
    constructor(address _coinContractAddress) {
        owner = msg.sender;
        coinContractAddress = _coinContractAddress;
        coinContract = IPredictlyCoin(_coinContractAddress);
    }
    
    // ==================== USER STATS MANAGEMENT ====================
    
    /**
     * @dev Initialize user stats when they first bet
     */
    function initializeUser(address user) external onlyOwner {
        require(user != address(0), "Invalid user address");
        
        if (!isActiveUser[user]) {
            userStats[user] = UserStats({
                user: user,
                totalBets: 0,
                totalWins: 0,
                totalLosses: 0,
                totalProfitCoins: 0,
                totalBetAmount: 0,
                joinedAt: block.timestamp,
                lastBetAt: 0,
                winStreak: 0,
                loseStreak: 0,
                accuracy: 0,
                isActive: true
            });
            
            activeUsers.push(user);
            isActiveUser[user] = true;
        }
    }
    
    /**
     * @dev Record a bet result
     */
    function recordBetResult(
        address user,
        uint256 betAmount,
        bool won,
        uint256 profitCoins
    ) external onlyOwner {
        require(user != address(0), "Invalid user address");
        
        // Initialize user if needed
        if (!isActiveUser[user]) {
            initializeUser(user);
        }
        
        UserStats storage stats = userStats[user];
        
        // Update bet count
        stats.totalBets++;
        stats.totalBetAmount += betAmount;
        stats.lastBetAt = block.timestamp;
        
        totalBetsPlaced++;
        
        if (won) {
            // Win
            stats.totalWins++;
            stats.winStreak++;
            stats.loseStreak = 0;
            stats.totalProfitCoins += profitCoins;
            totalProfitDistributed += profitCoins;
        } else {
            // Loss
            stats.totalLosses++;
            stats.winStreak = 0;
            stats.loseStreak++;
        }
        
        // Update accuracy (wins / total bets)
        stats.accuracy = (stats.totalWins * 10000) / stats.totalBets;
        
        // Check for badge unlocks
        _checkAndUnlockBadges(user, stats);
        
        emit BetResultRecorded(user, won, betAmount, block.timestamp);
        emit UserStatsUpdated(user, stats.totalBets, stats.totalWins, stats.totalProfitCoins);
    }
    
    /**
     * @dev Get user statistics
     */
    function getUserStats(address user) external view returns (UserStats memory) {
        require(user != address(0), "Invalid user address");
        return userStats[user];
    }
    
    /**
     * @dev Get user win rate percentage
     */
    function getUserWinRate(address user) external view returns (uint256) {
        require(user != address(0), "Invalid user address");
        UserStats memory stats = userStats[user];
        if (stats.totalBets == 0) return 0;
        return (stats.totalWins * 10000) / stats.totalBets;
    }
    
    /**
     * @dev Get user average bet size
     */
    function getUserAverageBetSize(address user) external view returns (uint256) {
        require(user != address(0), "Invalid user address");
        UserStats memory stats = userStats[user];
        if (stats.totalBets == 0) return 0;
        return stats.totalBetAmount / stats.totalBets;
    }
    
    // ==================== BADGE MANAGEMENT ====================
    
    /**
     * @dev Create a new badge
     */
    function createBadge(
        string memory badgeId,
        string memory name,
        string memory description,
        string memory metricType,
        uint256 requiredMetric
    ) external onlyOwner {
        require(bytes(badgeId).length > 0, "Badge ID required");
        require(bytes(name).length > 0, "Name required");
        require(bytes(metricType).length > 0, "Metric type required");
        
        badges[badgeId] = Badge({
            badgeId: badgeId,
            name: name,
            description: description,
            requiredMetric: requiredMetric,
            metricType: metricType
        });
        
        badgeIds.push(badgeId);
        
        emit BadgeCreated(badgeId, name, metricType, requiredMetric);
    }
    
    /**
     * @dev Check and unlock badges for a user
     */
    function _checkAndUnlockBadges(address user, UserStats storage stats) internal {
        for (uint256 i = 0; i < badgeIds.length; i++) {
            string memory badgeId = badgeIds[i];
            Badge storage badge = badges[badgeId];
            
            // Skip if already unlocked
            if (bytes(userBadges[user][badgeId].badgeId).length > 0) {
                continue;
            }
            
            bool shouldUnlock = false;
            
            if (keccak256(bytes(badge.metricType)) == keccak256(bytes("wins"))) {
                shouldUnlock = stats.totalWins >= badge.requiredMetric;
            } else if (keccak256(bytes(badge.metricType)) == keccak256(bytes("bets"))) {
                shouldUnlock = stats.totalBets >= badge.requiredMetric;
            } else if (keccak256(bytes(badge.metricType)) == keccak256(bytes("profit"))) {
                shouldUnlock = stats.totalProfitCoins >= badge.requiredMetric;
            } else if (keccak256(bytes(badge.metricType)) == keccak256(bytes("accuracy"))) {
                shouldUnlock = stats.accuracy >= badge.requiredMetric;
            }
            
            if (shouldUnlock) {
                userBadges[user][badgeId] = UserBadge({
                    user: user,
                    badgeId: badgeId,
                    unlockedAt: block.timestamp
                });
                
                userBadgesList[user].push(badgeId);
                
                emit BadgeUnlocked(user, badgeId, block.timestamp);
            }
        }
    }
    
    /**
     * @dev Get user's badges
     */
    function getUserBadges(address user) external view returns (string[] memory) {
        return userBadgesList[user];
    }
    
    /**
     * @dev Check if user has badge
     */
    function hasBadge(address user, string memory badgeId) external view returns (bool) {
        return bytes(userBadges[user][badgeId].badgeId).length > 0;
    }
    
    /**
     * @dev Get badge details
     */
    function getBadge(string memory badgeId) external view badgeExists(badgeId) returns (Badge memory) {
        return badges[badgeId];
    }
    
    /**
     * @dev Get all badges
     */
    function getAllBadges() external view returns (string[] memory) {
        return badgeIds;
    }
    
    // ==================== LEADERBOARD ====================
    
    /**
     * @dev Update leaderboard cache (should be called periodically by bot or trigger)
     */
    function updateLeaderboard() external {
        require(
            block.timestamp >= lastLeaderboardUpdate + LEADERBOARD_UPDATE_INTERVAL || lastLeaderboardUpdate == 0,
            "Leaderboard updated too recently"
        );
        
        // Create temporary array to sort
        LeaderboardEntry[] memory tempLeaderboard = new LeaderboardEntry[](activeUsers.length);
        
        for (uint256 i = 0; i < activeUsers.length; i++) {
            address user = activeUsers[i];
            UserStats memory stats = userStats[user];
            uint256 winRate = stats.totalBets == 0 ? 0 : (stats.totalWins * 10000) / stats.totalBets;
            
            tempLeaderboard[i] = LeaderboardEntry({
                user: user,
                rank: 0,
                totalProfitCoins: stats.totalProfitCoins,
                totalWins: stats.totalWins,
                winRate: winRate,
                totalBets: stats.totalBets
            });
        }
        
        // Sort by profit (descending)
        _quickSort(tempLeaderboard, 0, int256(tempLeaderboard.length) - 1);
        
        // Assign ranks
        for (uint256 i = 0; i < tempLeaderboard.length; i++) {
            tempLeaderboard[i].rank = i + 1;
        }
        
        // Update cache
        delete leaderboardCache;
        for (uint256 i = 0; i < tempLeaderboard.length; i++) {
            leaderboardCache.push(tempLeaderboard[i]);
        }
        
        lastLeaderboardUpdate = block.timestamp;
        
        emit LeaderboardUpdated(block.timestamp, leaderboardCache.length);
    }
    
    /**
     * @dev Quick sort helper for leaderboard
     */
    function _quickSort(
        LeaderboardEntry[] memory arr,
        int256 left,
        int256 right
    ) internal pure {
        int256 i = left;
        int256 j = right;
        
        if (i == j) return;
        
        uint256 pivot = arr[uint256(left + (right - left) / 2)].totalProfitCoins;
        
        while (i <= j) {
            while (arr[uint256(i)].totalProfitCoins > pivot) i++;
            while (arr[uint256(j)].totalProfitCoins < pivot) j--;
            
            if (i <= j) {
                (arr[uint256(i)], arr[uint256(j)]) = (arr[uint256(j)], arr[uint256(i)]);
                i++;
                j--;
            }
        }
        
        if (left < j) _quickSort(arr, left, j);
        if (i < right) _quickSort(arr, i, right);
    }
    
    /**
     * @dev Get top N users from leaderboard
     */
    function getTopUsers(uint256 limit) external view returns (LeaderboardEntry[] memory) {
        require(limit > 0, "Limit must be greater than 0");
        
        uint256 resultCount = limit > leaderboardCache.length ? leaderboardCache.length : limit;
        LeaderboardEntry[] memory result = new LeaderboardEntry[](resultCount);
        
        for (uint256 i = 0; i < resultCount; i++) {
            result[i] = leaderboardCache[i];
        }
        
        return result;
    }
    
    /**
     * @dev Get user's rank
     */
    function getUserRank(address user) external view returns (uint256) {
        for (uint256 i = 0; i < leaderboardCache.length; i++) {
            if (leaderboardCache[i].user == user) {
                return leaderboardCache[i].rank;
            }
        }
        return 0; // Not in leaderboard
    }
    
    /**
     * @dev Get leaderboard entry by rank
     */
    function getLeaderboardByRank(uint256 rank) external view returns (LeaderboardEntry memory) {
        require(rank > 0 && rank <= leaderboardCache.length, "Rank out of range");
        return leaderboardCache[rank - 1];
    }
    
    /**
     * @dev Get leaderboard size
     */
    function getLeaderboardSize() external view returns (uint256) {
        return leaderboardCache.length;
    }
    
    // ==================== STATISTICS ====================
    
    /**
     * @dev Get platform statistics
     */
    function getPlatformStats() external view returns (
        uint256 totalUsers,
        uint256 totalBets,
        uint256 totalProfit
    ) {
        return (
            activeUsers.length,
            totalBetsPlaced,
            totalProfitDistributed
        );
    }
    
    // ==================== ADMIN ====================
    
    /**
     * @dev Set coin contract address
     */
    function setCoinContractAddress(address newAddress) external onlyOwner {
        require(newAddress != address(0), "Invalid address");
        coinContractAddress = newAddress;
        coinContract = IPredictlyCoin(newAddress);
    }
}
