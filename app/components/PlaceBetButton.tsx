"use client";

import { useState } from 'react';
import { parseEther } from 'viem';

declare global {
  interface Window {
    baseProvider?: any;
    baseSDK?: any;
  }
}

interface PlaceBetButtonProps {
  predictionId: string;
  amount: number; // in ETH
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export default function PlaceBetButton({ predictionId, amount, onSuccess, onError }: PlaceBetButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePlaceBet = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if Base Account is available and connected
      if (!window.baseProvider) {
        throw new Error('Base Account not available. Please check if it loaded correctly.');
      }

      // Convert amount from ETH to Wei
      const amountInWei = parseEther(amount.toString());

      // Get connected accounts via eth_accounts
      const accounts = await window.baseProvider.request({
        method: "eth_accounts",
        params: [],
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts connected. Please connect your wallet in the sidebar first.');
      }

      const userAccount = accounts[0];

      console.log('Placing bet:', {
        predictionId,
        amount: amount.toString(),
        amountInWei: amountInWei.toString(),
        userAccount,
        timestamp: new Date().toISOString()
      });

      // Simulate a successful transaction
      const transactionHash = `0x${Math.random().toString(16).substring(2)}`;
      
      // Record the bet
      const response = await fetch('/api/predictions/bets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userAccount,
          predictionId,
          amount: amount.toString(),
          transactionHash,
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to record bet');
      }

      console.log('Bet placed successfully');
      onSuccess?.();
    } catch (err) {
      console.error('Payment failed:', err);
      const errorMsg = err instanceof Error ? err.message : 'Payment failed';
      setError(errorMsg);
      onError?.(err instanceof Error ? err : new Error(errorMsg));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handlePlaceBet}
        disabled={isLoading || amount <= 0}
        className="btn-primary"
        style={{ width: '100%' }}
      >
        {isLoading ? 'Placing Bet...' : `Place Bet (${amount} ETH)`}
      </button>
      
      {error && (
        <div style={{ 
          marginTop: '0.5rem', 
          color: '#ef4444', 
          fontSize: '0.875rem',
          padding: '0.5rem',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderRadius: '4px'
        }}>
          {error}
        </div>
      )}
    </div>
  );
}