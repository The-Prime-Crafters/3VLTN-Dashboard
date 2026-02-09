'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { getTransactionDetails, verifyTransaction, markNotificationAsRead } from '@/lib/verificationApi';

export default function TransactionDetailPage({ params: paramsPromise }) {
  const params = React.use(paramsPromise);
  const router = useRouter();
  const transactionId = params.transactionId;

  const [transaction, setTransaction] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Verification form state
  const [verified, setVerified] = useState(true);
  const [notes, setNotes] = useState('');
  const [adminUserId, setAdminUserId] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        if (data.user && data.user.id) {
          setAdminUserId(data.user.id);
        } else {
          setError('Unable to get user information. Please log in again.');
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        setError('Failed to load user information. Please refresh the page.');
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUser();
  }, []);

  // Load transaction details
  const loadTransaction = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await getTransactionDetails(transactionId);
      setTransaction(result.transaction || result.data);
      setHistory(result.history || []);
    } catch (err) {
      setError('Failed to load transaction details: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle verification
  const handleVerify = async () => {
    if (!notes.trim()) {
      setError('Please provide verification notes');
      return;
    }

    if (!adminUserId) {
      setError('User ID not available. Please wait for user information to load or refresh the page.');
      return;
    }

    setVerifying(true);
    setError('');
    setSuccess('');

    try {
      const result = await verifyTransaction(transactionId, {
        verified,
        adminUserId,
        notes: notes.trim(),
      });

      setSuccess(
        result.action === 'transferred'
          ? `✅ Transaction verified! Funds transferred: ${result.amount ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(result.amount) : ''}`
          : `✅ Transaction refunded: ${result.amount ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(result.amount) : ''}`
      );

      // Reload transaction details
      setTimeout(() => {
        loadTransaction();
        setNotes('');
      }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to verify transaction');
      console.error(err);
    } finally {
      setVerifying(false);
    }
  };

  // Fetch current user on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        if (data.user && data.user.id) {
          setAdminUserId(data.user.id);
        } else {
          console.error('No user ID in response:', data);
        }
      } catch (err) {
        console.error('Error fetching user:', err);
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (transactionId) {
      loadTransaction();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionId]);

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

  const getActionBadge = (action) => {
    const actionMap = {
      buyer_confirmed: { color: 'bg-yellow-500/20 text-yellow-400', icon: '✓' },
      payment_received: { color: 'bg-purple-500/20 text-purple-400', icon: '💳' },
      transaction_created: { color: 'bg-blue-500/20 text-blue-400', icon: '📝' },
      verified: { color: 'bg-green-500/20 text-green-400', icon: '✅' },
      refunded: { color: 'bg-red-500/20 text-red-400', icon: '↩️' },
    };
    const actionInfo = actionMap[action] || { color: 'bg-gray-500/20 text-gray-400', icon: '•' };
    return (
      <span className={`px-2 py-1 ${actionInfo.color} text-xs font-semibold rounded-full`}>
        {actionInfo.icon} {action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-green-400/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-green-400 rounded-full border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg mb-4">Transaction not found</p>
          <button
            onClick={() => router.push('/verifications')}
            className="px-6 py-3 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-bold rounded-xl transition-all duration-200"
          >
            ← Back to Verifications
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-green-400/20 to-emerald-600/20 rounded-3xl blur-xl"></div>
        <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push('/verifications')}
                className="w-10 h-10 rounded-xl bg-gray-800/60 hover:bg-gray-700/60 flex items-center justify-center transition-colors"
              >
                ←
              </button>
              <div>
                <h1 className="text-4xl font-bold text-white tracking-tight">
                  Transaction <span className="gradient-text">#{transaction.id}</span>
                </h1>
                <p className="text-gray-400 text-lg mt-1">{transaction.domain_name}</p>
              </div>
            </div>
            {getStatusBadge(transaction.verification_status || transaction.payment_status)}
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/50 rounded-xl">
          <p className="text-green-400 text-sm">{success}</p>
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Transaction Info */}
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Transaction Details</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Domain Name</label>
                <div className="text-lg font-bold text-white mt-1">{transaction.domain_name}</div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount</label>
                <div className="text-lg font-bold text-green-400 mt-1">
                  {formatCurrency(transaction.amount, transaction.currency)}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Buyer Name</label>
                <div className="text-white mt-1">{transaction.buyer_name}</div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Buyer Email</label>
                <div className="text-white mt-1">{transaction.buyer_email}</div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Seller Username</label>
                <div className="text-white mt-1">{transaction.seller_username}</div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Seller Email</label>
                <div className="text-white mt-1">{transaction.seller_email}</div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Campaign</label>
                <div className="text-white mt-1">{transaction.campaign_name || 'N/A'}</div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Platform Fee</label>
                <div className="text-yellow-400 font-semibold mt-1">
                  {formatCurrency(transaction.platform_fee_amount, transaction.currency)}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Seller Payout</label>
                <div className="text-green-400 font-semibold mt-1">
                  {formatCurrency(transaction.seller_payout_amount, transaction.currency)}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Payment Intent ID</label>
                <div className="text-gray-300 font-mono text-sm mt-1">
                  {transaction.stripe_payment_intent_id || 'N/A'}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Paid At</label>
                <div className="text-gray-300 mt-1">
                  {transaction.paid_at ? new Date(transaction.paid_at).toLocaleString() : 'N/A'}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Buyer Confirmed</label>
                <div className="mt-1">
                  {transaction.buyer_confirmed ? (
                    <span className="text-green-400 font-semibold">✓ Yes</span>
                  ) : (
                    <span className="text-gray-400">No</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* History */}
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Transaction History</h2>
            <div className="space-y-4">
              {history.length === 0 ? (
                <p className="text-gray-400">No history available</p>
              ) : (
                history.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-4 bg-gray-800/30 rounded-xl border border-gray-700/50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getActionBadge(item.action)}
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(item.created_at).toLocaleString()}
                      </span>
                    </div>
                    {item.notes && (
                      <p className="text-sm text-gray-300 mt-2">{item.notes}</p>
                    )}
                    {item.previous_status && item.new_status && (
                      <div className="text-xs text-gray-400 mt-2">
                        Status: <span className="text-gray-500">{item.previous_status}</span> →{' '}
                        <span className="text-white">{item.new_status}</span>
                      </div>
                    )}
                    {item.performed_by_username && (
                      <div className="text-xs text-gray-400 mt-1">
                        By: {item.performed_by_username}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Verification Panel */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6 sticky top-6">
            <h2 className="text-xl font-bold text-white mb-6">Verify Transaction</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Verification Status
                </label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={verified}
                      onChange={() => setVerified(true)}
                      className="w-4 h-4 text-green-400"
                    />
                    <span className="text-white">✓ Verified (Transfer Funds)</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={!verified}
                      onChange={() => setVerified(false)}
                      className="w-4 h-4 text-red-400"
                    />
                    <span className="text-white">✗ Failed (Refund Buyer)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Verification Notes <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter verification details..."
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20 resize-none"
                />
              </div>

              <button
                onClick={handleVerify}
                disabled={verifying || !notes.trim() || !adminUserId || loadingUser}
                className="w-full px-6 py-3 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-green-400/30 hover:shadow-green-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingUser ? 'Loading...' : verifying ? 'Processing...' : verified ? '✓ Verify & Transfer' : '↩️ Refund Buyer'}
              </button>
              
              {loadingUser && (
                <p className="text-xs text-yellow-400 text-center mt-2">
                  Loading user information...
                </p>
              )}
              
              {!loadingUser && !adminUserId && (
                <p className="text-xs text-red-400 text-center mt-2">
                  Unable to get user ID. Please refresh the page.
                </p>
              )}

              <div className="pt-4 border-t border-gray-700/50">
                <div className="text-xs text-gray-400 space-y-1">
                  <p>• Verified: Funds will be transferred to seller</p>
                  <p>• Failed: Full refund will be issued to buyer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

