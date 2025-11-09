/**
 * useBetting Hook
 * 
 * Provides betting functionality including:
 * - Create new bets
 * - Join existing bets (counter-bet)
 * - Place bets on matches
 * 
 * Usage:
 * const { createBet, joinBet, isPlacingBet } = useBetting();
 */

'use client';

import { useState, useCallback } from 'react';
import { placeBet } from '../utils/coinSystem';
import { useWallet } from './useWallet';

export interface CreateBetParams {
  matchId: string;
  amount: string;
  prediction: string;
  position: 'for' | 'against';
}

export interface JoinBetParams {
  communityBetId: string;
  amount: string;
  position: 'for' | 'against';
}

export interface BetResult {
  success: boolean;
  betId?: number;
  communityBetId?: string;
  transactionHash?: string;
  error?: string;
}

export function useBetting() {
  const { address, refreshBalance } = useWallet();
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Create a new bet that others can bet for or against
   */
  const createBet = useCallback(async (params: CreateBetParams): Promise<BetResult> => {
    if (!address) {
      const error = 'Wallet not connected';
      setError(error);
      throw new Error(error);
    }

    setIsPlacingBet(true);
    setError(null);

    try {
      const response = await fetch('/api/bets/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          ...params,
        }),
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to create bet');
      }

      // Refresh balance after bet
      await refreshBalance();

      return {
        success: true,
        betId: data.betId,
        communityBetId: data.communityBetId,
        transactionHash: data.transactionHash,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create bet';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsPlacingBet(false);
    }
  }, [address, refreshBalance]);

  /**
   * Join an existing bet (counter-bet)
   */
  const joinBet = useCallback(async (params: JoinBetParams): Promise<BetResult> => {
    if (!address) {
      const error = 'Wallet not connected';
      setError(error);
      throw new Error(error);
    }

    setIsPlacingBet(true);
    setError(null);

    try {
      const response = await fetch('/api/bets/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          ...params,
        }),
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to join bet');
      }

      // Refresh balance after bet
      await refreshBalance();

      return {
        success: true,
        betId: data.betId,
        communityBetId: data.communityBetId,
        transactionHash: data.transactionHash,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join bet';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsPlacingBet(false);
    }
  }, [address, refreshBalance]);

  /**
   * Place bet on a match (using existing API)
   */
  const placeBetOnMatch = useCallback(async (
    matchId: string,
    amount: string,
    prediction: string
  ): Promise<BetResult> => {
    if (!address) {
      const error = 'Wallet not connected';
      setError(error);
      throw new Error(error);
    }

    setIsPlacingBet(true);
    setError(null);

    try {
      const result = await placeBet(address, matchId, amount, prediction);
      
      // Refresh balance after bet
      await refreshBalance();

      return {
        success: true,
        betId: result.betId,
        transactionHash: result.transactionHash,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to place bet';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsPlacingBet(false);
    }
  }, [address, refreshBalance]);

  return {
    createBet,
    joinBet,
    placeBetOnMatch,
    isPlacingBet,
    error,
  };
}
