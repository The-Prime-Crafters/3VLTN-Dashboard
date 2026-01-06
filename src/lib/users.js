const pool = require('./db');

// Get all users with pagination
async function getUsers(limit = 10, offset = 0, search = '', status = 'all', subsTier = 'all') {
  let query = `
    SELECT 
      id,
      firebase_uid,
      email,
      subs_tier,
      created_at,
      updated_at,
      first_name,
      last_name,
      username,
      is_google_auth,
      subscription_status,
      last_payment_date,
      next_payment_date,
      phone,
      company,
      mailgun_configured
    FROM users
    WHERE 1=1
  `;
  
  const params = [];
  let paramCount = 0;

  // Add search filter
  if (search) {
    paramCount++;
    query += ` AND (email ILIKE $${paramCount} OR first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount} OR username ILIKE $${paramCount})`;
    params.push(`%${search}%`);
  }

  // Add status filter
  if (status !== 'all') {
    paramCount++;
    query += ` AND subscription_status = $${paramCount}`;
    params.push(status);
  }

  // Add subscription tier filter
  if (subsTier !== 'all') {
    paramCount++;
    query += ` AND subs_tier = $${paramCount}`;
    params.push(subsTier);
  }

  query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
  params.push(limit, offset);

  try {
    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

// Get user statistics
async function getUserStats() {
  try {
    const queries = await Promise.all([
      // Total users
      pool.query('SELECT COUNT(*) as total FROM users'),
      
      // Users by subscription tier
      pool.query(`
        SELECT 
          subs_tier,
          COUNT(*) as count
        FROM users 
        GROUP BY subs_tier
      `),
      
      // Users by subscription status
      pool.query(`
        SELECT 
          subscription_status,
          COUNT(*) as count
        FROM users 
        GROUP BY subscription_status
      `),
      
      // New users this month
      pool.query(`
        SELECT COUNT(*) as new_this_month
        FROM users 
        WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
      `),
      
      // Active users (last 30 days)
      pool.query(`
        SELECT COUNT(*) as active_users
        FROM users 
        WHERE updated_at >= CURRENT_DATE - INTERVAL '30 days'
      `)
    ]);

    const [totalResult, tierResult, statusResult, newThisMonthResult, activeUsersResult] = queries;

    return {
      total: parseInt(totalResult.rows[0].total),
      byTier: tierResult.rows,
      byStatus: statusResult.rows,
      newThisMonth: parseInt(newThisMonthResult.rows[0].new_this_month),
      activeUsers: parseInt(activeUsersResult.rows[0].active_users)
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    throw error;
  }
}

// Get plan statistics
async function getPlanStats() {
  try {
    const queries = await Promise.all([
      // Total revenue (mock calculation based on subscription tiers)
      pool.query(`
        SELECT 
          subs_tier,
          COUNT(*) as user_count,
          CASE 
            WHEN subs_tier = 'freemium' THEN 0
            WHEN subs_tier = 'basic' THEN 9
            WHEN subs_tier = 'professional' THEN 29
            WHEN subs_tier = 'enterprise' THEN 99
            ELSE 0
          END as monthly_price
        FROM users 
        WHERE subscription_status = 'active'
        GROUP BY subs_tier
      `),
      
      // Active subscriptions
      pool.query(`
        SELECT COUNT(*) as active_subscriptions
        FROM users 
        WHERE subscription_status = 'active'
      `),
      
      // Churn rate (users who became inactive in last 30 days)
      pool.query(`
        SELECT COUNT(*) as churned_users
        FROM users 
        WHERE subscription_status = 'inactive' 
        AND updated_at >= CURRENT_DATE - INTERVAL '30 days'
      `)
    ]);

    const [revenueResult, activeSubsResult, churnResult] = queries;
    
    // Calculate total revenue
    let totalRevenue = 0;
    revenueResult.rows.forEach(row => {
      totalRevenue += row.user_count * row.monthly_price;
    });

    const activeSubscriptions = parseInt(activeSubsResult.rows[0].active_subscriptions);
    const churnedUsers = parseInt(churnResult.rows[0].churned_users);
    const churnRate = activeSubscriptions > 0 ? (churnedUsers / activeSubscriptions * 100).toFixed(1) : 0;
    const avgRevenuePerUser = activeSubscriptions > 0 ? (totalRevenue / activeSubscriptions).toFixed(2) : 0;

    return {
      totalRevenue,
      activeSubscriptions,
      avgRevenuePerUser: parseFloat(avgRevenuePerUser),
      churnRate: parseFloat(churnRate),
      byTier: revenueResult.rows
    };
  } catch (error) {
    console.error('Error fetching plan stats:', error);
    throw error;
  }
}

// Get user count
async function getUserCount(search = '', status = 'all', subsTier = 'all') {
  let query = 'SELECT COUNT(*) as count FROM users WHERE 1=1';
  const params = [];
  let paramCount = 0;

  if (search) {
    paramCount++;
    query += ` AND (email ILIKE $${paramCount} OR first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount} OR username ILIKE $${paramCount})`;
    params.push(`%${search}%`);
  }

  if (status !== 'all') {
    paramCount++;
    query += ` AND subscription_status = $${paramCount}`;
    params.push(status);
  }

  if (subsTier !== 'all') {
    paramCount++;
    query += ` AND subs_tier = $${paramCount}`;
    params.push(subsTier);
  }

  try {
    const result = await pool.query(query, params);
    return parseInt(result.rows[0].count);
  } catch (error) {
    console.error('Error fetching user count:', error);
    throw error;
  }
}

module.exports = {
  getUsers,
  getUserStats,
  getPlanStats,
  getUserCount
};
