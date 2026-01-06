'use client';

import { useState, useEffect } from 'react';

const UserDistributionChart = () => {
  const [distributionData, setDistributionData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDistributionData = async () => {
      try {
        const response = await fetch('/api/analytics/stats');
        const data = await response.json();
        setDistributionData(data);
      } catch (error) {
        console.error('Error fetching distribution data:', error);
        setDistributionData({ tierDistribution: [], statusDistribution: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchDistributionData();
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const tierDistribution = distributionData?.tierDistribution || [];
  const statusDistribution = distributionData?.statusDistribution || [];

  const getTierColor = (tier) => {
    switch (tier) {
      case 'freemium':
        return 'bg-gray-500';
      case 'basic':
        return 'bg-blue-500';
      case 'professional':
        return 'bg-yellow-500';
      case 'enterprise':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'inactive':
        return 'bg-gray-500';
      case 'suspended':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-white mb-6">User Distribution</h2>
      
      <div className="space-y-6">
        {/* Subscription Tier Distribution */}
        <div>
          <h3 className="text-lg font-medium text-white mb-4">By Subscription Tier</h3>
          <div className="space-y-3">
            {tierDistribution.map((tier, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded ${getTierColor(tier.subs_tier)}`}></div>
                  <span className="text-gray-300 capitalize">{tier.subs_tier}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-white font-semibold">{tier.count}</span>
                  <span className="text-gray-400 text-sm">({tier.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Distribution */}
        <div>
          <h3 className="text-lg font-medium text-white mb-4">By Status</h3>
          <div className="space-y-3">
            {statusDistribution.map((status, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded ${getStatusColor(status.subscription_status)}`}></div>
                  <span className="text-gray-300 capitalize">{status.subscription_status}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-white font-semibold">{status.count}</span>
                  <span className="text-gray-400 text-sm">({status.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDistributionChart;
