/**
 * Base Pay Integration for Predictly Coin System
 * 
 * Official Base Pay SDK: @base-org/account
 * Docs: https://docs.base.org/base-account/guides/accept-payments
 * 
 * Features:
 * - One-tap USDC payment (settles in <2 seconds)
 * - Automatic gas sponsorship
 * - Works with all Base Accounts (smart wallets)
 * - No extra fees - you receive full amount
 */

import { pay, getPaymentStatus } from '@base-org/account';

/**
 * Initialize Base Pay for coin purchase
 * 
 * @param recipientAddress - Your treasury wallet (receives USDC)
 * @param amount - USD amount (USDC used internally)
 * @param userId - User ID for tracking
 * @param walletAddress - User's wallet address
 * @param testnet - true for Base Sepolia, false for mainnet
 * @returns Payment ID and status
 */
export async function initializeBasePay(
  recipientAddress: string,
  amount: string,
  userId: string,
  walletAddress: string,
  testnet: boolean = true
): Promise<{ paymentId: string; status: string }> {
  try {
    console.log('💳 Initializing Base Pay...');
    console.log(`   Amount: $${amount} USDC`);
    console.log(`   Recipient: ${recipientAddress}`);
    console.log(`   Network: ${testnet ? 'Base Sepolia (Testnet)' : 'Base Mainnet'}`);

    // Trigger payment - user will see wallet popup
    const payment = await pay({
      amount,
      to: recipientAddress,
      testnet,
      payerInfo: {
        requests: [
          { type: 'email' },
          { type: 'onchainAddress' }, // Get user's wallet address
        ],
      },
    });

    console.log('✅ Payment popup shown');
    console.log(`   Payment ID: ${payment.id}`);

    // Store payment info for webhook verification
    await logPaymentInitiation({
      paymentId: payment.id,
      userId,
      walletAddress,
      amount,
      timestamp: new Date().toISOString(),
    });

    return {
      paymentId: payment.id,
      status: 'pending',
    };
  } catch (error) {
    console.error('❌ Base Pay initialization failed:', error);
    throw new Error(
      `Payment initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Poll for payment status
 * 
 * @param paymentId - Payment ID from pay()
 * @param testnet - Must match the original pay() call
 * @returns Payment status
 */
export async function checkPaymentStatus(
  paymentId: string,
  testnet: boolean = true
): Promise<string> {
  try {
    if (!paymentId) {
      throw new Error('Payment ID is required');
    }

    console.log(`📊 Checking payment status for ID: ${paymentId} (${testnet ? 'testnet' : 'mainnet'})`);

    const result = await getPaymentStatus({
      id: paymentId,
      testnet,
    });

    const status = result?.status;

    if (!status) {
      throw new Error('No status returned from payment API');
    }

    console.log(`✓ Payment status: ${status}`);

    if (status === 'completed') {
      console.log('✅ Payment completed successfully');
    } else if (status === 'failed') {
      console.error('❌ Payment failed');
    } else if (status === 'pending') {
      console.log('⏳ Payment still pending...');
    }

    return status;
  } catch (error) {
    console.error('Error checking payment status:', error);
    
    // Re-throw with more context
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to check payment status: ${errorMsg}`);
  }
}

/**
 * Poll payment until completion or timeout
 * 
 * @param paymentId - Payment ID
 * @param maxAttempts - Maximum polling attempts (default: 60 = 60 seconds)
 * @param intervalMs - Polling interval in ms (default: 1000ms)
 * @param testnet - testnet flag (defaults to true if not specified)
 */
