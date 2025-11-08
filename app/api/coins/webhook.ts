/**
 * Base Pay Webhook Handler
 * 
 * This endpoint receives webhooks from Base Pay when a user successfully
 * purchases coins. It then calls the smart contract to mint coins to their wallet.
 * 
 * Setup in Base Pay Dashboard:
 * 1. Add webhook URL: https://yourdomain.com/api/coins/webhook
 * 2. Events: payment.confirmed, payment.failed
 * 3. Keep webhook secret secure - used for signature verification
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createWalletClient, createPublicClient, parseUnits, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { BASE_MAINNET, BASE_SEPOLIA, PREDICTLY_COIN_ADDRESS, PREDICTLY_COIN_ABI, COIN_DECIMALS } from '@/app/config/contractConfig';

// Initialize clients for contract interaction
const getClients = () => {
  const network = process.env.BASE_NETWORK === 'mainnet' ? BASE_MAINNET : BASE_SEPOLIA;
  
  const publicClient = createPublicClient({
    chain: network,
    transport: http(),
  });

  const privateKey = process.env.PRIVATE_KEY as `0x${string}`;
  if (!privateKey) {
    throw new Error('PRIVATE_KEY environment variable not set');
  }

  const account = privateKeyToAccount(privateKey);
  const walletClient = createWalletClient({
    account,
    chain: network,
    transport: http(),
  });

  return { publicClient, walletClient };
};

// Verify webhook signature from Base Pay
const verifyWebhookSignature = (
  payload: string,
  signature: string,
  secret: string
): boolean => {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
};

export async function POST(request: NextRequest) {
  try {
    // Get webhook secret from environment
    const webhookSecret = process.env.BASE_PAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('BASE_PAY_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Get raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get('x-webhook-signature') || '';

    // Verify webhook signature
    try {
      verifyWebhookSignature(rawBody, signature, webhookSecret);
    } catch (error) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse webhook payload
    const payload = JSON.parse(rawBody);
    
    console.log('📬 Webhook received:', {
      event: payload.event,
      paymentId: payload.data?.paymentId,
      userId: payload.data?.metadata?.userId,
      amount: payload.data?.amount,
    });

    // Handle payment.confirmed event
    if (payload.event === 'payment.confirmed') {
      const {
        data: {
          paymentId,
          amount,
          currency,
          metadata: { userId, walletAddress },
        },
      } = payload;

      // Validate required fields
      if (!userId || !walletAddress || !amount) {
        console.error('Missing required fields in webhook');
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      try {
        const { publicClient, walletClient } = getClients();
        const contractAddress = process.env.BASE_NETWORK === 'mainnet' 
          ? (PREDICTLY_COIN_ADDRESS.MAINNET as `0x${string}`)
          : (PREDICTLY_COIN_ADDRESS.TESTNET as `0x${string}`);

        // Convert amount to wei
        const amountInWei = parseUnits(amount.toString(), COIN_DECIMALS);

        console.log('🔄 Calling buyCoins contract function...');
        console.log(`   Recipient: ${walletAddress}`);
        console.log(`   Amount: ${amount} PDC (${amountInWei} wei)`);

        // Call buyCoins function on smart contract
        const hash = await walletClient.writeContract({
          address: contractAddress,
          abi: PREDICTLY_COIN_ABI,
          functionName: 'buyCoins',
          args: [walletAddress as `0x${string}`, amountInWei],
        });

        // Wait for confirmation
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        console.log('✅ Coins purchased successfully');
        console.log(`   Transaction: ${hash}`);
        console.log(`   Block: ${receipt.blockNumber}`);

        // Log to database (optional)
        await logCoinPurchase({
          paymentId,
          userId,
          walletAddress,
          amount: amount.toString(),
          currency,
          txHash: hash,
          status: 'confirmed',
        });

        return NextResponse.json(
          {
            success: true,
            message: 'Coins purchased successfully',
            txHash: hash,
          },
          { status: 200 }
        );
      } catch (error) {
        console.error('❌ Error processing coin purchase:', error);
        
        // Log failed transaction
        await logCoinPurchase({
          paymentId,
          userId,
          walletAddress,
          amount: amount.toString(),
          currency,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        return NextResponse.json(
          {
            success: false,
            error: 'Failed to process coin purchase',
            details: error instanceof Error ? error.message : 'Unknown error',
          },
          { status: 500 }
        );
      }
    }

    // Handle payment.failed event
    if (payload.event === 'payment.failed') {
      const {
        data: {
          paymentId,
          metadata: { userId, walletAddress },
        },
      } = payload;

      console.log('❌ Payment failed:', { paymentId, userId });

      // Log failed payment
      await logCoinPurchase({
        paymentId,
        userId,
        walletAddress,
        status: 'failed',
        error: 'Payment failed at processor',
      });

      return NextResponse.json(
        { success: false, message: 'Payment failed' },
        { status: 200 }
      );
    }

    // Unknown event
    return NextResponse.json(
      { success: false, error: 'Unknown event type' },
      { status: 400 }
    );
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Log coin purchase to database
 * TODO: Implement with your database (PostgreSQL, MongoDB, etc.)
 */
async function logCoinPurchase(data: {
  paymentId: string;
  userId: string;
  walletAddress: string;
  amount?: string;
  currency?: string;
  txHash?: string;
  status: string;
  error?: string;
}) {
  try {
    console.log('💾 Logging coin purchase to database:', {
      ...data,
      timestamp: new Date().toISOString(),
    });

    // TODO: Replace with actual database call
    /*
    await db.coinPurchases.create({
      paymentId: data.paymentId,
      userId: data.userId,
      walletAddress: data.walletAddress,
      amount: data.amount ? BigInt(parseUnits(data.amount, COIN_DECIMALS).toString()) : null,
      currency: data.currency,
      txHash: data.txHash,
      status: data.status,
      error: data.error,
      createdAt: new Date(),
    });
    */

    return true;
  } catch (error) {
    console.error('Error logging coin purchase:', error);
    return false;
  }
}
