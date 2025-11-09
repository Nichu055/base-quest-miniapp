import type { LeaderboardEntry } from '../contractService';

interface LeaderboardProps {
  leaderboard: LeaderboardEntry[];
  currentAccount: string;
}

function Leaderboard({ leaderboard, currentAccount }: LeaderboardProps) {
  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `#${rank + 1}`;
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="my-6">
      <div className="mb-5">
        <h2 className="text-xl font-semibold mb-1">🏆 Leaderboard</h2>
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
                <div className="w-10 text-center font-bold">
                  {typeof getMedalIcon(index) === 'string' && getMedalIcon(index).startsWith('#') ? (
                    <span className="text-lg text-text-secondary">{getMedalIcon(index)}</span>
                  ) : (
                    <span className="text-[28px]">{getMedalIcon(index)}</span>
                  )}
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
                    <span className="flex items-center gap-1">🔥 {entry.streak}</span>
                    <span className="flex items-center gap-1">⭐ {entry.points} BP</span>
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

      <div className="mt-5 p-4 bg-surface border border-border rounded-xl text-center">
        <p className="text-[13px] text-text-secondary leading-relaxed">
          🎁 Top 10% of players receive 90% of the weekly prize pool
        </p>
      </div>
    </div>
  );
}

export default Leaderboard;
