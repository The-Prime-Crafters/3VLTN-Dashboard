#!/usr/bin/env node

/**
 * Database Setup Script
 * 
 * Automatically creates the dashboard_users table in your Neon database.
 * 
 * Usage: node scripts/setup-database.js
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function setupDatabase() {
  console.log('\n🔧 3VLTN Dashboard - Database Setup\n');
  console.log('=' .repeat(60));

  // Check DATABASE_URL
  if (!process.env.DATABASE_URL) {
    console.error('\n❌ Error: DATABASE_URL not found in .env.local');
    console.log('\n💡 Tip: Copy env.example to .env.local and configure it.\n');
    process.exit(1);
  }

  console.log('\n⏳ Connecting to database...\n');

  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });

    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful\n');

    // Check if table already exists
    console.log('⏳ Checking if dashboard_users table exists...\n');
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'dashboard_users'
      );
    `);

    if (tableCheck.rows[0].exists) {
      console.log('⚠️  Table dashboard_users already exists');
      console.log('   Skipping table creation.\n');
      await pool.end();
      console.log('=' .repeat(60));
      console.log('\n✅ Database is ready!\n');
      console.log('Next step: npm run create-admin\n');
      process.exit(0);
    }

    console.log('⏳ Creating dashboard_users table...\n');

    // Create table
    await pool.query(`
      CREATE TABLE dashboard_users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role = ANY (ARRAY['admin'::text, 'developer'::text, 'support'::text])),
        is_approved BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        approved_at TIMESTAMP WITH TIME ZONE,
        approved_by INTEGER REFERENCES dashboard_users(id),
        last_login TIMESTAMP WITH TIME ZONE
      );
    `);

    console.log('✅ Table created successfully\n');

    console.log('⏳ Creating indexes...\n');

    // Create indexes
    await pool.query('CREATE INDEX idx_dashboard_users_email ON dashboard_users(email);');
    await pool.query('CREATE INDEX idx_dashboard_users_role ON dashboard_users(role);');

    console.log('✅ Indexes created successfully\n');

    // Verify table was created
    const verify = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'dashboard_users'
      ORDER BY ordinal_position;
    `);

    console.log('📋 Table structure:');
    console.log('');
    verify.rows.forEach(col => {
      console.log(`   - ${col.column_name.padEnd(20)} ${col.data_type}`);
    });

    await pool.end();

    console.log('\n' + '=' .repeat(60));
    console.log('\n✅ Database setup complete!\n');
    console.log('🚀 Next steps:');
    console.log('   1. npm run create-admin');
    console.log('   2. Visit http://localhost:3001/login\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error setting up database:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('   - Verify DATABASE_URL is correct in .env.local');
    console.log('   - Check your Neon database is accessible');
    console.log('   - Ensure you have permissions to create tables\n');
    process.exit(1);
  }
}

setupDatabase();

