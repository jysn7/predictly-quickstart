'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { getCoinPackages, formatUSDC } from '@/app/utils/basePay';

export default function BuyCoins() {
  const router = useRouter();
  const packages = getCoinPackages();

  const handleSelectPackage = (usdAmount: string) => {
    router.push(`/checkout?package=${usdAmount}`);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <main className="page-container">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button
          onClick={handleBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            transition: 'all 0.2s',
          }}
          title="Go back"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '600', color: 'var(--text)', margin: 0 }}>
          Buy PDC Coins
        </h1>
      </div>

      {/* Info Text */}
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem' }}>
        Select a coin package to purchase. All transactions are secure and powered by Base.
      </p>

      {/* Packages Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          maxWidth: '1200px',
        }}
      >
        {packages.map(pkg => (
          <div
            key={pkg.usdAmount}
            onClick={() => handleSelectPackage(pkg.usdAmount)}
            style={{
              padding: '2rem',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              position: 'relative',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(124, 58, 237, 0.15)';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
              (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
            }}
          >
            {/* Popular Badge */}
            {pkg.popular && (
              <div
                style={{
                  position: 'absolute',
                  top: '-12px',
                  right: '20px',
                  background: 'linear-gradient(135deg, #0052FF 0%, #5c2fff 100%)',
                  color: 'white',
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  whiteSpace: 'nowrap',
                }}
              >
                ⭐ MOST POPULAR
              </div>
            )}

            {/* Coin Amount */}
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 0.5rem 0' }}>
                Coin Package
              </p>
              <h2 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--accent)', margin: 0 }}>
                {pkg.coinAmount}
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
                PDC Coins
              </p>
            </div>

            {/* Price */}
            <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0' }}>
                Price
              </p>
              <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text)', margin: 0 }}>
                {formatUSDC(pkg.usdAmount)}
              </p>
            </div>

            {/* Value Info */}
            <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 0.5rem 0' }}>
                Value
              </p>
              <p style={{ fontSize: '0.9rem', color: 'var(--accent)', margin: 0, fontWeight: '600' }}>
                ${(parseFloat(pkg.usdAmount) / parseInt(pkg.coinAmount) * 100).toFixed(1)} per 100 coins
              </p>
            </div>

            {/* Button */}
            <button
              style={{
                marginTop: '1rem',
                padding: '0.75rem 1.5rem',
                background: pkg.popular ? 'var(--accent)' : 'transparent',
                border: pkg.popular ? 'none' : '1px solid var(--accent)',
                borderRadius: '6px',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.2s',
                backgroundColor: pkg.popular ? 'var(--accent)' : 'transparent',
              }}
              onClick={() => handleSelectPackage(pkg.usdAmount)}
              onMouseEnter={(e) => {
                if (!pkg.popular) {
                  (e.currentTarget as HTMLElement).style.background = 'var(--accent)';
                } else {
                  (e.currentTarget as HTMLElement).style.opacity = '0.9';
                }
              }}
              onMouseLeave={(e) => {
                if (!pkg.popular) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                } else {
                  (e.currentTarget as HTMLElement).style.opacity = '1';
                }
              }}
            >
              Select Package
            </button>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div
        style={{
          marginTop: '3rem',
          padding: '1.5rem',
          background: 'rgba(124, 58, 237, 0.05)',
          border: '1px solid rgba(124, 58, 237, 0.2)',
          borderRadius: '8px',
          textAlign: 'center',
        }}
      >
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 0.5rem 0', lineHeight: '1.6' }}>
          All transactions are secured by Base Pay with no additional fees. Coins are credited instantly to your account.
        </p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
          Need test USDC?{' '}
          <a
            href="https://faucet.circle.com/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'var(--accent)',
              textDecoration: 'none',
              fontWeight: '600',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.textDecoration = 'underline'}
            onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.textDecoration = 'none'}
          >
            Get from Circle Faucet
          </a>
        </p>
      </div>
    </main>
  );
}
