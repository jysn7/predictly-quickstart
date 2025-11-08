import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for bets (in production, use a database)
const bets: any[] = [];
let betIdCounter = 1;

// Interface for a bet
interface BetData {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  sport: string;
  prediction: string; // e.g., "Home Win", "Away Win", "Draw"
  confidence: number; // 0-100
  location: string;
  matchDateTime: string;
  userId: string; // Wallet address or user ID
  username?: string;
  timestamp: number;
  likes: number;
  likedBy: string[];
  shareToken?: string; // For sharing predictions
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      matchId,
      homeTeam,
      awayTeam,
      sport,
      prediction,
      confidence,
      location,
      matchDateTime,
      userId,
      username,
    } = body;

    // Validate required fields
    if (!matchId || !prediction || !userId || confidence === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate unique share token
    const shareToken = `share_${betIdCounter}_${Math.random().toString(36).substr(2, 9)}`;

    const newBet = {
      id: `bet_${betIdCounter++}`,
      matchId,
      homeTeam,
      awayTeam,
      sport,
      prediction,
      confidence: Math.min(Math.max(parseInt(confidence), 0), 100),
      location,
      matchDateTime,
      userId,
      username: username || `User_${userId.substring(0, 6)}`,
      timestamp: Date.now(),
      likes: 0,
      likedBy: [],
      shareToken,
    };

    bets.push(newBet);

    return NextResponse.json({
      success: true,
      bet: newBet,
      shareUrl: `/shared-prediction?token=${shareToken}`,
    });
  } catch (error) {
    console.error('Error creating bet:', error);
    return NextResponse.json(
      { error: 'Failed to create bet' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const matchId = searchParams.get('matchId');
    const shareToken = searchParams.get('shareToken');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let filtered = bets;

    // Filter by user ID
    if (userId) {
      filtered = filtered.filter(b => b.userId === userId);
    }

    // Filter by match ID
    if (matchId) {
      filtered = filtered.filter(b => b.matchId === matchId);
    }

    // Filter by share token (for shared predictions)
    if (shareToken) {
      filtered = filtered.filter(b => b.shareToken === shareToken);
    }

    // Sort by timestamp (newest first)
    filtered = filtered.sort((a, b) => b.timestamp - a.timestamp);

    // Pagination
    const paginatedBets = filtered.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      bets: paginatedBets,
      total: filtered.length,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching bets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bets' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { betId, action, userId } = body;

    // Validate required fields
    if (!betId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const bet = bets.find(b => b.id === betId);
    if (!bet) {
      return NextResponse.json(
        { error: 'Bet not found' },
        { status: 404 }
      );
    }

    // Handle like/unlike
    if (action === 'like') {
      if (!bet.likedBy.includes(userId)) {
        bet.likedBy.push(userId);
        bet.likes += 1;
      }
    } else if (action === 'unlike') {
      const index = bet.likedBy.indexOf(userId);
      if (index > -1) {
        bet.likedBy.splice(index, 1);
        bet.likes -= 1;
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      bet,
    });
  } catch (error) {
    console.error('Error updating bet:', error);
    return NextResponse.json(
      { error: 'Failed to update bet' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { betId, userId } = body;

    if (!betId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const betIndex = bets.findIndex(b => b.id === betId && b.userId === userId);
    if (betIndex === -1) {
      return NextResponse.json(
        { error: 'Bet not found or unauthorized' },
        { status: 404 }
      );
    }

    const deletedBet = bets.splice(betIndex, 1);

    return NextResponse.json({
      success: true,
      message: 'Bet deleted successfully',
      bet: deletedBet[0],
    });
  } catch (error) {
    console.error('Error deleting bet:', error);
    return NextResponse.json(
      { error: 'Failed to delete bet' },
      { status: 500 }
    );
  }
}
