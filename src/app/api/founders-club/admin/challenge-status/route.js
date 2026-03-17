import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

const BACKEND_API_BASE = 'https://3vltn.com';

async function isAdminSession() {
  const session = await getSession();
  return session?.role === 'admin';
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  const isAdmin = await isAdminSession();

  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'Forbidden: admin access required' }, { status: 403 });
  }

  if (!email) {
    return NextResponse.json({ success: false, error: 'email query param is required' }, { status: 400 });
  }

  try {
    const headers = { Accept: 'application/json' };
    if (process.env.ADMIN_API_KEY) {
      headers['x-admin-key'] = process.env.ADMIN_API_KEY;
    }

    const upstream = await fetch(`${BACKEND_API_BASE}/api/founders-club/admin/challenge-status?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers,
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