export async function pollPaymentCompletion(
  paymentId: string,
  maxAttempts: number = 60,
  intervalMs: number = 1000,
  testnet?: boolean
): Promise<{ completed: boolean; status: string }> {
  // Use environment variable if testnet not explicitly passed
  const isTestnet = testnet !== undefined ? testnet : process.env.NEXT_PUBLIC_BASE_NETWORK !== 'mainnet';
  
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      console.log(`🔍 Checking payment status (attempt ${attempts + 1}/${maxAttempts})...`);
      
      const status = await checkPaymentStatus(paymentId, isTestnet);

      if (status === 'completed') {
        console.log('🎉 Payment confirmed and settled on Base');
        return { completed: true, status };
      }

      if (status === 'failed') {
        console.error('❌ Payment failed at processor');
        return { completed: false, status };
      }

      // Still pending - wait and retry
      console.log(`⏳ Payment pending... waiting ${intervalMs}ms before next check`);
      await new Promise(resolve => setTimeout(resolve, intervalMs));
      attempts++;
    } catch (error) {
      console.error(`Error during polling (attempt ${attempts + 1}):`, error);
      
      // Don't retry forever on errors - after 10 consecutive errors, give up
      if (attempts > 10) {
        console.error('Too many polling errors, giving up');
        return { 
          completed: false, 
          status: `error: ${error instanceof Error ? error.message : 'Unknown error'}` 
        };
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, intervalMs));
      attempts++;
    }
  }

  console.warn('Payment polling timed out after 60 seconds');
  return { completed: false, status: 'timeout' };
}

/**
 * Get coin package pricing
 * 
 * Maps USD amounts to PDC coin amounts
 * 1 PDC = $0.10 (example pricing)
 */
export function getCoinPackages(): {
  usdAmount: string;
  coinAmount: string;
  label: string;
  popular?: boolean;
}[] {
  return [
    { usdAmount: '1.00', coinAmount: '10', label: '10 PDC - $1' },
    { usdAmount: '5.00', coinAmount: '50', label: '50 PDC - $5' },
    { usdAmount: '10.00', coinAmount: '100', label: '100 PDC - $10', popular: true },
    { usdAmount: '50.00', coinAmount: '500', label: '500 PDC - $50' },
    { usdAmount: '100.00', coinAmount: '1000', label: '1000 PDC - $100' },
  ];
}

/**
 * Format USDC amount for display
 */
export function formatUSDC(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Log payment initiation for audit trail
 * 
 * TODO: Implement with your backend database
 */
async function logPaymentInitiation(data: {
  paymentId: string;
  userId: string;
  walletAddress: string;
  amount: string;
  timestamp: string;
}) {
  try {
    console.log('💾 Logging payment initiation:', data);
    
    // TODO: Send to your backend
    // await fetch('/api/payments/log', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data),
    // });
  } catch (error) {
    console.error('Error logging payment:', error);
  }
}

/**
 * Get test USDC for Base Sepolia
 * 
 * Instructions:
 * 1. Visit: https://faucet.circle.com/
 * 2. Select "Base Sepolia"
 * 3. Enter wallet address
 * 4. Receive 100 test USDC
 */
export const GET_TEST_USDC_URL = 'https://faucet.circle.com/';

/**
 * Base Pay Documentation Links
 */
export const BASE_PAY_DOCS = {
  MAIN: 'https://docs.base.org/base-account/guides/accept-payments',
  SDK: 'https://www.npmjs.com/package/@base-org/account',
  PLAYGROUND: 'https://base.github.io/account-sdk/pay-playground',
  TESTNET_FAUCET: 'https://faucet.circle.com/',
  EXPLORER: 'https://sepolia.basescan.org/',
} as const;

/**
 * Example: Full coin purchase flow
 * 
 * Usage in component:
 * ```tsx
 * import { initializeBasePay, pollPaymentCompletion } from '@/app/utils/basePay';
 * 
 * async function handleCoinPurchase(usdAmount: string, coinAmount: string) {
 *   const { paymentId } = await initializeBasePay(
 *     treasuryWallet,
 *     usdAmount,
 *     userId,
 *     walletAddress,
 *     true // testnet
 *   );
 *   
 *   // Poll until payment completes
 *   const { completed } = await pollPaymentCompletion(paymentId);
 *   
 *   if (completed) {
 *     // Backend webhook automatically calls buyCoins()
 *     console.log('Coins purchased! Check your balance.');
 *   }
 * }
 * ```
 */
