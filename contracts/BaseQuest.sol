// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title BaseQuest - The Onchain Streak Game
 * @notice A streak-based reward system where users complete daily quests to maintain streaks and earn rewards
 * @dev Built for Base network with offchain task verification support
 */
contract BaseQuest {
    // ============ State Variables ============
    
    // CHANGE THIS: Replace with actual treasury address before mainnet deployment
    address public immutable treasury;
    
    // CHANGE THIS: Replace with actual attester address for offchain verification
    address public attester;
    
    address public owner;
    uint256 public currentWeek;
    uint256 public weekStartTime;
    uint256 public constant WEEK_DURATION = 7 days;
    uint256 public constant DAY_DURATION = 24 hours;
    uint256 public constant MONTH_DURATION = 30 days; // Approximate month for reset
    uint256 public entryFee = 0.00001 ether; // 1e14 wei
    uint256 public weeklyPrizePool;
    bool public paused;
    
    // ============ Structs ============
    
    struct PlayerData {
        uint256 currentStreak;
        uint256 totalBasePoints;
        uint256 lastCheckInTime;
        uint256 weeklyBasePoints;
        bool activeThisWeek;
        uint8 tasksCompletedToday;
        uint256 lastTaskResetTime;
        uint256 joinedWeek; // Week number when player first joined
        uint256 playerWeek; // Player's current week (1-4, resets monthly)
        uint256 lastMonthReset; // Timestamp of last month reset
    }
    
    struct Task {
        string description;
        string taskType; // "onchain", "offchain", "hybrid"
        bool isActive;
        uint256 basePointsReward;
        string metadata; // JSON string for additional data (e.g., bridge URLs, verification params)
    }
    
    struct WeeklyStats {
        uint256 totalPlayers;
        uint256 totalPrizePool;
        uint256 distributedRewards;
        address[] topPlayers;
    }
    
    // ============ Mappings ============
    
    mapping(address => PlayerData) public players;
    mapping(uint256 => Task[]) public weeklyTasks; // week => tasks array
    mapping(uint256 => WeeklyStats) public weekHistory;
    mapping(uint256 => mapping(address => bool)) public weeklyParticipation; // week => player => joined
    mapping(address => mapping(uint256 => bool)) public taskCompletion; // player => taskId => completed
    
    address[] public activePlayers;
    
    // ============ Events ============
    
    event PlayerJoined(address indexed player, uint256 week);
    event TaskCompleted(address indexed player, uint256 taskId, uint256 pointsEarned);
    event StreakUpdated(address indexed player, uint256 newStreak);
    event StreakBroken(address indexed player, uint256 previousStreak);
    event WeeklyRewardsDistributed(uint256 week, uint256 totalDistributed);
    event NewWeekStarted(uint256 week);
    event TaskAdded(uint256 week, uint256 taskId, string description);
    event EntryFeeUpdated(uint256 newFee);
    event AttesterUpdated(address newAttester);
    event BridgeTaskCompleted(address indexed player, uint256 taskId, string fromChain, string toChain);
    
    // ============ Modifiers ============
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    modifier onlyAttester() {
        require(msg.sender == attester, "Not attester");
        _;
    }
    
    modifier notPaused() {
        require(!paused, "Contract paused");
        _;
    }
    
    modifier weeklyActive() {
        require(weeklyParticipation[currentWeek][msg.sender], "Not joined this week");
        _;
    }
    
    // ============ Constructor ============
    
    constructor(address _treasury, address _attester) {
        owner = msg.sender;
        // CHANGE THIS: Update treasury and attester addresses
        treasury = _treasury;
        attester = _attester;
        currentWeek = 1;
        weekStartTime = block.timestamp;
        
        // Initialize with sample tasks for week 1
        _initializeSampleTasks();
    }
    
    // ============ Core Functions ============
    
    /**
     * @notice Join the current week's challenge
     */
    function joinWeek() external payable notPaused {
        require(!weeklyParticipation[currentWeek][msg.sender], "Already joined this week");
        require(msg.value >= entryFee, "Insufficient entry fee");
        
        // Check if player needs month reset (every 30 days)
        if (players[msg.sender].joinedWeek > 0) {
            if (block.timestamp >= players[msg.sender].lastMonthReset + MONTH_DURATION) {
                players[msg.sender].playerWeek = 1; // Reset to week 1
                players[msg.sender].lastMonthReset = block.timestamp;
            } else {
                // Progress to next week (1-4 cycle)
                if (players[msg.sender].playerWeek < 4) {
                    players[msg.sender].playerWeek++;
                }
            }
        } else {
            // First time joining
            players[msg.sender].joinedWeek = currentWeek;
            players[msg.sender].playerWeek = 1;
            players[msg.sender].lastMonthReset = block.timestamp;
        }
        
        weeklyParticipation[currentWeek][msg.sender] = true;
        players[msg.sender].activeThisWeek = true;
        players[msg.sender].weeklyBasePoints = 0;
        
        weeklyPrizePool += msg.value;
        weekHistory[currentWeek].totalPlayers++;
        activePlayers.push(msg.sender);
        
        emit PlayerJoined(msg.sender, currentWeek);
    }
    
    /**
     * @notice Complete a task (for onchain tasks)
     */
    function completeTask(uint256 taskId) external notPaused weeklyActive {
        _resetDailyTasksIfNeeded(msg.sender);
        
        require(taskId < weeklyTasks[currentWeek].length, "Invalid task ID");
        require(weeklyTasks[currentWeek][taskId].isActive, "Task not active");
        require(!taskCompletion[msg.sender][taskId], "Task already completed");
        require(players[msg.sender].tasksCompletedToday < 3, "Daily task limit reached");
        
        taskCompletion[msg.sender][taskId] = true;
        players[msg.sender].tasksCompletedToday++;
        
        uint256 points = weeklyTasks[currentWeek][taskId].basePointsReward;
        players[msg.sender].totalBasePoints += points;
        players[msg.sender].weeklyBasePoints += points;
        
        // Update streak if all 3 tasks completed
        if (players[msg.sender].tasksCompletedToday == 3) {
            _updateStreak(msg.sender);
        }
        
        emit TaskCompleted(msg.sender, taskId, points);
    }
    
    /**
     * @notice Attest bridge task completion with verification data
     */
    function attestBridgeCompletion(address player, uint256 taskId, string memory fromChain, string memory toChain) external onlyAttester {
        _resetDailyTasksIfNeeded(player);
        
        require(weeklyParticipation[currentWeek][player], "Player not active");
        require(taskId < weeklyTasks[currentWeek].length, "Invalid task ID");
        require(!taskCompletion[player][taskId], "Task already completed");
        require(players[player].tasksCompletedToday < 3, "Daily task limit reached");
        
        taskCompletion[player][taskId] = true;
        players[player].tasksCompletedToday++;
        
        uint256 points = weeklyTasks[currentWeek][taskId].basePointsReward;
        players[player].totalBasePoints += points;
        players[player].weeklyBasePoints += points;
        
        if (players[player].tasksCompletedToday == 3) {
            _updateStreak(player);
        }
        
        emit BridgeTaskCompleted(player, taskId, fromChain, toChain);
        emit TaskCompleted(player, taskId, points);
    }
    
    /**
     * @notice End current week and start new week
     */
    function endWeekAndDistribute() external onlyOwner {
        require(block.timestamp >= weekStartTime + WEEK_DURATION, "Week not finished");
        
        _distributeRewards();
        _startNewWeek();
    }
    
    // ============ Internal Functions ============
    
    function _updateStreak(address player) internal {
        players[player].currentStreak++;
        players[player].lastCheckInTime = block.timestamp;
        emit StreakUpdated(player, players[player].currentStreak);
    }
    
    function _resetDailyTasksIfNeeded(address player) internal {
        if (block.timestamp >= players[player].lastTaskResetTime + DAY_DURATION) {
            players[player].tasksCompletedToday = 0;
            players[player].lastTaskResetTime = block.timestamp;
            
            // Check if streak should be broken
            if (players[player].lastCheckInTime > 0 && 
                block.timestamp > players[player].lastCheckInTime + DAY_DURATION) {
                uint256 previousStreak = players[player].currentStreak;
                players[player].currentStreak = 0;
                emit StreakBroken(player, previousStreak);
            }
        }
    }
    
    function _distributeRewards() internal {
        uint256 totalPool = weeklyPrizePool;
        uint256 ownerFee = (totalPool * 10) / 100; // 10% to treasury
        uint256 playerPool = totalPool - ownerFee;
        
        // Transfer owner fee
        payable(treasury).transfer(ownerFee);
        
        // Get top 10% players
        address[] memory topPlayers = _getTopPlayers();
        weekHistory[currentWeek].topPlayers = topPlayers;
        
        if (topPlayers.length > 0) {
            uint256 rewardPerPlayer = playerPool / topPlayers.length;
            
            for (uint256 i = 0; i < topPlayers.length; i++) {
                payable(topPlayers[i]).transfer(rewardPerPlayer);
            }
            
            weekHistory[currentWeek].distributedRewards = playerPool;
        }
        
        weekHistory[currentWeek].totalPrizePool = totalPool;
        emit WeeklyRewardsDistributed(currentWeek, playerPool);
    }
    
    function _getTopPlayers() internal view returns (address[] memory) {
        uint256 playerCount = activePlayers.length;
        if (playerCount == 0) return new address[](0);
        
        // Calculate top 10%
        uint256 topCount = (playerCount * 10) / 100;
        if (topCount == 0) topCount = 1;
        
        // Simple sorting - get players with highest (streak + weeklyBP)
        address[] memory sortedPlayers = new address[](playerCount);
        for (uint256 i = 0; i < playerCount; i++) {
            sortedPlayers[i] = activePlayers[i];
        }
        
        // Bubble sort by score (streak + weekly points)
        for (uint256 i = 0; i < playerCount; i++) {
            for (uint256 j = i + 1; j < playerCount; j++) {
                uint256 scoreI = players[sortedPlayers[i]].currentStreak + players[sortedPlayers[i]].weeklyBasePoints;
                uint256 scoreJ = players[sortedPlayers[j]].currentStreak + players[sortedPlayers[j]].weeklyBasePoints;
                
                if (scoreJ > scoreI) {
                    address temp = sortedPlayers[i];
                    sortedPlayers[i] = sortedPlayers[j];
                    sortedPlayers[j] = temp;
                }
            }
        }
        
        address[] memory topPlayers = new address[](topCount);
        for (uint256 i = 0; i < topCount; i++) {
            topPlayers[i] = sortedPlayers[i];
        }
        
        return topPlayers;
    }
    
    function _startNewWeek() internal {
        // Reset activeThisWeek flag for all active players
        for (uint256 i = 0; i < activePlayers.length; i++) {
            players[activePlayers[i]].activeThisWeek = false;
        }
        
        currentWeek++;
        weekStartTime = block.timestamp;
        weeklyPrizePool = 0;
        delete activePlayers;
        
        emit NewWeekStarted(currentWeek);
    }
    
    function _initializeSampleTasks() internal {
        weeklyTasks[1].push(Task({
            description: "Swap any token on a Base DEX",
            taskType: "onchain",
            isActive: true,
            basePointsReward: 100,
            metadata: ""
        }));
        
        weeklyTasks[1].push(Task({
            description: "Bridge $1+ from Ethereum to Base",
            taskType: "offchain",
            isActive: true,
            basePointsReward: 150,
            metadata: '{"bridgeUrls":["https://bridge.base.org","https://app.optimism.io/bridge/deposit","https://www.orbiter.finance"],"minAmount":"1","fromChain":"Ethereum","toChain":"Base"}'
        }));
        
        weeklyTasks[1].push(Task({
            description: "Predict BTC direction for tomorrow",
            taskType: "offchain",
            isActive: true,
            basePointsReward: 50,
            metadata: ""
        }));
    }
    
    // ============ Admin Functions ============
    
    function addTask(string memory description, string memory taskType, uint256 basePointsReward, string memory metadata) external onlyOwner {
        uint256 taskId = weeklyTasks[currentWeek].length;
        weeklyTasks[currentWeek].push(Task({
            description: description,
            taskType: taskType,
            isActive: true,
            basePointsReward: basePointsReward,
            metadata: metadata
        }));
        
        emit TaskAdded(currentWeek, taskId, description);
    }
    
    function updateEntryFee(uint256 newFee) external onlyOwner {
        entryFee = newFee;
        emit EntryFeeUpdated(newFee);
    }
    
    function updateAttester(address newAttester) external onlyOwner {
        attester = newAttester;
        emit AttesterUpdated(newAttester);
    }
    
    function togglePause() external onlyOwner {
        paused = !paused;
    }
    
    function setTaskActive(uint256 taskId, bool active) external onlyOwner {
        require(taskId < weeklyTasks[currentWeek].length, "Invalid task ID");
        weeklyTasks[currentWeek][taskId].isActive = active;
    }
    
    // ============ View Functions ============
    
    function getPlayerData(address player) external view returns (PlayerData memory) {
        return players[player];
    }
    
    function getCurrentWeekTasks() external view returns (Task[] memory) {
        return weeklyTasks[currentWeek];
    }
    
    function getWeekTasks(uint256 week) external view returns (Task[] memory) {
        return weeklyTasks[week];
    }
    
    function getLeaderboard() external view returns (address[] memory, uint256[] memory, uint256[] memory) {
        uint256 count = activePlayers.length;
        address[] memory addresses = new address[](count);
        uint256[] memory streaks = new uint256[](count);
        uint256[] memory points = new uint256[](count);
        
        for (uint256 i = 0; i < count; i++) {
            addresses[i] = activePlayers[i];
            streaks[i] = players[activePlayers[i]].currentStreak;
            points[i] = players[activePlayers[i]].totalBasePoints;
        }
        
        return (addresses, streaks, points);
    }
    
    function getWeekHistory(uint256 week) external view returns (WeeklyStats memory) {
        return weekHistory[week];
    }
    
    function getTimeUntilWeekEnd() external view returns (uint256) {
        uint256 weekEnd = weekStartTime + WEEK_DURATION;
        if (block.timestamp >= weekEnd) return 0;
        return weekEnd - block.timestamp;
    }
    
    function getTimeUntilDayReset(address player) external view returns (uint256) {
        uint256 dayEnd = players[player].lastTaskResetTime + DAY_DURATION;
        if (block.timestamp >= dayEnd) return 0;
        return dayEnd - block.timestamp;
    }
    
    function getPlayerWeekInfo(address player) external view returns (uint256 playerWeek, uint256 timeUntilMonthReset) {
        playerWeek = players[player].playerWeek;
        uint256 monthEnd = players[player].lastMonthReset + MONTH_DURATION;
        if (block.timestamp >= monthEnd) {
            timeUntilMonthReset = 0;
        } else {
            timeUntilMonthReset = monthEnd - block.timestamp;
        }
    }
    
    // Debug function to check player status
    function getPlayerStatus(address player) external view returns (
        bool hasJoinedCurrentWeek,
        bool isActiveThisWeek,
        uint256 playerCurrentWeek,
        uint256 contractCurrentWeek
    ) {
        hasJoinedCurrentWeek = weeklyParticipation[currentWeek][player];
        isActiveThisWeek = players[player].activeThisWeek;
        playerCurrentWeek = players[player].playerWeek;
        contractCurrentWeek = currentWeek;
    }
}
