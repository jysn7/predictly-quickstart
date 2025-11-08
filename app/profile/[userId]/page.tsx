"use client";

export default function Profile({ params }: any) {
  const userId = params.userId;

  const mockRecent = [
    { match: 'Team A vs Team B', result: 'Win', confidence: 78 },
    { match: 'Lions vs Tigers', result: 'Loss', confidence: 52 },
  ];

  return (
    <main className="page-container">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">{userId}</h1>
          <div style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>@{userId.toLowerCase()} • Predictor</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button className="btn-primary">Follow</button>
          <div style={{ color: 'var(--text-secondary)' }}>Followers <strong style={{ color: 'var(--text)' }}>98</strong></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }} className="profile-grid">
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.5rem' }}>Stats</h3>
            <div className="grid-responsive">
              <div className="card" style={{ backgroundColor: 'var(--bg)' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text)', marginBottom: '0.5rem' }}>42</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Predictions</div>
              </div>
              <div className="card" style={{ backgroundColor: 'var(--bg)' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text)', marginBottom: '0.5rem' }}>78%</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Accuracy</div>
              </div>
              <div className="card" style={{ backgroundColor: 'var(--bg)' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text)', marginBottom: '0.5rem' }}>7</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Win Streak</div>
              </div>
              <div className="card" style={{ backgroundColor: 'var(--bg)' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text)', marginBottom: '0.5rem' }}>Diamond</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Tier</div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.5rem' }}>Recent Predictions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {mockRecent.map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ color: 'var(--text)' }}>{r.match}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>{r.confidence}% • {r.result}</div>
                  </div>
                  <div style={{ fontWeight: '600', color: r.result === 'Win' ? '#22c55e' : '#ef4444' }}>{r.result}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>About</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>Early adopter and competitive predictor. Loves sports analytics and building ML models.</p>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Mutuals</h3>
            <ul style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', listStyle: 'none' }}>
              <li style={{ marginBottom: '0.5rem' }}>Alice</li>
              <li style={{ marginBottom: '0.5rem' }}>Bob</li>
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}
