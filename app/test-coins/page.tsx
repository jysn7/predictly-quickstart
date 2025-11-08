'use client';

import { useState, useEffect } from 'react';
import CoinPurchaseModal from '../components/CoinPurchaseModal';
import { getBalance } from '../utils/coinSystem';
import { Coins, RefreshCw, Wallet } from 'lucide-react';

export default function TestCoinsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [coinBalance, setCoinBalance] = useState<number>(0);
  const [userWalletAddress, setUserWalletAddress] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<string>('');

  useEffect(() => {
    // Get wallet address from localStorage or generate
    let address = localStorage.getItem('userWalletAddress');
    if (!address) {
      address = '0x' + Math.random().toString(16).substr(2, 40);
      localStorage.setItem('userWalletAddress', address);
    }
    setUserWalletAddress(address);
    refreshBalance(address);
  }, []);

  const refreshBalance = async (address: string) => {
    setIsRefreshing(true);
    try {
      const balance = await getBalance(address);
      setCoinBalance(parseFloat(balance.balance));
      setLastRefresh(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Failed to load balance:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <main className="page-container">
      <CoinPurchaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userWalletAddress={userWalletAddress}
        userId={`test_user_${Math.random().toString(36).substr(2, 9)}`}
        treasuryWalletAddress={process.env.NEXT_PUBLIC_TREASURY_WALLET || '0x0'}
        onPurchaseComplete={() => {
          setTimeout(() => {
            refreshBalance(userWalletAddress);
          }, 2000);
        }}
      />

      <div className="page-header">
        <h1 className="page-title">Test Coin Purchase System</h1>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Current Balance Card */}
        <div className="card">
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem' }}>
            Your Coin Balance
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            {/* Balance Display */}
            <div
              style={{
                backgroundColor: 'rgba(124, 58, 237, 0.1)',
                padding: '1.25rem',
                borderRadius: '12px',
                border: '2px solid var(--accent)',
                textAlign: 'center',
              }}
            >
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                <Coins style={{ display: 'inline', marginRight: '0.5rem' }} size={16} />
                Total PDC Coins
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--accent)' }}>
                {coinBalance.toFixed(0)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                PDC
              </div>
            </div>

            {/* Wallet Address */}
            <div
              style={{
                backgroundColor: 'rgba(124, 58, 237, 0.05)',
                padding: '1.25rem',
                borderRadius: '12px',
                border: '2px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                <Wallet style={{ display: 'inline', marginRight: '0.5rem' }} size={16} />
                Your Wallet
              </div>
              <div
                style={{
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  color: 'var(--accent)',
                  wordBreak: 'break-all',
                  fontWeight: '600',
                }}
              >
                {userWalletAddress}
              </div>
            </div>
          </div>

          {/* Last Refresh */}
          {lastRefresh && (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Last updated: {lastRefresh}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              onClick={() => setIsModalOpen(true)}
              style={{
                width: '100%',
                padding: '0.75rem 1.25rem',
                backgroundColor: 'var(--accent)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              <Coins size={18} />
              Buy Coins with Base Pay
            </button>

            <button
              onClick={() => refreshBalance(userWalletAddress)}
              disabled={isRefreshing}
              style={{
                width: '100%',
                padding: '0.75rem 1.25rem',
                backgroundColor: 'var(--surface)',
                color: 'var(--text)',
                border: '2px solid var(--border)',
                borderRadius: '6px',
                fontWeight: '600',
                cursor: isRefreshing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                opacity: isRefreshing ? 0.6 : 1,
              }}
            >
              <RefreshCw size={18} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
              Refresh
            </button>
          </div>
        </div>

        {/* Instructions Card */}
        <div className="card">
          <h2 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '1rem' }}>How to Test</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-secondary)' }}>
            <div>
              <div style={{ fontWeight: '600', color: 'var(--text)', marginBottom: '0.5rem' }}>1. Get Test USDC</div>
              <p style={{ margin: 0 }}>
                Visit{' '}
                <a
                  href="https://faucet.circle.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--accent)', textDecoration: 'none' }}
                >
                  Circle Faucet
                </a>
                , select "Base Sepolia", and claim 100 test USDC to your wallet address above.
              </p>
            </div>

            <div>
              <div style={{ fontWeight: '600', color: 'var(--text)', marginBottom: '0.5rem' }}>2. Click "Buy Coins with Base Pay"</div>
              <p style={{ margin: 0 }}>Opens the coin purchase modal where you can select packages and complete payment.</p>
            </div>

            <div>
              <div style={{ fontWeight: '600', color: 'var(--text)', marginBottom: '0.5rem' }}>3. Select a Coin Package</div>
              <p style={{ margin: 0 }}>
                Choose from available packages (10 PDC - $1, up to 1000 PDC - $100). Each package shows the USD cost.
              </p>
            </div>

            <div>
              <div style={{ fontWeight: '600', color: 'var(--text)', marginBottom: '0.5rem' }}>4. Confirm Payment</div>
              <p style={{ margin: 0 }}>
                Click "Pay with Base" and confirm the transaction in your wallet popup. Payment settles in &lt;2 seconds on
                Base Sepolia.
              </p>
            </div>

            <div>
              <div style={{ fontWeight: '600', color: 'var(--text)', marginBottom: '0.5rem' }}>5. Check Balance</div>
              <p style={{ margin: 0 }}>
                After payment completes, click "Refresh" to see your new coin balance. Your coins are now ready to use for
                betting!
              </p>
            </div>
          </div>
        </div>

        {/* Coin Packages Info */}
        <div className="card">
          <h2 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '1rem' }}>Available Coin Packages</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
            {[
              { coins: '10', usd: '$1.00' },
              { coins: '50', usd: '$5.00' },
              { coins: '100', usd: '$10.00' },
              { coins: '500', usd: '$50.00' },
              { coins: '1000', usd: '$100.00' },
            ].map((pkg) => (
              <div
                key={pkg.usd}
                style={{
                  backgroundColor: 'rgba(124, 58, 237, 0.05)',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--accent)', marginBottom: '0.5rem' }}>
                  {pkg.coins} PDC
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{pkg.usd}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="card" style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text)' }}>
            Troubleshooting
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            <div>
              <div style={{ fontWeight: '600', color: 'var(--text)', marginBottom: '0.5rem' }}>❌ "Payment failed"</div>
              <p style={{ margin: 0, marginLeft: '1.5rem' }}>
                Make sure you have test USDC and your wallet is connected to Base Sepolia network.
              </p>
            </div>

            <div>
              <div style={{ fontWeight: '600', color: 'var(--text)', marginBottom: '0.5rem' }}>❌ Balance not updating</div>
              <p style={{ margin: 0, marginLeft: '1.5rem' }}>
                Wait 2-3 seconds after payment and click "Refresh" to check your updated balance.
              </p>
            </div>

            <div>
              <div style={{ fontWeight: '600', color: 'var(--text)', marginBottom: '0.5rem' }}>❌ Wallet popup not appearing</div>
              <p style={{ margin: 0, marginLeft: '1.5rem' }}>
                Make sure your wallet extension is installed and you've given permission for this site to access it.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </main>
  );
}
