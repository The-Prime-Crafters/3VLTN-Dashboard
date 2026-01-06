import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

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
    const result = await pool.query(
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
    const result = await pool.query(
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
    await pool.query(
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
    const result = await pool.query(
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
    const result = await pool.query(
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
    await pool.query('DELETE FROM dashboard_users WHERE id = $1', [userId]);
    return { success: true };
  } catch (error) {
    console.error('Error rejecting user:', error);
    throw error;
  }
}

// Get all dashboard users
export async function getAllDashboardUsers() {
  try {
    const result = await pool.query(
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

