/**
 * Client-side utilities for the Predictly coin system
 * 
 * Uses official Base Pay SDK: @base-org/account
 * Functions for:
 * - Buying coins via Base Pay (official SDK)
 * - Placing bets
 * - Checking balance
 * - Withdrawing coins
 */

export interface CoinBalance {
  walletAddress: string;
  balance: string;
  stats: {
    current: string;
    purchased: string;
    won: string;
    withdrawn: string;
  };
}

export interface BetPlacement {
  betId: number;
  walletAddress: string;
  matchId: string;
  amount: string;
  prediction: string;
  transactionHash: string;
  status: 'confirmed' | 'pending';
}

export interface BasePayPayment {
  id: string;
  amount: string;
  to: string;
  status: 'completed' | 'failed' | 'pending';
}

/**
 * Get the current coin balance for a wallet
 */
export async function getBalance(walletAddress: string): Promise<CoinBalance> {
  const response = await fetch(
    `/api/coins/balance?walletAddress=${walletAddress}`,
    { method: 'GET' }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get balance');
  }

  return response.json();
}

/**
 * Place a bet using coins
 * 
 * @param walletAddress User's wallet address
 * @param matchId The match to bet on
 * @param amount Amount in PDC coins
 * @param prediction User's prediction (e.g., "Home Win", "Away Win", "Draw")
 * @returns Bet placement result with transaction hash
 */
export async function placeBet(
  walletAddress: string,
  matchId: string,
  amount: string,
  prediction: string
): Promise<BetPlacement> {
  const response = await fetch('/api/bets/place', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      walletAddress,
      matchId,
      amount,
      prediction,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to place bet');
  }

  return response.json();
}

/**
 * Initiate a Base Pay coin purchase
 * 
 * This opens a Base Pay payment flow. After successful payment,
 * the webhook will automatically call buyCoins on the smart contract.
 * 
 * @param walletAddress User's wallet address
 * @param amount Amount of coins to purchase
 * @param usdAmount The USD equivalent (for display)
 */
export async function initiateBasePay(
  walletAddress: string,
  amount: string,
  usdAmount: number
): Promise<string> {
  // This would typically open Base Pay SDK modal
  // For now, return a placeholder that would be implemented with Base Pay SDK

  console.log('🛒 Initiating Base Pay checkout...');
  console.log(`   Wallet: ${walletAddress}`);
  console.log(`   Amount: ${amount} PDC (≈$${usdAmount})`);

  // Base Pay SDK implementation would go here
  // window.basePay.openCheckout({
  //   amount: usdAmount,
  //   currency: 'USD',
  //   metadata: {
  //     userId: userId,
  //     walletAddress: walletAddress,
  //     coinAmount: amount,
  //   },
  //   onSuccess: (paymentId: string) => {
  //     // Payment confirmed, coins will be purchased via webhook
  //   },
  //   onError: (error: Error) => {
  //     console.error('Payment failed:', error);
  //   },
  // });

  return 'checkout_initiated';
}

/**
 * Get coin purchase pricing
 * Returns the USD price for different coin packages
 */
export function getCoinPackages(): {
  amount: string;
  usdPrice: number;
  label: string;
  popular?: boolean;
}[] {
  return [
    { amount: '10', usdPrice: 1, label: '10 PDC' },
    { amount: '50', usdPrice: 5, label: '50 PDC' },
    { amount: '100', usdPrice: 10, label: '100 PDC', popular: true },
    { amount: '500', usdPrice: 50, label: '500 PDC' },
    { amount: '1000', usdPrice: 100, label: '1000 PDC' },
  ];
}

/**
 * Format coin amount for display
 */
export function formatCoinAmount(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Calculate potential winnings from a bet
 * @param betAmount Amount bet in PDC
 * @param odds Betting odds (e.g., 1.5, 2.0)
 * @returns Gross winnings before fees
 */
export function calculatePotentialWinnings(betAmount: string, odds: number): string {
  const amount = parseFloat(betAmount);
  const winnings = amount * odds;
  return winnings.toFixed(2);
}

/**
 * Calculate net winnings after 5% app fee
 * @param grossWinnings Total winnings before fee
 * @returns Net winnings after 5% fee
 */
export function calculateNetWinnings(grossWinnings: string): string {
  const gross = parseFloat(grossWinnings);
  const fee = gross * 0.05; // 5% fee
  const net = gross - fee;
  return net.toFixed(2);
}

/**
 * Validate a bet amount
 */
export function validateBetAmount(
  amount: string,
  userBalance: string,
  minBet: string = '1'
): { valid: boolean; error?: string } {
  const amountNum = parseFloat(amount);
  const balanceNum = parseFloat(userBalance);
  const minBetNum = parseFloat(minBet);

  if (isNaN(amountNum)) {
    return { valid: false, error: 'Invalid amount' };
  }

  if (amountNum < minBetNum) {
    return { valid: false, error: `Minimum bet is ${minBet} PDC` };
  }

  if (amountNum > balanceNum) {
    return { valid: false, error: 'Insufficient balance' };
  }

  return { valid: true };
}

/**
 * Subscribe to real-time balance updates via polling
 * (Consider using WebSockets for production)
 */
export function subscribeToBalance(
  walletAddress: string,
  callback: (balance: CoinBalance) => void,
  intervalMs: number = 5000
): (() => void) {
  const interval = setInterval(async () => {
    try {
      const balance = await getBalance(walletAddress);
      callback(balance);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  }, intervalMs);

  // Return unsubscribe function
  return () => clearInterval(interval);
}
