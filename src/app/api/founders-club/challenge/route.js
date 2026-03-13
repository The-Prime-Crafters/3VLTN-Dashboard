import { NextResponse } from 'next/server';

const BACKEND_API_BASE = process.env.BACKEND_API_URL || 'https://api.3vltn.com';

export async function POST(request) {
  try {
    const body = await request.json();

    const upstream = await fetch(`${BACKEND_API_BASE}/api/founders-club/challenge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(body),
      cache: 'no-store'
    });

    const payload = await upstream.json().catch(() => null);

    return NextResponse.json(
      payload || { success: false, error: 'Failed to submit challenge.' },
      { status: upstream.status }
    );
  } catch (error) {
    console.error('Challenge proxy error:', error);
    return NextResponse.json({ success: false, error: 'Failed to submit challenge.' }, { status: 500 });
  }
}
