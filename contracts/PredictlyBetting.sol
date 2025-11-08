// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title PredictlyBetting
 * @dev Manages sports matches, predictions, and bet outcomes
 * 
 * This contract handles:
 * - Match creation and status tracking
 * - Prediction option management
 * - Bet outcome resolution
 * - Match statistics
 */

interface IPredictlyCoin {
    function placeBet(
        address user,
        string memory matchId,
        uint256 amount,
        string memory prediction
    ) external returns (uint256);
    
    function resolveBet(
        uint256 betId,
        bool won,
        uint256 multiplier
    ) external;
}

contract PredictlyBetting {
    // ==================== STATE VARIABLES ====================
    
    address public owner;
    address public coinContractAddress;
    
    IPredictlyCoin public coinContract;
    
    // Match structure
    struct Match {
        string matchId;
        string sport; // "football", "basketball", etc.
        string homeTeam;
        string awayTeam;
        uint256 startTime;
        uint256 endTime;
        string status; // "upcoming", "live", "completed", "cancelled"
        string result; // "home_win", "away_win", "draw", "cancelled"
        uint256 createdAt;
        bool resolved;
        uint256 totalBets;
        uint256 totalVolume;
    }
    
    // Prediction structure
    struct Prediction {
        string predictionId;
        string matchId;
        string option; // e.g., "Home Win", "Draw", "Away Win"
        uint256 totalBets;
        uint256 totalAmount;
        uint256 odds; // In basis points (e.g., 200 = 2.0x)
    }
    
    // Match bet tracking
    struct MatchBetInfo {
        uint256 betId;
        address bettor;
        string prediction;
        uint256 amount;
        uint256 timestamp;
    }
    
    // Mapping: matchId => Match
    mapping(string => Match) public matches;
    
    // Mapping: matchId => array of match IDs (for listing)
    string[] public matchIds;
    
    // Mapping: predictionId => Prediction
    mapping(string => Prediction) public predictions;
    
    // Mapping: matchId => array of prediction IDs
    mapping(string => string[]) public matchPredictions;
    
    // Mapping: matchId => array of bets on that match
    mapping(string => MatchBetInfo[]) public matchBets;
    
    // Mapping: matchId => prediction => array of bets
    mapping(string => mapping(string => uint256[])) public predictionBets;
    
    // Mapping to track if a match exists
    mapping(string => bool) public matchExists;
    
    // Fee percentage (5% = 500 basis points)
    uint256 public constant APP_FEE_PERCENTAGE = 500; // in basis points
    
    // Minimum odds (1.1x = 1100 basis points)
    uint256 public constant MIN_ODDS = 1100;
    
    // Maximum odds (100x = 100000 basis points)
    uint256 public constant MAX_ODDS = 100000;
    
    // ==================== EVENTS ====================
    
    event MatchCreated(
        string indexed matchId,
        string sport,
        string homeTeam,
        string awayTeam,
        uint256 startTime
    );
    
    event MatchStatusUpdated(
        string indexed matchId,
        string newStatus,
        uint256 timestamp
    );
    
    event MatchResultSet(
        string indexed matchId,
        string result,
        uint256 timestamp
    );
    
    event PredictionCreated(
        string indexed predictionId,
        string matchId,
        string option,
        uint256 odds
    );
    
    event BetPlacedOnMatch(
        string indexed matchId,
        uint256 betId,
        address indexed bettor,
        string prediction,
        uint256 amount
    );
    
    event MatchResolved(
        string indexed matchId,
        string winningPrediction,
        uint256 totalWinnings
    );
    
    event OddsUpdated(
        string indexed predictionId,
        uint256 newOdds,
        uint256 timestamp
    );
    
    // ==================== MODIFIERS ====================
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier matchNotExists(string memory matchId) {
        require(!matchExists[matchId], "Match already exists");
        _;
    }
    
    modifier matchExistsCheck(string memory matchId) {
        require(matchExists[matchId], "Match does not exist");
        _;
    }
    
    modifier matchNotResolved(string memory matchId) {
        require(!matches[matchId].resolved, "Match already resolved");
        _;
    }
    
    modifier isUpcoming(string memory matchId) {
        require(
            keccak256(bytes(matches[matchId].status)) == keccak256(bytes("upcoming")),
            "Match must be upcoming to accept bets"
        );
        _;
    }
    
    // ==================== CONSTRUCTOR ====================
    
    constructor(address _coinContractAddress) {
        owner = msg.sender;
        coinContractAddress = _coinContractAddress;
        coinContract = IPredictlyCoin(_coinContractAddress);
    }
    
    // ==================== MATCH MANAGEMENT ====================
    
    /**
     * @dev Create a new match
     */
    function createMatch(
        string memory matchId,
        string memory sport,
        string memory homeTeam,
        string memory awayTeam,
        uint256 startTime
    ) external onlyOwner matchNotExists(matchId) {
        require(startTime > block.timestamp, "Start time must be in the future");
        require(bytes(matchId).length > 0, "Match ID required");
        require(bytes(sport).length > 0, "Sport required");
        require(bytes(homeTeam).length > 0, "Home team required");
        require(bytes(awayTeam).length > 0, "Away team required");
        
        matches[matchId] = Match({
            matchId: matchId,
            sport: sport,
            homeTeam: homeTeam,
            awayTeam: awayTeam,
            startTime: startTime,
            endTime: 0,
            status: "upcoming",
            result: "",
            createdAt: block.timestamp,
            resolved: false,
            totalBets: 0,
            totalVolume: 0
        });
        
        matchExists[matchId] = true;
        matchIds.push(matchId);
        
        emit MatchCreated(matchId, sport, homeTeam, awayTeam, startTime);
    }
    
    /**
     * @dev Update match status
     */
    function updateMatchStatus(
        string memory matchId,
        string memory newStatus
    ) external onlyOwner matchExistsCheck(matchId) {
        require(bytes(newStatus).length > 0, "Status required");
        
        matches[matchId].status = newStatus;
        
        if (keccak256(bytes(newStatus)) == keccak256(bytes("completed"))) {
            matches[matchId].endTime = block.timestamp;
        }
        
        emit MatchStatusUpdated(matchId, newStatus, block.timestamp);
    }
    
    /**
     * @dev Set match result
     */
    function setMatchResult(
        string memory matchId,
        string memory result
    ) external onlyOwner matchExistsCheck(matchId) matchNotResolved(matchId) {
        require(bytes(result).length > 0, "Result required");
        
        matches[matchId].result = result;
        matches[matchId].resolved = true;
        matches[matchId].status = "completed";
        matches[matchId].endTime = block.timestamp;
        
        emit MatchResultSet(matchId, result, block.timestamp);
    }
    
    /**
     * @dev Get match details
     */
    function getMatch(string memory matchId) external view matchExistsCheck(matchId) returns (Match memory) {
        return matches[matchId];
    }
    
    /**
     * @dev Get all matches
     */
    function getAllMatches() external view returns (string[] memory) {
        return matchIds;
    }
    
    /**
     * @dev Get match count
     */
    function getMatchCount() external view returns (uint256) {
        return matchIds.length;
    }
    
    // ==================== PREDICTION MANAGEMENT ====================
    
    /**
     * @dev Create prediction options for a match
     */
    function createPrediction(
        string memory predictionId,
        string memory matchId,
        string memory option,
        uint256 odds
    ) external onlyOwner matchExistsCheck(matchId) {
        require(odds >= MIN_ODDS && odds <= MAX_ODDS, "Odds out of valid range");
        require(bytes(predictionId).length > 0, "Prediction ID required");
        require(bytes(option).length > 0, "Option required");
        
        predictions[predictionId] = Prediction({
            predictionId: predictionId,
            matchId: matchId,
            option: option,
            totalBets: 0,
            totalAmount: 0,
            odds: odds
        });
        
        matchPredictions[matchId].push(predictionId);
        
        emit PredictionCreated(predictionId, matchId, option, odds);
    }
    
    /**
     * @dev Update prediction odds
     */
    function updatePredictionOdds(
        string memory predictionId,
        uint256 newOdds
    ) external onlyOwner {
        require(newOdds >= MIN_ODDS && newOdds <= MAX_ODDS, "Odds out of valid range");
        
        predictions[predictionId].odds = newOdds;
        
        emit OddsUpdated(predictionId, newOdds, block.timestamp);
    }
    
    /**
     * @dev Get prediction details
     */
    function getPrediction(string memory predictionId) external view returns (Prediction memory) {
        return predictions[predictionId];
    }
    
    /**
     * @dev Get all predictions for a match
     */
    function getMatchPredictions(string memory matchId) external view returns (string[] memory) {
        return matchPredictions[matchId];
    }
    
    // ==================== BET PLACEMENT ====================
    
    /**
     * @dev Place a bet on a match prediction
     */
    function placeBetOnMatch(
        address bettor,
        string memory matchId,
        string memory predictionId,
        uint256 amount
    ) external onlyOwner matchExistsCheck(matchId) isUpcoming(matchId) returns (uint256) {
        require(bettor != address(0), "Invalid bettor address");
        require(amount > 0, "Bet amount must be greater than 0");
        
        // Verify prediction exists and matches the match
        Prediction storage pred = predictions[predictionId];
        require(
            keccak256(bytes(pred.matchId)) == keccak256(bytes(matchId)),
            "Prediction does not belong to this match"
        );
        
        // Place bet on coin contract
        uint256 betId = coinContract.placeBet(
            bettor,
            matchId,
            amount,
            pred.option
        );
        
        // Update prediction stats
        pred.totalBets++;
        pred.totalAmount += amount;
        
        // Update match stats
        matches[matchId].totalBets++;
        matches[matchId].totalVolume += amount;
        
        // Track bet for this match
        MatchBetInfo memory betInfo = MatchBetInfo({
            betId: betId,
            bettor: bettor,
            prediction: pred.option,
            amount: amount,
            timestamp: block.timestamp
        });
        
        matchBets[matchId].push(betInfo);
        predictionBets[matchId][predictionId].push(betId);
        
        emit BetPlacedOnMatch(matchId, betId, bettor, pred.option, amount);
        
        return betId;
    }
    
    /**
     * @dev Get all bets on a match
     */
    function getMatchBets(string memory matchId) external view returns (MatchBetInfo[] memory) {
        return matchBets[matchId];
    }
    
    /**
     * @dev Get match bet count
     */
    function getMatchBetCount(string memory matchId) external view returns (uint256) {
        return matchBets[matchId].length;
    }
    
    // ==================== BET RESOLUTION ====================
    
    /**
     * @dev Resolve all bets for a match based on the result
     * @param matchId Match to resolve
     * @param winningPredictionId The prediction ID that won
     * @param multiplier Odds multiplier for winning bets
     */
    function resolveMatchBets(
        string memory matchId,
        string memory winningPredictionId,
        uint256 multiplier
    ) external onlyOwner matchExistsCheck(matchId) matchNotResolved(matchId) {
        require(multiplier > 0, "Multiplier must be greater than 0");
        
        Match storage matchData = matches[matchId];
        require(matchData.resolved, "Match must be resolved first");
        
        MatchBetInfo[] storage bets = matchBets[matchId];
        Prediction storage winningPrediction = predictions[winningPredictionId];
        
        uint256 totalWinnings = 0;
        
        // Process each bet
        for (uint256 i = 0; i < bets.length; i++) {
            MatchBetInfo memory bet = bets[i];
            
            // Check if this bet won
            bool won = keccak256(bytes(bet.prediction)) == keccak256(bytes(winningPrediction.option));
            
            if (won) {
                // Calculate winnings for this bet
                uint256 betWinnings = (bet.amount * multiplier);
                totalWinnings += betWinnings;
                
                // Resolve bet in coin contract
                coinContract.resolveBet(bet.betId, true, multiplier);
            } else {
                // Losing bet
                coinContract.resolveBet(bet.betId, false, 0);
            }
        }
        
        matchData.resolved = true;
        
        emit MatchResolved(matchId, winningPredictionId, totalWinnings);
    }
    
    // ==================== STATISTICS ====================
    
    /**
     * @dev Get match statistics
     */
    function getMatchStats(string memory matchId) external view matchExistsCheck(matchId) returns (
        uint256 totalBets,
        uint256 totalVolume,
        uint256 predictionCount
    ) {
        Match storage matchData = matches[matchId];
        return (
            matchData.totalBets,
            matchData.totalVolume,
            matchPredictions[matchId].length
        );
    }
    
    /**
     * @dev Get prediction bet count
     */
    function getPredictionBetCount(string memory matchId, string memory predictionId) 
        external 
        view 
        returns (uint256) 
    {
        return predictionBets[matchId][predictionId].length;
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
