'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getTickets, getEligibleAgents } from '@/lib/ticketApi';

export default function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [agents, setAgents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    assigned_to: '',
    page: 1
  });

  async function loadTickets() {
    setLoading(true);
    try {
      const result = await getTickets(filters);
      console.log('📊 Tickets API Response:', result);
      console.log('🎫 First Ticket Sample:', result.data?.[0]);
      console.log('👤 Agent Info Check:', {
        assigned_agent_name: result.data?.[0]?.assigned_agent_name,
        assigned_agent_email: result.data?.[0]?.assigned_agent_email,
        assigned_to: result.data?.[0]?.assigned_to
      });
      setTickets(result.data || []);
      setPagination(result.pagination || { page: 1, pages: 1, total: 0 });
    } catch (error) {
      console.error('❌ Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    loadAgents();
  }, []);

  async function loadTickets() {
    setLoading(true);
    try {
      const result = await getTickets(filters);
      console.log('📊 Tickets API Response:', result);
      console.log('🎫 First Ticket Sample:', result.data?.[0]);
      console.log('👤 Agent Info Check:', {
        assigned_agent_name: result.data?.[0]?.assigned_agent_name,
        assigned_agent_email: result.data?.[0]?.assigned_agent_email,
        assigned_to: result.data?.[0]?.assigned_to
      });
      setTickets(result.data || []);
      setPagination(result.pagination || { page: 1, pages: 1, total: 0 });
    } catch (error) {
      console.error('❌ Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadAgents() {
    try {
      const result = await getEligibleAgents();
      setAgents(result.agents || []);
    } catch (error) {
      console.error('Error loading agents:', error);
    }
  }

  function handleFilterChange(key, value) {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  }

  function handlePageChange(page) {
    setFilters(prev => ({ ...prev, page }));
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 rounded-3xl blur-xl"></div>
        <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-400/30">
                <span className="text-2xl">🎫</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white tracking-tight">
                  Support <span className="gradient-text">Tickets</span>
                </h1>
                <p className="text-gray-400 text-lg mt-1">
                  Manage customer support requests
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Tickets</p>
              <p className="text-3xl font-bold text-white">{pagination.total}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              📊 Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all"
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              🔥 Priority
            </label>
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all"
            >
              <option value="">All Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              👤 Assigned To
            </label>
            <select
              value={filters.assigned_to}
              onChange={(e) => handleFilterChange('assigned_to', e.target.value)}
              className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all"
            >
              <option value="">All Agents</option>
              <option value="unassigned">Unassigned</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.full_name} ({agent.role})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setFilters({ status: '', priority: '', assigned_to: '', page: 1 })}
              className="px-6 py-3 bg-gray-700/60 hover:bg-gray-600/60 text-white font-semibold rounded-xl transition-all duration-200"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-sm border border-gray-800/50 rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-800/50">
          <h2 className="text-2xl font-bold text-white">Tickets List</h2>
          <p className="text-sm text-gray-500 mt-1">
            {loading ? 'Loading...' : `Showing ${tickets.length} of ${pagination.total} tickets`}
          </p>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="shimmer h-16 rounded-xl mb-3"></div>
              ))}
            </div>
          ) : (
            <table className="w-full min-w-max">
              <thead className="bg-gray-800/60">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider whitespace-nowrap">
                    Ticket ID
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider whitespace-nowrap">
                    Customer
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider whitespace-nowrap">
                    Subject
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider whitespace-nowrap">
                    Status
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider whitespace-nowrap">
                    Priority
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider whitespace-nowrap">
                    Assigned To
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider whitespace-nowrap">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {tickets.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-400">
                      <div className="flex flex-col items-center">
                        <span className="text-4xl mb-2">📭</span>
                        <p>No tickets found</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Try adjusting your filters or check back later
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  tickets.map((ticket) => {
                    // Debug logging for each ticket
                    console.log(`🎫 Ticket ${ticket.ticket_id}:`, {
                      assigned_agent_name: ticket.assigned_agent_name,
                      assigned_agent_email: ticket.assigned_agent_email,
                      assigned_to: ticket.assigned_to,
                      all_fields: Object.keys(ticket)
                    });
                    
                    return (
                      <tr key={ticket.ticket_id} className="hover:bg-gray-800/30 transition-all duration-200">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <Link
                            href={`/tickets/${ticket.ticket_id}`}
                            className="text-yellow-400 hover:text-yellow-300 font-mono text-sm font-semibold transition-colors"
                          >
                            {ticket.ticket_id}
                          </Link>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-white font-medium max-w-[150px] truncate">{ticket.email}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-300 max-w-[200px] truncate">
                            {ticket.subject}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <StatusBadge status={ticket.status} />
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <PriorityBadge priority={ticket.priority} />
                        </td>
                        <td className="px-4 py-4">
                          {ticket.assigned_agent_name ? (
                            <div className="flex items-center space-x-2 min-w-[200px]">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-black font-bold text-xs flex-shrink-0">
                                {ticket.assigned_agent_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-semibold text-white truncate">
                                  {ticket.assigned_agent_name}
                                </div>
                                <div className="text-xs text-gray-400 truncate">
                                  {ticket.assigned_agent_email}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300 font-medium">
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-5 border-t border-gray-800/50 flex items-center justify-between">
            <div className="text-sm text-gray-400 font-medium">
              Page <span className="text-white font-semibold">{pagination.page}</span> of{' '}
              <span className="text-white font-semibold">{pagination.pages}</span>
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
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                      page === pagination.page
                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-black shadow-lg shadow-yellow-400/30'
                        : 'bg-gray-800/60 text-white hover:bg-gray-700/60'
                    }`}
                  >
                    {page}
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
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const config = {
    open: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Open' },
    in_progress: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'In Progress' },
    resolved: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Resolved' },
    closed: { bg: 'bg-gray-500/20', text: 'text-gray-400', label: 'Closed' },
  };

  const { bg, text, label } = config[status] || config.open;

  return (
    <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-bold ${bg} ${text}`}>
      {label}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const config = {
    urgent: { bg: 'bg-red-500/20', text: 'text-red-400', icon: '🔴' },
    high: { bg: 'bg-orange-500/20', text: 'text-orange-400', icon: '🟠' },
    medium: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', icon: '🟡' },
    low: { bg: 'bg-green-500/20', text: 'text-green-400', icon: '🟢' },
  };

  const { bg, text, icon } = config[priority] || config.medium;

  return (
    <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-bold ${bg} ${text}`}>
      <span>{icon}</span>
      <span>{priority?.toUpperCase()}</span>
    </span>
  );
}

