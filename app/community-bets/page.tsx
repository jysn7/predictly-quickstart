'use client';

import { useState, useEffect } from 'react';
import BetCard from '../components/BetCard';

export default function CommunityBets() {
  const [bets, setBets] = useState<any[]>([]);
  const [filteredBets, setFilteredBets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState('All Sports');
  const [sports, setSports] = useState<string[]>(['All Sports']);
  const [sortBy, setSortBy] = useState('recent'); // 'recent' or 'trending'
  const [searchQuery, setSearchQuery] = useState('');

  // Get userId from wallet address or generate one
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    // Try to get wallet address first, fallback to generated ID
    const walletAddress = localStorage.getItem('base_account_address');
    const storedUserId = walletAddress || localStorage.getItem('userId');
    
    if (!storedUserId) {
      const newUserId = "user_" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('userId', newUserId);
      setUserId(newUserId);
    } else {
      setUserId(storedUserId);
    }

    loadBets();
    
    // Auto-refresh bets every 10 seconds
    const interval = setInterval(loadBets, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterAndSortBets();
  }, [bets, selectedSport, sortBy, searchQuery]);

  const loadBets = async () => {
    try {
      const response = await fetch('/api/bets?limit=100');
      const data = await response.json();
      if (data.success) {
        setBets(data.bets);
        // Extract unique sports
        const uniqueSports = new Set(data.bets.map((b: any) => b.sport));
        setSports(['All Sports', ...(Array.from(uniqueSports) as string[]).sort()]);
      }
    } catch (error) {
      console.error('Error loading bets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    loadBets();
  };

  const filterAndSortBets = () => {
    let filtered = bets;

    // Filter by sport
    if (selectedSport !== 'All Sports') {
      filtered = filtered.filter(b => b.sport === selectedSport);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(b =>
        b.homeTeam.toLowerCase().includes(query) ||
        b.awayTeam.toLowerCase().includes(query) ||
        b.username.toLowerCase().includes(query)
      );
    }

    // Sort
    if (sortBy === 'trending') {
      filtered = filtered.sort((a: any, b: any) => b.likes - a.likes);
    } else {
      filtered = filtered.sort((a: any, b: any) => b.timestamp - a.timestamp);
    }

    setFilteredBets(filtered);
  };

  const handleLike = async (betId: string) => {
    try {
      const bet = bets.find(b => b.id === betId);
      const isLiked = bet?.likedBy.includes(userId);
      
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
        const updatedBets = bets.map(b =>
          b.id === betId ? data.bet : b
        );
        setBets(updatedBets);
      }
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  const handleShare = (bet: any) => {
    const shareUrl = `${window.location.origin}/community-bets?shareToken=${bet.shareToken}`;
    navigator.clipboard.writeText(shareUrl);
    alert('Prediction link copied to clipboard!');
  };

  const stats = {
    totalBets: bets.length,
    avgConfidence: bets.length > 0 
      ? Math.round(bets.reduce((sum: number, b: any) => sum + b.confidence, 0) / bets.length)
      : 0,
    topPredictors: bets
      .reduce((acc: any, b: any) => {
        const existing = acc.find((a: any) => a.username === b.username);
        if (existing) {
          existing.count += 1;
        } else {
          acc.push({ username: b.username, count: 1 });
        }
        return acc;
      }, [])
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 5),
  };

  return (
    <main className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Community Predictions</h1>
          <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Explore predictions from other users. Like predictions and see how they perform!
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          style={{
            padding: '0.75rem 1.25rem',
            backgroundColor: isLoading ? 'var(--border)' : 'var(--accent)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontWeight: '600',
            fontSize: '0.9rem',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          {isLoading ? '↻ Loading...' : '↻ Refresh'}
        </button>
      </div>

      <div className="predict-layout" style={{ display: 'flex', height: 'calc(100vh - 120px)', gap: '1.5rem' }}>
        <section className="predict-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Filters */}
          <div className="predict-form card" style={{ flexShrink: 0 }}>
            <div className="predict-form-inputs">
              <input
                className="input-primary"
                placeholder="Search teams or users..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <select
                className="select-input"
                value={selectedSport}
                onChange={e => setSelectedSport(e.target.value)}
                style={{ width: '150px' }}
              >
                {sports.map(sport => (
                  <option key={sport} value={sport}>{sport}</option>
                ))}
              </select>
              <select
                className="select-input"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                style={{ width: '130px' }}
              >
                <option value="recent">Recent</option>
                <option value="trending">Trending</option>
              </select>
            </div>
          </div>

          {/* Bets List */}
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              Loading community predictions...
            </div>
          ) : filteredBets.length > 0 ? (
            <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', gap: '1rem' }} className="hide-scrollbar">
              {filteredBets.map(bet => (
                <BetCard
                  key={bet.id}
                  bet={bet}
                  currentUserId={userId}
                  onLike={handleLike}
                  onShare={handleShare}
                />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              <p style={{ fontSize: '1rem', marginBottom: '1rem' }}>
                {bets.length === 0 ? 'No community predictions yet.' : 'No predictions match your search.'}
              </p>
              <p style={{ fontSize: '0.9rem' }}>
                {bets.length === 0 
                  ? 'Create a prediction on the Predict page to get started!'
                  : 'Try adjusting your filters or search terms.'}
              </p>
            </div>
          )}
        </section>

        <aside className="predict-sidebar hide-scrollbar" style={{ width: '300px', overflowY: 'auto', maxHeight: 'calc(100vh - 120px)', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h3 className="sidebar-title">📊 Community Stats</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <div>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                  Total Predictions
                </p>
                <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: 'var(--accent)' }}>
                  {stats.totalBets}
                </p>
              </div>
              <div>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                  Avg Confidence
                </p>
                <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: 'var(--accent)' }}>
                  {stats.avgConfidence}%
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="sidebar-title">👥 Top Predictors</h3>
            {stats.topPredictors.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {stats.topPredictors.map((predictor: any, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.9rem',
                      padding: '0.75rem',
                      backgroundColor: 'var(--surface)',
                      borderRadius: '6px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ color: 'var(--accent)', fontWeight: '700' }}>#{idx + 1}</span>
                      <span style={{ color: 'var(--text)' }}>{predictor.username}</span>
                    </div>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {predictor.count} prediction{predictor.count !== 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                No predictions yet
              </p>
            )}
          </div>

          <div className="card">
            <h3 className="sidebar-title">💡 About</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0, lineHeight: '1.6' }}>
              Like predictions you find compelling. The community leaderboard shows the most active predictors. Share your own predictions and compete with other users!
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
