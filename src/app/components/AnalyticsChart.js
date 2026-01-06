'use client';

import { useState, useEffect } from 'react';

const AnalyticsChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await fetch('/api/analytics/stats');
        const data = await response.json();
        setChartData(data);
      } catch (error) {
        console.error('Error fetching chart data:', error);
        // Fallback to empty data
        setChartData({
          userGrowth: [],
          revenueGrowth: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/3 mb-6"></div>
          <div className="h-64 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  const userGrowth = chartData?.userGrowth || [];
  const revenueGrowth = chartData?.revenueGrowth || [];
  
  // Combine and sort data by month
  const months = [...new Set([...userGrowth.map(d => d.month), ...revenueGrowth.map(d => d.month)])].sort();
  
  const combinedData = months.map(month => {
    const userData = userGrowth.find(d => d.month === month);
    const revenueData = revenueGrowth.find(d => d.month === month);
    
    return {
      month: month.slice(5), // Get MM from YYYY-MM
      users: userData?.users || 0,
      revenue: revenueData?.revenue || 0
    };
  });

  const maxUsers = Math.max(...combinedData.map(d => d.users), 1);
  const maxRevenue = Math.max(...combinedData.map(d => d.revenue), 1);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">User Growth & Revenue</h2>
        <div className="flex space-x-4">
          <button className="px-3 py-1 bg-yellow-400 text-black rounded text-sm font-medium">
            6M
          </button>
          <button className="px-3 py-1 bg-gray-800 text-white rounded text-sm font-medium hover:bg-gray-700">
            1Y
          </button>
        </div>
      </div>
      
      {combinedData.length > 0 ? (
        <>
          <div className="h-64 flex items-end space-x-2">
            {combinedData.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full flex flex-col items-center space-y-1">
                  {/* Revenue bar */}
                  <div
                    className="w-full bg-yellow-400 rounded-t"
                    style={{ height: `${(data.revenue / maxRevenue) * 100}px` }}
                    title={`Revenue: $${data.revenue.toLocaleString()}`}
                  ></div>
                  {/* Users bar */}
                  <div
                    className="w-full bg-blue-500 rounded-b"
                    style={{ height: `${(data.users / maxUsers) * 100}px` }}
                    title={`Users: ${data.users.toLocaleString()}`}
                  ></div>
                </div>
                <div className="mt-2 text-xs text-gray-400">{data.month}</div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex items-center justify-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-400 rounded"></div>
              <span className="text-sm text-gray-300">Revenue</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-sm text-gray-300">Users</span>
            </div>
          </div>
        </>
      ) : (
        <div className="h-64 flex items-center justify-center">
          <p className="text-gray-400">No data available</p>
        </div>
      )}
    </div>
  );
};

export default AnalyticsChart;
