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
    <>
      <div className="feed-item">
        <div className="feed-item-content">
          <div className="feed-item-user">
            <div className="user-name">{user}</div>
            <div className="user-time">{new Date().toLocaleString()}</div>
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <div className="match-title">{match}</div>
            <div className="match-prediction">Predicted: <span style={{ color: 'var(--text)', fontWeight: '600' }}>{winner}</span></div>
          </div>
        </div>

        <div className="feed-item-stats">
          <div style={{ color: 'var(--accent)', fontSize: '1.5rem', fontWeight: '700' }}>{confidence}%</div>
          <div className="confidence-label">Confidence</div>
          <button className="btn-secondary" onClick={explain} style={{ marginTop: '0.75rem', width: '100%' }}>{loadingAi ? 'Thinking…' : 'Explain'}</button>
        </div>
      </div>

      {aiText && (
        <div className="card" style={{ marginTop: '1rem' }}>
          <div style={{ color: 'var(--text)', marginBottom: '0.75rem', fontWeight: '600' }}>AI Explanation</div>
          <div style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', fontSize: '0.95rem', lineHeight: '1.5' }}>{aiText}</div>
        </div>
      )}
    </>
  );
}
