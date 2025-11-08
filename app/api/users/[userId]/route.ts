import { NextRequest, NextResponse } from "next/server";

// Mock user data for demo purposes
const mockUsers: any = {};
const mockPredictions: any = {};

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const userProfile = mockUsers[params.userId] || {
      id: params.userId,
      displayName: 'User ' + params.userId,
      bio: 'Prediction enthusiast',
      avatarUrl: null,
      joinedAt: new Date()
    };

    const userPredictions = mockPredictions[params.userId] || [];

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

export async function PUT(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const body = await request.json();
    const { displayName, bio, avatarUrl } = body;

    const updatedProfile = {
      id: params.userId,
      displayName,
      bio,
      avatarUrl,
      updatedAt: new Date()
    };

    mockUsers[params.userId] = updatedProfile;

    return NextResponse.json(updatedProfile);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}