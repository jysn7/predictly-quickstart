"use client";

import LeaderboardRow, { LeaderboardRowProps } from "../components/LeaderboardRow";

export default function Leaderboard() {
  const mockUsers: Array<Omit<LeaderboardRowProps, 'rank'>> = [
    { 
      username: "Alice",
      score: 120,
      accuracy: 85,
      totalPredictions: 45,
      winStreak: 7,
      lastPrediction: {
        result: "win",
        timestamp: "2025-11-07T10:30:00Z"
      },
      tier: "Diamond"
    },
    { 
      username: "Bob",
      score: 105,
      accuracy: 78,
      totalPredictions: 38,
      winStreak: 4,
      lastPrediction: {
        result: "win",
        timestamp: "2025-11-07T09:15:00Z"
      },
      tier: "Gold"
    },
    { 
      username: "Charlie",
      score: 95,
      accuracy: 72,
      totalPredictions: 32,
      winStreak: 0,
      lastPrediction: {
        result: "loss",
        timestamp: "2025-11-07T08:45:00Z"
      },
      tier: "Silver"
    },
  ];

  return (
    <main className="min-h-screen bg-blackDark text-white font-techy antialiased px-4 md:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-6">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purpleNeon to-white bg-clip-text text-transparent">Leaderboard</h1>
          <div className="flex gap-4">
            <select className="p-3 rounded-lg bg-purpleDark/20 border border-purpleNeon/30 text-white w-40 focus:outline-none focus:border-purpleNeon focus:ring-1 focus:ring-purpleNeon/50 transition-all">
              <option value="all-time">All Time</option>
              <option value="this-week">This Week</option>
              <option value="today">Today</option>
            </select>
          </div>
        </div>
        <div className="grid gap-4">
          {mockUsers.map((user, idx) => (
            <LeaderboardRow key={idx} {...user} rank={idx + 1} />
          ))}
        </div>
      </div>
    </main>
  );
}
