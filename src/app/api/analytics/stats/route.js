import { NextResponse } from 'next/server';
import pool from '../../../../lib/db';

export async function GET() {
  try {
    const queries = await Promise.all([
      // Page views (mock data for now - you can implement real tracking later)
      pool.query(`
        SELECT 
          COUNT(*) as total_users,
          COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as active_users_30d,
          COUNT(CASE WHEN updated_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as active_users_7d
        FROM users
      `),
      
      // User growth over time (last 6 months)
      pool.query(`
        SELECT 
          DATE_TRUNC('month', created_at) as month,
          COUNT(*) as new_users
        FROM users 
        WHERE created_at >= CURRENT_DATE - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month
      `),
      
      // Revenue growth over time
      pool.query(`
        SELECT 
          DATE_TRUNC('month', created_at) as month,
          SUM(CASE 
            WHEN subs_tier = 'freemium' THEN 0
            WHEN subs_tier = 'basic' THEN 9
            WHEN subs_tier = 'professional' THEN 29
            WHEN subs_tier = 'enterprise' THEN 99
            ELSE 0
          END) as monthly_revenue
        FROM users 
        WHERE subscription_status = 'active'
        AND created_at >= CURRENT_DATE - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month
      `),
      
      // Top users by activity (based on updated_at)
      pool.query(`
        SELECT 
          id,
          first_name,
          last_name,
          username,
          email,
          subs_tier,
          subscription_status,
          updated_at,
          created_at
        FROM users 
        WHERE updated_at >= CURRENT_DATE - INTERVAL '30 days'
        ORDER BY updated_at DESC
        LIMIT 10
      `),
      
      // User distribution by subscription tier
      pool.query(`
        SELECT 
          subs_tier,
          COUNT(*) as count,
          ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) as percentage
        FROM users 
        GROUP BY subs_tier
        ORDER BY count DESC
      `),
      
      // User distribution by status
      pool.query(`
        SELECT 
          subscription_status,
          COUNT(*) as count,
          ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) as percentage
        FROM users 
        GROUP BY subscription_status
        ORDER BY count DESC
      `)
    ]);

    const [
      userStatsResult,
      userGrowthResult,
      revenueGrowthResult,
      topUsersResult,
      tierDistributionResult,
      statusDistributionResult
    ] = queries;

    // Calculate bounce rate (users who haven't been active in 7 days)
    const totalUsers = parseInt(userStatsResult.rows[0].total_users);
    const activeUsers7d = parseInt(userStatsResult.rows[0].active_users_7d);
    const bounceRate = totalUsers > 0 ? ((totalUsers - activeUsers7d) / totalUsers * 100).toFixed(1) : 0;

    // Calculate average session duration (mock calculation based on user activity)
    const avgSessionDuration = totalUsers > 0 ? Math.floor(Math.random() * 10) + 2 : 0; // 2-12 minutes

    // Calculate page views (mock data - you can implement real tracking)
    const pageViews = totalUsers * 25; // Estimate 25 page views per user
    const uniqueVisitors = totalUsers;

    // Format growth data for charts
    const userGrowth = userGrowthResult.rows.map(row => ({
      month: row.month.toISOString().slice(0, 7), // YYYY-MM format
      users: parseInt(row.new_users)
    }));

    const revenueGrowth = revenueGrowthResult.rows.map(row => ({
      month: row.month.toISOString().slice(0, 7),
      revenue: parseInt(row.monthly_revenue) || 0
    }));

    // Format top users
    const topUsers = topUsersResult.rows.map(user => ({
      id: user.id,
      name: user.first_name && user.last_name 
        ? `${user.first_name} ${user.last_name}` 
        : user.username || 'N/A',
      email: user.email,
      plan: user.subs_tier,
      status: user.subscription_status,
      lastActive: user.updated_at,
      joinDate: user.created_at
    }));

    return NextResponse.json({
      pageViews: pageViews.toLocaleString(),
      uniqueVisitors: uniqueVisitors.toLocaleString(),
      bounceRate: `${bounceRate}%`,
      avgSessionDuration: `${avgSessionDuration}m ${Math.floor(Math.random() * 60)}s`,
      userGrowth,
      revenueGrowth,
      topUsers,
      tierDistribution: tierDistributionResult.rows,
      statusDistribution: statusDistributionResult.rows
    });
  } catch (error) {
    console.error('Error fetching analytics stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics stats' },
      { status: 500 }
    );
  }
}
