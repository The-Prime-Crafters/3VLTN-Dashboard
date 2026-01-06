'use client';

import { useState, useEffect, useCallback } from 'react';

const UserFilters = ({ onFilterChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');

  const handleApplyFilters = useCallback(() => {
    onFilterChange({
      search: searchTerm,
      status: statusFilter,
      subsTier: planFilter
    });
  }, [onFilterChange, searchTerm, statusFilter, planFilter]);

  // Auto-apply filters after a delay when typing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleApplyFilters();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [handleApplyFilters]);

  return (
    <div className="bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            🔍 Search Users
          </label>
          <input
            type="text"
            placeholder="Search by name, email, or username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all"
          />
        </div>

        {/* Status Filter */}
        <div className="lg:w-52">
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            📊 Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        {/* Plan Filter */}
        <div className="lg:w-52">
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            💎 Plan
          </label>
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all"
          >
            <option value="all">All Plans</option>
            <option value="freemium">Freemium</option>
            <option value="basic">Basic</option>
            <option value="professional">Professional</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>

        {/* Filter Button */}
        <div className="flex items-end">
          <button 
            onClick={handleApplyFilters}
            className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold rounded-xl transition-all duration-200 shadow-lg shadow-yellow-400/30 hover:shadow-yellow-400/50 hover:scale-105"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserFilters;
