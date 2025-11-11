import { useEffect, useState, useRef } from 'react';
import { DollarSign } from 'lucide-react';
import { contractService } from '../contractService';

interface WeeklyTimerProps {
  currentWeek: number;
  prizePool: string;
  isConnected?: boolean;
}

function WeeklyTimer({ currentWeek, prizePool, isConnected = false }: WeeklyTimerProps) {
  const [timeUntilEnd, setTimeUntilEnd] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isConnected) {
      setIsLoading(false);
      return;
    }
    
    loadEndTime();
    // Fetch from contract every 30 seconds instead of every second
    intervalRef.current = setInterval(loadEndTime, 30000);
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [isConnected]);

  // Separate countdown that decrements locally every second
  useEffect(() => {
    if (timeUntilEnd > 0) {
      countdownRef.current = setInterval(() => {
        setTimeUntilEnd(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      
      return () => {
        if (countdownRef.current) clearInterval(countdownRef.current);
      };
    }
  }, [timeUntilEnd]);

  const loadEndTime = async () => {
    if (!isConnected) return;
    
    try {
      const time = await contractService.getTimeUntilWeekEnd();
      setTimeUntilEnd(time);
      setIsLoading(false);
    } catch (error) {
      // Silently fail if contract not initialized
      console.debug('Timer paused - wallet not connected');
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return { days, hours, minutes, secs };
  };

  const time = formatTime(timeUntilEnd);

  return (
    <div className="bg-gradient-to-br from-[rgba(0,82,255,0.1)] to-[rgba(0,211,149,0.1)] border border-primary rounded-2xl p-5 my-5">
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-lg font-semibold text-text-primary">Week {currentWeek}</h3>
        <div className="flex items-center gap-1.5 bg-surface border border-border rounded-[20px] px-3.5 py-1.5">
          <DollarSign className="w-4 h-4 text-secondary" />
          <span className="text-sm font-bold text-secondary">{parseFloat(prizePool).toFixed(6)} ETH</span>
        </div>
      </div>

      <div className="flex justify-center items-center gap-2 mb-3">
        <div className="bg-surface border border-border rounded-xl p-3 min-w-[60px] text-center">
          <div className="text-2xl font-bold text-primary leading-none mb-1 tabular-nums">{time.days}</div>
          <div className="text-[10px] text-text-secondary uppercase tracking-wide font-semibold">Days</div>
        </div>
        <div className="text-2xl font-bold text-text-secondary px-1">:</div>
        <div className="bg-surface border border-border rounded-xl p-3 min-w-[60px] text-center">
          <div className="text-2xl font-bold text-primary leading-none mb-1 tabular-nums">{time.hours.toString().padStart(2, '0')}</div>
          <div className="text-[10px] text-text-secondary uppercase tracking-wide font-semibold">Hours</div>
        </div>
        <div className="text-2xl font-bold text-text-secondary px-1">:</div>
        <div className="bg-surface border border-border rounded-xl p-3 min-w-[60px] text-center">
          <div className="text-2xl font-bold text-primary leading-none mb-1 tabular-nums">{time.minutes.toString().padStart(2, '0')}</div>
          <div className="text-[10px] text-text-secondary uppercase tracking-wide font-semibold">Minutes</div>
        </div>
        <div className="text-2xl font-bold text-text-secondary px-1">:</div>
        <div className="bg-surface border border-border rounded-xl p-3 min-w-[60px] text-center">
          <div className="text-2xl font-bold text-primary leading-none mb-1 tabular-nums">{time.secs.toString().padStart(2, '0')}</div>
          <div className="text-[10px] text-text-secondary uppercase tracking-wide font-semibold">Seconds</div>
        </div>
      </div>

      <div className="text-center text-xs text-text-secondary uppercase tracking-[1px] font-semibold">Until Week Ends</div>
    </div>
  );
}

export default WeeklyTimer;
