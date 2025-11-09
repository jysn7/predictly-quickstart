/**
 * Create Bet Endpoint
 * 
 * Allows users to create new bets that others can bet for or against
 * 
 * Endpoint: POST /api/bets/create
 * Body: {
 *   walletAddress: string,
 *   matchId: string,
 *   amount: string (in PDC),
 *   prediction: string (e.g., "Home Win", "Away Win", "Draw"),
 *   position: 'for' | 'against'
 * }
 * 
 * Returns: {
 *   success: boolean,
 *   betId: number (blockchain bet ID),
 *   communityBetId: string (frontend ID),
 *   transactionHash: string
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, createWalletClient, isAddress, parseUnits, formatUnits, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { BASE_MAINNET, BASE_SEPOLIA, PREDICTLY_COIN_ADDRESS, PREDICTLY_COIN_ABI, COIN_DECIMALS } from '@/app/config/contractConfig';
import { promises as fs } from 'fs';
import path from 'path';

const getClients = () => {
  const network = process.env.BASE_NETWORK === 'mainnet' ? BASE_MAINNET : BASE_SEPOLIA;
  const publicClient = createPublicClient({
    chain: network,
    transport: http(),
  });

  const privateKey = process.env.PRIVATE_KEY as `0x${string}`;
  if (!privateKey) {
    throw new Error('PRIVATE_KEY not configured in environment');
  }

  const account = privateKeyToAccount(privateKey);
  const walletClient = createWalletClient({
    account,
    chain: network,
    transport: http(),
  });

  return { publicClient, walletClient };
};

// Helper to store community bet data
async function storeCommunityBet(bet: any) {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    const filePath = path.join(dataDir, 'community-bets.json');

    // Ensure directory exists
    try {
      await fs.mkdir(dataDir, { recursive: true });
    } catch (err) {
      // Directory might already exist
    }

    // Read existing bets
    let bets = [];
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      bets = JSON.parse(fileContent);
    } catch (err) {
      // File doesn't exist yet, start with empty array
    }

    // Add new bet
    bets.push(bet);

    // Write back to file
    await fs.writeFile(filePath, JSON.stringify(bets, null, 2));
  } catch (error) {
    console.error('Error storing community bet:', error);
    // Don't throw - bet is already on blockchain
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, matchId, amount, prediction, position } = body;

    // Validation
    if (!walletAddress || !matchId || !amount || !prediction || !position) {
      return NextResponse.json(
        { error: 'Missing required fields: walletAddress, matchId, amount, prediction, position' },
        { status: 400 }
      );
    }

    if (!isAddress(walletAddress)) {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
        { status: 400 }
      );
    }

    if (!['for', 'against'].includes(position)) {
      return NextResponse.json(
        { error: 'Position must be "for" or "against"' },
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

    console.log('🎯 Creating community bet...');
    console.log(`   Creator: ${walletAddress}`);
    console.log(`   Match: ${matchId}`);
    console.log(`   Amount: ${amount} PDC`);
    console.log(`   Prediction: ${prediction}`);
    console.log(`   Position: ${position}`);

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

    // Place bet on blockchain
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

    // Create community bet record
    const communityBetId = `bet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const communityBet = {
      id: communityBetId,
      betId: latestBetId,
      creator: walletAddress,
      matchId,
      amount,
      prediction,
      position,
      odds: 2.0, // Default odds, can be calculated dynamically
      status: 'open',
      counterBets: [],
      resolved: false,
      won: null,
      transactionHash: hash,
      createdAt: Date.now(),
    };

    // Store community bet
    await storeCommunityBet(communityBet);

    console.log(`✅ Community bet created: ${communityBetId}`);

    return NextResponse.json(
      {
        success: true,
        message: 'Bet created successfully',
        betId: latestBetId,
        communityBetId,
        walletAddress,
        matchId,
        amount,
        prediction,
        position,
        transactionHash: hash,
        blockNumber: receipt.blockNumber,
        status: 'confirmed',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error creating bet:', error);
    return NextResponse.json(
      {
        error: 'Failed to create bet',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
