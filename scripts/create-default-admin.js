#!/usr/bin/env node

/**
 * Create Default Admin User
 * Creates admin user with default credentials
 */

require('dotenv').config({ path: '.env.local' });
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

async function createDefaultAdmin() {
  // Default admin credentials
  const email = 'admin@3vltn.com';
  const password = 'admin123';
  const fullName = 'System Administrator';

  console.log('\n🔐 Creating default admin user...\n');

  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO dashboard_users (email, password_hash, full_name, role, is_approved, is_active)
       VALUES ($1, $2, $3, 'admin', true, true)
       RETURNING id, email, full_name, role`,
      [email, passwordHash, fullName]
    );

    await pool.end();

    console.log('✅ Admin user created successfully!\n');
    console.log('=' .repeat(50));
    console.log('\n📋 Login Credentials:');
    console.log('   Email:    admin@3vltn.com');
    console.log('   Password: admin123');
    console.log('\n⚠️  IMPORTANT: Change this password after first login!');
    console.log('\n🚀 Login at: http://localhost:3001/login\n');

  } catch (error) {
    if (error.code === '23505') {
      console.log('ℹ️  Admin user already exists\n');
      console.log('   Email: admin@3vltn.com');
      console.log('   Password: admin123 (if not changed)\n');
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

createDefaultAdmin();

