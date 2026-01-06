// Shared JWT secret for consistent token signing and verification
// This ensures both session.js and middleware.js use the exact same secret

const getJWTSecret = () => {
  const secret = process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET;
  
  if (!secret) {
    console.warn('⚠️  JWT_SECRET not found, using default (not secure for production)');
    return 'your-secret-key-change-this-in-production-3vltn-dashboard-2024';
  }
  
  return secret;
};

export const JWT_SECRET = new TextEncoder().encode(getJWTSecret());
export const COOKIE_NAME = 'dashboard_session';

