export interface LeaderboardRowProps {
  rank: number;
  username: string;
  score: number;
  accuracy: number;
  totalPredictions: number;
  winStreak: number;
  lastPrediction: {
    result: "win" | "loss";
    timestamp: string;
  };
  tier: string;
}

export default function LeaderboardRow({ 
  rank, 
  username, 
  score, 
  accuracy, 
  totalPredictions, 
  winStreak,
  lastPrediction,
  tier
}: LeaderboardRowProps) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="text-2xl font-bold text-accent">#{rank}</div>
          <div>
            <h3 className="text-xl font-bold text-text">{username}</h3>
            <span style={{ color: 'var(--text-secondary)' }} className="text-sm">{tier} Predictor</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-text">{score}</div>
          <div style={{ color: 'var(--text-secondary)' }} className="text-sm">points</div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div style={{ backgroundColor: 'var(--surface)', padding: '0.75rem', borderRadius: 'var(--radius)' }}>
          <div style={{ color: 'var(--text-secondary)' }} className="text-sm">Accuracy</div>
          <div className="text-text font-bold">{accuracy}%</div>
        </div>
        <div style={{ backgroundColor: 'var(--surface)', padding: '0.75rem', borderRadius: 'var(--radius)' }}>
          <div style={{ color: 'var(--text-secondary)' }} className="text-sm">Predictions</div>
          <div className="text-text font-bold">{totalPredictions}</div>
        </div>
        <div style={{ backgroundColor: 'var(--surface)', padding: '0.75rem', borderRadius: 'var(--radius)' }}>
          <div style={{ color: 'var(--text-secondary)' }} className="text-sm">Win Streak</div>
          <div className="text-text font-bold">🔥 {winStreak}</div>
        </div>
        <div style={{ backgroundColor: 'var(--surface)', padding: '0.75rem', borderRadius: 'var(--radius)' }}>
          <div style={{ color: 'var(--text-secondary)' }} className="text-sm">Last Prediction</div>
          <div style={{ color: lastPrediction.result === 'win' ? '#22c55e' : '#ef4444' }} className="font-bold">{lastPrediction.result.toUpperCase()}</div>
        </div>
      </div>
    </div>
  );
}
