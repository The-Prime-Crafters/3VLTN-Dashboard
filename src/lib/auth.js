import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  // Connection pool settings
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection could not be established
});

// Handle connection errors gracefully
pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

// Helper function to retry queries on connection errors
async function queryWithRetry(text, params, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await pool.query(text, params);
    } catch (error) {
      // Check if it's a connection error that might be retryable
      if (
        (error.code === 'EAI_AGAIN' || 
         error.code === 'ECONNREFUSED' || 
         error.code === 'ETIMEDOUT' ||
         error.message?.includes('getaddrinfo')) &&
        i < retries - 1
      ) {
        console.warn(`Database query failed (attempt ${i + 1}/${retries}), retrying...`, error.message);
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        continue;
      }
      throw error;
    }
  }
}

// Role-based permissions
export const PERMISSIONS = {
  admin: ['dashboard', 'users', 'plans', 'issues', 'analytics', 'admin-panel'],
  developer: ['dashboard', 'users', 'issues'],
  support: ['dashboard', 'issues']
};

// Check if user has permission to access a route
export function hasPermission(role, resource) {
  if (!role || !PERMISSIONS[role]) {
    return false;
  }
  return PERMISSIONS[role].includes(resource);
}

// Get user by email
export async function getDashboardUser(email) {
  try {
    const result = await queryWithRetry(
      'SELECT id, email, password_hash, full_name, role, is_approved, is_active, last_login FROM dashboard_users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching dashboard user:', error);
    throw error;
  }
}

// Create new dashboard user
export async function createDashboardUser(email, passwordHash, fullName, role) {
  try {
    const result = await queryWithRetry(
      `INSERT INTO dashboard_users (email, password_hash, full_name, role, is_approved, is_active)
       VALUES ($1, $2, $3, $4, false, true)
       RETURNING id, email, full_name, role, is_approved, created_at`,
      [email, passwordHash, fullName, role]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating dashboard user:', error);
    throw error;
  }
}

// Update last login
export async function updateLastLogin(userId) {
  try {
    await queryWithRetry(
      'UPDATE dashboard_users SET last_login = NOW() WHERE id = $1',
      [userId]
    );
  } catch (error) {
    console.error('Error updating last login:', error);
  }
}

// Get pending users for approval
export async function getPendingUsers() {
  try {
    const result = await queryWithRetry(
      `SELECT id, email, full_name, role, created_at 
       FROM dashboard_users 
       WHERE is_approved = false AND is_active = true
       ORDER BY created_at DESC`
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching pending users:', error);
    throw error;
  }
}

// Approve user
export async function approveUser(userId, approvedByUserId) {
  try {
    const result = await queryWithRetry(
      `UPDATE dashboard_users 
       SET is_approved = true, approved_at = NOW(), approved_by = $2, updated_at = NOW()
       WHERE id = $1
       RETURNING id, email, full_name, role, is_approved`,
      [userId, approvedByUserId]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error approving user:', error);
    throw error;
  }
}

// Reject/Delete user
export async function rejectUser(userId) {
  try {
    await queryWithRetry('DELETE FROM dashboard_users WHERE id = $1', [userId]);
    return { success: true };
  } catch (error) {
    console.error('Error rejecting user:', error);
    throw error;
  }
}

// Get all dashboard users
export async function getAllDashboardUsers() {
  try {
    const result = await queryWithRetry(
      `SELECT id, email, full_name, role, is_approved, is_active, created_at, last_login
       FROM dashboard_users
       ORDER BY created_at DESC`
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching all dashboard users:', error);
    throw error;
  }
}

