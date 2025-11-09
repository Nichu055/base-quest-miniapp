import { BrowserProvider, Contract, formatEther, parseEther, JsonRpcSigner } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './config';

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
  private provider: BrowserProvider | null = null;

  async initialize(provider: BrowserProvider) {
    this.provider = provider;
    this.signer = await provider.getSigner();
    this.contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.signer);
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
    if (!this.contract) throw new Error('Contract not initialized');
    const tx = await this.contract.joinWeek({ value: parseEther(entryFee) });
    return await tx.wait();
  }

  async completeTask(taskId: number) {
    if (!this.contract) throw new Error('Contract not initialized');
    const tx = await this.contract.completeTask(taskId);
    return await tx.wait();
  }

  async getPlayerData(address: string): Promise<PlayerData> {
    if (!this.contract) throw new Error('Contract not initialized');
    const data = await this.contract.getPlayerData(address);
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
    if (!this.contract) throw new Error('Contract not initialized');
    const tasks = await this.contract.getCurrentWeekTasks();
    return tasks.map((task: any) => ({
      description: task.description,
      taskType: task.taskType,
      isActive: task.isActive,
      basePointsReward: task.basePointsReward,
    }));
  }

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    if (!this.contract) throw new Error('Contract not initialized');
    const [addresses, streaks, points] = await this.contract.getLeaderboard();
    
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
    if (!this.contract) throw new Error('Contract not initialized');
    const fee = await this.contract.entryFee();
    return formatEther(fee);
  }

  async getCurrentWeek(): Promise<number> {
    if (!this.contract) throw new Error('Contract not initialized');
    const week = await this.contract.currentWeek();
    return Number(week);
  }

  async getWeeklyPrizePool(): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');
    const pool = await this.contract.weeklyPrizePool();
    return formatEther(pool);
  }

  async getTimeUntilWeekEnd(): Promise<number> {
    if (!this.contract) throw new Error('Contract not initialized');
    const time = await this.contract.getTimeUntilWeekEnd();
    return Number(time);
  }

  async getTimeUntilDayReset(address: string): Promise<number> {
    if (!this.contract) throw new Error('Contract not initialized');
    const time = await this.contract.getTimeUntilDayReset(address);
    return Number(time);
  }
}

export const contractService = new ContractService();
