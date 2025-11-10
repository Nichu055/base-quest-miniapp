// TODO: Replace with your actual deployed contract address after running: npx hardhat run scripts/deploy.js --network base-sepolia
// For testing purposes, using a valid address format (zero address - update after deployment)
export const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000"; // UPDATE THIS AFTER DEPLOYMENT

// Helper to check if contract is deployed
export const isContractDeployed = () => {
  return CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000" && 
         CONTRACT_ADDRESS !== "0xYourContractAddressHere";
};

export const CONTRACT_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "_treasury", "type": "address"},
      {"internalType": "address", "name": "_attester", "type": "address"}
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "player", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "week", "type": "uint256"}
    ],
    "name": "PlayerJoined",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "player", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "taskId", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "pointsEarned", "type": "uint256"}
    ],
    "name": "TaskCompleted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "player", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "newStreak", "type": "uint256"}
    ],
    "name": "StreakUpdated",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "joinWeek",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "taskId", "type": "uint256"}],
    "name": "completeTask",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "player", "type": "address"}],
    "name": "getPlayerData",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "currentStreak", "type": "uint256"},
          {"internalType": "uint256", "name": "totalBasePoints", "type": "uint256"},
          {"internalType": "uint256", "name": "lastCheckInTime", "type": "uint256"},
          {"internalType": "uint256", "name": "weeklyBasePoints", "type": "uint256"},
          {"internalType": "bool", "name": "activeThisWeek", "type": "bool"},
          {"internalType": "uint8", "name": "tasksCompletedToday", "type": "uint8"},
          {"internalType": "uint256", "name": "lastTaskResetTime", "type": "uint256"}
        ],
        "internalType": "struct BaseQuest.PlayerData",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCurrentWeekTasks",
    "outputs": [
      {
        "components": [
          {"internalType": "string", "name": "description", "type": "string"},
          {"internalType": "string", "name": "taskType", "type": "string"},
          {"internalType": "bool", "name": "isActive", "type": "bool"},
          {"internalType": "uint256", "name": "basePointsReward", "type": "uint256"}
        ],
        "internalType": "struct BaseQuest.Task[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getLeaderboard",
    "outputs": [
      {"internalType": "address[]", "name": "", "type": "address[]"},
      {"internalType": "uint256[]", "name": "", "type": "uint256[]"},
      {"internalType": "uint256[]", "name": "", "type": "uint256[]"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "entryFee",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "currentWeek",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "weeklyPrizePool",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTimeUntilWeekEnd",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "player", "type": "address"}],
    "name": "getTimeUntilDayReset",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export const BASE_SEPOLIA_CHAIN_ID = 84532;
export const BASE_MAINNET_CHAIN_ID = 8453;

// Network configurations
export const NETWORKS = {
  [BASE_SEPOLIA_CHAIN_ID]: {
    name: 'Base Sepolia',
    rpcUrl: 'https://sepolia.base.org',
    blockExplorer: 'https://sepolia.basescan.org',
  },
  [BASE_MAINNET_CHAIN_ID]: {
    name: 'Base Mainnet',
    rpcUrl: 'https://mainnet.base.org',
    blockExplorer: 'https://basescan.org',
  },
} as const;
