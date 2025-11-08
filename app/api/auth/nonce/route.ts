import { NextResponse } from "next/server";

export async function GET() {
  // Generate a simple nonce for authentication
  const nonce = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
  return NextResponse.json({ nonce });
}
