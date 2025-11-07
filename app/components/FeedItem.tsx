import { useState } from "react";
import { callAiOrMock } from "../utils/demo";

interface FeedItemProps {
  user: string;
  match: string;
  winner: string;
  confidence: number;
}

export default function FeedItem({ user, match, winner, confidence }: FeedItemProps) {
  const [aiText, setAiText] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const explain = async () => {
    setLoadingAi(true);
    try {
      const data = await callAiOrMock({ prompt: `Explain this prediction:\nMatch: ${match}\nWinner: ${winner}\nConfidence: ${confidence}%`, max_tokens: 250 });
      setAiText(data.text || (data as any).error || 'No explanation');
    } catch (e) {
      setAiText('Error fetching explanation');
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="feed-item">
      <div className="feed-item-content">
        <div className="feed-item-user">
          <div className="user-avatar">{user[0]}</div>
          <div className="user-info">
            <div className="user-name">{user}</div>
            <div className="user-time">{new Date().toLocaleString()}</div>
          </div>
        </div>

        <div className="match-info">
          <div className="match-title">{match}</div>
          <div className="match-prediction">Predicted Winner: <span className="winner">{winner}</span></div>
        </div>
      </div>

      <div className="feed-item-stats">
        <div className={`confidence-score ${confidence >= 75 ? 'high' : 'medium'}`}>{confidence}%</div>
        <div className="confidence-label">Confidence</div>
        <button className="btn-secondary" onClick={explain}>{loadingAi ? 'Thinking…' : 'Explain'}</button>
      </div>

      {aiText && (
        <div className="card" style={{ marginTop: 12 }}>
          <div style={{ color: 'rgba(255,255,255,0.85)', marginBottom: 8, fontWeight: "600" }}>AI Explanation</div>
          <div style={{ color: 'rgba(255,255,255,0.8)', whiteSpace: 'pre-wrap' }}>{aiText}</div>
        </div>
      )}
    </div>
  );
}
