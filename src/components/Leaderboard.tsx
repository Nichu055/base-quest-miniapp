import { Trophy, Medal, Flame, Star, Gift } from 'lucide-react';
import type { LeaderboardEntry } from '../contractService';

interface LeaderboardProps {
  leaderboard: LeaderboardEntry[];
  currentAccount: string;
}

function Leaderboard({ leaderboard, currentAccount }: LeaderboardProps) {
  const getMedalIcon = (rank: number) => {
    const className = "w-7 h-7";
    switch (rank) {
      case 0: return <Medal className={`${className} text-yellow-400 fill-yellow-400`} />;
      case 1: return <Medal className={`${className} text-gray-400 fill-gray-400`} />;
      case 2: return <Medal className={`${className} text-orange-600 fill-orange-600`} />;
      default: return <span className="text-lg text-text-secondary font-bold">#{rank + 1}</span>;
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="my-6">
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <Trophy className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">Leaderboard</h2>
        </div>
        <p className="text-text-secondary">Top players by streak + weekly BP</p>
      </div>

      {leaderboard.length === 0 ? (
        <div className="text-center px-5 py-10 bg-surface border border-border rounded-xl">
          <p className="my-2">No players yet this week.</p>
          <p className="text-text-secondary my-2">Be the first to join!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {leaderboard.map((entry, index) => {
            const isCurrentUser = entry.address.toLowerCase() === currentAccount.toLowerCase();
            const score = entry.streak + entry.points;

            return (
              <div 
                key={entry.address} 
                className={`flex items-center gap-4 bg-surface border rounded-xl p-4 transition-all duration-300 hover:border-primary hover:translate-x-1 ${
                  isCurrentUser ? 'border-primary bg-[rgba(0,82,255,0.05)]' : 'border-border'
                } ${index < 3 ? 'bg-[rgba(255,215,0,0.03)]' : ''}`}
              >
                <div className="w-10 flex justify-center items-center font-bold">
                  {getMedalIcon(index)}
                </div>

                <div className="flex-1">
                  <div className="font-semibold text-[15px] mb-1.5 flex items-center gap-2">
                    {formatAddress(entry.address)}
                    {isCurrentUser && (
                      <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded tracking-wide">
                        YOU
                      </span>
                    )}
                  </div>
                  <div className="flex gap-4 text-[13px] text-text-secondary">
                    <span className="flex items-center gap-1">
                      <Flame className="w-3 h-3" />
                      {entry.streak}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      {entry.points} BP
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] text-text-secondary uppercase tracking-wide mb-0.5">Score</div>
                  <div className="text-xl font-bold text-primary">{score}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-5 p-4 bg-surface border border-border rounded-xl">
        <div className="flex items-center justify-center gap-2 text-[13px] text-text-secondary">
          <Gift className="w-4 h-4" />
          <p className="leading-relaxed">Top 10% of players receive 90% of the weekly prize pool</p>
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;
