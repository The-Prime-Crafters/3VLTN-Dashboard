import { NextResponse } from 'next/server';

const BACKEND_API_BASE = process.env.BACKEND_API_URL || 'https://api.3vltn.com';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized: userId required' }, { status: 401 });
  }

  try {
    const upstream = await fetch(`${BACKEND_API_BASE}/api/domains?userId=${encodeURIComponent(userId)}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store'
    });

    const payload = await upstream.json().catch(() => null);

    if (!upstream.ok) {
      return NextResponse.json(
        payload || { error: 'Internal server error' },
        { status: upstream.status }
      );
    }

    return NextResponse.json(payload || { domains: [] }, { status: 200 });
  } catch (error) {
    console.error('Domains proxy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
