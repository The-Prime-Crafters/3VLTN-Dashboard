import { NextResponse } from 'next/server';

const BACKEND_API_BASE = 'https://3vltn.com';

export async function POST(request) {
  const adminKey = request.headers.get('x-admin-key') || '';

  if (!adminKey) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    const upstream = await fetch(`${BACKEND_API_BASE}/api/founders-club/admin/challenge-decision`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'x-admin-key': adminKey
      },
      body: JSON.stringify(body),
      cache: 'no-store'
    });

    const payload = await upstream.json().catch(() => null);

    return NextResponse.json(
      payload || { success: false, error: 'Failed to apply challenge decision.' },
      { status: upstream.status }
    );
  } catch (error) {
    console.error('Admin challenge-decision proxy error:', error);
    return NextResponse.json({ success: false, error: 'Failed to apply challenge decision.' }, { status: 500 });
  }
}

