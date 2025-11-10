import { BASE_MAINNET_CHAIN_ID } from '../config';

interface NetworkSwitcherProps {
  currentChainId: number;
}

function NetworkSwitcher({ currentChainId }: NetworkSwitcherProps) {
  const networkName = currentChainId === BASE_MAINNET_CHAIN_ID ? 'Base Mainnet' : `Chain ${currentChainId}`;
  const isCorrectNetwork = currentChainId === BASE_MAINNET_CHAIN_ID;

  return (
    <div className="flex items-center gap-2 bg-surface-light px-3 py-2 rounded-lg border border-border text-xs font-medium">
      <div className={`w-2 h-2 rounded-full ${isCorrectNetwork ? 'text-success animate-pulse' : 'bg-warning'}`}></div>
      <span>{networkName}</span>
    </div>
  );
}

export default NetworkSwitcher;