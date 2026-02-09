/**
 * Verification API Helper Functions
 * Base URL: https://api.3vltn.com
 */

const API_BASE_URL = 'https://api.3vltn.com';

/**
 * Get pending verifications
 * @returns {Promise<Object>} Pending verifications data
 */
export async function getPendingVerifications() {
  try {
    const response = await fetch(`${API_BASE_URL}/backend/admin/verifications/pending`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch pending verifications: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching pending verifications:', error);
    throw error;
  }
}

/**
 * Verify a transaction
 * @param {number} transactionId - Transaction ID
 * @param {Object} data - Verification data
 * @param {boolean} data.verified - Whether transaction is verified
 * @param {number} data.adminUserId - Admin user ID
 * @param {string} data.notes - Admin notes
 * @returns {Promise<Object>} Verification result
 */
export async function verifyTransaction(transactionId, data) {
  try {
    const response = await fetch(`${API_BASE_URL}/backend/admin/verifications/${transactionId}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || `Failed to verify transaction: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error verifying transaction:', error);
    throw error;
  }
}

/**
 * Get transaction details
 * @param {number} transactionId - Transaction ID
 * @returns {Promise<Object>} Transaction details with history
 */
export async function getTransactionDetails(transactionId) {
  try {
    const response = await fetch(`${API_BASE_URL}/backend/admin/verifications/${transactionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch transaction details: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching transaction details:', error);
    throw error;
  }
}

/**
 * Get admin notifications
 * @param {Object} filters - Filter options
 * @param {boolean} filters.unreadOnly - Only unread notifications
 * @param {number} filters.limit - Number of results
 * @returns {Promise<Object>} Notifications data
 */
export async function getNotifications(filters = {}) {
  try {
    const params = new URLSearchParams();
    
    if (filters.unreadOnly !== undefined) {
      params.append('unreadOnly', filters.unreadOnly);
    }
    if (filters.limit) {
      params.append('limit', filters.limit);
    }

    const url = `${API_BASE_URL}/backend/admin/notifications${params.toString() ? '?' + params.toString() : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch notifications: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
}

/**
 * Mark notification as read
 * @param {number} notificationId - Notification ID
 * @param {number} adminUserId - Admin user ID
 * @returns {Promise<Object>} Result
 */
export async function markNotificationAsRead(notificationId, adminUserId) {
  try {
    const response = await fetch(`${API_BASE_URL}/backend/admin/notifications/${notificationId}/read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ adminUserId }),
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to mark notification as read: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

/**
 * Get dashboard stats
 * @returns {Promise<Object>} Dashboard statistics
 */
export async function getDashboardStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/backend/admin/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch dashboard stats: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
}

