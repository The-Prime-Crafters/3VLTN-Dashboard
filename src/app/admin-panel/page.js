'use client';

import { useState, useEffect } from 'react';

export default function AdminPanelPage() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pendingRes, allUsersRes] = await Promise.all([
        fetch('/api/admin/pending'),
        fetch('/api/admin/users')
      ]);

      if (pendingRes.ok) {
        const pendingData = await pendingRes.json();
        setPendingUsers(pendingData.pendingUsers || []);
      }

      if (allUsersRes.ok) {
        const allUsersData = await allUsersRes.json();
        setAllUsers(allUsersData.users || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (userId, action) => {
    setActionLoading(userId);
    try {
      const response = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action })
      });

      if (response.ok) {
        await fetchData(); // Refresh data
      } else {
        const data = await response.json();
        alert(data.error || 'Action failed');
      }
    } catch (error) {
      console.error('Error performing action:', error);
      alert('An error occurred');
    } finally {
      setActionLoading(null);
    }
  };

  const getRoleBadge = (role) => {
    const styles = {
      admin: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      developer: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      support: 'bg-green-500/20 text-green-400 border-green-500/30'
    };
    return styles[role] || styles.support;
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="shimmer h-32 rounded-2xl"></div>
        <div className="shimmer h-64 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-400/20 to-purple-600/20 rounded-3xl blur-xl"></div>
        <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-8">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-400/30">
              <span className="text-2xl">👑</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white tracking-tight">Admin <span className="gradient-text">Panel</span></h1>
            </div>
          </div>
          <p className="text-gray-400 text-lg ml-15">Manage dashboard users and permissions</p>
        </div>
      </div>

      {/* Pending Approvals */}
      {pendingUsers.length > 0 && (
        <div className="bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-1">Pending Approvals</h2>
            <p className="text-gray-500 text-sm">{pendingUsers.length} user(s) waiting for approval</p>
          </div>

          <div className="space-y-4">
            {pendingUsers.map((user) => (
              <div key={user.id} className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-bold text-white">{user.full_name}</h3>
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${getRoleBadge(user.role)}`}>
                        {user.role.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">{user.email}</p>
                    <p className="text-gray-500 text-xs mt-1">
                      Requested: {new Date(user.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleAction(user.id, 'approve')}
                      disabled={actionLoading === user.id}
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg disabled:opacity-50"
                    >
                      {actionLoading === user.id ? '...' : '✓ Approve'}
                    </button>
                    <button
                      onClick={() => handleAction(user.id, 'reject')}
                      disabled={actionLoading === user.id}
                      className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg disabled:opacity-50"
                    >
                      {actionLoading === user.id ? '...' : '✕ Reject'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Dashboard Users */}
      <div className="bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-sm border border-gray-800/50 rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-800/50">
          <h2 className="text-2xl font-bold text-white">All Dashboard Users</h2>
          <p className="text-sm text-gray-500 mt-1">Total: {allUsers.length} users</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/60">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {allUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-800/30 transition-all duration-200">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-semibold text-white">{user.full_name}</div>
                      <div className="text-xs text-gray-400">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${getRoleBadge(user.role)}`}>
                      {user.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.is_approved ? (
                      <span className="inline-flex px-3 py-1 rounded-lg text-xs font-bold bg-green-500/20 text-green-400">
                        Approved
                      </span>
                    ) : (
                      <span className="inline-flex px-3 py-1 rounded-lg text-xs font-bold bg-yellow-500/20 text-yellow-400">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

