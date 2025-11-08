"use client";
import { useState, useEffect } from "react";
import BetCard from "../components/BetCard";

export default function Dashboard() {
  const [savedBets, setSavedBets] = useState<any[]>([]);
  const [filteredBets, setFilteredBets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState('All Sports');
  const [sports, setSports] = useState<string[]>(['All Sports']);
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'confidence', 'likes'
  const [userId, setUserId] = useState<string>("user_" + Math.random().toString(36).substr(2, 9));

  useEffect(() => {
    // Load from API and localStorage
    loadSavedBets();
  }, []);

  useEffect(() => {
    filterAndSortBets();
  }, [savedBets, selectedSport, sortBy]);

  const loadSavedBets = async () => {
    setIsLoading(true);
    try {
      // Try to fetch from API first
      const response = await fetch(`/api/bets?userId=${userId}`);
      const data = await response.json();
      
      if (data.success && data.bets.length > 0) {
        setSavedBets(data.bets);
        // Extract unique sports
        const uniqueSports = new Set(data.bets.map((b: any) => b.sport));
        setSports(['All Sports', ...(Array.from(uniqueSports) as string[]).sort()]);
      } else {
        // Fall back to localStorage
        const stored = localStorage.getItem('savedBets');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setSavedBets(parsed);
            const uniqueSports = new Set(parsed.map((b: any) => b.sport));
            setSports(['All Sports', ...(Array.from(uniqueSports) as string[]).sort()]);
          } catch (e) {
            console.error('Error parsing stored bets:', e);
          }
        }
      }
    } catch (error) {
      console.error('Error loading saved bets:', error);
      // Fall back to localStorage
      const stored = localStorage.getItem('savedBets');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setSavedBets(parsed);
        } catch (e) {
          console.error('Error parsing stored bets:', e);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortBets = () => {
    let filtered = savedBets;

    // Filter by sport
    if (selectedSport !== 'All Sports') {
      filtered = filtered.filter(b => b.sport === selectedSport);
    }

    // Sort
    if (sortBy === 'confidence') {
      filtered = filtered.sort((a: any, b: any) => b.confidence - a.confidence);
    } else if (sortBy === 'likes') {
      filtered = filtered.sort((a: any, b: any) => b.likes - a.likes);
    } else {
      filtered = filtered.sort((a: any, b: any) => b.timestamp - a.timestamp);
    }

    setFilteredBets(filtered);
  };

  const handleLike = async (betId: string) => {
    try {
      const bet = savedBets.find(b => b.id === betId);
      const isLiked = bet?.likedBy?.includes(userId);
      
      const response = await fetch('/api/bets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          betId,
          action: isLiked ? 'unlike' : 'like',
          userId,
        }),
      });

      const data = await response.json();
      if (data.success) {
        const updatedBets = savedBets.map(b =>
          b.id === betId ? data.bet : b
        );
        setSavedBets(updatedBets);
      }
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  const handleShare = (bet: any) => {
    const shareUrl = `${window.location.origin}/shared-prediction?token=${bet.shareToken}`;
    navigator.clipboard.writeText(shareUrl);
    alert('Prediction link copied to clipboard!');
  };

  const handleDeleteBet = async (betId: string) => {
    if (!confirm('Are you sure you want to delete this prediction?')) return;

    try {
      const response = await fetch('/api/bets', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ betId, userId }),
      });

      const data = await response.json();
      if (data.success) {
        setSavedBets(savedBets.filter(b => b.id !== betId));
      }
    } catch (error) {
      console.error('Error deleting bet:', error);
    }
  };

  const stats = {
    totalPredictions: savedBets.length,
    avgConfidence: savedBets.length > 0
      ? Math.round(savedBets.reduce((sum: number, b: any) => sum + b.confidence, 0) / savedBets.length)
      : 0,
    totalLikes: savedBets.reduce((sum: number, b: any) => sum + (b.likes || 0), 0),
    highestConfidence: savedBets.length > 0 ? Math.max(...savedBets.map(b => b.confidence)) : 0,
  };

  return (
    <main className="page-container">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">My Profile & Predictions</h1>
        <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Track all your saved predictions and statistics
        </p>
      </div>

      {/* Statistics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card">
          <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Total Predictions
          </p>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: '700', color: 'var(--accent)' }}>
            {stats.totalPredictions}
          </p>
        </div>
        <div className="card">
          <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Avg Confidence
          </p>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: '700', color: 'var(--accent)' }}>
            {stats.avgConfidence}%
          </p>
        </div>
        <div className="card">
          <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Total Likes
          </p>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: '700', color: 'var(--accent)' }}>
            {stats.totalLikes}
          </p>
        </div>
        <div className="card">
          <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Best Confidence
          </p>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: '700', color: 'var(--accent)' }}>
            {stats.highestConfidence}%
          </p>
        </div>
      </div>

      {/* Predictions List */}
      <div className="predict-layout">
        <section className="predict-main">
          {/* Filters */}
          <div className="predict-form card" style={{ marginBottom: '1rem' }}>
            <div className="predict-form-inputs">
              <select
                className="select-input"
                value={selectedSport}
                onChange={e => setSelectedSport(e.target.value)}
                style={{ flex: 1, maxWidth: '150px' }}
              >
                {sports.map(sport => (
                  <option key={sport} value={sport}>{sport}</option>
                ))}
              </select>
              <select
                className="select-input"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                style={{ flex: 1, maxWidth: '130px' }}
              >
                <option value="recent">Recent</option>
                <option value="confidence">Highest Confidence</option>
                <option value="likes">Most Liked</option>
              </select>
            </div>
          </div>

          {/* Saved Predictions */}
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              Loading your predictions...
            </div>
          ) : filteredBets.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredBets.map((bet, idx) => (
                <div key={bet.id || idx} style={{ position: 'relative' }}>
                  <BetCard
                    bet={bet}
                    currentUserId={userId}
                    onLike={handleLike}
                    onShare={handleShare}
                  />
                  <button
                    onClick={() => handleDeleteBet(bet.id)}
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: '#ff4444',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      opacity: 0.7,
                      transition: 'opacity 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'var(--surface)', borderRadius: '12px' }}>
              <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                No predictions yet.
              </p>
              <a
                href="/predict"
                style={{
                  display: 'inline-block',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'var(--accent)',
                  color: 'var(--bg)',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                }}
              >
                Create Your First Prediction →
              </a>
            </div>
          )}
        </section>

        <aside className="predict-sidebar">
          <div className="card">
            <h3 className="sidebar-title">📈 Performance</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <div>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  Win Rate
                </p>
                <p style={{ margin: 0, fontSize: '1.3rem', fontWeight: '700', color: 'var(--accent)' }}>
                  Pending
                </p>
              </div>
              <div>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  Community Rating
                </p>
                <p style={{ margin: 0, fontSize: '1.3rem', fontWeight: '700', color: 'var(--accent)' }}>
                  ⭐ {(stats.totalLikes / Math.max(stats.totalPredictions, 1)).toFixed(1)}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="sidebar-title">💡 Tips</h3>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              <li>Higher confidence predictions get more attention</li>
              <li>Share your best predictions with the community</li>
              <li>Track your accuracy over time</li>
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}
