import { NextResponse } from 'next/server';
import pool from '../../../../lib/db';

export async function GET() {
  try {
    const [summary, byDay, sources] = await Promise.all([
      pool.query(`
        SELECT
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') AS last_30_days,
          COUNT(*) FILTER (WHERE created_at::date = CURRENT_DATE) AS today
        FROM page_visits
        WHERE page = 'landing'
      `),
      pool.query(`
        SELECT
          to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS day,
          COUNT(*) AS visits
        FROM page_visits
        WHERE page = 'landing'
          AND created_at >= NOW() - INTERVAL '14 days'
        GROUP BY 1
        ORDER BY 1
      `),
      pool.query(`
        SELECT
          COALESCE(utm_source, 'unknown') AS source,
          COUNT(*) AS count
        FROM page_visits
        WHERE page = 'landing'
          AND created_at >= NOW() - INTERVAL '30 days'
        GROUP BY 1
        ORDER BY count DESC
        LIMIT 10
      `)
    ]);

    return NextResponse.json({
      totals: {
        last30Days: parseInt(summary.rows[0]?.last_30_days || 0),
        today: parseInt(summary.rows[0]?.today || 0)
      },
      byDay: byDay.rows.map(r => ({ day: r.day, visits: parseInt(r.visits) })),
      sources: sources.rows.map(r => ({ source: r.source, count: parseInt(r.count) }))
    });
  } catch (error) {
    console.error('Error fetching landing visits:', error);
    return NextResponse.json({ error: 'Failed to fetch landing visits' }, { status: 500 });
  }
}

