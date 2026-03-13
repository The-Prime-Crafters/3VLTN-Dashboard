import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

const BACKEND_API_BASE = 'https://3vltn.com';

async function resolveAdminKey(request) {
  const headerKey = request.headers.get('x-admin-key') || '';
  if (headerKey) return headerKey;

  const session = await getSession();
  if (session?.role === 'admin' && process.env.ADMIN_API_KEY) {
    return process.env.ADMIN_API_KEY;
  }

  return '';
}

export async function POST(request) {
  const adminKey = await resolveAdminKey(request);

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

