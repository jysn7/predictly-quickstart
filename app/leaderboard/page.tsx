"use client";

import { useState } from "react";
import LeaderboardRow, { LeaderboardRowProps } from "../components/LeaderboardRow";
import { Trophy, TrendingUp, Target } from "lucide-react";

export default function Leaderboard() {
  const [timeFilter, setTimeFilter] = useState("all-time");
  const [visibleCount, setVisibleCount] = useState(12);

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

  const displayedUsers = mockUsers.slice(0, visibleCount);

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 12);
  };

  const topThree = mockUsers.slice(0, 3);

  return (
    <main className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Leaderboard</h1>
          <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Top predictors ranked by accuracy and performance
          </p>
        </div>
        <select 
          className="select-input" 
          style={{ width: '150px' }}
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value)}
        >
          <option value="all-time">All Time</option>
          <option value="this-week">This Week</option>
          <option value="today">Today</option>
        </select>
      </div>

      {/* Top 3 Podium */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '1rem', 
        marginBottom: '2rem',
        maxWidth: '900px',
        marginLeft: 'auto',
        marginRight: 'auto'
      }}>
        {/* 2nd Place */}
        <div className="card" style={{ 
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(192, 192, 192, 0.1) 0%, var(--surface) 100%)',
          border: '1px solid rgba(192, 192, 192, 0.3)',
          marginTop: '2rem'
        }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            margin: '0 auto 1rem', 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, #C0C0C0, #A8A8A8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: 'white'
          }}>
            2
          </div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>{topThree[1]?.username}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{topThree[1]?.tier}</p>
          <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#C0C0C0' }}>{topThree[1]?.score} pts</p>
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '1rem', fontSize: '0.85rem' }}>
            <span>{topThree[1]?.accuracy}% accuracy</span>
          </div>
        </div>

        {/* 1st Place */}
        <div className="card" style={{ 
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, var(--surface) 100%)',
          border: '2px solid rgba(255, 215, 0, 0.5)',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: '-15px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: '700',
            color: '#000',
            boxShadow: '0 4px 10px rgba(255, 215, 0, 0.3)'
          }}>
            <Trophy size={14} style={{ display: 'inline', marginRight: '4px' }} />
            CHAMPION
          </div>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            margin: '1rem auto 1rem', 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            fontWeight: 'bold',
            color: 'white',
            boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)'
          }}>
            1
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>{topThree[0]?.username}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '0.5rem' }}>{topThree[0]?.tier}</p>
          <p style={{ fontSize: '2rem', fontWeight: '700', color: '#FFD700' }}>{topThree[0]?.score} pts</p>
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '1rem', fontSize: '0.85rem' }}>
            <span>{topThree[0]?.accuracy}% accuracy</span>
          </div>
        </div>

        {/* 3rd Place */}
        <div className="card" style={{ 
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(205, 127, 50, 0.1) 0%, var(--surface) 100%)',
          border: '1px solid rgba(205, 127, 50, 0.3)',
          marginTop: '2rem'
        }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            margin: '0 auto 1rem', 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, #CD7F32, #8B4513)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: 'white'
          }}>
            3
          </div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>{topThree[2]?.username}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{topThree[2]?.tier}</p>
          <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#CD7F32' }}>{topThree[2]?.score} pts</p>
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '1rem', fontSize: '0.85rem' }}>
            <span>{topThree[2]?.accuracy}% accuracy</span>
          </div>
        </div>
      </div>

      {/* Full Rankings */}
      <div style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingUp size={20} /> Full Rankings
        </h2>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {displayedUsers.map((user, idx) => (
          <LeaderboardRow key={idx} {...user} rank={idx + 1} />
        ))}
      </div>

      {/* Load More Button */}
      {visibleCount < mockUsers.length && (
        <button
          onClick={handleLoadMore}
          style={{
            width: '100%',
            padding: '1rem',
            marginTop: '1rem',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            color: 'var(--text)',
            fontSize: '0.95rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--accent)';
            e.currentTarget.style.borderColor = 'var(--accent)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--surface)';
            e.currentTarget.style.borderColor = 'var(--border)';
          }}
        >
          Load More ({mockUsers.length - visibleCount} remaining)
        </button>
      )}
    </main>
  );
}
