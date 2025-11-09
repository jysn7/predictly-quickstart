/**
 * useWallet Hook
 * 
 * Provides wallet connection, balance, and account management
 * 
 * Usage:
 * const { address, isConnected, balance, connect, refreshBalance } = useWallet();
 */

'use client';

import { useAuth } from '../rootProvider';
import { getBalance } from '../utils/coinSystem';
import { useState, useEffect, useCallback } from 'react';

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  balance: string;
  isLoading: boolean;
  error: string | null;
}

export function useWallet() {
  const { address, isConnected, connect: authConnect, provider } = useAuth();
  const [balance, setBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load balance when address changes
  useEffect(() => {
    if (address) {
      loadBalance();
    } else {
      setBalance('0');
    }
  }, [address]);

  const loadBalance = useCallback(async () => {
    if (!address) return;
    
    try {
      setError(null);
      const result = await getBalance(address);
      setBalance(result.balance);
    } catch (err) {
      console.error('Failed to load balance:', err);
      setError(err instanceof Error ? err.message : 'Failed to load balance');
    }
  }, [address]);

  const refreshBalance = useCallback(async () => {
    setIsLoading(true);
    await loadBalance();
    setIsLoading(false);
  }, [loadBalance]);

  const connect = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      await authConnect();
    } catch (err) {
      console.error('Failed to connect wallet:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [authConnect]);

  return {
    address,
    isConnected,
    balance,
    refreshBalance,
    connect,
    isLoading,
    error,
    provider,
  };
}
