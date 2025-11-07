import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { utils as ethersUtils } from 'ethers';
import jwt from 'jsonwebtoken';

// In-memory nonce store: address -> { nonce, expiresAt }
const nonces: Map<string, { nonce: string; expiresAt: number }> = new Map();

const NONCE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

function generateNonce() {
  return randomBytes(16).toString('hex');
}

function signSession(address: string) {
  const secret = process.env.SESSION_SECRET || 'dev-session-secret';
  const payload = { address };
  return jwt.sign(payload, secret, { expiresIn: SESSION_TTL_SECONDS });
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const address = (url.searchParams.get('address') || '').toLowerCase();

    if (!address) {
      return NextResponse.json({ error: 'Missing address query param' }, { status: 400 });
    }

    const nonce = generateNonce();
    const expiresAt = Date.now() + NONCE_TTL_MS;
    nonces.set(address, { nonce, expiresAt });

    return NextResponse.json({ nonce, expiresAt });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address: rawAddress, signature } = body || {};
    if (!rawAddress || !signature) {
      return NextResponse.json({ error: 'Missing address or signature' }, { status: 400 });
    }

    const address = String(rawAddress).toLowerCase();
    const entry = nonces.get(address);
    if (!entry) {
      return NextResponse.json({ error: 'No nonce for address or nonce expired' }, { status: 400 });
    }

    if (Date.now() > entry.expiresAt) {
      nonces.delete(address);
      return NextResponse.json({ error: 'Nonce expired' }, { status: 400 });
    }

    const message = `Sign in to Predictly: ${entry.nonce}`;

    let recovered: string;
    try {
      recovered = ethersUtils.verifyMessage(message, signature).toLowerCase();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid signature format' }, { status: 400 });
    }

    if (recovered !== address) {
      return NextResponse.json({ error: 'Signature does not match address' }, { status: 401 });
    }

    // signature verified: create session token
    const token = signSession(address);
    nonces.delete(address);

    return NextResponse.json({ success: true, address, token });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 });
  }
}

export const runtime = 'edge';
