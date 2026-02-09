const { Pool } = require('pg');

// Create a connection pool with better configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  // Connection pool settings
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection could not be established
  // Retry configuration
  retry: {
    max: 3,
    delay: 1000
  }
});

// Test the connection
pool.on('connect', () => {
  console.log('Connected to Neon database');
});

pool.on('error', (err) => {
  console.error('Database connection error:', err);
  // Don't exit the process on pool errors, let the app handle it
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

module.exports = pool;
module.exports.queryWithRetry = queryWithRetry;
