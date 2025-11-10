import { useState } from 'react';
import { BASE_SEPOLIA_CHAIN_ID, BASE_MAINNET_CHAIN_ID } from '../config';

interface NetworkSwitcherProps {
  currentChainId: number;
  onNetworkSwitch: (chainId: number) => void;
}

function NetworkSwitcher({ currentChainId, onNetworkSwitch }: NetworkSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  const networks = [
    { id: BASE_SEPOLIA_CHAIN_ID, name: 'Base Sepolia', color: 'text-warning' },
    { id: BASE_MAINNET_CHAIN_ID, name: 'Base Mainnet', color: 'text-success' }
  ];

  const currentNetwork = networks.find(n => n.id === currentChainId);

  const handleNetworkSwitch = async (networkId: number) => {
    if (networkId === currentChainId) {
      setIsOpen(false);
      return;
    }
    
    setIsSwitching(true);
    setIsOpen(false);
    
    try {
      await onNetworkSwitch(networkId);
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isSwitching}
        className="flex items-center gap-2 bg-surface-light px-3 py-2 rounded-lg border border-border text-xs font-medium hover:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className={`w-2 h-2 rounded-full ${currentNetwork?.color || 'bg-text-secondary'} ${isSwitching ? 'animate-spin' : 'animate-pulse'}`}></div>
        <span>{isSwitching ? 'Switching...' : (currentNetwork?.name || 'Unknown')}</span>
        <span className="text-[10px]">{isSwitching ? '⟳' : '▼'}</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full right-0 mt-2 bg-surface border border-border rounded-lg shadow-lg overflow-hidden z-50 min-w-[160px]">
            {networks.map(network => (
              <button
                key={network.id}
                onClick={() => handleNetworkSwitch(network.id)}
                disabled={isSwitching}
                className={`w-full text-left px-4 py-3 text-xs font-medium flex items-center gap-2 hover:bg-surface-light transition-all border-0 rounded-none disabled:opacity-50 disabled:cursor-not-allowed ${
                  currentChainId === network.id ? 'bg-surface-light' : ''
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${network.color}`}></div>
                {network.name}
                {currentChainId === network.id && <span className="ml-auto text-primary">✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default NetworkSwitcher;