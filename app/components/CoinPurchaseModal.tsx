'use client';

/**
 * Base Pay Button Component
 * 
 * Official Base Pay UI component from @base-org/account-ui/react
 * Pre-built button for native look-and-feel
 */

import React, { useState } from 'react';
import { initializeBasePay, pollPaymentCompletion, getCoinPackages, formatUSDC } from '@/app/utils/basePay';
import { getBalance } from '@/app/utils/coinSystem';
import { Wallet, Loader2, X } from 'lucide-react';

interface CoinPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  userWalletAddress: string;
  userId: string;
  treasuryWalletAddress: string;
  onPurchaseComplete?: (paymentId: string) => void;
}

export default function CoinPurchaseModal({
  isOpen,
  onClose,
  userWalletAddress,
  userId,
  treasuryWalletAddress,
  onPurchaseComplete,
}: CoinPurchaseModalProps) {
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string>('');
  const [error, setError] = useState<string>('');

  const packages = getCoinPackages();

  const handlePayment = async () => {
    if (!selectedPackage) {
      setError('Please select a coin package');
      return;
    }

    const pkg = packages.find(p => p.usdAmount === selectedPackage);
    if (!pkg) return;

    setIsProcessing(true);
    setError('');
    setPaymentStatus('initiating');

    try {
      console.log('🎯 Starting coin purchase...');
      console.log(`   Package: ${pkg.label}`);
      console.log(`   USD Amount: ${formatUSDC(pkg.usdAmount)}`);

      // Initialize Base Pay
      const { paymentId } = await initializeBasePay(
        treasuryWalletAddress,
        pkg.usdAmount,
        userId,
        userWalletAddress,
        process.env.NEXT_PUBLIC_BASE_NETWORK === 'mainnet' ? false : true
      );

      setPaymentStatus('pending');
      console.log(`⏳ Payment initiated. ID: ${paymentId}`);

      // Poll for completion - pass testnet flag to match initializeBasePay
      const isTestnet = process.env.NEXT_PUBLIC_BASE_NETWORK !== 'mainnet';
      const { completed, status } = await pollPaymentCompletion(
        paymentId,
        60,           // maxAttempts
        1000,         // intervalMs
        isTestnet     // testnet flag
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

        // Notify parent component
        if (onPurchaseComplete) {
          onPurchaseComplete(paymentId);
        }

        // Close modal
        setTimeout(() => {
          onClose();
          setSelectedPackage('');
          setPaymentStatus('');
        }, 1000);
      } else {
        // More detailed error message based on status
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

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop - Covers entire screen */}
      <div
        className="fixed inset-0 z-[999] backdrop-blur-md bg-black/50 transition-opacity duration-300"
        onClick={!isProcessing ? onClose : undefined}
        style={{ cursor: isProcessing ? 'not-allowed' : 'pointer' }}
      />

      {/* Modal Container - Centered, Fixed, Above Everything */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full pointer-events-auto transform transition-all duration-300"
          style={{
            animation: 'modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        >
          {/* Header */}
          <div className="relative px-6 py-4 border-b border-gray-100">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Buy PDC Coins</h2>
                <p className="text-sm text-gray-500 mt-1">Powered by Base Pay</p>
              </div>
              {/* Close Button */}
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="p-2 hover:bg-gray-100 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                aria-label="Close modal"
              >
                <X size={24} className="text-gray-600" strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-5 max-h-[70vh] overflow-y-auto hide-scrollbar">
            {/* Coin Packages Section */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Select Package
              </label>
              <div className="space-y-2">
                {packages.map(pkg => (
                  <label
                    key={pkg.usdAmount}
                    className="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-blue-300 hover:bg-blue-50/50 transition duration-200"
                    style={{
                      borderColor: selectedPackage === pkg.usdAmount ? '#7c3aed' : '#e5e7eb',
                      backgroundColor: selectedPackage === pkg.usdAmount ? 'rgba(124, 58, 237, 0.08)' : 'transparent',
                    }}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <input
                        type="radio"
                        name="package"
                        value={pkg.usdAmount}
                        checked={selectedPackage === pkg.usdAmount}
                        onChange={e => setSelectedPackage(e.target.value)}
                        disabled={isProcessing}
                        className="w-4 h-4 cursor-pointer accent-blue-600"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">{pkg.coinAmount} PDC</div>
                        <div className="text-sm text-gray-500">{formatUSDC(pkg.usdAmount)}</div>
                      </div>
                    </div>
                    {pkg.popular && (
                      <span className="text-xs font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full">
                        ⭐ Popular
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Status Messages */}
            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg text-red-700 text-sm flex gap-3">
                <X size={20} className="flex-shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {paymentStatus === 'pending' && (
              <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg text-blue-700 text-sm flex gap-3 items-start">
                <Loader2 className="w-5 h-5 animate-spin flex-shrink-0 text-blue-500 mt-0.5" />
                <span>Payment processing... Please confirm in your wallet</span>
              </div>
            )}

            {paymentStatus === 'completed' && (
              <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-lg text-green-700 text-sm flex gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>Payment successful! Coins are being added to your account...</span>
              </div>
            )}
          </div>

          {/* Footer with Action Buttons */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl flex gap-3">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 px-4 py-3 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handlePayment}
              disabled={!selectedPackage || isProcessing}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4" />
                  Pay with Base
                </>
              )}
            </button>
          </div>

          {/* Help Text */}
          <div className="px-6 py-3 text-center text-xs text-gray-600 border-t border-gray-100">
            Need test USDC?{' '}
            <a
              href="https://faucet.circle.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline font-semibold"
            >
              Get from Circle Faucet
            </a>
          </div>
        </div>
      </div>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes modalSlideUp {
          from {
            opacity: 0;
            transform: scale(0.92) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </>
  );
}
