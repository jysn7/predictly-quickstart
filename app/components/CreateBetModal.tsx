/**
 * CreateBetModal Component
 * 
 * Modal for users to create new bets that others can bet for or against
 * 
 * Props:
 * - isOpen: boolean - Show/hide modal
 * - onClose: () => void - Close callback
 * - match: Match object with matchId, homeTeam, awayTeam
 * - onSuccess?: (result) => void - Success callback
 */

'use client';

import { useState, useEffect } from 'react';
import { useBetting } from '../hooks/useBetting';
import { useWallet } from '../hooks/useWallet';
import { formatCoinAmount, validateBetAmount } from '../utils/coinSystem';

interface Match {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  sport?: string;
  startTime?: number;
}

interface CreateBetModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: Match;
  onSuccess?: (result: any) => void;
}

export default function CreateBetModal({ isOpen, onClose, match, onSuccess }: CreateBetModalProps) {
  const { address, balance, connect, isConnected } = useWallet();
  const { createBet, isPlacingBet, error: bettingError } = useBetting();
  
  const [amount, setAmount] = useState('10');
  const [prediction, setPrediction] = useState('Home Win');
  const [position, setPosition] = useState<'for' | 'against'>('for');
  const [showSuccess, setShowSuccess] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setAmount('10');
      setPrediction('Home Win');
      setPosition('for');
      setShowSuccess(false);
      setTransactionHash('');
    }
  }, [isOpen]);

  const validation = validateBetAmount(amount, balance);

  const handleCreate = async () => {
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    try {
      const result = await createBet({
        matchId: match.matchId,
        amount,
        prediction,
        position,
      });

      if (result.success) {
        setTransactionHash(result.transactionHash || '');
        setShowSuccess(true);
        
        if (onSuccess) {
          onSuccess(result);
        }

        // Auto-close after 3 seconds
        setTimeout(() => {
          onClose();
        }, 3000);
      }
    } catch (err) {
      console.error('Error creating bet:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
        {showSuccess ? (
          // Success state
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: 64, marginBottom: '1rem' }}>✅</div>
            <h2 style={{ color: 'var(--accent)', marginBottom: '0.5rem' }}>Bet Created!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Your bet has been placed on the blockchain.
            </p>
            {transactionHash && (
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', wordBreak: 'break-all' }}>
                TX: {transactionHash.substring(0, 10)}...{transactionHash.substring(transactionHash.length - 8)}
              </p>
            )}
            <p style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontSize: 14 }}>
              Closing automatically...
            </p>
          </div>
        ) : (
          // Form state
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>Create Bet</h2>
              <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--text-secondary)' }}>×</button>
            </div>
            
            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 8 }}>
              <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)' }}>Match</p>
              <p style={{ margin: '0.25rem 0 0', fontWeight: 600, fontSize: 16 }}>
                {match.homeTeam} vs {match.awayTeam}
              </p>
            </div>

            {!isConnected ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                  Connect your wallet to create a bet
                </p>
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
                  }}
                >
                  Connect Wallet
                </button>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                    Your Prediction
                  </label>
                  <select 
                    value={prediction} 
                    onChange={(e) => setPrediction(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: 8,
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      fontSize: 14,
                    }}
                  >
                    <option value="Home Win">{match.homeTeam} Win</option>
                    <option value="Draw">Draw</option>
                    <option value="Away Win">{match.awayTeam} Win</option>
                  </select>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                    Your Position
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <button
                      onClick={() => setPosition('for')}
                      style={{
                        padding: '0.75rem',
                        borderRadius: 8,
                        border: `2px solid ${position === 'for' ? 'var(--accent)' : 'var(--border-color)'}`,
                        background: position === 'for' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                        color: position === 'for' ? 'var(--accent)' : 'var(--text-primary)',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: 14,
                      }}
                    >
                      👍 For<br/>
                      <span style={{ fontSize: 12, fontWeight: 400 }}>I think it will happen</span>
                    </button>
                    <button
                      onClick={() => setPosition('against')}
                      style={{
                        padding: '0.75rem',
                        borderRadius: 8,
                        border: `2px solid ${position === 'against' ? '#ef4444' : 'var(--border-color)'}`,
                        background: position === 'against' ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                        color: position === 'against' ? '#ef4444' : 'var(--text-primary)',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: 14,
                      }}
                    >
                      👎 Against<br/>
                      <span style={{ fontSize: 12, fontWeight: 400 }}>I think it won't happen</span>
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                    Stake Amount (PDC)
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
                    onClick={onClose} 
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
                    onClick={handleCreate} 
                    disabled={isPlacingBet || !validation.valid}
                    style={{
                      flex: 2,
                      padding: '0.75rem',
                      border: 'none',
                      borderRadius: 8,
                      background: validation.valid ? 'var(--accent)' : 'var(--border-color)',
                      color: 'white',
                      fontWeight: 600,
                      cursor: validation.valid ? 'pointer' : 'not-allowed',
                      opacity: isPlacingBet ? 0.7 : 1,
                    }}
                  >
                    {isPlacingBet ? 'Creating...' : `Create Bet (${amount} PDC)`}
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>

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
    </div>
  );
}
