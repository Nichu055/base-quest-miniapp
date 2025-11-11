// Contract addresses per network
export const CONTRACT_ADDRESSES = {
  [84532]: "0xAA4c50b0023530432EEe23F8c6d29756b5a317dc", // Base Sepolia
  [8453]: "0x749E23524d7033C8d39664f2f7efB5ab0E4DFEfE", // Base Mainnet
} as const;

// Get contract address for current network
export const getContractAddress = (chainId: number): string => {
  return CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES] || "0x0000000000000000000000000000000000000000";
};

// Legacy export for backward compatibility
export const CONTRACT_ADDRESS = CONTRACT_ADDRESSES[84532];
export const CONTRACT_NETWORK = 84532; // Primary network (Sepolia for now)

// Helper to check if contract is deployed
export const isContractDeployed = () => {
  const address = CONTRACT_ADDRESS as string;
  return address !== "0x0000000000000000000000000000000000000000" && 
         address !== "0xYourContractAddressHere";
};

// Helper to check if contract is deployed on current network
export const isContractOnNetwork = (chainId: number) => {
  const address = getContractAddress(chainId);
  return address !== "0x0000000000000000000000000000000000000000" && 
         address !== "0xYourContractAddressHere";
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
