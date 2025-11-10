import { BrowserProvider, JsonRpcProvider, Contract, formatEther, parseEther, JsonRpcSigner, getAddress } from 'ethers';
import type { Eip1193Provider } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI, BASE_SEPOLIA_CHAIN_ID, BASE_MAINNET_CHAIN_ID } from './config';

// Create a static JSON RPC provider for Base networks that has ENS explicitly disabled
const createStaticProvider = (chainId: number): JsonRpcProvider => {
  const rpcUrl = chainId === BASE_MAINNET_CHAIN_ID 
    ? 'https://mainnet.base.org' 
    : 'https://sepolia.base.org';
  
  // Create provider with network that has NO ENS support
  return new JsonRpcProvider(rpcUrl, {
    chainId,
    name: chainId === BASE_MAINNET_CHAIN_ID ? 'base' : 'base-sepolia',
    ensAddress: undefined // Explicitly disable ENS
  });
};

// Safe signer getter - uses wallet signer but wraps contract creation to prevent ENS
const getSafeSigner = async (): Promise<JsonRpcSigner> => {
  if (!window.ethereum) throw new Error('No wallet detected');
  
  // Get the current chain ID and accounts
  const browserProvider = new BrowserProvider(window.ethereum as Eip1193Provider);
  const accounts = await browserProvider.send('eth_accounts', []);
  if (!accounts || accounts.length === 0) {
    throw new Error('No accounts found. Please connect your wallet.');
  }
  
  // Get wallet signer from browser provider
  // The key is to use a checksummed address and never let Contract resolve addresses
  return await browserProvider.getSigner(accounts[0]);
};

export interface PlayerData {
  currentStreak: bigint;
  totalBasePoints: bigint;
  lastCheckInTime: bigint;
  weeklyBasePoints: bigint;
  activeThisWeek: boolean;
  tasksCompletedToday: number;
  lastTaskResetTime: bigint;
}

export interface Task {
  description: string;
  taskType: string;
  isActive: boolean;
  basePointsReward: bigint;
}

export interface LeaderboardEntry {
  address: string;
  streak: number;
  points: number;
}

class ContractService {
  private contract: Contract | null = null;
  private signer: JsonRpcSigner | null = null;
  private provider: BrowserProvider | JsonRpcProvider | null = null;
  private contractAddress: string;

  constructor() {
    // Ensure contract address is checksummed and valid
    const address = CONTRACT_ADDRESS as string;
    try {
      // Validate that CONTRACT_ADDRESS is not the placeholder
      if (address === '0xYourContractAddressHere' || !address.startsWith('0x') || address.length !== 42) {
        throw new Error('Invalid contract address. Please update CONTRACT_ADDRESS in config.ts with your deployed contract address.');
      }
      this.contractAddress = getAddress(address);
    } catch (err: any) {
      console.error('Contract address error:', err.message);
      // Show helpful error message
      if (err.message.includes('Invalid contract address')) {
        throw err;
      }
      throw new Error('Invalid contract address format. Please use a valid Ethereum address.');
    }
  }

  isInitialized(): boolean {
    return this.contract !== null && this.provider !== null;
  }

  async initialize(provider: BrowserProvider | JsonRpcProvider) {
    this.provider = provider;
    
    // ALWAYS use JsonRpcProvider (safe provider) for Base networks
    // Never use BrowserProvider.getSigner() as it can trigger ENS
    if (provider instanceof JsonRpcProvider) {
      // JsonRpcProvider - read-only mode initially
      this.contract = new Contract(this.contractAddress, CONTRACT_ABI, provider);
      this.signer = null; // Will get signer on-demand for transactions
    } else {
      // This path should never be hit if using getSafeBaseProvider correctly
      // But kept for safety - convert to safe provider
      console.warn('BrowserProvider passed to initialize - converting to safe provider');
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      const safeProvider = createStaticProvider(chainId);
      this.provider = safeProvider;
      this.contract = new Contract(this.contractAddress, CONTRACT_ABI, safeProvider);
      this.signer = null;
    }
  }

  async reinitialize() {
    if (!this.provider) throw new Error('Provider not available');
    await this.initialize(this.provider);
  }

  disconnect() {
    this.contract = null;
    this.signer = null;
    this.provider = null;
  }

