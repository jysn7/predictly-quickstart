"use client";
import { useState, useEffect } from "react";
import FeedItem from "../components/FeedItem";
import { getUpcomingMatches, formatMatchDate, getSports, type Match } from "../utils/sports";

export default function Feed() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedSport, setSelectedSport] = useState("All Sports");
  const [sports, setSports] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    const loadMatches = async () => {
      try {
        const allMatches = await getUpcomingMatches();
        setMatches(allMatches);
        setSports(['All Sports', ...getSports()]);
      } catch (error) {
        console.error('Failed to load matches:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMatches();
  }, []);

  const filteredMatches = selectedSport === 'All Sports' 
    ? matches 
    : matches.filter(m => m.sport === selectedSport);

  const displayedMatches = filteredMatches.slice(0, visibleCount);

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 12);
  };

  const feedItems = filteredMatches.map(match => ({
    user: match.league,
    match: `${match.homeTeam} vs ${match.awayTeam}`,
    winner: match.homeTeam,
    confidence: Math.floor(Math.random() * 30) + 60,
    date: formatMatchDate(match.date, match.time),
  }));

  return (
    <main className="page-container">
      <div className="page-header">
        <h1 className="page-title">Global Feed</h1>
      </div>

      <div className="feed-layout">
        {/* Main Feed - Scrollable */}
        <div className="feed-main hide-scrollbar">
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              Loading matches...
            </div>
          ) : filteredMatches.length > 0 ? (
            <>
              {displayedMatches.map((match) => (
                <FeedItem
                  key={match.id}
                  user={match.league}
                  match={`${match.homeTeam} vs ${match.awayTeam}`}
                  winner={match.homeTeam}
                  confidence={Math.floor(Math.random() * 30) + 60}
                />
              ))}
              
              {/* Load More Button */}
              {visibleCount < filteredMatches.length && (
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
                  Load More ({filteredMatches.length - visibleCount} remaining)
                </button>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              No matches found
            </div>
          )}
        </div>

        {/* Sidebar - Fixed on desktop, stacked on mobile */}
        <aside className="feed-sidebar hide-scrollbar">
          <div className="sidebar-card">
            <h3 className="sidebar-title">Filter by Sport</h3>
            <select 
              className="select-input" 
              value={selectedSport} 
              onChange={e => setSelectedSport(e.target.value)} 
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              {sports.map(sport => (
                <option key={sport} value={sport}>{sport}</option>
              ))}
            </select>
          </div>

          <div className="sidebar-card">
            <h3 className="sidebar-title">Trending Matches</h3>
            <ul className="sidebar-list">
              {filteredMatches.slice(0, 3).map((match) => (
                <li key={match.id}>{match.homeTeam} vs {match.awayTeam}</li>
              ))}
            </ul>
          </div>

          <div className="sidebar-card">
            <h3 className="sidebar-title">Available Sports</h3>
            <ul className="sidebar-list">
              {sports.filter(s => s !== 'All Sports').map((sport) => (
                <li key={sport}>{sport}</li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}
