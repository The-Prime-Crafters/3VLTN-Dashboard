#!/usr/bin/env node

/**
 * Get Admin User Information
 * Retrieves admin user ID, email, and other details from the database
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function getAdminInfo() {
  console.log('\n🔍 Fetching admin user information...\n');

  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    // Get admin user
    const result = await pool.query(
      `SELECT id, email, full_name, role, is_approved, is_active, created_at, last_login
       FROM dashboard_users
       WHERE role = 'admin'
       ORDER BY id ASC
       LIMIT 1`
    );

    await pool.end();

    if (result.rows.length === 0) {
      console.log('❌ No admin user found in the database.\n');
      console.log('💡 Run: npm run quick-admin (or node scripts/create-default-admin.js)\n');
      return;
    }

    const admin = result.rows[0];

    console.log('='.repeat(60));
    console.log('👑 ADMIN USER INFORMATION');
    console.log('='.repeat(60));
    console.log(`\n📋 User ID:        ${admin.id}`);
    console.log(`📧 Email:          ${admin.email}`);
    console.log(`👤 Full Name:      ${admin.full_name}`);
    console.log(`🔑 Role:           ${admin.role}`);
    console.log(`✅ Approved:       ${admin.is_approved ? 'Yes' : 'No'}`);
    console.log(`🟢 Active:         ${admin.is_active ? 'Yes' : 'No'}`);
    console.log(`📅 Created:        ${admin.created_at ? new Date(admin.created_at).toLocaleString() : 'N/A'}`);
    console.log(`🕐 Last Login:     ${admin.last_login ? new Date(admin.last_login).toLocaleString() : 'Never'}`);
    console.log('\n' + '='.repeat(60));
    console.log('\n🔐 Default Credentials:');
    console.log(`   Email:    admin@3vltn.com`);
    console.log(`   Password: admin123`);
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');
    console.log('\n🚀 Login at: http://localhost:3000/login\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === '42P01') {
      console.log('\n💡 The dashboard_users table does not exist.');
      console.log('   Run: npm run setup-db (or node scripts/setup-database.js)\n');
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.log('\n💡 Cannot connect to database.');
      console.log('   Check your DATABASE_URL in .env.local\n');
    }
  }
}

getAdminInfo();

