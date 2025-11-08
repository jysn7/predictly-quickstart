import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";

// Simple in-memory nonce store (use Redis or DB in production)
const usedNonces = new Set<string>();

// Create viem client for signature verification
const client = createPublicClient({
  chain: base,
  transport: http(),
});

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const address = url.searchParams.get("address");

    if (address) {
      // Redirect to dashboard after successful authentication
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } else {
      // Handle error case
      return NextResponse.redirect(new URL("/", request.url));
    }
  } catch (error) {
    console.error("Base Account callback error:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, message, signature } = body;

    if (!address || !message || !signature) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Extract nonce from SIWE message
    const nonceMatch = message.match(/Nonce: (\w+)/);
    const nonce = nonceMatch ? nonceMatch[1] : null;

    // Check if nonce has been used
    if (!nonce) {
      return NextResponse.json(
        { error: "Invalid message format" },
        { status: 400 }
      );
    }

    if (usedNonces.has(nonce)) {
      return NextResponse.json(
        { error: "Nonce already used" },
        { status: 400 }
      );
    }

    // Verify signature (viem handles ERC-6492 automatically)
    const valid = await client.verifyMessage({
      address: address as `0x${string}`,
      message,
      signature: signature as `0x${string}`,
    });

    if (!valid) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    // Mark nonce as used
    usedNonces.add(nonce);

    // Create session (in production, use secure session management)
    const session = {
      address,
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    };

    return NextResponse.json({ success: true, session });
  } catch (error: any) {
    console.error("Auth verification error:", error);
    return NextResponse.json(
      { error: error.message || "Verification failed" },
      { status: 500 }
    );
  }
}