interface PredictionCardProps {
  match: string;
  winner: string;
  confidence: number; // 0-100
}

export default function PredictionCard({ match, winner, confidence }: PredictionCardProps) {
  return (
    <div className="prediction-card">
      <h2 className="prediction-card-title">{match}</h2>
      <p className="prediction-card-info">
        Predicted Winner: <span className="prediction-winner">{winner}</span>
      </p>
      <div style={{ marginTop: 8 }}>
        <button className="btn-primary" style={{ marginRight: 8 }}>Save</button>
        <button className="btn-secondary">Share</button>
      </div>
      <p className="prediction-card-info">
        Confidence: <span className="prediction-confidence">{confidence}%</span>
      </p>
      <div className="confidence-bar-bg">
        <div className="confidence-bar" style={{ width: `${confidence}%` }}></div>
      </div>
    </div>
  );
}
