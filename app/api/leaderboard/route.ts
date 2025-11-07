import { NextRequest, NextResponse } from "next/server";
import { BASE } from '@baseapp/sdk';

const base = new BASE({
  apiKey: process.env.BASE_API_KEY!,
  projectId: process.env.BASE_PROJECT_ID!,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    const leaderboard = await base.leaderboard.get({
      limit,
      offset,
      orderBy: 'score',
      order: 'desc'
    });

    return NextResponse.json(leaderboard);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}