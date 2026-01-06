'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getTicket, updateTicket, sendReply } from '@/lib/ticketApi';
import { parseEmailContent } from '@/lib/emailParser';

export default function TicketDetailPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const ticketId = resolvedParams.ticketId;
  
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [sending, setSending] = useState(false);

  async function loadTicket() {
    setLoading(true);
    try {
      const result = await getTicket(ticketId);
      setTicket(result.data);
    } catch (error) {
      console.error('Error loading ticket:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTicket();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId]);

  async function handleStatusChange(newStatus) {
    setUpdating(true);
    try {
      await updateTicket(ticketId, { status: newStatus });
      await loadTicket();
    } catch (error) {
      alert('Failed to update status: ' + error.message);
    } finally {
      setUpdating(false);
    }
  }

  async function handlePriorityChange(newPriority) {
    setUpdating(true);
    try {
      await updateTicket(ticketId, { priority: newPriority });
      await loadTicket();
    } catch (error) {
      alert('Failed to update priority: ' + error.message);
    } finally {
      setUpdating(false);
    }
  }

  async function handleSendReply(e) {
    e.preventDefault();

    if (!replyMessage.trim()) {
      alert('Please enter a message');
      return;
    }

    setSending(true);
    try {
      await sendReply(ticketId, replyMessage);
      setReplyMessage('');
      await loadTicket();
      alert('Reply sent successfully!');
    } catch (error) {
      alert('Failed to send reply: ' + error.message);
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="shimmer h-32 rounded-2xl"></div>
        <div className="shimmer h-64 rounded-2xl"></div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <span className="text-6xl">❌</span>
        <h2 className="text-2xl font-bold text-white mt-4">Ticket Not Found</h2>
        <Link href="/tickets" className="text-yellow-400 hover:text-yellow-300 mt-4 inline-block">
          ← Back to Tickets
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Link
        href="/tickets"
        className="inline-flex items-center space-x-2 text-yellow-400 hover:text-yellow-300 transition-colors"
      >
        <span>←</span>
        <span className="font-semibold">Back to Tickets</span>
      </Link>

      {/* Ticket Header */}
      <div className="bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{ticket.subject}</h1>
            <p className="text-gray-400 font-mono text-sm">Ticket ID: {ticket.ticket_id}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              value={ticket.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={updating}
              className="px-4 py-2 bg-gray-800/60 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:border-yellow-400 transition-all"
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>

            <select
              value={ticket.priority}
              onChange={(e) => handlePriorityChange(e.target.value)}
              disabled={updating}
              className="px-4 py-2 bg-gray-800/60 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:border-yellow-400 transition-all"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        {/* Ticket Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 p-6 bg-gray-800/30 rounded-xl">
          <div>
            <span className="text-gray-400 text-sm font-medium">Customer Email</span>
            <p className="font-semibold text-white mt-1">{ticket.email}</p>
          </div>
          <div>
            <span className="text-gray-400 text-sm font-medium">Status</span>
            <p className="font-semibold text-white mt-1 capitalize">
              {ticket.status.replace('_', ' ')}
            </p>
          </div>
          <div>
            <span className="text-gray-400 text-sm font-medium">Priority</span>
            <p className="font-semibold text-white mt-1 capitalize">{ticket.priority}</p>
          </div>
          <div>
            <span className="text-gray-400 text-sm font-medium">Assigned To</span>
            {ticket.assigned_agent_name ? (
              <div className="flex items-center space-x-2 mt-1">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-black font-bold text-xs flex-shrink-0">
                  {ticket.assigned_agent_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{ticket.assigned_agent_name}</p>
                  <p className="text-xs text-gray-400">{ticket.assigned_agent_role}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic mt-1">Unassigned</p>
            )}
          </div>
          <div>
            <span className="text-gray-400 text-sm font-medium">Created</span>
            <p className="font-semibold text-white mt-1">
              {new Date(ticket.created_at).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Conversation Thread */}
      <div className="bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Conversation</h2>

        <div className="space-y-4">
          {/* Initial Message */}
          <div className="bg-blue-500/10 border-l-4 border-blue-500 rounded-xl p-6">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="font-semibold text-blue-400 text-sm">Customer</span>
                <span className="text-gray-400 text-sm ml-2">({ticket.email})</span>
              </div>
              <span className="text-gray-500 text-xs">
                {new Date(ticket.created_at).toLocaleString()}
              </span>
            </div>
            <div className="text-gray-200 whitespace-pre-wrap leading-relaxed">
              {parseEmailContent(ticket.message)}
            </div>
          </div>

          {/* Messages */}
          {(() => {
            // Filter out the initial message (skip first message if it's from customer at ticket creation time)
            const filteredMessages = (ticket.messages || []).filter((msg, index) => {
              // Skip first message if it matches the ticket creation time (likely duplicate)
              if (index === 0 && msg.is_from_customer) {
                const msgTime = new Date(msg.created_at).getTime();
                const ticketTime = new Date(ticket.created_at).getTime();
                // If times are within 1 second, it's likely the same message
                return Math.abs(msgTime - ticketTime) > 1000;
              }
              return true;
            });

            return filteredMessages.length > 0 ? (
              filteredMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`${
                    msg.is_from_customer
                      ? 'bg-blue-500/10 border-l-4 border-blue-500'
                      : 'bg-green-500/10 border-l-4 border-green-500'
                  } rounded-xl p-6`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span
                        className={`font-semibold text-sm ${
                          msg.is_from_customer ? 'text-blue-400' : 'text-green-400'
                        }`}
                      >
                        {msg.is_from_customer ? 'Customer' : 'Support Team'}
                      </span>
                      <span className="text-gray-400 text-sm ml-2">
                        ({msg.from_email || ticket.email})
                      </span>
                    </div>
                    <span className="text-gray-500 text-xs">
                      {new Date(msg.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-gray-200 whitespace-pre-wrap leading-relaxed">
                    {parseEmailContent(msg.body)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <span className="text-4xl mb-2 block">💬</span>
                No replies yet
              </div>
            );
          })()}
        </div>
      </div>

      {/* Reply Form */}
      <div className="bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Send Reply</h2>

        <form onSubmit={handleSendReply}>
          <textarea
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
            placeholder="Type your response to the customer..."
            rows={6}
            className="w-full bg-gray-800/60 border border-gray-700/50 rounded-xl p-4 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all mb-4"
            disabled={sending}
          />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={sending || !replyMessage.trim()}
              className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold rounded-xl transition-all duration-200 shadow-lg shadow-yellow-400/30 hover:shadow-yellow-400/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {sending ? 'Sending...' : '📧 Send Reply'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

