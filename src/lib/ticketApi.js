const API_BASE_URL = process.env.NEXT_PUBLIC_TICKET_API_URL || 'http://localhost:3001';

/**
 * Fetch all tickets with optional filters
 */
export async function getTickets(filters = {}) {
  const params = new URLSearchParams();
  
  if (filters.status) params.append('status', filters.status);
  if (filters.priority) params.append('priority', filters.priority);
  if (filters.email) params.append('email', filters.email);
  if (filters.assigned_to) params.append('assigned_to', filters.assigned_to);
  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit || '10');

  const url = `${API_BASE_URL}/api/tickets${params.toString() ? '?' + params.toString() : ''}`;
  
  try {
    const res = await fetch(url, {
      cache: 'no-store', // Always fetch fresh data
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch tickets');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching tickets:', error);
    // Return empty data structure on error
    return {
      data: [],
      pagination: { page: 1, pages: 1, total: 0, limit: 10 }
    };
  }
}

/**
 * Fetch single ticket by ID
 */
export async function getTicket(ticketId) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/tickets/${ticketId}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch ticket');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching ticket:', error);
    throw error;
  }
}

/**
 * Update ticket (status, priority, assignment)
 */
export async function updateTicket(ticketId, updates) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/tickets/${ticketId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    
    if (!res.ok) {
      throw new Error('Failed to update ticket');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error updating ticket:', error);
    throw error;
  }
}

/**
 * Send reply to ticket
 */
export async function sendReply(ticketId, message) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/tickets/${ticketId}/reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });
    
    if (!res.ok) {
      throw new Error('Failed to send reply');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error sending reply:', error);
    throw error;
  }
}

/**
 * Get ticket statistics
 */
export async function getTicketStats() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/tickets/stats`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch stats');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching ticket stats:', error);
    // Return default stats on error
    return {
      data: {
        open: 0,
        in_progress: 0,
        resolved: 0,
        closed: 0,
        urgent: 0,
        recent: { last_24h: 0, last_7d: 0 }
      }
    };
  }
}

/**
 * Get list of eligible agents for assignment
 */
export async function getEligibleAgents() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/assignments/eligible-agents`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch agents');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching agents:', error);
    // Return empty list on error
    return { agents: [] };
  }
}

