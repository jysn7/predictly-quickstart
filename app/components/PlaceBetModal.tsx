'use client';

import { useState } from 'react';
import { Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface PlaceBetModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: {
    id: string;
    homeTeam: string;
    awayTeam: string;
    sport: string;
    league: string;
    date: string;
    time: string;
  };
  userBalance: number;
  onPlaceBet: (betData: BetData) => Promise<void>;
}

export interface BetData {
  matchId: string;
  betType: 'for' | 'against';
  amount: string;
  predictedHomeScore: string;
  predictedAwayScore: string;
  prediction: string;
}

export default function PlaceBetModal({
  isOpen,
  onClose,
  match,
  userBalance,
  onPlaceBet,
}: PlaceBetModalProps) {
  const [betType, setBetType] = useState<'for' | 'against'>('for');
  const [amount, setAmount] = useState('');
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    const betAmount = parseFloat(amount);
    if (!amount || betAmount <= 0) {
      setError('Please enter a valid bet amount');
      return;
    }

    if (betAmount > userBalance) {
      setError('Insufficient balance');
      return;
    }

    if (betAmount < 1) {
      setError('Minimum bet is 1 PDC');
      return;
    }

    if (!homeScore || !awayScore) {
      setError('Please enter score predictions for both teams');
      return;
    }

    const home = parseInt(homeScore);
    const away = parseInt(awayScore);

    if (isNaN(home) || isNaN(away) || home < 0 || away < 0) {
      setError('Please enter valid scores (0 or higher)');
      return;
    }

    // Determine prediction based on scores and bet type
    let prediction = '';
    if (home > away) {
      prediction = betType === 'for' ? 'Home Win' : 'Away Win';
    } else if (away > home) {
      prediction = betType === 'for' ? 'Away Win' : 'Home Win';
    } else {
      prediction = 'Draw';
    }

    try {
      setIsProcessing(true);
      await onPlaceBet({
        matchId: match.id,
        betType,
        amount,
        predictedHomeScore: homeScore,
        predictedAwayScore: awayScore,
        prediction: `${prediction} (${homeScore}-${awayScore})`,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place bet');
    } finally {
      setIsProcessing(false);
    }
  };

  const potentialWinnings = amount ? (parseFloat(amount) * 1.95).toFixed(2) : '0.00'; // 95% payout (5% fee)
  const fee = amount ? (parseFloat(amount) * 0.05).toFixed(2) : '0.00';

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--surface)',
          borderRadius: '12px',
          padding: '2rem',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          border: '1px solid var(--border)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', color: 'var(--text)' }}>
            Place Your Bet
          </h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {match.homeTeam} vs {match.awayTeam}
          </p>
          <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {match.league} • {match.date} {match.time}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Balance Display */}
          <div
            style={{
              padding: '1rem',
              backgroundColor: 'rgba(124, 58, 237, 0.1)',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              border: '1px solid rgba(124, 58, 237, 0.3)',
            }}
          >
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
              Your Balance
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--accent)' }}>
              {userBalance.toFixed(2)} PDC
            </div>
          </div>

          {/* Bet Type Selection */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '600', color: 'var(--text)' }}>
              Bet Type
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setBetType('for')}
                style={{
                  padding: '1rem',
                  backgroundColor: betType === 'for' ? 'var(--accent)' : 'transparent',
                  border: `2px solid ${betType === 'for' ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: '8px',
                  color: betType === 'for' ? 'white' : 'var(--text)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s',
                }}
              >
                <TrendingUp size={24} />
                <span>Bet FOR</span>
                <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Your prediction wins</span>
              </button>
              <button
                type="button"
                onClick={() => setBetType('against')}
                style={{
                  padding: '1rem',
                  backgroundColor: betType === 'against' ? '#ef4444' : 'transparent',
                  border: `2px solid ${betType === 'against' ? '#ef4444' : 'var(--border)'}`,
                  borderRadius: '8px',
                  color: betType === 'against' ? 'white' : 'var(--text)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s',
                }}
              >
                <TrendingDown size={24} />
                <span>Bet AGAINST</span>
                <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Opposite wins</span>
              </button>
            </div>
          </div>

          {/* Score Prediction */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '600', color: 'var(--text)' }}>
              Predict Final Score
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {match.homeTeam}
                </label>
                <input
                  type="number"
                  min="0"
                  value={homeScore}
                  onChange={(e) => setHomeScore(e.target.value)}
                  placeholder="0"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    color: 'var(--text)',
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    textAlign: 'center',
                  }}
                  required
                />
              </div>
              <Minus size={20} style={{ color: 'var(--text-secondary)', marginTop: '1.5rem' }} />
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {match.awayTeam}
                </label>
                <input
                  type="number"
                  min="0"
                  value={awayScore}
                  onChange={(e) => setAwayScore(e.target.value)}
                  placeholder="0"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    color: 'var(--text)',
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    textAlign: 'center',
                  }}
                  required
                />
              </div>
            </div>
          </div>

          {/* Bet Amount */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '600', color: 'var(--text)' }}>
              Bet Amount (PDC)
            </label>
            <input
              type="number"
              min="1"
              step="0.01"
              max={userBalance}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                color: 'var(--text)',
                fontSize: '1rem',
              }}
              required
            />
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              {[10, 25, 50, 100].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(Math.min(preset, userBalance).toString())}
                  disabled={userBalance < preset}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    backgroundColor: 'transparent',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    color: userBalance < preset ? 'var(--text-secondary)' : 'var(--accent)',
                    fontSize: '0.85rem',
                    cursor: userBalance < preset ? 'not-allowed' : 'pointer',
                    opacity: userBalance < preset ? 0.5 : 1,
                  }}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Potential Winnings */}
          {amount && parseFloat(amount) > 0 && (
            <div
              style={{
                padding: '1rem',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                borderRadius: '8px',
                marginBottom: '1.5rem',
                border: '1px solid rgba(34, 197, 94, 0.3)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Bet Amount:</span>
                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text)' }}>{amount} PDC</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>System Fee (5%):</span>
                <span style={{ fontSize: '0.85rem', color: '#ef4444' }}>-{fee} PDC</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid rgba(34, 197, 94, 0.3)' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text)' }}>Potential Win:</span>
                <span style={{ fontSize: '1.1rem', fontWeight: '700', color: '#22c55e' }}>+{potentialWinnings} PDC</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div
              style={{
                padding: '0.75rem',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '6px',
                color: '#ef4444',
                fontSize: '0.85rem',
                marginBottom: '1rem',
              }}
            >
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              style={{
                flex: 1,
                padding: '0.875rem',
                backgroundColor: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                color: 'var(--text)',
                fontWeight: '600',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                opacity: isProcessing ? 0.5 : 1,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              style={{
                flex: 1,
                padding: '0.875rem',
                backgroundColor: isProcessing ? 'var(--border)' : 'var(--accent)',
                border: 'none',
                borderRadius: '6px',
                color: 'white',
                fontWeight: '600',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              {isProcessing ? (
                <>
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Placing Bet...</span>
                </>
              ) : (
                'Place Bet'
              )}
            </button>
          </div>
        </form>

        {/* Info */}
        <div
          style={{
            marginTop: '1rem',
            padding: '0.75rem',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '6px',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            lineHeight: '1.5',
          }}
        >
          ℹ️ You win if your exact score prediction is correct. 5% of winnings go to the platform. Bet amount is deducted immediately.
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
