/**
 * CounterBetButton Component
 * 
 * Button to place counter-bet against an existing community bet
 * 
 * Props:
 * - communityBetId: string - ID of the original bet
 * - originalAmount: string - Original bet amount
 * - originalPosition: 'for' | 'against' - Original position
 * - originalPrediction: string - Original prediction
 * - matchInfo?: { homeTeam, awayTeam } - Match details
 * - onSuccess?: (result) => void - Success callback
 */

'use client';

import { useState } from 'react';
import { useBetting } from '../hooks/useBetting';
import { useWallet } from '../hooks/useWallet';
import { formatCoinAmount, validateBetAmount } from '../utils/coinSystem';

interface CounterBetButtonProps {
  communityBetId: string;
  originalAmount: string;
  originalPosition: 'for' | 'against';
  originalPrediction: string;
  matchInfo?: {
    homeTeam: string;
    awayTeam: string;
  };
  onSuccess?: (result: any) => void;
}

export default function CounterBetButton({
  communityBetId,
  originalAmount,
  originalPosition,
  originalPrediction,
  matchInfo,
  onSuccess,
}: CounterBetButtonProps) {
  const { address, balance, connect, isConnected } = useWallet();
  const { joinBet, isPlacingBet, error: bettingError } = useBetting();
  
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState(originalAmount);
  const [showSuccess, setShowSuccess] = useState(false);

  const oppositePosition = originalPosition === 'for' ? 'against' : 'for';
  const validation = validateBetAmount(amount, balance);

  const handleCounterBet = async () => {
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    try {
      const result = await joinBet({
        communityBetId,
        amount,
        position: oppositePosition,
      });

      if (result.success) {
        setShowSuccess(true);
        
        if (onSuccess) {
          onSuccess(result);
        }

        // Auto-close and reload after 2 seconds
        setTimeout(() => {
          setShowModal(false);
          setShowSuccess(false);
          window.location.reload(); // Refresh to show updated bet
        }, 2000);
      }
    } catch (err) {
      console.error('Error placing counter-bet:', err);
    }
  };

  if (!isConnected) {
    return (
      <button
        onClick={connect}
        style={{
          padding: '0.75rem 1.5rem',
          background: 'var(--accent)',
          border: 'none',
          borderRadius: 8,
          color: 'white',
          fontWeight: 600,
          cursor: 'pointer',
          fontSize: 14,
        }}
      >
        Connect to Counter-Bet
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        style={{
          padding: '0.75rem 1.5rem',
          background: '#ef4444',
          border: 'none',
          borderRadius: 8,
          color: 'white',
          fontWeight: 600,
          cursor: 'pointer',
          fontSize: 14,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <span>👎</span>
        <span>Bet Against This</span>
      </button>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 450 }}>
            {showSuccess ? (
              // Success state
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: 64, marginBottom: '1rem' }}>✅</div>
                <h2 style={{ color: 'var(--accent)', marginBottom: '0.5rem' }}>Counter-Bet Placed!</h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Your bet has been recorded on the blockchain.
                </p>
                <p style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontSize: 14 }}>
                  Refreshing page...
                </p>
              </div>
            ) : (
              // Form state
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ margin: 0 }}>Counter-Bet</h2>
                  <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--text-secondary)' }}>×</button>
                </div>

                {matchInfo && (
                  <div style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 8 }}>
                    <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)' }}>Match</p>
                    <p style={{ margin: '0.25rem 0 0', fontWeight: 600 }}>
                      {matchInfo.homeTeam} vs {matchInfo.awayTeam}
                    </p>
                  </div>
                )}

                <div style={{ 
                  marginBottom: '1.5rem', 
                  padding: '1rem', 
                  background: 'rgba(239, 68, 68, 0.1)', 
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: 8 
                }}>
                  <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)' }}>Original Prediction</p>
                  <p style={{ margin: '0.25rem 0 0.75rem', fontWeight: 600, fontSize: 16 }}>
                    {originalPosition === 'for' ? '👍' : '👎'} {originalPrediction}
                  </p>
                  <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)' }}>Your Position</p>
                  <p style={{ margin: '0.25rem 0 0', fontWeight: 600, fontSize: 16, color: '#ef4444' }}>
                    👎 Bet Against ({oppositePosition})
                  </p>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                    Your Stake (PDC)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="1"
                    step="1"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: 8,
                      border: `1px solid ${!validation.valid ? '#ef4444' : 'var(--border-color)'}`,
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      fontSize: 16,
                    }}
                  />
                  {!validation.valid && validation.error && (
                    <p style={{ margin: '0.25rem 0 0', color: '#ef4444', fontSize: 12 }}>
                      {validation.error}
                    </p>
                  )}
                  <p style={{ margin: '0.5rem 0 0', color: 'var(--text-secondary)', fontSize: 12 }}>
                    Your balance: {formatCoinAmount(balance)} PDC
                    <br />
                    Suggested: {originalAmount} PDC (match original bet)
                  </p>
                </div>

                <div style={{ 
                  padding: '0.75rem', 
                  background: 'rgba(59, 130, 246, 0.1)', 
                  borderRadius: 8,
                  marginBottom: '1rem',
                }}>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)' }}>
                    💡 <strong>How it works:</strong> Your bet opposes the original prediction. 
                    If the result proves them wrong, you win!
                  </p>
                </div>

                {bettingError && (
                  <div style={{ 
                    padding: '0.75rem', 
                    background: 'rgba(239, 68, 68, 0.1)', 
                    border: '1px solid #ef4444',
                    borderRadius: 8,
                    marginBottom: '1rem',
                  }}>
                    <p style={{ margin: 0, color: '#ef4444', fontSize: 14 }}>
                      {bettingError}
                    </p>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    onClick={() => setShowModal(false)} 
                    disabled={isPlacingBet}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: 8,
                      background: 'transparent',
                      color: 'var(--text-primary)',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleCounterBet} 
                    disabled={isPlacingBet || !validation.valid}
                    style={{
                      flex: 2,
                      padding: '0.75rem',
                      border: 'none',
                      borderRadius: 8,
                      background: validation.valid ? '#ef4444' : 'var(--border-color)',
                      color: 'white',
                      fontWeight: 600,
                      cursor: validation.valid ? 'pointer' : 'not-allowed',
                      opacity: isPlacingBet ? 0.7 : 1,
                    }}
                  >
                    {isPlacingBet ? 'Placing...' : `Counter-Bet (${amount} PDC)`}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-content {
          background: var(--bg-primary);
          border-radius: 16px;
          padding: 2rem;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </>
  );
}
