'use client';

import { useState, useEffect } from 'react';

const UserStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/users/stats');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching user stats:', error);
        // Fallback to mock data
        setStats({
          total: 0,
          newThisMonth: 0,
          activeUsers: 0,
          byStatus: []
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
          <div key={index} className="bg-gray-900 border border-gray-800 rounded-lg p-6 animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-700 rounded w-1/2 mb-4"></div>
            <div className="h-3 bg-gray-700 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  // Calculate inactive users
  const inactiveUsers = stats?.byStatus?.find(s => s.subscription_status === 'inactive')?.count || 0;

  const userStats = [
    {
      title: 'Total Users',
      value: stats?.total?.toLocaleString() || '0',
      change: '+12.5%',
      changeType: 'positive',
      icon: '👥'
    },
    {
      title: 'New This Month',
      value: stats?.newThisMonth?.toLocaleString() || '0',
      change: '+8.2%',
      changeType: 'positive',
      icon: '🆕'
    },
    {
      title: 'Active Users',
      value: stats?.activeUsers?.toLocaleString() || '0',
      change: '+15.3%',
      changeType: 'positive',
      icon: '✅'
    },
    {
      title: 'Inactive Users',
      value: inactiveUsers.toLocaleString(),
      change: '-5.1%',
      changeType: 'negative',
      icon: '⏸️'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {userStats.map((stat, index) => (
        <div key={index} className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-yellow-400/50 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
              <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
            </div>
            <div className="text-3xl">{stat.icon}</div>
          </div>
          <div className="mt-4 flex items-center">
            <span
              className={`text-sm font-medium ${
                stat.changeType === 'positive'
                  ? 'text-green-400'
                  : stat.changeType === 'negative'
                  ? 'text-red-400'
                  : 'text-gray-400'
              }`}
            >
              {stat.change}
            </span>
            <span className="text-gray-500 text-sm ml-2">vs last month</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserStats;
