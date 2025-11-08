/**
 * Get User Coin Balance
 * 
 * Endpoint: GET /api/coins/balance?walletAddress=0x...
 * Returns: Current PDC balance for the user
 */

import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, isAddress, formatUnits, http } from 'viem';
import { BASE_MAINNET, BASE_SEPOLIA, PREDICTLY_COIN_ADDRESS, PREDICTLY_COIN_ABI, COIN_DECIMALS } from '@/app/config/contractConfig';

const getClient = () => {
  const network = process.env.BASE_NETWORK === 'mainnet' ? BASE_MAINNET : BASE_SEPOLIA;
  return createPublicClient({
    chain: network,
    transport: http(),
  });
};

export async function GET(request: NextRequest) {
  try {
    const walletAddress = request.nextUrl.searchParams.get('walletAddress');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'walletAddress parameter required' },
        { status: 400 }
      );
    }

    // Validate address format
    if (!isAddress(walletAddress)) {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
        { status: 400 }
      );
    }

    const client = getClient();
    const contractAddress = process.env.BASE_NETWORK === 'mainnet' 
      ? (PREDICTLY_COIN_ADDRESS.MAINNET as `0x${string}`)
      : (PREDICTLY_COIN_ADDRESS.TESTNET as `0x${string}`);

    // Get current balance
    const balance = await client.readContract({
      address: contractAddress,
      abi: PREDICTLY_COIN_ABI,
      functionName: 'getBalance',
      args: [walletAddress as `0x${string}`],
    });

    const formattedBalance = formatUnits(BigInt(balance as string), COIN_DECIMALS);

    // Get detailed stats
    const stats = await client.readContract({
      address: contractAddress,
      abi: PREDICTLY_COIN_ABI,
      functionName: 'getUserCoinStats',
      args: [walletAddress as `0x${string}`],
    });

    const statsArray = stats as [bigint, bigint, bigint, bigint];

    return NextResponse.json(
      {
        success: true,
        walletAddress,
        balance: formattedBalance,
        stats: {
          current: formatUnits(statsArray[0], COIN_DECIMALS),
          purchased: formatUnits(statsArray[1], COIN_DECIMALS),
          won: formatUnits(statsArray[2], COIN_DECIMALS),
          withdrawn: formatUnits(statsArray[3], COIN_DECIMALS),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error getting balance:', error);
    return NextResponse.json(
      { error: 'Failed to get balance', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
