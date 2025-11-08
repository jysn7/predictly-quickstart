import { NextRequest, NextResponse } from "next/server";

// In-memory storage for demo purposes
const bets: any[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const predictionId = searchParams.get('predictionId');
    const userId = searchParams.get('userId');
    
    const filteredBets = bets.filter(bet => {
      if (predictionId && bet.predictionId !== predictionId) return false;
      if (userId && bet.userId !== userId) return false;
      return true;
    });

    return NextResponse.json(filteredBets);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, predictionId, amount, transactionHash } = body;

    if (!userId || !predictionId || !amount || !transactionHash) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newBet = {
      id: `bet_${Date.now()}`,
      userId,
      predictionId,
      amount,
      transactionHash,
      status: 'placed',
      createdAt: new Date(),
    };

    bets.push(newBet);
    return NextResponse.json(newBet);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}