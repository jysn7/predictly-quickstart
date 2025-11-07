"use client";

import { useState } from "react";
import Link from "next/link";

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile menu toggle */}
      <button
        className="sidebar-toggle"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
      >
        &#9776;
      </button>

      {/* Main sidebar */}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        {/* Logo & Brand */}
        <div className="brand">
          <div style={{width:36,height:36,background:'var(--accent)',borderRadius:8}} />
          <div>
            <div style={{fontWeight:"700"}}>Predictly</div>
            <div style={{fontSize:12,color:'var(--muted)'}}>Predict & share</div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="nav">
          <Link href="/" className="nav-link" onClick={() => setOpen(false)}>Home</Link>
          <Link href="/feed" className="nav-link" onClick={() => setOpen(false)}>Feed</Link>
          <Link href="/predict" className="nav-link" onClick={() => setOpen(false)}>Predict</Link>
          <Link href="/leaderboard" className="nav-link" onClick={() => setOpen(false)}>Leaderboard</Link>
          <Link href="/dashboard" className="nav-link" onClick={() => setOpen(false)}>Dashboard</Link>
          <Link href="/settings" className="nav-link" onClick={() => setOpen(false)}>Settings</Link>
        </nav>

        {/* Connect Button */}
        <div style={{marginTop:'auto',padding:'0.5rem 0'}}>
          <button 
            className="btn-primary" 
            onClick={() => alert('Authentication coming soon!')}
            style={{width:'100%'}}
          >
            Connect Wallet
          </button>
        </div>

        {/* Mobile close button */}
        <button
          className="close-btn"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          style={{display: open ? 'block' : 'none'}}
        >
          ✕
        </button>
      </aside>
    </>
  );
}
