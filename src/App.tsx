import { useState, useEffect, useCallback } from 'react';
import { BrowserProvider } from 'ethers';
import { sdk } from '@farcaster/miniapp-sdk';
import { contractService, type PlayerData, type Task, type LeaderboardEntry } from './contractService';
import { BASE_SEPOLIA_CHAIN_ID, BASE_MAINNET_CHAIN_ID } from './config';
import { useToast } from './hooks/useToast';
import { useIdleTimeout } from './hooks/useIdleTimeout';

// Components
import Header from './components/Header';
import PlayerStats from './components/PlayerStats';
import TaskList from './components/TaskList';
import Leaderboard from './components/Leaderboard';
import WeeklyTimer from './components/WeeklyTimer';
import Toast from './components/Toast';

function App() {
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [account, setAccount] = useState<string>('');
  const [currentChainId, setCurrentChainId] = useState<number>(BASE_SEPOLIA_CHAIN_ID);
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [entryFee, setEntryFee] = useState<string>('0');
  const [prizePool, setPrizePool] = useState<string>('0');
  const [currentWeek, setCurrentWeek] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'quests' | 'leaderboard'>('quests');
  const { toasts, removeToast, success, error, warning, info } = useToast();

  // Idle timeout handler
  const handleIdle = useCallback(() => {
    info('Session expired due to inactivity');
    disconnectWallet();
  }, []);

  // 30-minute idle timeout
  const { updateActivity } = useIdleTimeout({
    timeout: 30 * 60 * 1000, // 30 minutes
    onIdle: handleIdle,
    enabled: connected
  });

  useEffect(() => {
    initializeMiniApp();
    checkExistingConnection(); // Check if wallet is already connected
  }, []);

  useEffect(() => {
    if (connected && account) {
      loadData();
      const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [connected, account]);

  // Auto-redirect if wallet connection is lost
  useEffect(() => {
    if (!loading && !connected && window.ethereum) {
      const wasConnected = sessionStorage.getItem('walletConnected');
      if (wasConnected === 'true') {
        sessionStorage.removeItem('walletConnected');
      }
    }
  }, [connected, loading]);

  const initializeMiniApp = async () => {
    try {
      // Initialize Farcaster MiniApp SDK
      await sdk.actions.ready();
    } catch (error) {
      console.error('Failed to initialize MiniApp:', error);
    }
  };

  const checkExistingConnection = async () => {
    try {
      if (!window.ethereum) {
        setLoading(false);
        return;
      }

      // Check if there are already connected accounts (without requesting permission)
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_accounts', []); // Use eth_accounts instead of eth_requestAccounts
      
      if (accounts && accounts.length > 0) {
        // Wallet is already connected, reconnect automatically
        const network = await provider.getNetwork();
        const chainId = Number(network.chainId);
        
        // Check if on supported network
        if (chainId !== BASE_SEPOLIA_CHAIN_ID && chainId !== BASE_MAINNET_CHAIN_ID) {
          setLoading(false);
          return;
        }

        // Get address directly from accounts array to avoid ENS
        const address = accounts[0];
        
        await contractService.initialize(provider);
        
        setAccount(address);
        setCurrentChainId(chainId);
        setConnected(true);
        updateActivity();
        sessionStorage.setItem('walletConnected', 'true');
        
        // Listen for account changes
        if (window.ethereum?.on) {
          window.ethereum.on('accountsChanged', handleAccountsChanged);
          window.ethereum.on('chainChanged', handleChainChanged);
        }
      }
    } catch (err) {
      console.error('Failed to check existing connection:', err);
    } finally {
      setLoading(false);
    }
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        error('Please install MetaMask or use a Web3-enabled browser');
        return;
      }

      const provider = new BrowserProvider(window.ethereum);
      
      // Request accounts - this will trigger wallet popup
      const accounts = await provider.send('eth_requestAccounts', []);
      if (!accounts || accounts.length === 0) {
        error('No accounts found. Please unlock your wallet.');
        return;
      }
      
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      
      // Check if connected to a supported network
      if (chainId !== BASE_SEPOLIA_CHAIN_ID && chainId !== BASE_MAINNET_CHAIN_ID) {
        warning('Please switch to Base Sepolia or Base Mainnet');
        try {
          await switchNetwork(BASE_SEPOLIA_CHAIN_ID);
        } catch (err) {
          return;
        }
      }

      // Get address directly from accounts array to avoid ENS lookup
      const address = accounts[0];
      
      await contractService.initialize(provider);
      
      setAccount(address);
      setCurrentChainId(chainId);
      setConnected(true);
      updateActivity(); // Initialize activity tracking
      sessionStorage.setItem('walletConnected', 'true');
      success(`Connected to ${address.slice(0, 6)}...${address.slice(-4)}`);
      
      // Listen for account changes
      if (window.ethereum?.on) {
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);
      }
    } catch (err: any) {
      console.error('Failed to connect wallet:', err);
      if (err.code === 4001) {
        info('Connection request rejected');
      } else {
        error(err.message || 'Failed to connect wallet. Please try again.');
      }
    }
  };

  const disconnectWallet = () => {
    try {
      // Remove event listeners
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
      
      contractService.disconnect();
      setConnected(false);
      setAccount('');
      setPlayerData(null);
      setTasks([]);
      setLeaderboard([]);
      sessionStorage.removeItem('walletConnected');
      info('Wallet disconnected');
    } catch (err: any) {
      console.error('Failed to disconnect:', err);
      error('Failed to disconnect wallet');
    }
  };

  const switchNetwork = async (targetChainId: number) => {
    try {
      if (!window.ethereum) {
        error('No wallet detected');
        return;
      }

      const chainIdHex = `0x${targetChainId.toString(16)}`;
      
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainIdHex }],
        });
        
        setCurrentChainId(targetChainId);
        await contractService.reinitialize();
        
        const networkName = targetChainId === BASE_MAINNET_CHAIN_ID ? 'Base Mainnet' : 'Base Sepolia';
        success(`Switched to ${networkName}`);
        
        // Reload data after network switch
        if (account) {
          await loadData();
        }
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          const networkParams = getNetworkParams(targetChainId);
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [networkParams],
            });
            setCurrentChainId(targetChainId);
            await contractService.reinitialize();
            success(`Added and switched to ${networkParams.chainName}`);
          } catch (addError: any) {
            error('Failed to add network to wallet');
            throw addError;
          }
        } else {
          error(switchError.message || 'Failed to switch network');
          throw switchError;
        }
      }
    } catch (err: any) {
      console.error('Network switch error:', err);
      error(err.message || 'Failed to switch network');
    }
  };

  const getNetworkParams = (chainId: number) => {
    if (chainId === BASE_MAINNET_CHAIN_ID) {
      return {
        chainId: '0x2105',
        chainName: 'Base Mainnet',
        nativeCurrency: {
          name: 'Ether',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: ['https://mainnet.base.org'],
        blockExplorerUrls: ['https://basescan.org'],
      };
    } else {
      return {
        chainId: '0x14a34',
        chainName: 'Base Sepolia',
        nativeCurrency: {
          name: 'Ether',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: ['https://sepolia.base.org'],
        blockExplorerUrls: ['https://sepolia.basescan.org'],
      };
    }
  };

  const handleAccountsChanged = async (accounts: string[]) => {
    if (accounts.length === 0) {
      // Wallet disconnected - clear everything and show connect screen
      sessionStorage.removeItem('walletConnected');
      disconnectWallet();
      warning('Wallet disconnected. Please connect again.');
    } else if (accounts[0] !== account) {
      // Account changed - reconnect with new account
      try {
        const provider = new BrowserProvider(window.ethereum!);
        const network = await provider.getNetwork();
        const chainId = Number(network.chainId);
        const address = accounts[0];
        
        await contractService.initialize(provider);
        
        setAccount(address);
        setCurrentChainId(chainId);
        setConnected(true);
        updateActivity();
        info(`Switched to ${address.slice(0, 6)}...${address.slice(-4)}`);
      } catch (err) {
        console.error('Failed to switch account:', err);
        disconnectWallet();
      }
    }
  };

  const handleChainChanged = () => {
    window.location.reload();
  };

  const loadData = async () => {
    if (!connected || !account) return;
    
    // Update activity time on data load
    updateActivity();
    
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
    } catch (err: any) {
      console.error('Failed to load data:', err);
      // Check if it's a connection issue
      if (err.message?.includes('network does not support ENS') || 
          err.message?.includes('Please connect your wallet')) {
        error('Connection lost. Please reconnect your wallet.');
        disconnectWallet();
      } else {
        error('Failed to load data. Please try again.');
      }
    }
  };

  const handleJoinWeek = async () => {
    if (!contractService.isInitialized() || !connected) {
      warning('Please connect your wallet first');
      disconnectWallet();
      return;
    }
    
    updateActivity();
    
    try {
      setLoading(true);
      await contractService.joinWeek(entryFee);
      await loadData();
      success('Successfully joined this week! Start completing tasks to build your streak.');
    } catch (err: any) {
      console.error('Failed to join week:', err);
      if (err.message?.includes('user rejected')) {
        info('Transaction cancelled');
      } else {
        error(err.message || 'Failed to join week. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (taskId: number) => {
    if (!contractService.isInitialized() || !connected) {
      warning('Please connect your wallet first');
      disconnectWallet();
      return;
    }
    
    updateActivity();
    
    try {
      setLoading(true);
      await contractService.completeTask(taskId);
      await loadData();
      success('Task completed! Keep going to maintain your streak.');
    } catch (err: any) {
      console.error('Failed to complete task:', err);
      if (err.message?.includes('user rejected')) {
        info('Transaction cancelled');
      } else {
        error(err.message || 'Failed to complete task. Please try again.');
      }
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
      <Header 
        account={account} 
        currentChainId={currentChainId}
        onNetworkSwitch={switchNetwork}
        onDisconnect={disconnectWallet}
      />
      
      <div className="px-5 pb-10">
        <WeeklyTimer 
          currentWeek={currentWeek} 
          prizePool={prizePool}
          isConnected={connected}
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

      {/* Toast Notifications */}
      <div className="fixed bottom-5 right-5 z-[1000] flex flex-col gap-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
