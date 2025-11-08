/**
 * Place Bet Endpoint
 * 
 * Endpoint: POST /api/bets/place
 * Body: {
 *   walletAddress: string,
 *   matchId: string,
 *   amount: string (in PDC),
 *   prediction: string (e.g., "Home Win", "Away Win", "Draw")
 * }
 * 
 * Returns: {
 *   betId: number,
 *   transactionHash: string,
 *   status: "pending" | "confirmed"
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, createWalletClient, isAddress, parseUnits, formatUnits, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { BASE_MAINNET, BASE_SEPOLIA, PREDICTLY_COIN_ADDRESS, PREDICTLY_COIN_ABI, COIN_DECIMALS } from '@/app/config/contractConfig';

const getClients = () => {
  const network = process.env.BASE_NETWORK === 'mainnet' ? BASE_MAINNET : BASE_SEPOLIA;
  const publicClient = createPublicClient({
    chain: network,
    transport: http(),
  });

  const privateKey = process.env.PRIVATE_KEY as `0x${string}`;
  if (!privateKey) {
    throw new Error('PRIVATE_KEY not configured');
  }

  const account = privateKeyToAccount(privateKey);
  const walletClient = createWalletClient({
    account,
    chain: network,
    transport: http(),
  });

  return { publicClient, walletClient };
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, matchId, amount, prediction } = body;

    // Validation
    if (!walletAddress || !matchId || !amount || !prediction) {
      return NextResponse.json(
        { error: 'Missing required fields: walletAddress, matchId, amount, prediction' },
        { status: 400 }
      );
    }

    if (!isAddress(walletAddress)) {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
        { status: 400 }
      );
    }

    // Parse amount to wei
    let amountInWei: bigint;
    try {
      amountInWei = parseUnits(amount.toString(), COIN_DECIMALS);
    } catch {
      return NextResponse.json(
        { error: 'Invalid amount format' },
        { status: 400 }
      );
    }

    console.log('🎯 Processing bet placement...');
    console.log(`   Wallet: ${walletAddress}`);
    console.log(`   Match: ${matchId}`);
    console.log(`   Amount: ${amount} PDC`);
    console.log(`   Prediction: ${prediction}`);

    const { publicClient, walletClient } = getClients();
    const contractAddress = process.env.BASE_NETWORK === 'mainnet' 
      ? (PREDICTLY_COIN_ADDRESS.MAINNET as `0x${string}`)
      : (PREDICTLY_COIN_ADDRESS.TESTNET as `0x${string}`);

    // Check user balance first
    const balance = await publicClient.readContract({
      address: contractAddress,
      abi: PREDICTLY_COIN_ABI,
      functionName: 'getBalance',
      args: [walletAddress as `0x${string}`],
    });

    const balanceBigInt = BigInt(balance as string);
    if (balanceBigInt < amountInWei) {
      return NextResponse.json(
        {
          error: 'Insufficient balance',
          current: formatUnits(balanceBigInt, COIN_DECIMALS),
          required: amount,
        },
        { status: 400 }
      );
    }

    // Place bet
    console.log('📝 Calling placeBet contract function...');
    const hash = await walletClient.writeContract({
      address: contractAddress,
      abi: PREDICTLY_COIN_ABI,
      functionName: 'placeBet',
      args: [
        walletAddress as `0x${string}`,
        matchId,
        amountInWei,
        prediction,
      ],
    });

    console.log(`⏳ Transaction sent: ${hash}`);
    console.log('⏳ Waiting for confirmation...');

    // Wait for transaction
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    if (!receipt) {
      return NextResponse.json(
        { error: 'Transaction failed - no receipt' },
        { status: 500 }
      );
    }

    console.log(`✅ Transaction confirmed at block ${receipt.blockNumber}`);

    // Get user's bets to find latest bet ID
    const userBets = await publicClient.readContract({
      address: contractAddress,
      abi: PREDICTLY_COIN_ABI,
      functionName: 'getUserBets',
      args: [walletAddress as `0x${string}`],
    });

    const betIds = userBets as bigint[];
    const latestBetId = betIds.length > 0 ? Number(betIds[betIds.length - 1]) : 0;

    return NextResponse.json(
      {
        success: true,
        message: 'Bet placed successfully',
        betId: latestBetId,
        walletAddress,
        matchId,
        amount,
        prediction,
        transactionHash: hash,
        blockNumber: receipt.blockNumber,
        status: 'confirmed',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error placing bet:', error);
    return NextResponse.json(
      {
        error: 'Failed to place bet',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
