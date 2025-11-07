"use client";
import { useState } from "react";
import PredictionCard from "../components/PredictionCard";
import { buildSuggestionPrompt } from "../utils/ai";
import { callAiOrMock } from "../utils/demo";

export default function Predict() {
  const [homeTeam, setHomeTeam] = useState("");
  const [awayTeam, setAwayTeam] = useState("");
  const [sport, setSport] = useState("Football");
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const mockHistory = [
    { match: "Team A vs Team B", winner: "Team A", confidence: 78 },
    { match: "Lions vs Tigers", winner: "Tigers", confidence: 52 },
  ];

  const handlePredict = async () => {
    if (!homeTeam || !awayTeam) return;
    setIsLoading(true);
    try {
      // call local AI-powered suggestion if OpenAI key is present
      const prompt = buildSuggestionPrompt(homeTeam, awayTeam, sport);
      const data = await callAiOrMock({ prompt, max_tokens: 150 });
      // crude parsing: try to extract winner and confidence from returned text
      const text = (data.text || '');
      const winnerMatch = text.match(/winner:\s*(\w[\w\s&.-]+)/i);
      const confidenceMatch = text.match(/(\d{1,3})%/);
      const winner = winnerMatch ? winnerMatch[1].trim() : 'N/A';
      const confidence = confidenceMatch ? parseInt(confidenceMatch[1], 10) : 50;
      setResult({ winner, confidence });
    } catch (err) {
      setResult({ winner: "N/A", confidence: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  const quickFill = (pair: string) => {
    const [home, away] = pair.split(" vs ");
    setHomeTeam(home.trim());
    setAwayTeam(away.trim());
  };

  return (
    <main className="page-container">
      <div className="page-header">
        <h1 className="page-title">Predict a Match</h1>
        <div className="sport-label">Sport: <strong>{sport}</strong></div>
      </div>

      <div className="predict-layout">
        <section className="predict-main">
          <div className="predict-form card">
            <div className="predict-form-inputs">
              <input 
                className="input-primary" 
                placeholder="Home Team" 
                value={homeTeam} 
                onChange={e => setHomeTeam(e.target.value)} 
              />
              <input 
                className="input-primary" 
                placeholder="Away Team" 
                value={awayTeam} 
                onChange={e => setAwayTeam(e.target.value)} 
              />
              <select 
                className="input-primary select-input" 
                value={sport} 
                onChange={e => setSport(e.target.value)}
              >
                <option>Football</option>
                <option>Basketball</option>
                <option>Cricket</option>
                <option>Tennis</option>
              </select>
              <button 
                onClick={handlePredict} 
                className="btn-primary"
                disabled={isLoading || !homeTeam || !awayTeam}
              >
                {isLoading ? 'Predicting...' : 'Predict'}
              </button>
            </div>
          </div>

          {result && (
            <PredictionCard 
              match={`${homeTeam} vs ${awayTeam}`} 
              winner={result.winner} 
              confidence={result.confidence} 
            />
          )}
        </section>

        <aside className="predict-sidebar">
          <div className="quick-picks card">
            <h3 className="sidebar-title">Quick Picks</h3>
            <div className="quick-picks-list">
              <button 
                className="btn-secondary text-left" 
                onClick={() => quickFill('Team A vs Team B')}
              >
                Team A vs Team B
              </button>
              <button 
                className="btn-secondary text-left" 
                onClick={() => quickFill('Lions vs Tigers')}
              >
                Lions vs Tigers
              </button>
            </div>
          </div>

          <div className="recent-predictions card">
            <h3 className="sidebar-title">Recent Predictions</h3>
            <div className="predictions-list">
              {mockHistory.map((h, i) => (
                <div key={i} className="prediction-item">
                  <div className="prediction-info">
                    <div className="prediction-match">{h.match}</div>
                    <div className="prediction-details">{h.winner} • {h.confidence}%</div>
                  </div>
                  <div className="prediction-confidence">{h.confidence}%</div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
