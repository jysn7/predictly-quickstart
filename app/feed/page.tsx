"use client";
import FeedItem from "../components/FeedItem";

export default function Feed() {
  const mockFeed = [
    { user: "Alice", match: "Team A vs Team B", winner: "Team A", confidence: 78 },
    { user: "Bob", match: "Team C vs Team D", winner: "Team D", confidence: 65 },
    { user: "Charlie", match: "Lions vs Tigers", winner: "Tigers", confidence: 52 },
  ];

  return (
    <main className="page-container">
      <div className="page-header">
        <h1 className="page-title">Global Feed</h1>
        <div className="feed-controls">
          <input placeholder="Search matches or user" className="input-primary search-input" />
          <select className="input-primary select-input">
            <option>All Sports</option>
            <option>Football</option>
            <option>Basketball</option>
            <option>Cricket</option>
          </select>
        </div>
      </div>

      <div className="feed-layout">
        <div className="feed-main">
          {mockFeed.map((item, idx) => (
            <FeedItem key={idx} {...item} />
          ))}
        </div>

        <aside className="feed-sidebar">
          <div className="sidebar-card">
            <h3 className="sidebar-title">Trending Matches</h3>
            <ul className="sidebar-list">
              <li>Team A vs Team B</li>
              <li>Lions vs Tigers</li>
              <li>Team C vs Team D</li>
            </ul>
          </div>

          <div className="sidebar-card">
            <h3 className="sidebar-title">Top Predictors</h3>
            <ol className="sidebar-list ordered">
              <li>1. Alice</li>
              <li>2. Bob</li>
              <li>3. Charlie</li>
            </ol>
          </div>
        </aside>
      </div>
    </main>
  );
}
