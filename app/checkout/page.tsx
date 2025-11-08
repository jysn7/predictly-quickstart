'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { Loader2, ChevronLeft } from 'lucide-react';
import { BasePayButton } from '@base-org/account-ui/react';
import { initializeBasePay, pollPaymentCompletion, getCoinPackages, formatUSDC } from '@/app/utils/basePay';
import { getBalance } from '@/app/utils/coinSystem';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const packageId = searchParams.get('package');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [userWalletAddress, setUserWalletAddress] = useState<string>('');

  // Get package details
  const packages = getCoinPackages();
  const selectedPackage = packages.find(p => p.usdAmount === packageId);

  useEffect(() => {
    // Initialize user data
    const id = 'user_' + Math.random().toString(36).substr(2, 9);
    setUserId(id);
    
    const address = localStorage.getItem('userWalletAddress') || '0x0';
    setUserWalletAddress(address);
  }, []);

  const handlePayment = async () => {
    if (!selectedPackage) return;

    setIsProcessing(true);
    setError('');
    setPaymentStatus('initiating');

    try {
      console.log('🎯 Starting coin purchase...');
      console.log(`   Package: ${selectedPackage.label}`);
      console.log(`   USD Amount: ${formatUSDC(selectedPackage.usdAmount)}`);

      // Initialize Base Pay
      const { paymentId } = await initializeBasePay(
        process.env.NEXT_PUBLIC_TREASURY_WALLET || '0x0',
        selectedPackage.usdAmount,
        userId,
        userWalletAddress,
        process.env.NEXT_PUBLIC_BASE_NETWORK === 'mainnet' ? false : true
      );

      setPaymentStatus('pending');
      console.log(`⏳ Payment initiated. ID: ${paymentId}`);

      // Poll for completion
      const isTestnet = process.env.NEXT_PUBLIC_BASE_NETWORK !== 'mainnet';
      const { completed, status } = await pollPaymentCompletion(
        paymentId,
        60,
        1000,
        isTestnet
      );

      if (completed) {
        setPaymentStatus('completed');
        console.log(`✅ Payment ${paymentId} confirmed!`);
        console.log('⏳ Waiting for coins to be credited...');

        // Wait a moment for webhook to process
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Check updated balance
        const balance = await getBalance(userWalletAddress);
        console.log(`💰 New balance: ${balance.balance} PDC`);

        // Redirect to success page
        setTimeout(() => {
          router.push(`/success?amount=${selectedPackage.coinAmount}&paymentId=${paymentId}`);
        }, 1500);
      } else {
        const errorMsg = status === 'timeout'
          ? 'Payment verification timed out. Check Base Sepolia for transaction status.'
          : status.includes('error:')
          ? `Payment check failed: ${status}`
          : `Payment ${status}. Please try again.`;

        setError(errorMsg);
        setPaymentStatus('failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      setError(errorMessage);
      setPaymentStatus('failed');
      console.error('❌ Payment error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (!selectedPackage) {
    return (
      <main className="page-container">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <h1 style={{ color: 'var(--text)', marginBottom: '1rem' }}>Package Not Found</h1>
          <button
            onClick={handleCancel}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'var(--surface)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: '500',
            }}
          >
            Go Back
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="page-container">
      <div style={{ maxWidth: '500px', margin: '0 auto', width: '100%' }}>
        {/* Header with back button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <button
            onClick={handleCancel}
            disabled={isProcessing}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              color: 'var(--text-secondary)',
              transition: 'all 0.2s',
              opacity: isProcessing ? 0.5 : 1,
            }}
            title="Go back"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '600', color: 'var(--text)', margin: 0 }}>
            Purchase Coins
          </h1>
        </div>

        {/* Order Summary Card */}
        <div
          style={{
            padding: '1.5rem',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            marginBottom: '1.5rem',
          }}
        >
          <h2 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Order Summary
          </h2>

          {/* Package Info */}
          <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                {selectedPackage.coinAmount} PDC Coins
              </span>
              <span style={{ color: 'var(--accent)', fontWeight: '600', fontSize: '1.1rem' }}>
                {formatUSDC(selectedPackage.usdAmount)}
              </span>
            </div>
            {selectedPackage.popular && (
              <div style={{ display: 'inline-block', background: 'rgba(124, 58, 237, 0.1)', color: 'var(--accent)', fontSize: '0.75rem', fontWeight: '600', padding: '0.4rem 0.8rem', borderRadius: '4px', marginTop: '0.5rem' }}>
                ⭐ POPULAR CHOICE
              </div>
            )}
          </div>

          {/* Total */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--text)', fontWeight: '500' }}>Total</span>
            <span style={{ color: 'var(--accent)', fontWeight: '700', fontSize: '1.25rem' }}>
              {formatUSDC(selectedPackage.usdAmount)}
            </span>
          </div>

          {/* Payment Method */}
          <div style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Payment Method
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '32px', height: '32px', background: '#0052FF', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'white', fontWeight: '700', fontSize: '0.7rem' }}>Ⓑ</span>
              </div>
              <div>
                <p style={{ color: 'var(--text)', fontWeight: '600', margin: 0, fontSize: '0.95rem' }}>Base Pay</p>
                <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.8rem' }}>Powered by Base</p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div
            style={{
              padding: '1rem',
              background: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              color: '#991b1b',
              fontSize: '0.9rem',
              marginBottom: '1.5rem',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'flex-start',
            }}
          >
            <span style={{ flex: 0 }}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {paymentStatus === 'pending' && (
          <div
            style={{
              padding: '1rem',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '8px',
              color: '#1e40af',
              fontSize: '0.9rem',
              marginBottom: '1.5rem',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'center',
            }}
          >
            <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
            <span>Payment processing... Please confirm in your wallet</span>
          </div>
        )}

        {paymentStatus === 'completed' && (
          <div
            style={{
              padding: '1rem',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: '8px',
              color: '#065f46',
              fontSize: '0.9rem',
              marginBottom: '1.5rem',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'center',
            }}
          >
            <span>✓</span>
            <span>Payment successful! Coins are being added to your account...</span>
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={handleCancel}
            disabled={isProcessing}
            style={{
              flex: 1,
              padding: '1rem',
              background: 'var(--surface)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              opacity: isProcessing ? 0.5 : 1,
            }}
          >
            Cancel
          </button>

          {/* Base Pay Button - using official account-ui component */}
          <div style={{ flex: 1 }}>
            <BasePayButton 
              onClick={handlePayment}
              colorScheme="dark"
            />
          </div>
        </div>

        {/* Footer Note */}
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textAlign: 'center', marginTop: '2rem', lineHeight: '1.5' }}>
          Payment processed securely on Base Chain. No extra fees. Coins credited instantly.
        </p>

        {/* Help Link */}
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <a
            href="https://faucet.circle.com/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'var(--accent)',
              textDecoration: 'none',
              fontSize: '0.85rem',
              fontWeight: '500',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
          >
            Need test USDC? Get from Circle Faucet →
          </a>
        </div>
      </div>

      {/* Spin animation */}
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

export default function Checkout() {
  return (
    <Suspense fallback={
      <main className="page-container">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent)' }} />
          <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>Loading...</p>
        </div>
      </main>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
