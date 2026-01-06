import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { JWT_SECRET as SECRET_KEY } from './lib/jwt-secret';

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/register', '/track', '/complaint'];

// Role-based route permissions
const ROUTE_PERMISSIONS = {
  '/': ['admin'], // Only admin can see overview
  '/users': ['admin', 'developer'],
  '/plans': ['admin'],
  '/tickets': ['admin', 'developer', 'support'],
  '/chat': ['admin', 'developer', 'support'], // All authenticated users
  '/chatbot': ['admin'], // Only admin can see chatbot analytics
  '/analytics': ['admin'],
  '/admin-panel': ['admin']
};

// Default redirect routes based on role
const DEFAULT_ROUTES = {
  'admin': '/',
  'developer': '/users',
  'support': '/tickets'
};

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // Get session token
  const token = request.cookies.get('dashboard_session');

  // Redirect to login if no token
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Verify token
    const { payload } = await jwtVerify(token.value, SECRET_KEY);

    // Check if user is approved (should be handled during login, but double check)
    if (!payload.role) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Check route permissions
    const allowedRoles = ROUTE_PERMISSIONS[pathname];
    
    if (allowedRoles && !allowedRoles.includes(payload.role)) {
      // Redirect to appropriate page based on role
      const defaultRoute = DEFAULT_ROUTES[payload.role] || '/tickets';
      return NextResponse.redirect(new URL(defaultRoute, request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Token verification failed:', error);
    // Clear invalid token and redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('dashboard_session');
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png).*)',
  ],
};

