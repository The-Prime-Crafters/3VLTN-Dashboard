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

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'pending';
  const limit = searchParams.get('limit') || '200';
  const adminKey = await resolveAdminKey(request);

  if (!adminKey) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const upstream = await fetch(
      `${BACKEND_API_BASE}/api/founders-club/admin/challenges?status=${encodeURIComponent(status)}&limit=${encodeURIComponent(limit)}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'x-admin-key': adminKey
        },
        cache: 'no-store'
      }
    );

    const payload = await upstream.json().catch(() => null);

    return NextResponse.json(
      payload || { success: false, error: 'Failed to fetch challenge list.' },
      { status: upstream.status }
    );
  } catch (error) {
    console.error('Admin challenges proxy error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch challenge list.' }, { status: 500 });
  }
}
