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
    <main className="page-container">
      <div className="page-header">
        <h1 className="page-title">Leaderboard</h1>
        <select className="select-input" style={{ width: '150px' }}>
          <option value="all-time">All Time</option>
          <option value="this-week">This Week</option>
          <option value="today">Today</option>
        </select>
      </div>
      <div className="grid-responsive">
        {mockUsers.map((user, idx) => (
          <LeaderboardRow key={idx} {...user} rank={idx + 1} />
        ))}
      </div>
    </main>
  );
}
