'use client';

import { useState } from 'react';
import UserTable from '../components/UserTable';
import UserStats from '../components/UserStats';
import UserFilters from '../components/UserFilters';

export default function UsersPage() {
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    subsTier: 'all'
  });

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-400/20 to-blue-600/20 rounded-3xl blur-xl"></div>
        <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-8">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-400/30">
              <span className="text-2xl">👥</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white tracking-tight">Users <span className="gradient-text">Management</span></h1>
            </div>
          </div>
          <p className="text-gray-400 text-lg ml-15">Manage and monitor your app users</p>
        </div>
      </div>

      {/* User Statistics */}
      <UserStats />

      {/* Filters and Search */}
      <UserFilters onFilterChange={handleFilterChange} />

      {/* Users Table */}
      <UserTable filters={filters} />
    </div>
  );
}
