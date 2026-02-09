'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getPendingVerifications, getDashboardStats, getNotifications } from '@/lib/verificationApi';

export default function VerificationsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'notifications', 'stats'
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  // Load pending verifications
  const loadPendingVerifications = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await getPendingVerifications();
      setPendingTransactions(result.transactions || result.data || []);
    } catch (err) {
      setError('Failed to load pending verifications: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load notifications
  const loadNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await getNotifications({ unreadOnly: false, limit: 50 });
      setNotifications(result.notifications || result.data || []);
      setUnreadCount(result.unreadCount || 0);
    } catch (err) {
      setError('Failed to load notifications: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load dashboard stats
  const loadStats = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await getDashboardStats();
      setStats(result.stats || result.data || null);
    } catch (err) {
      setError('Failed to load stats: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load data based on active tab
  useEffect(() => {
    if (activeTab === 'pending') {
      loadPendingVerifications();
    } else if (activeTab === 'notifications') {
      loadNotifications();
    } else if (activeTab === 'stats') {
      loadStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(parseFloat(amount || 0));
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      buyer_confirmed: { label: 'Buyer Confirmed', color: 'bg-yellow-500/20 text-yellow-400' },
      pending_payment: { label: 'Pending Payment', color: 'bg-blue-500/20 text-blue-400' },
      payment_received: { label: 'Payment Received', color: 'bg-purple-500/20 text-purple-400' },
      verified: { label: 'Verified', color: 'bg-green-500/20 text-green-400' },
      refunded: { label: 'Refunded', color: 'bg-red-500/20 text-red-400' },
    };
    const statusInfo = statusMap[status] || { label: status, color: 'bg-gray-500/20 text-gray-400' };
    return (
      <span className={`px-3 py-1 ${statusInfo.color} text-xs font-semibold rounded-full`}>
        {statusInfo.label}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityMap = {
      high: { color: 'bg-red-500/20 text-red-400', label: 'High' },
      medium: { color: 'bg-yellow-500/20 text-yellow-400', label: 'Medium' },
      low: { color: 'bg-blue-500/20 text-blue-400', label: 'Low' },
    };
    const priorityInfo = priorityMap[priority] || { color: 'bg-gray-500/20 text-gray-400', label: priority };
    return (
      <span className={`px-2 py-1 ${priorityInfo.color} text-xs font-semibold rounded-full`}>
        {priorityInfo.label}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-green-400/20 to-emerald-600/20 rounded-3xl blur-xl"></div>
        <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-8">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-400/30">
              <span className="text-2xl">✅</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white tracking-tight">Domain <span className="gradient-text">Verifications</span></h1>
              <p className="text-gray-400 text-lg mt-1">Manage and verify domain transaction escrows</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 relative ${
              activeTab === 'pending'
                ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg shadow-green-400/30'
                : 'bg-gray-800/60 text-gray-300 hover:bg-gray-700/60'
            }`}
          >
            ⏳ Pending Verifications
            {activeTab === 'pending' && pendingTransactions.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-white/20 text-xs rounded-full">
                {pendingTransactions.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 relative ${
              activeTab === 'notifications'
                ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg shadow-green-400/30'
                : 'bg-gray-800/60 text-gray-300 hover:bg-gray-700/60'
            }`}
          >
            🔔 Notifications
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
              activeTab === 'stats'
                ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg shadow-green-400/30'
                : 'bg-gray-800/60 text-gray-300 hover:bg-gray-700/60'
            }`}
          >
            📊 Statistics
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-green-400/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-green-400 rounded-full border-t-transparent animate-spin"></div>
            </div>
          </div>
        ) : activeTab === 'pending' ? (
          <PendingTransactionsTable 
            transactions={pendingTransactions} 
            formatCurrency={formatCurrency}
            getStatusBadge={getStatusBadge}
            onViewDetails={(id) => router.push(`/verifications/${id}`)}
            onRefresh={loadPendingVerifications}
          />
        ) : activeTab === 'notifications' ? (
          <NotificationsTable 
            notifications={notifications}
            formatCurrency={formatCurrency}
            getPriorityBadge={getPriorityBadge}
            onViewTransaction={(id) => router.push(`/verifications/${id}`)}
            onRefresh={loadNotifications}
          />
        ) : (
          <StatsView stats={stats} formatCurrency={formatCurrency} />
        )}
      </div>
    </div>
  );
}

// Pending Transactions Table
function PendingTransactionsTable({ transactions, formatCurrency, getStatusBadge, onViewDetails, onRefresh }) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">No pending verifications</p>
        <button
          onClick={onRefresh}
          className="mt-4 px-4 py-2 bg-gray-800/60 text-gray-300 rounded-xl hover:bg-gray-700/60 transition-colors"
        >
          🔄 Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex justify-end mb-4">
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-bold rounded-xl transition-all duration-200"
        >
          🔄 Refresh
        </button>
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700/50">
            <th className="px-4 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Transaction ID</th>
            <th className="px-4 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Domain</th>
            <th className="px-4 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Buyer</th>
            <th className="px-4 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Amount</th>
            <th className="px-4 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Seller</th>
            <th className="px-4 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Status</th>
            <th className="px-4 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Paid At</th>
            <th className="px-4 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800/50">
          {transactions.map((tx) => (
            <tr key={tx.id} className="hover:bg-gray-800/30 transition-colors">
              <td className="px-4 py-4">
                <span className="text-sm font-mono text-gray-300">#{tx.id}</span>
              </td>
              <td className="px-4 py-4">
                <span className="text-sm font-semibold text-white">{tx.domain_name}</span>
              </td>
              <td className="px-4 py-4">
                <div>
                  <div className="text-sm text-white font-semibold">{tx.buyer_name}</div>
                  <div className="text-xs text-gray-400">{tx.buyer_email}</div>
                </div>
              </td>
              <td className="px-4 py-4">
                <span className="text-sm font-bold text-green-400">{formatCurrency(tx.amount, tx.currency)}</span>
              </td>
              <td className="px-4 py-4">
                <div>
                  <div className="text-sm text-white">{tx.seller_username}</div>
                  <div className="text-xs text-gray-400">{tx.seller_email}</div>
                </div>
              </td>
              <td className="px-4 py-4">
                {getStatusBadge(tx.verification_status)}
              </td>
              <td className="px-4 py-4">
                <span className="text-sm text-gray-400">
                  {tx.paid_at ? new Date(tx.paid_at).toLocaleString() : 'N/A'}
                </span>
              </td>
              <td className="px-4 py-4">
                <button
                  onClick={() => onViewDetails(tx.id)}
                  className="px-4 py-2 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white text-sm font-bold rounded-xl transition-all duration-200"
                >
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Notifications Table
function NotificationsTable({ notifications, formatCurrency, getPriorityBadge, onViewTransaction, onRefresh }) {
  if (notifications.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">No notifications</p>
        <button
          onClick={onRefresh}
          className="mt-4 px-4 py-2 bg-gray-800/60 text-gray-300 rounded-xl hover:bg-gray-700/60 transition-colors"
        >
          🔄 Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex justify-end mb-4">
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-bold rounded-xl transition-all duration-200"
        >
          🔄 Refresh
        </button>
      </div>
      <div className="space-y-3">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`p-4 rounded-xl border transition-all duration-200 ${
              notif.is_read
                ? 'bg-gray-800/30 border-gray-700/50'
                : 'bg-green-500/10 border-green-500/30'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-white font-semibold">{notif.title}</h3>
                  {getPriorityBadge(notif.priority)}
                  {!notif.is_read && (
                    <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">New</span>
                  )}
                </div>
                <p className="text-gray-300 text-sm mb-2">{notif.message}</p>
                {notif.domain_name && (
                  <div className="flex items-center space-x-4 text-xs text-gray-400">
                    <span>Domain: <span className="text-white font-semibold">{notif.domain_name}</span></span>
                    {notif.amount && (
                      <span>Amount: <span className="text-green-400 font-semibold">{formatCurrency(notif.amount)}</span></span>
                    )}
                    {notif.buyer_name && (
                      <span>Buyer: <span className="text-white">{notif.buyer_name}</span></span>
                    )}
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-2">
                  {new Date(notif.created_at).toLocaleString()}
                </div>
              </div>
              {notif.transaction_id && (
                <button
                  onClick={() => onViewTransaction(notif.transaction_id)}
                  className="ml-4 px-4 py-2 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white text-sm font-bold rounded-xl transition-all duration-200"
                >
                  View Transaction
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Stats View
function StatsView({ stats, formatCurrency }) {
  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">No statistics available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-2xl p-6">
        <div className="text-yellow-400 text-sm font-semibold mb-2">Pending Verifications</div>
        <div className="text-3xl font-bold text-white mb-1">{stats.pending?.count || 0}</div>
        <div className="text-yellow-400 text-sm font-semibold">{formatCurrency(stats.pending?.amount || 0)}</div>
      </div>
      <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-2xl p-6">
        <div className="text-green-400 text-sm font-semibold mb-2">Completed</div>
        <div className="text-3xl font-bold text-white mb-1">{stats.completed?.count || 0}</div>
        <div className="text-green-400 text-sm font-semibold">{formatCurrency(stats.completed?.amount || 0)}</div>
      </div>
      <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-2xl p-6">
        <div className="text-purple-400 text-sm font-semibold mb-2">Platform Fees</div>
        <div className="text-3xl font-bold text-white">{formatCurrency(stats.platformFees || 0)}</div>
      </div>
      <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 rounded-2xl p-6">
        <div className="text-red-400 text-sm font-semibold mb-2">Failed/Refunded</div>
        <div className="text-3xl font-bold text-white mb-1">{stats.failed?.count || 0}</div>
        <div className="text-red-400 text-sm font-semibold">{formatCurrency(stats.failed?.refunded || 0)}</div>
      </div>
    </div>
  );
}