  async joinWeek(entryFee: string) {
    if (!this.isInitialized()) throw new Error('Please connect your wallet first');
    
    // Need a signer for transactions
    if (!this.signer && window.ethereum) {
      try {
        this.signer = await getSafeSigner();
        // CRITICAL: Pass already-resolved checksummed address to prevent ENS lookup
        // Contract constructor will try to resolve addresses, so we ensure it's already resolved
        this.contract = new Contract(this.contractAddress, CONTRACT_ABI, this.signer);
      } catch (err) {
        console.error('Failed to get signer:', err);
        throw new Error('Please connect your wallet to perform transactions');
      }
    }
    
    if (!this.signer) throw new Error('Please connect your wallet to perform transactions');
    
    // Use method directly without awaiting getAddress() which could trigger ENS
    const tx = await this.contract!.joinWeek({ value: parseEther(entryFee) });
    return await tx.wait();
  }

  async completeTask(taskId: number) {
    if (!this.isInitialized()) throw new Error('Please connect your wallet first');
    
    // Need a signer for transactions
    if (!this.signer && window.ethereum) {
      try {
        this.signer = await getSafeSigner();
        // CRITICAL: Pass already-resolved checksummed address to prevent ENS lookup
        this.contract = new Contract(this.contractAddress, CONTRACT_ABI, this.signer);
      } catch (err) {
        console.error('Failed to get signer:', err);
        throw new Error('Please connect your wallet to perform transactions');
      }
    }
    
    if (!this.signer) throw new Error('Please connect your wallet to perform transactions');
    
    const tx = await this.contract!.completeTask(taskId);
    return await tx.wait();
  }

  async getPlayerData(address: string): Promise<PlayerData> {
    if (!this.isInitialized()) throw new Error('Please connect your wallet first');
    const data = await this.contract!.getPlayerData(address);
    return {
      currentStreak: data.currentStreak,
      totalBasePoints: data.totalBasePoints,
      lastCheckInTime: data.lastCheckInTime,
      weeklyBasePoints: data.weeklyBasePoints,
      activeThisWeek: data.activeThisWeek,
      tasksCompletedToday: Number(data.tasksCompletedToday),
      lastTaskResetTime: data.lastTaskResetTime,
    };
  }

  async getCurrentWeekTasks(): Promise<Task[]> {
    if (!this.isInitialized()) throw new Error('Please connect your wallet first');
    const tasks = await this.contract!.getCurrentWeekTasks();
    return tasks.map((task: any) => ({
      description: task.description,
      taskType: task.taskType,
      isActive: task.isActive,
      basePointsReward: task.basePointsReward,
    }));
  }

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    if (!this.isInitialized()) throw new Error('Please connect your wallet first');
    const [addresses, streaks, points] = await this.contract!.getLeaderboard();
    
    return addresses.map((addr: string, i: number) => ({
      address: addr,
      streak: Number(streaks[i]),
      points: Number(points[i]),
    })).sort((a: LeaderboardEntry, b: LeaderboardEntry) => {
      const scoreA = a.streak + a.points;
      const scoreB = b.streak + b.points;
      return scoreB - scoreA;
    });
  }

  async getEntryFee(): Promise<string> {
    if (!this.isInitialized()) throw new Error('Please connect your wallet first');
    const fee = await this.contract!.entryFee();
    return formatEther(fee);
  }

  async getCurrentWeek(): Promise<number> {
    if (!this.isInitialized()) throw new Error('Please connect your wallet first');
    const week = await this.contract!.currentWeek();
    return Number(week);
  }

  async getWeeklyPrizePool(): Promise<string> {
    if (!this.isInitialized()) throw new Error('Please connect your wallet first');
    const pool = await this.contract!.weeklyPrizePool();
    return formatEther(pool);
  }

  async getTimeUntilWeekEnd(): Promise<number> {
    if (!this.isInitialized()) throw new Error('Please connect your wallet first');
    const time = await this.contract!.getTimeUntilWeekEnd();
    return Number(time);
  }

  async getTimeUntilDayReset(address: string): Promise<number> {
    if (!this.isInitialized()) throw new Error('Please connect your wallet first');
    const time = await this.contract!.getTimeUntilDayReset(address);
    return Number(time);
  }
}

export const contractService = new ContractService();
