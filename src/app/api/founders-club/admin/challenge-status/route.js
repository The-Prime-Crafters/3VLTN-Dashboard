import { NextResponse } from 'next/server';

const BACKEND_API_BASE = 'https://3vltn.com';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  const adminKey = request.headers.get('x-admin-key') || '';

  if (!adminKey) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (!email) {
    return NextResponse.json({ success: false, error: 'email query param is required' }, { status: 400 });
  }

  try {
    const upstream = await fetch(`${BACKEND_API_BASE}/api/founders-club/admin/challenge-status?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'x-admin-key': adminKey
      },
      cache: 'no-store'
    });

    const payload = await upstream.json().catch(() => null);

    return NextResponse.json(
      payload || { success: false, error: 'Failed to fetch challenge status.' },
      { status: upstream.status }
    );
  } catch (error) {
    console.error('Admin challenge-status proxy error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch challenge status.' }, { status: 500 });
  }
}

