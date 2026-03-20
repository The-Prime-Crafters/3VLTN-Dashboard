import { NextResponse } from 'next/server';
import pool from '../../../../lib/db';

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS page_visits (
      id SERIAL PRIMARY KEY,
      page TEXT NOT NULL,
      session_id TEXT NOT NULL,
      utm_source TEXT,
      utm_medium TEXT,
      utm_campaign TEXT,
      ip TEXT,
      user_agent TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_page_visits_created_at ON page_visits (created_at);
    CREATE INDEX IF NOT EXISTS idx_page_visits_page ON page_visits (page);
  `);
}

export async function POST(request) {
  try {
    await ensureTable();
    const body = await request.json().catch(() => ({}));

    const page = body.page || 'unknown';
    const sessionId = body.sessionId || '';
    const utmSource = body.utm_source || null;
    const utmMedium = body.utm_medium || null;
    const utmCampaign = body.utm_campaign || null;

    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'sessionId is required' }, { status: 400 });
    }

    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      null;
    const userAgent = request.headers.get('user-agent') || null;

    await pool.query(
      `
      INSERT INTO page_visits (page, session_id, utm_source, utm_medium, utm_campaign, ip, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `,
      [page, sessionId, utmSource, utmMedium, utmCampaign, ip, userAgent]
    );

    const res = NextResponse.json({ success: true });
    res.headers.set('Access-Control-Allow-Origin', '*');
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    return res;
  } catch (error) {
    console.error('Error tracking visit:', error);
    return NextResponse.json({ success: false, error: 'Failed to track visit' }, { status: 500 });
  }
}

export async function OPTIONS() {
  const res = new NextResponse(null, { status: 204 });
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  res.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  return res;
}

