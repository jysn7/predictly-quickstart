import { NextRequest, NextResponse } from "next/server";

// Mock leaderboard data for demo purposes
const mockLeaderboard = [
  { rank: 1, address: '0x1234...5678', username: 'PredictionMaster', score: 9500, winRate: 0.78 },
  { rank: 2, address: '0x2345...6789', username: 'CryptoSeer', score: 8750, winRate: 0.72 },
  { rank: 3, address: '0x3456...7890', username: 'BetWizard', score: 7800, winRate: 0.68 },
  { rank: 4, address: '0x4567...8901', username: 'DataDriven', score: 6900, winRate: 0.65 },
  { rank: 5, address: '0x5678...9012', username: 'FutureForecaster', score: 5800, winRate: 0.62 },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    const leaderboard = mockLeaderboard.slice(offset, offset + limit);

    return NextResponse.json({
      data: leaderboard,
      total: mockLeaderboard.length,
      limit,
      offset
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}