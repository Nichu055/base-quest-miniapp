import { BrowserProvider, JsonRpcProvider, Contract, formatEther, parseEther, JsonRpcSigner, getAddress } from 'ethers';
import type { Eip1193Provider } from 'ethers';
import { getContractAddress, CONTRACT_ABI, BASE_MAINNET_CHAIN_ID } from './config';

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
  private currentChainId: number = 84532; // Default to Sepolia

  constructor() {
    // Initialize with default network (Sepolia)
    const address = getContractAddress(this.currentChainId);
    try {
      // Validate that contract address is not the placeholder
      if (address === '0xYourContractAddressHere' || !address.startsWith('0x') || address.length !== 42) {
        throw new Error('Invalid contract address. Please deploy contract and update CONTRACT_ADDRESSES in config.ts.');
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
    
    // Get the chain ID and update contract address accordingly
    const network = await provider.getNetwork();
    this.currentChainId = Number(network.chainId);
    const contractAddr = getContractAddress(this.currentChainId);
    
    console.log('🔗 Initializing contract for chain:', this.currentChainId);
    console.log('📍 Contract address:', contractAddr);
    
    // Validate contract address for this network
    if (contractAddr === '0x0000000000000000000000000000000000000000' || contractAddr === '0xYourContractAddressHere') {
      console.warn(`No contract deployed on chain ${this.currentChainId}`);
      this.contractAddress = contractAddr;
      // Don't initialize contract if no valid address
      this.contract = null;
      return;
    }
    
    this.contractAddress = getAddress(contractAddr);
    
    // ALWAYS use JsonRpcProvider (safe provider) for Base networks
    if (provider instanceof JsonRpcProvider) {
      // JsonRpcProvider - read-only mode initially
      this.contract = new Contract(this.contractAddress, CONTRACT_ABI, provider);
      this.signer = null; // Will get signer on-demand for transactions
      console.log('✅ Contract initialized successfully');
    } else {
      // Convert to safe provider
      console.warn('BrowserProvider passed to initialize - converting to safe provider');
      const safeProvider = createStaticProvider(this.currentChainId);
      this.provider = safeProvider;
      this.contract = new Contract(this.contractAddress, CONTRACT_ABI, safeProvider);
      this.signer = null;
      console.log('✅ Contract initialized with safe provider');
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
    
    console.log('📝 joinWeek called with fee:', entryFee, 'ETH');
    
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
    
    const feeInWei = parseEther(entryFee);
    console.log('💸 Sending value (wei):', feeInWei.toString());
    console.log('💸 Sending value (ETH):', formatEther(feeInWei));
    
    // Use method directly without awaiting getAddress() which could trigger ENS
    const tx = await this.contract!.joinWeek({ value: feeInWei });
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
    try {
      const tasks = await this.contract!.getCurrentWeekTasks();
      
      // Handle empty result (when contract returns empty array)
      if (!tasks || tasks.length === 0) {
        console.warn('No tasks found for current week');
        return [];
      }
      
      return tasks.map((task: any) => ({
        description: task.description,
        taskType: task.taskType,
        isActive: task.isActive,
        basePointsReward: task.basePointsReward,
      }));
    } catch (err: any) {
      // Handle BAD_DATA error (empty response)
      if (err.code === 'BAD_DATA' || err.message?.includes('could not decode result data')) {
        console.warn('No tasks initialized for current week - returning empty array');
        return [];
      }
      throw err;
    }
  }

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    if (!this.isInitialized()) throw new Error('Please connect your wallet first');
    try {
      const [addresses, streaks, points] = await this.contract!.getLeaderboard();
      
      // Handle empty leaderboard
      if (!addresses || addresses.length === 0) {
        console.info('Leaderboard is empty - no players yet');
        return [];
      }
      
      return addresses.map((addr: string, i: number) => ({
        address: addr,
        streak: Number(streaks[i]),
        points: Number(points[i]),
      })).sort((a: LeaderboardEntry, b: LeaderboardEntry) => {
        const scoreA = a.streak + a.points;
        const scoreB = b.streak + b.points;
        return scoreB - scoreA;
      });
    } catch (err: any) {
      // Handle BAD_DATA error (empty leaderboard)
      if (err.code === 'BAD_DATA' || err.message?.includes('could not decode result data')) {
        console.info('Leaderboard not initialized yet - returning empty array');
        return [];
      }
      throw err;
    }
  }

  async getEntryFee(): Promise<string> {
    if (!this.isInitialized()) throw new Error('Please connect your wallet first');
    try {
      const fee = await this.contract!.entryFee();
      const feeInEth = formatEther(fee);
      console.log('📊 Contract entry fee (wei):', fee.toString());
      console.log('📊 Contract entry fee (ETH):', feeInEth);
      return feeInEth;
    } catch (err) {
      console.error('Failed to get entry fee:', err);
      // Default to contract's default value if call fails
      return '0.00001';
    }
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
