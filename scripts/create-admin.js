#!/usr/bin/env node

/**
 * Create Admin User Script
 * 
 * This script creates an admin user in the dashboard_users table.
 * Run it once to create your first admin user.
 * 
 * Usage: node scripts/create-admin.js
 */

require('dotenv').config({ path: '.env.local' });
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createAdmin() {
  console.log('\n🔐 3VLTN Dashboard - Create Admin User\n');
  console.log('=' .repeat(50));

  // Check DATABASE_URL
  if (!process.env.DATABASE_URL) {
    console.error('\n❌ Error: DATABASE_URL not found in .env.local');
    console.log('\n💡 Tip: Copy env.example to .env.local and configure it.\n');
    process.exit(1);
  }

  try {
    // Get user input
    const email = await question('\n📧 Enter admin email: ');
    const fullName = await question('👤 Enter full name: ');
    const password = await question('🔑 Enter password (min 8 chars): ');
    const confirmPassword = await question('🔑 Confirm password: ');

    // Validate input
    if (!email || !fullName || !password) {
      console.error('\n❌ Error: All fields are required\n');
      rl.close();
      process.exit(1);
    }

    if (password.length < 8) {
      console.error('\n❌ Error: Password must be at least 8 characters\n');
      rl.close();
      process.exit(1);
    }

    if (password !== confirmPassword) {
      console.error('\n❌ Error: Passwords do not match\n');
      rl.close();
      process.exit(1);
    }

    console.log('\n⏳ Creating admin user...\n');

    // Connect to database
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert admin user
    const result = await pool.query(
      `INSERT INTO dashboard_users (email, password_hash, full_name, role, is_approved, is_active)
       VALUES ($1, $2, $3, 'admin', true, true)
       RETURNING id, email, full_name, role, is_approved, created_at`,
      [email, passwordHash, fullName]
    );

    await pool.end();

    console.log('✅ Admin user created successfully!\n');
    console.log('=' .repeat(50));
    console.log('\nUser Details:');
    console.log('  ID:', result.rows[0].id);
    console.log('  Email:', result.rows[0].email);
    console.log('  Name:', result.rows[0].full_name);
    console.log('  Role:', result.rows[0].role);
    console.log('  Approved:', result.rows[0].is_approved);
    console.log('  Created:', result.rows[0].created_at);
    console.log('\n' + '=' .repeat(50));
    console.log('\n✨ You can now login at http://localhost:3000/login\n');

    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating admin user:', error.message);
    
    if (error.code === '23505') {
      console.log('\n💡 Tip: This email is already registered. Use a different email.\n');
    } else if (error.code === '42P01') {
      console.log('\n💡 Tip: dashboard_users table does not exist. Run the SQL setup first.\n');
      console.log('   See DATABASE_SETUP.md for instructions.\n');
    }
    
    rl.close();
    process.exit(1);
  }
}

createAdmin();

