/**
 * Join Bet Endpoint (Counter-Betting)
 * 
 * Allows users to bet against an existing community bet
 * 
 * Endpoint: POST /api/bets/join
 * Body: {
 *   walletAddress: string,
 *   communityBetId: string,
 *   amount: string (in PDC),
 *   position: 'for' | 'against'
 * }
 * 
 * Returns: {
 *   success: boolean,
 *   betId: number (blockchain bet ID),
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

// Helper to get opposite prediction
function getOppositePrediction(prediction: string): string {
  const opposites: Record<string, string> = {
    'Home Win': 'Away Win',
    'Away Win': 'Home Win',
    'Draw': 'Not Draw', // For draw, opposite is "not draw" (either team wins)
    'Over 2.5': 'Under 2.5',
    'Under 2.5': 'Over 2.5',
  };
  return opposites[prediction] || `Not ${prediction}`;
}

// Helper to load community bet
async function getCommunityBet(communityBetId: string) {
  try {
    const filePath = path.join(process.cwd(), 'data', 'community-bets.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const bets = JSON.parse(fileContent);
    return bets.find((b: any) => b.id === communityBetId);
  } catch (error) {
    console.error('Error loading community bet:', error);
    return null;
  }
}

// Helper to update community bet
async function updateCommunityBet(communityBetId: string, updates: any) {
  try {
    const filePath = path.join(process.cwd(), 'data', 'community-bets.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    let bets = JSON.parse(fileContent);
    
    const index = bets.findIndex((b: any) => b.id === communityBetId);
    if (index !== -1) {
      bets[index] = { ...bets[index], ...updates };
      await fs.writeFile(filePath, JSON.stringify(bets, null, 2));
    }
  } catch (error) {
    console.error('Error updating community bet:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, communityBetId, amount, position } = body;

    // Validation
    if (!walletAddress || !communityBetId || !amount || !position) {
      return NextResponse.json(
        { error: 'Missing required fields: walletAddress, communityBetId, amount, position' },
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

    // Get original bet
    const originalBet = await getCommunityBet(communityBetId);
    if (!originalBet) {
      return NextResponse.json(
        { error: 'Community bet not found' },
        { status: 404 }
      );
    }

    if (originalBet.status !== 'open') {
      return NextResponse.json(
        { error: 'This bet is no longer accepting counter-bets' },
        { status: 400 }
      );
    }

    // Prevent betting on your own bet
    if (originalBet.creator.toLowerCase() === walletAddress.toLowerCase()) {
      return NextResponse.json(
        { error: 'Cannot bet against your own bet' },
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

    // Determine prediction based on position
    const prediction = position === originalBet.position 
      ? originalBet.prediction 
      : getOppositePrediction(originalBet.prediction);

    console.log('🎯 Joining community bet...');
    console.log(`   Original Bet: ${communityBetId}`);
    console.log(`   Bettor: ${walletAddress}`);
    console.log(`   Amount: ${amount} PDC`);
    console.log(`   Position: ${position}`);
    console.log(`   Prediction: ${prediction}`);

    const { publicClient, walletClient } = getClients();
    const contractAddress = process.env.BASE_NETWORK === 'mainnet' 
      ? (PREDICTLY_COIN_ADDRESS.MAINNET as `0x${string}`)
      : (PREDICTLY_COIN_ADDRESS.TESTNET as `0x${string}`);

    // Check user balance
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
        originalBet.matchId,
        amountInWei,
        prediction,
      ],
    });

    console.log(`⏳ Transaction sent: ${hash}`);
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

    // Update community bet
    const counterBet = {
      betId: latestBetId,
      bettor: walletAddress,
      amount,
      prediction,
      position,
      transactionHash: hash,
      createdAt: Date.now(),
    };

    const updatedCounterBets = [...(originalBet.counterBets || []), counterBet];
    await updateCommunityBet(communityBetId, {
      counterBets: updatedCounterBets,
      status: 'matched',
    });

    console.log(`✅ Counter-bet added to community bet: ${communityBetId}`);

    return NextResponse.json(
      {
        success: true,
        message: 'Counter-bet placed successfully',
        betId: latestBetId,
        communityBetId,
        walletAddress,
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
    console.error('❌ Error joining bet:', error);
    return NextResponse.json(
      {
        error: 'Failed to join bet',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
