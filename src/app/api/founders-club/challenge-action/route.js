const BACKEND_API_BASE = process.env.BACKEND_API_URL || 'https://api.3vltn.com';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return new Response('Missing token', { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }

  try {
    const upstream = await fetch(`${BACKEND_API_BASE}/api/founders-club/challenge-action?token=${encodeURIComponent(token)}`, {
      method: 'GET',
      cache: 'no-store'
    });

    const html = await upstream.text();
    const contentType = upstream.headers.get('content-type') || 'text/html; charset=utf-8';

    return new Response(html, {
      status: upstream.status,
      headers: { 'Content-Type': contentType }
    });
  } catch (error) {
    console.error('Challenge action proxy error:', error);
    return new Response('<h1>Internal Server Error</h1>', {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
}
