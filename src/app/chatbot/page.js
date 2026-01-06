'use client';

import { useState, useEffect } from 'react';
import { getConversations, getLeads, scoreAllUnscored } from '@/lib/chatbotApi';

export default function ChatbotPage() {
  const [activeTab, setActiveTab] = useState('conversations'); // 'conversations' or 'leads'
  const [conversations, setConversations] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters
  const [filters, setFilters] = useState({
    minMessages: 1,
    hasEmail: false,
    includeUnscored: false,
    classification: 'all',
    limit: 100
  });

  // Load conversations
  const loadConversations = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await getConversations({
        minMessages: filters.minMessages,
        hasEmail: filters.hasEmail,
        limit: filters.limit
      });
      setConversations(result.data || result.conversations || []);
    } catch (err) {
      setError('Failed to load conversations: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load leads
  const loadLeads = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await getLeads({
        includeUnscored: filters.includeUnscored,
        classification: filters.classification !== 'all' ? filters.classification : undefined,
        limit: filters.limit
      });
      setLeads(result.data || result.leads || []);
    } catch (err) {
      setError('Failed to load leads: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Score all unscored conversations
  const handleScoreAll = async () => {
    if (!confirm('This will score all unscored conversations with 2+ messages. Continue?')) {
      return;
    }

    setScoring(true);
    setError('');
    setSuccess('');
    try {
      const result = await scoreAllUnscored();
      setSuccess(`Successfully scored ${result.scored || result.count || 0} conversations!`);
      // Reload data
      if (activeTab === 'conversations') {
        await loadConversations();
      } else {
        await loadLeads();
      }
    } catch (err) {
      setError('Failed to score conversations: ' + err.message);
      console.error(err);
    } finally {
      setScoring(false);
    }
  };

  // Load data when tab or filters change
  useEffect(() => {
    if (activeTab === 'conversations') {
      loadConversations();
    } else {
      loadLeads();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, filters]);

  const getScoreBadge = (score) => {
    if (score === null || score === undefined) {
      return <span className="px-2 py-1 bg-gray-700/50 text-gray-400 text-xs font-semibold rounded-full">Unscored</span>;
    }
    if (score >= 8) {
      return <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-semibold rounded-full">Hot ({score})</span>;
    } else if (score >= 5) {
      return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-semibold rounded-full">Warm ({score})</span>;
    } else {
      return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-full">Cold ({score})</span>;
    }
  };

  const getClassificationBadge = (classification) => {
    if (!classification) {
      return <span className="px-2 py-1 bg-gray-700/50 text-gray-400 text-xs font-semibold rounded-full">Unclassified</span>;
    }
    const colors = {
      hot: 'bg-red-500/20 text-red-400',
      warm: 'bg-yellow-500/20 text-yellow-400',
      cold: 'bg-blue-500/20 text-blue-400'
    };
    return (
      <span className={`px-2 py-1 ${colors[classification] || 'bg-gray-700/50 text-gray-400'} text-xs font-semibold rounded-full capitalize`}>
        {classification}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-400/20 to-pink-600/20 rounded-3xl blur-xl"></div>
        <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-400/30">
                <span className="text-2xl">🤖</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white tracking-tight">Chatbot <span className="gradient-text">Analytics</span></h1>
                <p className="text-gray-400 text-lg mt-1">View conversations and leads from your chatbot</p>
              </div>
            </div>
            <button
              onClick={handleScoreAll}
              disabled={scoring}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {scoring ? 'Scoring...' : '📊 Score All Unscored'}
            </button>
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

      {/* Tabs */}
      <div className="bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setActiveTab('conversations')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
              activeTab === 'conversations'
                ? 'bg-gradient-to-r from-purple-400 to-pink-500 text-white shadow-lg shadow-purple-400/30'
                : 'bg-gray-800/60 text-gray-300 hover:bg-gray-700/60'
            }`}
          >
            💬 Conversations
          </button>
          <button
            onClick={() => setActiveTab('leads')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
              activeTab === 'leads'
                ? 'bg-gradient-to-r from-purple-400 to-pink-500 text-white shadow-lg shadow-purple-400/30'
                : 'bg-gray-800/60 text-gray-300 hover:bg-gray-700/60'
            }`}
          >
            🎯 Leads
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {activeTab === 'conversations' ? (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Min Messages</label>
                <input
                  type="number"
                  min="1"
                  value={filters.minMessages}
                  onChange={(e) => setFilters({ ...filters, minMessages: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-2 bg-gray-800/60 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Has Email</label>
                <select
                  value={filters.hasEmail}
                  onChange={(e) => setFilters({ ...filters, hasEmail: e.target.value === 'true' })}
                  className="w-full px-4 py-2 bg-gray-800/60 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
                >
                  <option value="false">All</option>
                  <option value="true">With Email</option>
                </select>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Include Unscored</label>
                <select
                  value={filters.includeUnscored}
                  onChange={(e) => setFilters({ ...filters, includeUnscored: e.target.value === 'true' })}
                  className="w-full px-4 py-2 bg-gray-800/60 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
                >
                  <option value="false">Scored Only</option>
                  <option value="true">Include Unscored</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Classification</label>
                <select
                  value={filters.classification}
                  onChange={(e) => setFilters({ ...filters, classification: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800/60 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
                >
                  <option value="all">All</option>
                  <option value="hot">Hot</option>
                  <option value="warm">Warm</option>
                  <option value="cold">Cold</option>
                </select>
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Limit</label>
            <input
              type="number"
              min="1"
              max="500"
              value={filters.limit}
              onChange={(e) => setFilters({ ...filters, limit: parseInt(e.target.value) || 100 })}
              className="w-full px-4 py-2 bg-gray-800/60 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={activeTab === 'conversations' ? loadConversations : loadLeads}
              className="w-full px-4 py-2 bg-gradient-to-r from-purple-400 to-pink-500 hover:from-purple-500 hover:to-pink-600 text-white font-bold rounded-xl transition-all duration-200"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Data Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-purple-400/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-purple-400 rounded-full border-t-transparent animate-spin"></div>
            </div>
          </div>
        ) : activeTab === 'conversations' ? (
          <ConversationsTable conversations={conversations} getScoreBadge={getScoreBadge} />
        ) : (
          <LeadsTable leads={leads} getScoreBadge={getScoreBadge} getClassificationBadge={getClassificationBadge} />
        )}
      </div>
    </div>
  );
}

// Conversations Table Component
function ConversationsTable({ conversations, getScoreBadge }) {
  if (conversations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">No conversations found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700/50">
            <th className="px-4 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Session ID</th>
            <th className="px-4 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Messages</th>
            <th className="px-4 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Email</th>
            <th className="px-4 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Score</th>
            <th className="px-4 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Last Message</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800/50">
          {conversations.map((conv, idx) => (
            <tr key={conv.sessionId || conv.id || idx} className="hover:bg-gray-800/30 transition-colors">
              <td className="px-4 py-4">
                <span className="text-sm font-mono text-gray-300">{conv.sessionId || conv.id || 'N/A'}</span>
              </td>
              <td className="px-4 py-4">
                <span className="text-sm text-white font-semibold">{conv.messageCount || conv.messages?.length || 0}</span>
              </td>
              <td className="px-4 py-4">
                <span className="text-sm text-gray-300">{conv.email || conv.userEmail || 'No email'}</span>
              </td>
              <td className="px-4 py-4">
                {getScoreBadge(conv.score || conv.autoScore?.score)}
              </td>
              <td className="px-4 py-4">
                <span className="text-sm text-gray-400">
                  {conv.lastMessageAt || conv.updatedAt 
                    ? new Date(conv.lastMessageAt || conv.updatedAt).toLocaleString()
                    : 'N/A'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Leads Table Component
function LeadsTable({ leads, getScoreBadge, getClassificationBadge }) {
  if (leads.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">No leads found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700/50">
            <th className="px-4 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Session ID</th>
            <th className="px-4 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Email</th>
            <th className="px-4 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Messages</th>
            <th className="px-4 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Score</th>
            <th className="px-4 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Classification</th>
            <th className="px-4 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Last Activity</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800/50">
          {leads.map((lead, idx) => (
            <tr key={lead.sessionId || lead.id || idx} className="hover:bg-gray-800/30 transition-colors">
              <td className="px-4 py-4">
                <span className="text-sm font-mono text-gray-300">{lead.sessionId || lead.id || 'N/A'}</span>
              </td>
              <td className="px-4 py-4">
                <span className="text-sm text-white font-semibold">{lead.email || lead.userEmail || 'No email'}</span>
              </td>
              <td className="px-4 py-4">
                <span className="text-sm text-gray-300">{lead.messageCount || lead.messages?.length || 0}</span>
              </td>
              <td className="px-4 py-4">
                {getScoreBadge(lead.score || lead.autoScore?.score)}
              </td>
              <td className="px-4 py-4">
                {getClassificationBadge(lead.classification || lead.autoScore?.classification)}
              </td>
              <td className="px-4 py-4">
                <span className="text-sm text-gray-400">
                  {lead.lastMessageAt || lead.updatedAt 
                    ? new Date(lead.lastMessageAt || lead.updatedAt).toLocaleString()
                    : 'N/A'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

