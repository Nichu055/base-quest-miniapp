import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

function Toast({ message, type, onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  const colors = {
    success: 'border-success',
    error: 'border-error',
    warning: 'border-warning',
    info: 'border-primary'
  };

  return (
    <div className={`toast ${colors[type]} animate-slideIn`}>
      <div className="flex items-center gap-3">
        <span className="text-xl">{icons[type]}</span>
        <p className="text-sm font-medium">{message}</p>
        <button 
          onClick={onClose}
          className="ml-2 p-0 bg-transparent border-0 text-text-secondary hover:text-text-primary cursor-pointer text-lg leading-none"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export default Toast;