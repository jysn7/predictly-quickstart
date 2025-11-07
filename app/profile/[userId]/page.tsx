"use client";

export default function Profile({ params }: any) {
  const userId = params.userId;

  const mockRecent = [
    { match: 'Team A vs Team B', result: 'Win', confidence: 78 },
    { match: 'Lions vs Tigers', result: 'Loss', confidence: 52 },
  ];

  return (
    <main className="page-container">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purpleNeon to-white bg-clip-text text-transparent">{userId}</h1>
          <div className="text-white/70">@{userId.toLowerCase()} • Predictor</div>
        </div>

        <div className="flex items-center gap-4">
          <button className="px-6 py-3 bg-gradient-to-r from-purpleNeon to-[#B066FF] text-white font-bold rounded-xl whitespace-nowrap hover:opacity-90 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purpleNeon/50">Follow</button>
          <div className="text-white/70">Followers <strong className="text-white">98</strong></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 flex flex-col gap-4">
          <div className="card">
            <h3 className="text-lg font-bold mb-3">Stats</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">42</div>
                <div className="stat-label">Predictions</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">78%</div>
                <div className="stat-label">Accuracy</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">7</div>
                <div className="stat-label">Win Streak</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">Diamond</div>
                <div className="stat-label">Tier</div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-bold mb-3">Recent Predictions</h3>
            <div className="flex flex-col gap-3">
              {mockRecent.map((r, i) => (
                <div key={i} className="prediction-item">
                  <div>
                    <div className="text-white/90">{r.match}</div>
                    <div className="text-white/70 text-sm">{r.confidence}% • {r.result}</div>
                  </div>
                  <div className={`font-bold ${r.result === 'Win' ? 'text-green-400' : 'text-red-400'}`}>{r.result}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="flex flex-col gap-4">
          <div className="p-6 rounded-2xl bg-purpleDark/20 border border-purpleNeon/10">
            <h3 className="text-lg font-bold mb-3">About</h3>
            <p className="text-white/70 text-sm">Early adopter and competitive predictor. Loves sports analytics and building ML models.</p>
          </div>

          <div className="p-6 rounded-2xl bg-purpleDark/20 border border-purpleNeon/10">
            <h3 className="text-lg font-bold mb-3">Mutuals</h3>
            <ul className="text-white/70 text-sm list-disc pl-5">
              <li>Alice</li>
              <li>Bob</li>
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}
