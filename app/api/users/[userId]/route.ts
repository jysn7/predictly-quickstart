import { NextRequest, NextResponse } from "next/server";

// Mock user data for demo purposes
const mockUsers: any = {};
const mockPredictions: any = {};

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params;
    
    const userProfile = mockUsers[userId] || {
      id: userId,
      displayName: 'User ' + userId,
      bio: 'Prediction enthusiast',
      avatarUrl: null,
      joinedAt: new Date()
    };

    const userPredictions = mockPredictions[userId] || [];

    const userStats = {
      totalPredictions: userPredictions.length,
      winRate: 0.65,
      totalBets: 0
    };

    return NextResponse.json({
      profile: userProfile,
      predictions: userPredictions,
      stats: userStats
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params;
    const body = await request.json();
    const { displayName, bio, avatarUrl } = body;

    const updatedProfile = {
      id: userId,
      displayName,
      bio,
      avatarUrl,
      updatedAt: new Date()
    };

    mockUsers[userId] = updatedProfile;

    return NextResponse.json(updatedProfile);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}