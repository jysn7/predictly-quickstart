import { NextRequest, NextResponse } from "next/server";
import { isValidConfig } from '../../config/base';

// Simple demo fallback feed
const demoFeed = [
  {
    id: '1',
    userId: 'alice',
    prediction: 'Team A vs Team B',
    confidence: 78,
    createdAt: new Date().toISOString(),
    user: { id: 'alice', displayName: 'Alice', avatarUrl: '' }
  },
  {
    id: '2',
    userId: 'bob',
    prediction: 'Team C vs Team D',
    confidence: 65,
    createdAt: new Date().toISOString(),
    user: { id: 'bob', displayName: 'Bob', avatarUrl: '' }
  }
];

export async function GET(request: NextRequest) {
  try {
    // If BASE isn't configured, return demo feed
    if (!isValidConfig()) {
      return NextResponse.json({ items: demoFeed, nextCursor: null });
    }

    // TODO: implement real BASE integration when SDK or REST client is available
    return NextResponse.json({ items: demoFeed, nextCursor: null });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}