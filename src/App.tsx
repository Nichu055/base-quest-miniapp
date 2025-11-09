import { useState, useEffect } from 'react';
import { BrowserProvider } from 'ethers';
import { sdk } from '@farcaster/miniapp-sdk';
import { contractService, type PlayerData, type Task, type LeaderboardEntry } from './contractService';
import { BASE_SEPOLIA_CHAIN_ID } from './config';

// Components
import Header from './components/Header';
import PlayerStats from './components/PlayerStats';
import TaskList from './components/TaskList';
import Leaderboard from './components/Leaderboard';
import WeeklyTimer from './components/WeeklyTimer';

function App() {
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [account, setAccount] = useState<string>('');
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [entryFee, setEntryFee] = useState<string>('0');
  const [prizePool, setPrizePool] = useState<string>('0');
  const [currentWeek, setCurrentWeek] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'quests' | 'leaderboard'>('quests');

  useEffect(() => {
    initializeMiniApp();
  }, []);

  useEffect(() => {
    if (connected && account) {
      loadData();
      const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [connected, account]);

  const initializeMiniApp = async () => {
    try {
      // Initialize Farcaster MiniApp SDK
      await sdk.actions.ready();
      setLoading(false);
    } catch (error) {
      console.error('Failed to initialize MiniApp:', error);
      setLoading(false);
    }
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert('Please install MetaMask or use a Web3-enabled browser');
        return;
      }

      const provider = new BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      
      const network = await provider.getNetwork();
      if (Number(network.chainId) !== BASE_SEPOLIA_CHAIN_ID) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${BASE_SEPOLIA_CHAIN_ID.toString(16)}` }],
          });
        } catch (error: any) {
          if (error.code === 4902) {
            alert('Please add Base Sepolia network to your wallet');
          }
          return;
        }
      }

      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      await contractService.initialize(provider);
      
      setAccount(address);
      setConnected(true);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    }
  };

  const loadData = async () => {
    try {
      const [playerInfo, weekTasks, board, fee, pool, week] = await Promise.all([
        contractService.getPlayerData(account),
        contractService.getCurrentWeekTasks(),
        contractService.getLeaderboard(),
        contractService.getEntryFee(),
        contractService.getWeeklyPrizePool(),
        contractService.getCurrentWeek(),
      ]);

      setPlayerData(playerInfo);
      setTasks(weekTasks);
      setLeaderboard(board);
      setEntryFee(fee);
      setPrizePool(pool);
      setCurrentWeek(week);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleJoinWeek = async () => {
    try {
      setLoading(true);
      await contractService.joinWeek(entryFee);
      await loadData();
      alert('Successfully joined this week! Start completing tasks to build your streak.');
    } catch (error: any) {
      console.error('Failed to join week:', error);
      alert(error.message || 'Failed to join week. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (taskId: number) => {
    try {
      setLoading(true);
      await contractService.completeTask(taskId);
      await loadData();
      alert('Task completed! Keep going to maintain your streak.');
    } catch (error: any) {
      console.error('Failed to complete task:', error);
      alert(error.message || 'Failed to complete task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !connected) {
    return (
      <div className="w-full max-w-miniapp min-h-miniapp mx-auto bg-background relative">
        <div className="flex flex-col items-center justify-center min-h-miniapp px-10 py-10 gap-5">
          <div className="spinner"></div>
          <p>Loading Base Quest...</p>
        </div>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="w-full max-w-miniapp min-h-miniapp mx-auto bg-background relative">
        <div className="flex items-center justify-center min-h-miniapp px-10 py-10">
          <div className="text-center max-w-[360px]">
            <h1 className="gradient-text text-[42px] font-bold mb-2">⚡ Base Quest</h1>
            <p className="text-xl font-semibold text-text-secondary mb-6">The Onchain Streak Game</p>
            <p className="text-[15px] leading-relaxed text-text-secondary mb-8">
              Complete daily quests, maintain your streak, and climb the leaderboard to win weekly ETH rewards on Base!
            </p>
            <button className="btn-primary w-full px-8 py-4 text-lg font-bold" onClick={connectWallet}>
              Connect Wallet
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-miniapp min-h-miniapp mx-auto bg-background relative">
      <Header account={account} />
      
      <div className="px-5 pb-10">
        <WeeklyTimer 
          currentWeek={currentWeek} 
          prizePool={prizePool}
        />

        {!playerData?.activeThisWeek ? (
          <div className="card p-8 text-center my-6">
            <h2 className="text-2xl mb-3">Join Week {currentWeek}</h2>
            <p>Entry Fee: {entryFee} ETH</p>
            <p className="text-text-secondary my-2">
              Join this week's challenge to start completing quests and earning rewards!
            </p>
            <button 
              className="btn-primary w-full px-8 py-4 text-lg font-bold mt-6" 
              onClick={handleJoinWeek}
              disabled={loading}
            >
              {loading ? 'Joining...' : 'Join This Week'}
            </button>
          </div>
        ) : (
          <>
            <PlayerStats playerData={playerData} account={account} />

            <div className="flex gap-2 bg-surface border border-border rounded-xl p-1 my-6 mt-6 mb-4">
              <button 
                className={`flex-1 p-3 bg-transparent border-0 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  activeTab === 'quests' 
                    ? 'bg-primary text-white shadow-[0_2px_8px_rgba(0,82,255,0.3)]' 
                    : 'text-text-secondary hover:text-text-primary'
                }`}
                onClick={() => setActiveTab('quests')}
              >
                Daily Quests
              </button>
              <button 
                className={`flex-1 p-3 bg-transparent border-0 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  activeTab === 'leaderboard' 
                    ? 'bg-primary text-white shadow-[0_2px_8px_rgba(0,82,255,0.3)]' 
                    : 'text-text-secondary hover:text-text-primary'
                }`}
                onClick={() => setActiveTab('leaderboard')}
              >
                Leaderboard
              </button>
            </div>

            {activeTab === 'quests' ? (
              <TaskList 
                tasks={tasks}
                playerData={playerData}
                onCompleteTask={handleCompleteTask}
                loading={loading}
              />
            ) : (
              <Leaderboard 
                leaderboard={leaderboard}
                currentAccount={account}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
