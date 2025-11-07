import { NextRequest, NextResponse } from "next/server";
import { isValidConfig } from '../../../config/base';

const base = null;
  apiKey: process.env.BASE_API_KEY!,
  projectId: process.env.BASE_PROJECT_ID!,
});

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const [userProfile, userPredictions, userStats] = await Promise.all([
      base.users.get(params.userId),
      base.predictions.list({ userId: params.userId, limit: 10 }),
      base.users.getStats(params.userId)
    ]);

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

    const updatedProfile = await base.users.update(params.userId, {
      displayName,
      bio,
      avatarUrl
    });

    return NextResponse.json(updatedProfile);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}