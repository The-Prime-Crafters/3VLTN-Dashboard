'use client';

import { useState, useEffect } from 'react';

const TopUsers = () => {
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopUsers = async () => {
      try {
        const response = await fetch('/api/analytics/stats');
        const data = await response.json();
        setTopUsers(data.topUsers || []);
      } catch (error) {
        console.error('Error fetching top users:', error);
        setTopUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopUsers();
  }, []);

  const calculateActivity = (lastActive) => {
    if (!lastActive) return 0;
    const now = new Date();
    const lastActiveDate = new Date(lastActive);
    const diffInHours = Math.floor((now - lastActiveDate) / (1000 * 60 * 60));
    
    // Calculate activity percentage based on recency
    if (diffInHours < 1) return 100;
    if (diffInHours < 24) return Math.max(90 - (diffInHours * 2), 50);
    if (diffInHours < 168) return Math.max(70 - ((diffInHours - 24) * 0.5), 20);
    return Math.max(20 - ((diffInHours - 168) * 0.1), 0);
  };

  const formatLastActive = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getPlanColor = (plan) => {
    switch (plan) {
      case 'freemium':
        return 'text-gray-400';
      case 'basic':
        return 'text-blue-400';
      case 'professional':
        return 'text-yellow-400';
      case 'enterprise':
        return 'text-purple-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Top Active Users</h2>
        <button className="text-yellow-400 hover:text-yellow-300 text-sm font-medium">
          View All
        </button>
      </div>
      
      <div className="space-y-4">
        {topUsers.length > 0 ? (
          topUsers.map((user, index) => {
            const activity = calculateActivity(user.lastActive);
            return (
              <div key={user.id || index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-800 transition-colors">
                <div className="text-2xl">👤</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-white font-medium truncate">{user.name}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${getPlanColor(user.plan)} bg-gray-800`}>
                      {user.plan?.charAt(0).toUpperCase() + user.plan?.slice(1) || 'N/A'}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm truncate">{user.email}</p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-xs text-gray-500">Activity: {Math.round(activity)}%</span>
                    <span className="text-xs text-gray-500">Last active: {formatLastActive(user.lastActive)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="w-16 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full" 
                      style={{ width: `${activity}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">No active users found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopUsers;
