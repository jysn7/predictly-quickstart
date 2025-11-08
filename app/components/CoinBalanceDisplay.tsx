'use client';

import { useEffect, useState } from 'react';
import { getBalance } from '@/app/utils/coinSystem';
import { Coins, Lightbulb } from 'lucide-react';

interface CoinBalanceDisplayProps {
  walletAddress: string;
  onOpenPurchaseModal?: () => void;
  compact?: boolean;
}

export default function CoinBalanceDisplay({
  walletAddress,
  onOpenPurchaseModal,
  compact = false,
}: CoinBalanceDisplayProps) {
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBalance = async () => {
      try {
        if (walletAddress && walletAddress !== '0x0') {
          const data = await getBalance(walletAddress);
          setBalance(parseFloat(data.balance));
        }
      } catch (error) {
        console.error('Failed to load balance:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBalance();
    const interval = setInterval(loadBalance, 5000);
    return () => clearInterval(interval);
  }, [walletAddress]);

  if (compact) {
    return (
      <div
        onClick={onOpenPurchaseModal}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          backgroundColor: 'var(--accent)',
          color: 'white',
          borderRadius: '6px',
          fontWeight: '600',
          cursor: onOpenPurchaseModal ? 'pointer' : 'default',
          fontSize: '0.9rem',
        }}
      >
        <Coins size={16} />
        <span>{isLoading ? '...' : balance.toFixed(0)}</span>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}
      >
        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>Your Coins</h3>
        {onOpenPurchaseModal && (
          <button
            onClick={onOpenPurchaseModal}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--accent)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontWeight: '600',
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            Buy More
          </button>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '1rem',
          backgroundColor: 'rgba(124, 58, 237, 0.1)',
          borderRadius: '8px',
          border: '1px solid var(--accent)',
        }}
      >
        <Coins size={32} style={{ color: 'var(--accent)' }} />
        <div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>PDC Balance</div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--accent)' }}>
            {isLoading ? '...' : balance.toFixed(0)}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Lightbulb size={16} style={{ color: 'var(--accent)' }} />
        Use your PDC coins to place bets on upcoming matches!
      </div>
    </div>
  );
}
