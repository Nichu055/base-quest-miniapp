import { X, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface BridgeOption {
  name: string;
  url: string;
  description: string;
}

interface BridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskDescription: string;
  metadata: string;
}

const BRIDGE_OPTIONS: BridgeOption[] = [
  {
    name: 'Official Base Bridge',
    url: 'https://bridge.base.org',
    description: 'Official bridge from Coinbase - most secure option'
  },
  {
    name: 'Superbridge',
    url: 'https://superbridge.app/base',
    description: 'Fast and user-friendly bridge interface'
  },
  {
    name: 'Orbiter Finance',
    url: 'https://www.orbiter.finance/?source=Ethereum&dest=Base',
    description: 'Cross-chain bridge with competitive fees'
  }
];

function BridgeModal({ isOpen, onClose, taskDescription, metadata }: BridgeModalProps) {
  const [selectedBridge, setSelectedBridge] = useState<string | null>(null);

  if (!isOpen) return null;

  let bridgeOptions = BRIDGE_OPTIONS;
  let fromChain = 'Ethereum';
  let toChain = 'Base';
  let minAmount = '$1+';

  // Parse metadata if available
  try {
    if (metadata) {
      const meta = JSON.parse(metadata);
      if (meta.bridgeUrls && meta.bridgeUrls.length > 0) {
        bridgeOptions = meta.bridgeUrls.map((url: string, idx: number) => {
          const option = BRIDGE_OPTIONS.find(opt => opt.url === url);
          if (option) return option;
          return {
            name: `Bridge Option ${idx + 1}`,
            url,
            description: 'Bridge your assets to Base'
          };
        });
      }
      if (meta.fromChain) fromChain = meta.fromChain;
      if (meta.toChain) toChain = meta.toChain;
      if (meta.minAmount) minAmount = `$${meta.minAmount}+`;
    }
  } catch (err) {
    console.error('Failed to parse bridge metadata:', err);
  }

  const handleBridgeClick = (url: string) => {
    setSelectedBridge(url);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-background border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-text-primary mb-1">Bridge to Base</h2>
            <p className="text-sm text-text-secondary">{taskDescription}</p>
          </div>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary transition-colors p-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Task Info */}
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-secondary" />
            <span className="font-semibold text-text-primary">Task Requirements</span>
          </div>
          <ul className="text-sm text-text-secondary space-y-1 ml-7">
            <li>• Bridge {minAmount} from {fromChain} to {toChain}</li>
            <li>• Use any of the bridge options below</li>
            <li>• Task will be verified by our attester</li>
          </ul>
        </div>

        {/* Bridge Options */}
        <div className="space-y-3 mb-6">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">
            Choose a Bridge Platform
          </h3>
          
          {bridgeOptions.map((bridge) => (
            <button
              key={bridge.url}
              onClick={() => handleBridgeClick(bridge.url)}
              className={`w-full bg-surface border rounded-xl p-4 text-left transition-all duration-300 hover:border-primary hover:shadow-[0_4px_16px_rgba(0,82,255,0.1)] ${
                selectedBridge === bridge.url ? 'border-primary bg-primary/5' : 'border-border'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-text-primary">{bridge.name}</span>
                <ExternalLink className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm text-text-secondary">{bridge.description}</p>
            </button>
          ))}
        </div>

        {/* Instructions */}
        <div className="bg-surface-light border border-border rounded-xl p-4 mb-4">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
            <div className="text-sm text-text-secondary">
              <p className="font-semibold text-text-primary mb-1">Next Steps:</p>
              <ol className="space-y-1 list-decimal list-inside">
                <li>Select a bridge platform above</li>
                <li>Complete the bridge transaction</li>
                <li>Wait for our attester to verify your bridge</li>
                <li>Task will be marked as complete automatically</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="btn-primary w-full px-6 py-3 text-base font-semibold"
        >
          Got it!
        </button>
      </div>
    </div>
  );
}

export default BridgeModal;
