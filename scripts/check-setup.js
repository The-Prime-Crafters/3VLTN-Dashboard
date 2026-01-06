#!/usr/bin/env node

/**
 * Setup Checker Script
 * 
 * Verifies that all required components for RBAC are configured correctly.
 * 
 * Usage: node scripts/check-setup.js
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const fs = require('fs');

console.log('\n🔍 3VLTN Dashboard - Setup Verification\n');
console.log('=' .repeat(60));

let hasErrors = false;

// Check 1: Environment Variables
console.log('\n1️⃣  Checking Environment Variables...');
if (process.env.DATABASE_URL) {
  console.log('   ✅ DATABASE_URL is set');
} else {
  console.log('   ❌ DATABASE_URL is missing');
  hasErrors = true;
}

if (process.env.JWT_SECRET) {
  console.log('   ✅ JWT_SECRET is set');
  if (process.env.JWT_SECRET.length < 32) {
    console.log('   ⚠️  Warning: JWT_SECRET should be at least 32 characters');
  }
} else {
  console.log('   ❌ JWT_SECRET is missing');
  hasErrors = true;
}

// Check 2: Required Files
console.log('\n2️⃣  Checking Required Files...');
const requiredFiles = [
  'src/lib/auth.js',
  'src/lib/session.js',
  'src/middleware.js',
  'src/app/login/page.js',
  'src/app/register/page.js',
  'src/app/admin-panel/page.js'
];

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} is missing`);
    hasErrors = true;
  }
});

// Check 3: Dependencies
console.log('\n3️⃣  Checking Dependencies...');
try {
  require('bcryptjs');
  console.log('   ✅ bcryptjs installed');
} catch {
  console.log('   ❌ bcryptjs not installed');
  hasErrors = true;
}

try {
  require('jose');
  console.log('   ✅ jose installed');
} catch {
  console.log('   ❌ jose not installed');
  hasErrors = true;
}

try {
  require('pg');
  console.log('   ✅ pg installed');
} catch {
  console.log('   ❌ pg not installed');
  hasErrors = true;
}

// Check 4: Database Connection & Tables
async function checkDatabase() {
  if (!process.env.DATABASE_URL) {
    console.log('\n4️⃣  Skipping Database Check (DATABASE_URL not set)');
    return;
  }

  console.log('\n4️⃣  Checking Database Connection...');
  
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });

    // Test connection
    await pool.query('SELECT NOW()');
    console.log('   ✅ Database connection successful');

    // Check for dashboard_users table
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'dashboard_users'
      );
    `);

    if (tableCheck.rows[0].exists) {
      console.log('   ✅ dashboard_users table exists');

      // Check for admin user
      const adminCheck = await pool.query(`
        SELECT COUNT(*) as count 
        FROM dashboard_users 
        WHERE role = 'admin' AND is_approved = true
      `);

      const adminCount = parseInt(adminCheck.rows[0].count);
      if (adminCount > 0) {
        console.log(`   ✅ Found ${adminCount} approved admin user(s)`);
      } else {
        console.log('   ⚠️  No approved admin users found');
        console.log('      Run: node scripts/create-admin.js');
        hasErrors = true;
      }
    } else {
      console.log('   ❌ dashboard_users table does not exist');
      console.log('      Run the SQL setup from DATABASE_SETUP.md');
      hasErrors = true;
    }

    await pool.end();
  } catch (error) {
    console.log('   ❌ Database error:', error.message);
    hasErrors = true;
  }
}

// Run async checks
checkDatabase().then(() => {
  console.log('\n' + '=' .repeat(60));
  
  if (!hasErrors) {
    console.log('\n✅ All checks passed! Your setup is ready.');
    console.log('\n🚀 Next steps:');
    console.log('   1. npm run dev');
    console.log('   2. Visit http://localhost:3000/login');
    console.log('   3. Login with your admin credentials\n');
  } else {
    console.log('\n❌ Setup incomplete. Please fix the issues above.');
    console.log('\n📖 Documentation:');
    console.log('   - RBAC_SETUP.md - Quick setup guide');
    console.log('   - DATABASE_SETUP.md - Database schema');
    console.log('   - SECURITY_GUIDE.md - Security documentation\n');
  }

  process.exit(hasErrors ? 1 : 0);
});

