import { useState, useEffect, useCallback } from 'react';
import { BrowserProvider, JsonRpcProvider } from 'ethers';
import { sdk } from '@farcaster/miniapp-sdk';
import { contractService, type PlayerData, type Task, type LeaderboardEntry } from './contractService';
import { BASE_SEPOLIA_CHAIN_ID, BASE_MAINNET_CHAIN_ID, isContractDeployed, isContractOnNetwork } from './config';
import { useToast } from './hooks/useToast';
import { useIdleTimeout } from './hooks/useIdleTimeout';

// Components
import Header from './components/Header';
import PlayerStats from './components/PlayerStats';
import TaskList from './components/TaskList';
import Leaderboard from './components/Leaderboard';
import WeeklyTimer from './components/WeeklyTimer';
import Toast from './components/Toast';
import Loader from './components/Loader';

// Safe provider that skips ENS lookups on Base networks
// Uses custom RPC if available, otherwise falls back to public endpoints
const getSafeBaseProvider = async () => {
  try {
    if (!window.ethereum) {
      // No wallet, return default Base Sepolia RPC
      const rpcUrl = import.meta.env.VITE_BASE_SEPOLIA_RPC || 'https://sepolia.base.org';
      return new JsonRpcProvider(rpcUrl);
    }

    const browserProvider = new BrowserProvider(window.ethereum);
    const network = await browserProvider.getNetwork();
    const chainId = Number(network.chainId);

    // Get custom RPC URL from environment if available
    let rpcUrl: string;
    if (chainId === BASE_SEPOLIA_CHAIN_ID) {
      rpcUrl = import.meta.env.VITE_BASE_SEPOLIA_RPC || 'https://sepolia.base.org';
    } else if (chainId === BASE_MAINNET_CHAIN_ID) {
      rpcUrl = import.meta.env.VITE_BASE_MAINNET_RPC || 'https://mainnet.base.org';
    } else {
      // Fallback for other networks
      return browserProvider;
    }

    // Return static RPC provider to skip ENS lookups
    return new JsonRpcProvider(rpcUrl);
  } catch (err) {
    console.warn('Failed to get provider, using default Base Sepolia RPC:', err);
    // Default fallback
    const rpcUrl = import.meta.env.VITE_BASE_SEPOLIA_RPC || 'https://sepolia.base.org';
    return new JsonRpcProvider(rpcUrl);
  }
};

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

  // Wallet disconnect handler (needs to be defined before handleIdle)
  const disconnectWallet = useCallback(() => {
    try {
      // Remove event listeners
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
      
      // Disconnect contract service
      contractService.disconnect();
      
      // Clear all state
      setConnected(false);
      setAccount('');
      setPlayerData(null);
      setTasks([]);
      setLeaderboard([]);
      setEntryFee('0');
      setPrizePool('0');
      setCurrentWeek(0);
      
      // Clear session storage
      sessionStorage.removeItem('walletConnected');
      
      info('Wallet disconnected');
    } catch (err: any) {
      console.error('Failed to disconnect:', err);
      error('Failed to disconnect wallet');
    }
  }, [info, error]);

  // Idle timeout handler
  const handleIdle = useCallback(() => {
    info('Session expired due to inactivity');
    disconnectWallet();
  }, [info, disconnectWallet]);

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
      // Check if contract is deployed on current network
      if (!isContractOnNetwork(currentChainId)) {
        warning(`Contract only deployed on Base Sepolia. Please switch to Base Sepolia network.`);
        return;
      }
      
      loadData();
      // Reduce polling to 2 minutes to avoid rate limiting
      const interval = setInterval(loadData, 120000);
      return () => clearInterval(interval);
    }
  }, [connected, account, currentChainId]);

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
      const provider = await getSafeBaseProvider();
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
    console.log('🔵 Connect Wallet button clicked');
    console.log('🔍 Checking window.ethereum:', window.ethereum ? 'Found' : 'Not found');
    
    try {
      if (!window.ethereum) {
        console.error('❌ No wallet detected');
        error('Please install MetaMask or use a Web3-enabled browser');
        return;
      }

      const walletInfo: any = window.ethereum;
      console.log('✅ Wallet detected:', {
        isMetaMask: walletInfo?.isMetaMask,
        isCoinbaseWallet: walletInfo?.isCoinbaseWallet,
        provider: walletInfo?.constructor?.name
      });

      setLoading(true);
      console.log('⏳ Loading state set to true');

      // 1️⃣ FIRST: Request accounts using BrowserProvider to trigger popup
      const browserProvider = new BrowserProvider(window.ethereum);
      console.log('🔑 Requesting accounts - popup should appear now...');
      
      const accounts = await browserProvider.send('eth_requestAccounts', []);
      console.log('📝 Accounts received:', accounts);
      
      if (!accounts || accounts.length === 0) {
        console.error('❌ No accounts found');
        error('No accounts found. Please unlock your wallet.');
        setLoading(false);
        return;
      }
      
      // Small delay to let wallet settle
      await new Promise(r => setTimeout(r, 500));
      
      // 2️⃣ THEN: Check network using safe provider (read-only)
      const provider = await getSafeBaseProvider();
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      
      console.log('🌐 Current network:', { chainId, name: network.name });
      
      // Check if connected to a supported network
      if (chainId !== BASE_SEPOLIA_CHAIN_ID && chainId !== BASE_MAINNET_CHAIN_ID) {
        const currentNetworkName = chainId === 1 ? 'Ethereum Mainnet' : `Chain ${chainId}`;
        console.warn(`⚠️ Wrong network: ${currentNetworkName}`);
        warning(`You're on ${currentNetworkName}. Please switch to Base Sepolia or Base Mainnet.`);
        
        // Small delay before triggering network switch popup
        await new Promise(r => setTimeout(r, 300));
        
        try {
          // Trigger network switch popup
          info('Opening wallet to switch network...');
          await switchNetwork(BASE_SEPOLIA_CHAIN_ID);
          // After successful switch, re-get the provider
          const newProvider = await getSafeBaseProvider();
          await contractService.initialize(newProvider);
        } catch (err) {
          console.error('❌ Failed to switch network:', err);
          error('Failed to switch network. Please switch manually in your wallet.');
          setLoading(false);
          return;
        }
      } else {
        // Already on correct network
        console.log('✅ On correct network, initializing contract...');
        await contractService.initialize(provider);
      }

      // Get address directly from accounts array to avoid ENS lookup
      const address = accounts[0];
      
      setAccount(address);
      setCurrentChainId(chainId);
      setConnected(true);
      updateActivity(); // Initialize activity tracking
      sessionStorage.setItem('walletConnected', 'true');
      console.log('✅ Connected successfully:', address);
      success(`Connected to ${address.slice(0, 6)}...${address.slice(-4)}`);
      
      // Listen for account changes
      if (window.ethereum?.on) {
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);
      }
    } catch (err: any) {
      console.error('❌ Failed to connect wallet:', err);
      if (err.code === 4001) {
        info('Connection request rejected');
      } else if (err.code === -32002) {
        warning('Request already pending. Please check your wallet extension.');
      } else {
        error(err.message || 'Failed to connect wallet. Please try again.');
      }
    } finally {
      setLoading(false);
      console.log('⏳ Loading state set to false');
    }
  };

  const switchNetwork = async (targetChainId: number) => {
    try {
      if (!window.ethereum) {
        error('No wallet detected');
        return;
      }

      const chainIdHex = `0x${targetChainId.toString(16)}`;
      console.log('🔄 Network Switch Request');
      console.log('Target Chain ID:', targetChainId, 'Hex:', chainIdHex);
      console.log('Wallet provider:', (window.ethereum as any)?.isMetaMask ? 'MetaMask' : (window.ethereum as any)?.isOkxWallet ? 'OKX' : 'Unknown');
      
      // Check current network FIRST
      const currentProvider = await getSafeBaseProvider();
      const currentNetwork = await currentProvider.getNetwork();
      const currentChain = Number(currentNetwork.chainId);
      
      console.log('Current chain:', currentChain);
      
      if (currentChain === targetChainId) {
        const networkName = targetChainId === BASE_MAINNET_CHAIN_ID ? 'Base Mainnet' : 'Base Sepolia';
        info(`Already on ${networkName}`);
        setCurrentChainId(currentChain);
        return;
      }
      
      const targetNetworkName = targetChainId === BASE_MAINNET_CHAIN_ID ? 'Base Mainnet' : 'Base Sepolia';
      info(`🔄 Switching to ${targetNetworkName}... If popup doesn't appear, please switch manually in your wallet.`);
      
      try {
        console.log('Calling wallet_switchEthereumChain...');
        console.log('Request params:', { chainId: chainIdHex });
        
        // Force wallet popup by using request directly
        const result = await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainIdHex }],
        });
        
        console.log('✅ Switch request completed:', result);
        
        // Wait for wallet to complete the switch
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Verify using fresh provider
        const verifyProvider = await getSafeBaseProvider();
        const verifyNetwork = await verifyProvider.getNetwork();
        const actualChainId = Number(verifyNetwork.chainId);
        
        console.log('Verified chain after switch:', actualChainId, 'Expected:', targetChainId);
        
        if (actualChainId === targetChainId) {
          setCurrentChainId(targetChainId);
          await contractService.reinitialize();
          
          const networkName = targetChainId === BASE_MAINNET_CHAIN_ID ? 'Base Mainnet' : 'Base Sepolia';
          success(`✅ Switched to ${networkName}!`);
          
          if (account && isContractOnNetwork(targetChainId)) {
            await loadData();
          }
        } else {
          const actualNetworkName = actualChainId === BASE_MAINNET_CHAIN_ID ? 'Base Mainnet' : 
                                    actualChainId === BASE_SEPOLIA_CHAIN_ID ? 'Base Sepolia' : `Chain ${actualChainId}`;
          warning(`You're on ${actualNetworkName}. The switch may not have completed. Try again.`);
          setCurrentChainId(actualChainId);
        }
      } catch (switchError: any) {
        console.error('Switch error:', switchError);
        
        if (switchError.code === 4902) {
          // Network not in wallet - add it
          const networkParams = getNetworkParams(targetChainId);
          info(`➕ Adding ${networkParams.chainName}... Check your wallet!`);
          console.log('Adding network:', networkParams);
          
          try {
            const addResult = await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [networkParams],
            });
            
            console.log('Add network completed:', addResult);
            
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const provider = await getSafeBaseProvider();
            const network = await provider.getNetwork();
            const actualChainId = Number(network.chainId);
            
            console.log(`Chain after add: ${actualChainId}`);
            
            if (actualChainId === targetChainId) {
              setCurrentChainId(targetChainId);
              await contractService.reinitialize();
              success(`✅ Added ${networkParams.chainName}!`);
              
              if (account && isContractOnNetwork(targetChainId)) {
                await loadData();
              }
            } else {
              warning('Network added. Please select it from the dropdown again.');
              setCurrentChainId(actualChainId);
            }
          } catch (addError: any) {
            console.error('❌ Add network error:', addError);
            if (addError.code === 4001) {
              info('Cancelled');
            } else if (addError.code === -32002) {
              warning('⚠️ Request pending - click your wallet extension icon!');
            } else {
              error(`Failed: ${addError.message}`);
            }
          }
        } else if (switchError.code === 4001) {
          console.log('User rejected network switch');
          info('Network switch cancelled. Please switch manually in your wallet to continue.');
        } else if (switchError.code === -32002) {
          console.warn('Request already pending');
          warning('⚠️ Request pending - click your wallet extension icon or switch manually!');
        } else {
          console.error('Unknown switch error:', switchError);
          error(`Failed to switch automatically. Please switch to ${targetNetworkName} manually in your wallet.`);
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
        const provider = await getSafeBaseProvider();
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

  const handleChainChanged = async (chainIdHex: string) => {
    console.log('Chain changed detected:', chainIdHex);
    
    try {
      // Convert hex to number
      const newChainId = parseInt(chainIdHex, 16);
      
      console.log('Network changed to chain ID:', newChainId);
      
      // Check if it's a supported network
      if (newChainId === BASE_SEPOLIA_CHAIN_ID || newChainId === BASE_MAINNET_CHAIN_ID) {
        const networkName = newChainId === BASE_MAINNET_CHAIN_ID ? 'Base Mainnet' : 'Base Sepolia';
        info(`Network changed to ${networkName}`);
        
        // Force update the state
        setCurrentChainId(newChainId);
        
        // Reinitialize contract service with new network
        const provider = await getSafeBaseProvider();
        await contractService.initialize(provider);
        
        // Reload data if connected and contract is deployed
        if (connected && account && isContractDeployed()) {
          await loadData();
        }
        
        success(`Now on ${networkName}`);
      } else {
        // Unsupported network - disconnect
        warning(`Unsupported network (chain ${newChainId}). Please switch to Base Sepolia or Base Mainnet.`);
        disconnectWallet();
      }
    } catch (err) {
      console.error('Error handling chain change:', err);
      // Fallback to reload if there's an error
      window.location.reload();
    }
  };

  const loadData = async () => {
    if (!connected || !account) return;
    
    // Update activity time on data load
    updateActivity();
    
    try {
      const [playerInfo, weekTasks, board, fee, pool, week] = await Promise.all([
        contractService.getPlayerData(account),
        contractService.getCurrentWeekTasks().catch(() => []), // Gracefully handle empty tasks
        contractService.getLeaderboard().catch(() => []), // Gracefully handle empty leaderboard
        contractService.getEntryFee().catch(() => '0.00001'), // Use default if fails
        contractService.getWeeklyPrizePool().catch(() => '0'),
        contractService.getCurrentWeek().catch(() => 1),
      ]);

      setPlayerData(playerInfo);
      setTasks(weekTasks);
      setLeaderboard(board);
      // Ensure entry fee is never 0
      const actualFee = !fee || fee === '0.0' || fee === '0' ? '0.00001' : fee;
      setEntryFee(actualFee);
      setPrizePool(pool);
      setCurrentWeek(week);
      
      console.log('✅ Data loaded successfully:');
      console.log('  - Active this week:', playerInfo.activeThisWeek);
      console.log('  - Current streak:', Number(playerInfo.currentStreak));
      console.log('  - Weekly BP:', Number(playerInfo.weeklyBasePoints));
      console.log('  - Tasks completed today:', playerInfo.tasksCompletedToday);
      console.log('  - Entry fee:', actualFee, 'ETH');
      
      // Show info if no tasks available
      if (weekTasks.length === 0) {
        console.info('ℹ️ No tasks available for the current week yet.');
      }
      
      // Show info if leaderboard is empty
      if (board.length === 0) {
        console.info('ℹ️ No players on leaderboard yet. Be the first to join!');
      }
    } catch (err: any) {
      console.error('Failed to load data:', err);
      
      // Check for rate limiting (429 Too Many Requests)
      if (err.message?.includes('429') || err.message?.toLowerCase().includes('too many requests')) {
        warning('Rate limit reached. Slowing down data refresh. Consider using a custom RPC endpoint.');
        console.warn('💡 To avoid rate limits, add custom RPC URLs to .env.local:\nVITE_BASE_SEPOLIA_RPC=https://base-sepolia.g.alchemy.com/v2/YOUR_KEY\nVITE_BASE_MAINNET_RPC=https://base-mainnet.g.alchemy.com/v2/YOUR_KEY');
        return;
      }
      
      // Check if it's a zero address / contract not deployed error
      if (err.code === 'CALL_EXCEPTION' && err.message?.includes('missing revert data')) {
        console.warn('Contract call failed - using defaults');
        // Set defaults instead of showing error
        setEntryFee('0.00001');
        setPrizePool('0');
        setCurrentWeek(1);
        return;
      }
      
      // Check if it's an ENS error - just warn, don't disconnect
      if (err.message?.includes('network does not support ENS')) {
        console.warn('ENS not supported on Base — skipping lookup.');
        return;
      }
      
      // Check if it's a connection issue
      if (err.message?.includes('Please connect your wallet')) {
        error('Connection lost. Please reconnect your wallet.');
        disconnectWallet();
      } else if (!err.message?.includes('missing revert data') && !err.message?.includes('429')) {
        // Don't show error for contract deployment issues or rate limits (already warned above)
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
      console.log('💰 Joining week with entry fee:', entryFee, 'ETH');
      
      // Wait for transaction to complete
      const tx = await contractService.joinWeek(entryFee);
      console.log('⏳ Transaction submitted, waiting for confirmation...');
      
      // Wait a bit for blockchain to update
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Reload data multiple times to ensure we get updated state
      console.log('🔄 Refreshing data...');
      await loadData();
      
      // Double-check after another delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      await loadData();
      
      console.log('✅ Join successful, data refreshed');
      success('Successfully joined this week! Start completing tasks to build your streak.');
    } catch (err: any) {
      console.error('Failed to join week:', err);
      
      // Extract error message
      const errorMessage = err.message || err.reason || err.toString();
      
      if (err.message?.includes('user rejected') || err.code === 4001) {
        info('Transaction cancelled');
      } else if (errorMessage.includes('Already joined this week')) {
        success('✅ You\'re already in! You\'ve joined this week and can complete tasks until the week ends.');
        // Force refresh data to update UI to show tasks
        await loadData();
      } else if (errorMessage.includes('Insufficient entry fee')) {
        error(`Entry fee required: ${entryFee} ETH. Please make sure you have enough ETH in your wallet.`);
      } else if (errorMessage.includes('insufficient funds')) {
        error(`Insufficient funds. You need at least ${entryFee} ETH plus gas fees.`);
      } else {
        error(errorMessage.includes('execution reverted') 
          ? 'Transaction failed. Please check the error and try again.' 
          : (errorMessage || 'Failed to join week. Please try again.'));
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
      <div className="w-full max-w-miniapp h-miniapp mx-auto bg-background relative overflow-hidden">
        <div className="flex flex-col items-center justify-center h-full px-10 py-10 gap-5">
          <Loader variant="pulse" size="lg" />
          <p className="text-text-secondary">Loading Base Quest...</p>
        </div>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="w-full max-w-miniapp h-miniapp mx-auto bg-background relative overflow-hidden">
        <div className="flex items-center justify-center h-full px-10 py-10">
          <div className="text-center max-w-[360px]">
            <div className="mb-4 flex justify-center">
              <img src="/logo.svg" alt="Base Quest" className="w-20 h-20" />
            </div>
            <h1 className="gradient-text text-[42px] font-bold mb-2">Base Quest</h1>
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
    <div className="w-full max-w-miniapp h-miniapp mx-auto bg-background relative overflow-hidden flex flex-col">
      <Header 
        account={account} 
        currentChainId={currentChainId}
        onNetworkSwitch={switchNetwork}
        onDisconnect={disconnectWallet}
      />
      
      <div className="flex-1 overflow-y-auto px-5 pb-5">
        {!isContractOnNetwork(currentChainId) ? (
          <div className="card p-8 text-center my-6">
            <div className="mb-4 flex justify-center">
              <img src="/logo.svg" alt="Base Quest" className="w-16 h-16 opacity-50" />
            </div>
            <h2 className="text-2xl mb-3">Wrong Network</h2>
            <p className="text-text-secondary mb-4">
              Contract is only deployed on Base Sepolia testnet.
            </p>
            <div className="bg-surface-light rounded-xl p-4 text-left text-sm mb-4">
              <p className="text-text-secondary mb-2">📡 Please switch to:</p>
              <div className="bg-surface px-3 py-2 rounded font-mono text-primary mb-2">
                Base Sepolia (Chain ID: 84532)
              </div>
              <p className="text-xs text-text-secondary mt-2">
                👉 If the automatic switch doesn't work, please change your network manually in your wallet settings.
              </p>
            </div>
            <button 
              className="btn-primary w-full px-8 py-4 text-lg font-bold" 
              onClick={() => switchNetwork(BASE_SEPOLIA_CHAIN_ID)}
            >
              Switch to Base Sepolia
            </button>
          </div>
        ) : (
          <>
            <WeeklyTimer 
              currentWeek={currentWeek} 
              prizePool={prizePool}
              isConnected={connected}
            />

            {!playerData?.activeThisWeek ? (
              <div className="card p-8 text-center my-6">
                <h2 className="text-2xl mb-3">Join Week {currentWeek}</h2>
                <p className="text-lg font-semibold mb-2">Entry Fee: {entryFee} ETH</p>
                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30 rounded-xl p-4 my-4">
                  <p className="text-sm text-text-secondary">
                    💡 Pay once to join this week's challenge. Once joined, you can complete daily tasks throughout the entire week until it ends!
                  </p>
                </div>
                <p className="text-text-secondary text-sm">
                  Complete 3 tasks daily to maintain your streak and earn rewards!
                </p>
                <button 
                  className="btn-primary w-full px-8 py-4 text-lg font-bold mt-6" 
                  onClick={handleJoinWeek}
                  disabled={loading}
                >
                  {loading ? 'Joining...' : 'Join This Week'}
                </button>
                
                {/* Debug: Manual refresh if join seems stuck */}
                <button 
                  className="w-full px-4 py-2 text-sm text-text-secondary hover:text-primary transition-colors mt-3"
                  onClick={loadData}
                  disabled={loading}
                >
                  🔄 Refresh Status
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
