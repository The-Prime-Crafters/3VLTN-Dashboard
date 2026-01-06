/**
 * Chatbot API Helper Functions
 * Base URL: https://api.3vltn.com
 */

const API_BASE_URL = 'https://api.3vltn.com';

/**
 * Get all conversations
 * @param {Object} filters - Filter options
 * @param {number} filters.minMessages - Minimum number of messages (default: 1)
 * @param {boolean} filters.hasEmail - Filter by conversations with email (default: false)
 * @param {number} filters.limit - Number of results to return (default: 100)
 * @returns {Promise<Object>} Conversations data
 */
export async function getConversations(filters = {}) {
  try {
    const params = new URLSearchParams();
    
    if (filters.minMessages !== undefined) {
      params.append('minMessages', filters.minMessages);
    }
    if (filters.hasEmail !== undefined) {
      params.append('hasEmail', filters.hasEmail);
    }
    if (filters.limit) {
      params.append('limit', filters.limit);
    }

    const url = `${API_BASE_URL}/backend/chatbot/conversations${params.toString() ? '?' + params.toString() : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch conversations: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
}

/**
 * Get leads
 * @param {Object} filters - Filter options
 * @param {boolean} filters.includeUnscored - Include unscored conversations (default: false)
 * @param {string} filters.classification - Filter by classification (hot, warm, cold)
 * @param {number} filters.limit - Number of results to return (default: 50)
 * @returns {Promise<Object>} Leads data
 */
export async function getLeads(filters = {}) {
  try {
    const params = new URLSearchParams();
    
    if (filters.includeUnscored !== undefined) {
      params.append('includeUnscored', filters.includeUnscored);
    }
    if (filters.classification) {
      params.append('classification', filters.classification);
    }
    if (filters.limit) {
      params.append('limit', filters.limit);
    }

    const url = `${API_BASE_URL}/backend/chatbot/leads${params.toString() ? '?' + params.toString() : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch leads: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching leads:', error);
    throw error;
  }
}

/**
 * Batch score all unscored conversations
 * Scores all conversations with 2+ messages that haven't been scored yet
 * @returns {Promise<Object>} Scoring result
 */
export async function scoreAllUnscored() {
  try {
    const response = await fetch(`${API_BASE_URL}/backend/chatbot/score-all`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to score conversations: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error scoring conversations:', error);
    throw error;
  }
}

