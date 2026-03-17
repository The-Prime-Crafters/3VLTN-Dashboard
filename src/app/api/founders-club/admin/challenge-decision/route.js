import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

const BACKEND_API_BASE = 'https://3vltn.com';

async function isAdminSession() {
  const session = await getSession();
  return session?.role === 'admin';
}

export async function POST(request) {
  const isAdmin = await isAdminSession();

  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'Forbidden: admin access required' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    };
    if (process.env.ADMIN_API_KEY) {
      headers['x-admin-key'] = process.env.ADMIN_API_KEY;
    }

    const upstream = await fetch(`${BACKEND_API_BASE}/api/founders-club/admin/challenge-decision`, {
      method: 'POST',
      headers,
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

