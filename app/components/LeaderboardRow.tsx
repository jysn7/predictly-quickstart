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
    <div className="p-6 rounded-2xl bg-purpleDark/20 border border-purpleNeon/10 hover:bg-purpleDark/30 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="text-2xl font-bold text-purpleNeon">#{rank}</div>
          <div>
            <h3 className="text-xl font-bold text-white">{username}</h3>
            <span className="text-purpleNeon/80 text-sm">{tier} Predictor</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{score}</div>
          <div className="text-purpleNeon/80 text-sm">points</div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-3 rounded-lg bg-purpleDark/10">
          <div className="text-purpleNeon/80 text-sm">Accuracy</div>
          <div className="text-white font-bold">{accuracy}%</div>
        </div>
        <div className="p-3 rounded-lg bg-purpleDark/10">
          <div className="text-purpleNeon/80 text-sm">Predictions</div>
          <div className="text-white font-bold">{totalPredictions}</div>
        </div>
        <div className="p-3 rounded-lg bg-purpleDark/10">
          <div className="text-purpleNeon/80 text-sm">Win Streak</div>
          <div className="text-white font-bold">🔥 {winStreak}</div>
        </div>
        <div className="p-3 rounded-lg bg-purpleDark/10">
          <div className="text-purpleNeon/80 text-sm">Last Prediction</div>
          <div className={`font-bold ${lastPrediction.result === 'win' ? 'text-green-400' : 'text-red-400'}`}>{lastPrediction.result.toUpperCase()}</div>
        </div>
      </div>
    </div>
  );
}
