'use client';

import { useState, useEffect } from 'react';

const UserTable = ({ filters: initialFilters }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState(initialFilters || {
    search: '',
    status: 'all',
    subsTier: 'all'
  });

  const fetchUsers = async (page = 1, search = '', status = 'all', subsTier = 'all') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search,
        status,
        subsTier
      });

      const response = await fetch(`/api/users?${params}`);
      const data = await response.json();
      
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Watch for filter changes from parent
  useEffect(() => {
    if (initialFilters) {
      setFilters(initialFilters);
      fetchUsers(1, initialFilters.search, initialFilters.status, initialFilters.subsTier);
    }
  }, [initialFilters]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchUsers(1, newFilters.search, newFilters.status, newFilters.subsTier);
  };

  const handlePageChange = (newPage) => {
    fetchUsers(newPage, filters.search, filters.status, filters.subsTier);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-400/20';
      case 'inactive':
        return 'text-gray-400 bg-gray-400/20';
      case 'suspended':
        return 'text-red-400 bg-red-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
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
    return formatDate(dateString);
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="shimmer h-16 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-sm border border-gray-800/50 rounded-2xl overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-800/50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Users List</h2>
            <p className="text-sm text-gray-500 mt-1">Total: {pagination.total} users</p>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-800/60">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                Plan
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                Join Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                Last Active
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-800/30 transition-all duration-200">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-sm">
                        {(user.first_name?.[0] || user.username?.[0] || '?').toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">
                        {user.first_name && user.last_name 
                          ? `${user.first_name} ${user.last_name}` 
                          : user.username || 'N/A'
                        }
                      </div>
                      <div className="text-xs text-gray-400">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm font-bold ${getPlanColor(user.subs_tier)}`}>
                    {user.subs_tier?.charAt(0).toUpperCase() + user.subs_tier?.slice(1) || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-lg ${getStatusColor(user.subscription_status)}`}>
                    {user.subscription_status?.charAt(0).toUpperCase() + user.subscription_status?.slice(1) || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-medium">
                  {formatDate(user.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-medium">
                  {formatLastActive(user.updated_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-3">
                    <button className="text-yellow-400 hover:text-yellow-300 font-semibold transition-colors">
                      Edit
                    </button>
                    <button className="text-red-400 hover:text-red-300 font-semibold transition-colors">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="px-6 py-5 border-t border-gray-800/50 flex items-center justify-between">
        <div className="text-sm text-gray-400 font-medium">
          Showing <span className="text-white font-semibold">{((pagination.page - 1) * 10) + 1}-{Math.min(pagination.page * 10, pagination.total)}</span> of <span className="text-white font-semibold">{pagination.total}</span> users
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="px-4 py-2 bg-gray-800/60 text-white rounded-xl hover:bg-gray-700/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
          >
            Previous
          </button>
          {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
            const pageNum = i + 1;
            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  pagination.page === pageNum
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-black shadow-lg shadow-yellow-400/30'
                    : 'bg-gray-800/60 text-white hover:bg-gray-700/60'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          <button 
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.pages}
            className="px-4 py-2 bg-gray-800/60 text-white rounded-xl hover:bg-gray-700/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserTable;
