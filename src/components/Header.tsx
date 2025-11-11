import { Zap, X } from 'lucide-react';
import NetworkSwitcher from './NetworkSwitcher';

interface HeaderProps {
  account: string;
  currentChainId: number;
  onNetworkSwitch: (chainId: number) => void;
  onDisconnect: () => void;
}

function Header({ account, currentChainId, onNetworkSwitch, onDisconnect }: HeaderProps) {
  const shortAddress = `${account.slice(0, 6)}...${account.slice(-4)}`;

  return (
    <header className="bg-surface/90 border-b border-border px-5 py-4 sticky top-0 z-[100] backdrop-blur-[10px]">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary fill-primary" />
          <h1 className="text-xl font-bold gradient-text">Base Quest</h1>
        </div>
        <div className="flex items-center gap-2">
          <NetworkSwitcher 
            currentChainId={currentChainId}
            onNetworkSwitch={onNetworkSwitch}
          />
          <div className="flex items-center gap-2 bg-surface-light px-3 py-2 rounded-lg border border-border text-xs font-medium">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
            {shortAddress}
          </div>
          <button
            onClick={onDisconnect}
            className="bg-surface-light px-3 py-2 rounded-lg border border-border text-xs font-medium hover:border-error hover:text-error transition-all flex items-center gap-1"
            title="Disconnect Wallet"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
