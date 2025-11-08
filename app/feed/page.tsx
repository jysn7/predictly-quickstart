"use client";
import { useState, useEffect } from "react";
import FeedItem from "../components/FeedItem";
import { getUpcomingMatches, formatMatchDate, getSports, type Match } from "../utils/sports";

export default function Feed() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedSport, setSelectedSport] = useState("All Sports");
  const [sports, setSports] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
        <select className="select-input" value={selectedSport} onChange={e => setSelectedSport(e.target.value)} style={{ width: '150px' }}>
          {sports.map(sport => (
            <option key={sport} value={sport}>{sport}</option>
          ))}
        </select>
      </div>

      <div className="feed-layout" style={{ display: 'flex', height: 'calc(100vh - 140px)', gap: '1.5rem' }}>
        {/* Main Feed - Scrollable */}
        <div className="feed-main hide-scrollbar" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', minWidth: 0 }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              Loading matches...
            </div>
          ) : filteredMatches.length > 0 ? (
            filteredMatches.map((match) => (
              <FeedItem
                key={match.id}
                user={match.league}
                match={`${match.homeTeam} vs ${match.awayTeam}`}
                winner={match.homeTeam}
                confidence={Math.floor(Math.random() * 30) + 60}
              />
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              No matches found
            </div>
          )}
        </div>

        {/* Sidebar - Fixed */}
        <aside className="feed-sidebar hide-scrollbar" style={{ width: '300px', overflowY: 'auto', maxHeight: 'calc(100vh - 140px)', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
