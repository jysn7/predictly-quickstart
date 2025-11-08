"use client";

import { useState } from 'react';
import PlaceBetButton from './PlaceBetButton';

interface PredictionCardProps {
  match: string;
  winner: string;
  confidence: number; // 0-100
  id: string;
}

export default function PredictionCard({ match, winner, confidence, id }: PredictionCardProps) {
  const [betAmount, setBetAmount] = useState(0.1); // Default bet amount in ETH

  const handleBetSuccess = () => {
    // Handle successful bet placement
    console.log('Bet placed successfully!');
  };

  const handleBetError = (error: Error) => {
    // Handle bet placement error
    console.error('Failed to place bet:', error);
  };

  return (
    <div className="prediction-card">
      <h2 className="prediction-card-title">{match}</h2>
      <p className="prediction-card-info">
        Predicted Winner: <span className="prediction-winner">{winner}</span>
      </p>
      <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.75rem' }}>
        <button className="btn-primary">Save</button>
        <button className="btn-secondary">Share</button>
      </div>
      <p className="prediction-card-info" style={{ marginTop: '1rem' }}>
        Confidence: <span className="prediction-confidence">{confidence}%</span>
      </p>
      <div className="confidence-bar-bg">
        <div className="confidence-bar" style={{ width: `${confidence}%` }}></div>
      </div>
      
      <div className="bet-section">
        <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', fontWeight: '600', color: 'var(--text)' }}>Place a Bet</h3>
        <div className="bet-input">
          <label htmlFor="betAmount" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '500' }}>
            Bet Amount (ETH)
          </label>
          <input
            id="betAmount"
            type="number"
            min="0.01"
            step="0.01"
            value={betAmount}
            onChange={(e) => setBetAmount(Number(e.target.value))}
            className="input-primary"
            style={{ width: '100%' }}
          />
        </div>
        
        <PlaceBetButton
          predictionId={id}
          amount={betAmount}
          onSuccess={handleBetSuccess}
          onError={handleBetError}
        />
      </div>
    </div>
  );
}
