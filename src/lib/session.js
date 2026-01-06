import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { JWT_SECRET as SECRET_KEY, COOKIE_NAME } from './jwt-secret';

export async function createSession(user) {
  const token = await new SignJWT({
    id: user.id,
    email: user.email,
    role: user.role,
    fullName: user.full_name
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(SECRET_KEY);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 // 24 hours
  });

  return token;
}

export async function getSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME);

    if (!token) {
      return null;
    }

    const { payload } = await jwtVerify(token.value, SECRET_KEY);
    return payload;
  } catch (error) {
    console.error('Session verification error:', error);
    return null;
  }
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    return { authenticated: false, session: null };
  }
  return { authenticated: true, session };
}

export async function requireRole(allowedRoles) {
  const { authenticated, session } = await requireAuth();
  
  if (!authenticated) {
    return { authorized: false, session: null, message: 'Not authenticated' };
  }

  if (!allowedRoles.includes(session.role)) {
    return { authorized: false, session, message: 'Insufficient permissions' };
  }

  return { authorized: true, session };
}

