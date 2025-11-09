import { useEffect, useState } from 'react';
import type { PlayerData } from '../contractService';
import { contractService } from '../contractService';

interface PlayerStatsProps {
  playerData: PlayerData;
  account: string;
}

function PlayerStats({ playerData, account }: PlayerStatsProps) {
  const [timeUntilReset, setTimeUntilReset] = useState(0);

  useEffect(() => {
    loadResetTime();
    const interval = setInterval(loadResetTime, 1000);
    return () => clearInterval(interval);
  }, [account]);

  const loadResetTime = async () => {
    try {
      const time = await contractService.getTimeUntilDayReset(account);
      setTimeUntilReset(time);
    } catch (error) {
      console.error('Failed to load reset time:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  return (
    <div className="my-5">
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3 transition-all duration-300 hover:border-primary hover:-translate-y-0.5">
          <div className="text-[32px]">🔥</div>
          <div className="flex-1">
            <div className="text-2xl font-bold text-text-primary leading-none mb-1">{Number(playerData.currentStreak)}</div>
            <div className="text-xs text-text-secondary font-medium uppercase tracking-wide">Day Streak</div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3 transition-all duration-300 hover:border-primary hover:-translate-y-0.5">
          <div className="text-[32px]">⭐</div>
          <div className="flex-1">
            <div className="text-2xl font-bold text-text-primary leading-none mb-1">{Number(playerData.totalBasePoints)}</div>
            <div className="text-xs text-text-secondary font-medium uppercase tracking-wide">Total BP</div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3 transition-all duration-300 hover:border-primary hover:-translate-y-0.5">
          <div className="text-[32px]">📊</div>
          <div className="flex-1">
            <div className="text-2xl font-bold text-text-primary leading-none mb-1">{Number(playerData.weeklyBasePoints)}</div>
            <div className="text-xs text-text-secondary font-medium uppercase tracking-wide">Weekly BP</div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3 transition-all duration-300 hover:border-primary hover:-translate-y-0.5">
          <div className="text-[32px]">✅</div>
          <div className="flex-1">
            <div className="text-2xl font-bold text-text-primary leading-none mb-1">{playerData.tasksCompletedToday}/3</div>
            <div className="text-xs text-text-secondary font-medium uppercase tracking-wide">Tasks Today</div>
          </div>
        </div>
      </div>

      {timeUntilReset > 0 && (
        <div className="bg-surface border border-border rounded-xl px-4 py-3 flex justify-between items-center">
          <span className="text-sm text-text-secondary">Daily reset in:</span>
          <span className="text-base font-semibold text-primary tabular-nums">{formatTime(timeUntilReset)}</span>
        </div>
      )}
    </div>
  );
}

export default PlayerStats;
