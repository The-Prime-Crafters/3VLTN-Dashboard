'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function TrackTicketPage() {
  const [ticketId, setTicketId] = useState('');
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSearch(e) {
    e.preventDefault();
    
    if (!ticketId.trim()) {
      setError('Please enter a ticket ID');
      return;
    }

    setLoading(true);
    setError('');
    setTicket(null);

    try {
      // Call backend API to get ticket status
      const response = await fetch(`${process.env.NEXT_PUBLIC_TICKET_API_URL}/api/public/ticket/${ticketId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Ticket not found. Please check your ticket ID.');
        } else {
          setError('Unable to fetch ticket. Please try again.');
        }
        return;
      }

      const data = await response.json();
      setTicket(data.ticket);
    } catch (err) {
      console.error('Error fetching ticket:', err);
      setError('Unable to connect to server. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  function getStatusColor(status) {
    const colors = {
      open: 'from-blue-500 to-blue-600',
      in_progress: 'from-yellow-500 to-yellow-600',
      resolved: 'from-green-500 to-green-600',
      closed: 'from-gray-500 to-gray-600',
    };
    return colors[status] || colors.open;
  }

  function getStatusIcon(status) {
    const icons = {
      open: '🆕',
      in_progress: '⏳',
      resolved: '✅',
      closed: '🔒',
    };
    return icons[status] || '📝';
  }

  function getDaysOld(createdAt) {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-400/30">
              <span className="text-2xl font-bold text-black">3V</span>
            </div>
            <h1 className="text-3xl font-bold gradient-text">3VLTN Support</h1>
          </div>
          <p className="text-gray-400 text-lg">Track Your Support Ticket</p>
        </div>

        {/* Search Form */}
        <div className="bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-8 shadow-2xl mb-8">
          <form onSubmit={handleSearch} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                🎫 Enter Your Ticket ID
              </label>
              <input
                type="text"
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value.toUpperCase())}
                placeholder="e.g., TICK-20250116-ABC123"
                className="w-full px-4 py-4 bg-gray-800/60 border border-gray-700/50 rounded-xl text-white text-lg placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all font-mono"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-2">
                Your ticket ID was sent to your email when you submitted your request
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold rounded-xl transition-all duration-200 shadow-lg shadow-yellow-400/30 hover:shadow-yellow-400/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Searching...
                </span>
              ) : (
                '🔍 Track Ticket'
              )}
            </button>
          </form>
        </div>

        {/* Ticket Details */}
        {ticket && (
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-8 shadow-2xl">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{ticket.subject}</h2>
                  <p className="text-gray-400 font-mono text-sm">Ticket ID: {ticket.ticket_id}</p>
                </div>
                <div className={`mt-4 md:mt-0 inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r ${getStatusColor(ticket.status)} text-white font-bold shadow-lg`}>
                  <span className="text-2xl">{getStatusIcon(ticket.status)}</span>
                  <span className="text-lg capitalize">{ticket.status.replace('_', ' ')}</span>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-gray-800/30 rounded-xl">
                <div>
                  <span className="text-gray-400 text-sm font-medium">Created</span>
                  <p className="font-semibold text-white mt-1">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {getDaysOld(ticket.created_at)} day(s) ago
                  </p>
                </div>
                <div>
                  <span className="text-gray-400 text-sm font-medium">Priority</span>
                  <p className="font-semibold text-white mt-1 capitalize">{ticket.priority}</p>
                </div>
                <div>
                  <span className="text-gray-400 text-sm font-medium">Last Updated</span>
                  <p className="font-semibold text-white mt-1">
                    {ticket.updated_at ? new Date(ticket.updated_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Status Messages */}
              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                <p className="text-blue-400 text-sm">
                  {ticket.status === 'open' && '💡 Your ticket has been received and is waiting to be assigned to a support agent.'}
                  {ticket.status === 'in_progress' && '⚡ Our team is actively working on your request. You should receive an update soon.'}
                  {ticket.status === 'resolved' && '🎉 Your ticket has been resolved! If you need further assistance, please reply to the email.'}
                  {ticket.status === 'closed' && '✅ This ticket has been closed. If you need to reopen it, please contact us.'}
                </p>
              </div>

              {/* Response Count */}
              {ticket.message_count > 0 && (
                <div className="mt-4 text-center">
                  <p className="text-gray-400 text-sm">
                    💬 {ticket.message_count} response(s) from our team
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    Check your email for detailed updates
                  </p>
                </div>
              )}
            </div>

            {/* Complaint Option - Always Available */}
            <div className="bg-gradient-to-br from-orange-900/40 to-orange-900/20 backdrop-blur-sm border border-orange-500/30 rounded-2xl p-6 shadow-xl">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <span className="text-4xl">📢</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-orange-400 mb-2">
                    Need to Escalate?
                  </h3>
                  <p className="text-gray-300 mb-4">
                    If your ticket needs urgent attention or you have concerns, 
                    you can file an escalation complaint to our management team.
                  </p>
                  <Link
                    href={`/complaint?ticket=${ticket.ticket_id}`}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:scale-105"
                  >
                    <span>📢</span>
                    <span>File Escalation Complaint</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

