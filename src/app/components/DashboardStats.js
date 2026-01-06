'use client';

import { useState, useEffect } from 'react';
import StatsCard from './StatsCard';

const DashboardStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [userStatsResponse, planStatsResponse] = await Promise.all([
          fetch('/api/users/stats'),
          fetch('/api/plans/stats')
        ]);

        const userStats = await userStatsResponse.json();
        const planStats = await planStatsResponse.json();

        setStats({
          totalUsers: userStats.total,
          activePlans: planStats.activeSubscriptions,
          revenue: planStats.totalRevenue,
          newUsers: userStats.newThisMonth
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Fallback to mock data if API fails
        setStats({
          totalUsers: 0,
          activePlans: 0,
          revenue: 0,
          newUsers: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
            <div className="shimmer h-4 rounded-lg w-3/4 mb-3"></div>
            <div className="shimmer h-8 rounded-lg w-1/2 mb-4"></div>
            <div className="shimmer h-3 rounded-lg w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  const statsData = [
    {
      title: 'Total Users',
      value: stats?.totalUsers?.toLocaleString() || '0',
      change: '+12.5%',
      changeType: 'positive',
      icon: '👥'
    },
    {
      title: 'Active Plans',
      value: stats?.activePlans?.toLocaleString() || '0',
      change: '+8.2%',
      changeType: 'positive',
      icon: '💎'
    },
    {
      title: 'Open Issues',
      value: '23',
      change: '-15.3%',
      changeType: 'negative',
      icon: '⚠️'
    },
    {
      title: 'Revenue',
      value: `$${stats?.revenue?.toLocaleString() || '0'}`,
      change: '+18.7%',
      changeType: 'positive',
      icon: '💰'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  );
};

export default DashboardStats;
