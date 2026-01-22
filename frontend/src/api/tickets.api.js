/**
 * Tickets API Module
 * 
 * This module handles all support ticket-related API calls to the Django REST Framework backend.
 * Manages ticket creation, retrieval, updates, comments, and status management.
 * 
 * Endpoints managed:
 * - Create support tickets
 * - Get tickets list with filtering
 * - Get single ticket details
 * - Update ticket status and priority
 * - Add comments to tickets
 * - Assign tickets to staff
 * - Close/resolve tickets
 * - Get ticket statistics
 */

import apiClient from './client';

/**
 * Get paginated list of tickets with optional filters
 * 
 * @param {Object} params - Query parameters for filtering and pagination
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.page_size - Items per page (default: 10)
 * @param {string} params.search - Search query
 * @param {string} params.status - Filter by status (open, in_progress, resolved, closed)
 * @param {string} params.priority - Filter by priority (low, medium, high, urgent)
 * @param {string} params.category - Filter by category
 * @param {string} params.assigned_to - Filter by assigned staff ID
 * @param {string} params.created_by - Filter by creator user ID
 * @param {string} params.ordering - Sort field (e.g., '-created_at')
 * @returns {Promise<Object>} Paginated tickets list
 * @throws {Error} If request fails
 */
export const getTickets = async (params = {}) => {
  try {
    const response = await apiClient.get('/v1/tickets/', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get single ticket by ID with full details
 * 
 * @param {string|number} ticketId - Ticket ID
 * @returns {Promise<Object>} Ticket details including comments and history
 * @throws {Error} If ticket not found or request fails
 */
export const getTicketById = async (ticketId) => {
  try {
    const response = await apiClient.get(`/v1/tickets/${ticketId}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Create a new support ticket
 * 
 * @param {Object} ticketData - Ticket creation data
 * @param {string} ticketData.subject - Ticket subject/title
 * @param {string} ticketData.description - Detailed description of the issue
 * @param {string} ticketData.category - Ticket category (technical, billing, general, etc.)
 * @param {string} ticketData.priority - Priority level (low, medium, high, urgent)
 * @param {Array<File>} ticketData.attachments - Optional file attachments
 * @returns {Promise<Object>} Created ticket data
 * @throws {Error} If creation fails
 */
export const createTicket = async (ticketData) => {
  try {
    // If there are attachments, use FormData
    if (ticketData.attachments && ticketData.attachments.length > 0) {
      const formData = new FormData();
      formData.append('subject', ticketData.subject);
      formData.append('description', ticketData.description);
      formData.append('category', ticketData.category);
      formData.append('priority', ticketData.priority);

      ticketData.attachments.forEach((file) => {
        formData.append('attachments', file);
      });

      const response = await apiClient.post('/v1/tickets/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    }

    // No attachments, send as JSON
    const response = await apiClient.post('/v1/tickets/', {
      subject: ticketData.subject,
      description: ticketData.description,
      category: ticketData.category,
      priority: ticketData.priority,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update ticket details
 * Can update subject, description, priority, status, etc.
 * 
 * @param {string|number} ticketId - Ticket ID
 * @param {Object} updateData - Fields to update
 * @param {string} updateData.subject - Ticket subject
 * @param {string} updateData.description - Ticket description
 * @param {string} updateData.priority - Priority level
 * @param {string} updateData.status - Status (open, in_progress, resolved, closed)
 * @param {string} updateData.category - Ticket category
 * @returns {Promise<Object>} Updated ticket data
 * @throws {Error} If update fails
 */
export const updateTicket = async (ticketId, updateData) => {
  try {
    const response = await apiClient.patch(`/v1/tickets/${ticketId}/`, updateData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a ticket
 * Typically only allowed for ticket creator or admin
 * 
 * @param {string|number} ticketId - Ticket ID to delete
 * @returns {Promise<void>} No content on success
 * @throws {Error} If deletion fails
 */
export const deleteTicket = async (ticketId) => {
  try {
    const response = await apiClient.delete(`/v1/tickets/${ticketId}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update ticket status
 * Convenience method for status changes
 * 
 * @param {string|number} ticketId - Ticket ID
 * @param {string} status - New status (open, in_progress, resolved, closed)
 * @returns {Promise<Object>} Updated ticket
 * @throws {Error} If update fails
 */
export const updateTicketStatus = async (ticketId, status) => {
  try {
    const response = await apiClient.patch(`/v1/tickets/${ticketId}/status/`, { status });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Assign ticket to a staff member
 * Staff/admin only action
 * 
 * @param {string|number} ticketId - Ticket ID
 * @param {string|number} staffId - Staff user ID to assign to
 * @returns {Promise<Object>} Updated ticket
 * @throws {Error} If assignment fails
 */
export const assignTicket = async (ticketId, staffId) => {
  try {
    const response = await apiClient.patch(`/v1/tickets/${ticketId}/assign/`, {
      assigned_to: staffId,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Add a comment to a ticket
 * 
 * @param {string|number} ticketId - Ticket ID
 * @param {string} comment - Comment text
 * @param {Array<File>} attachments - Optional file attachments
 * @returns {Promise<Object>} Created comment data
 * @throws {Error} If comment creation fails
 */
export const addTicketComment = async (ticketId, comment, attachments = []) => {
  try {
    if (attachments.length > 0) {
      const formData = new FormData();
      formData.append('comment', comment);
      
      attachments.forEach((file) => {
        formData.append('attachments', file);
      });

      const response = await apiClient.post(
        `/v1/tickets/${ticketId}/comments/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    }

    const response = await apiClient.post(`/v1/tickets/${ticketId}/comments/`, {
      comment,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get all comments for a ticket
 * 
 * @param {string|number} ticketId - Ticket ID
 * @returns {Promise<Array>} Array of comments
 * @throws {Error} If request fails
 */
export const getTicketComments = async (ticketId) => {
  try {
    const response = await apiClient.get(`/v1/tickets/${ticketId}/comments/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Close a ticket
 * Marks ticket as resolved and closed
 * 
 * @param {string|number} ticketId - Ticket ID
 * @param {string} resolution - Resolution description (optional)
 * @returns {Promise<Object>} Updated ticket
 * @throws {Error} If close fails
 */
export const closeTicket = async (ticketId, resolution = '') => {
  try {
    const response = await apiClient.post(`/v1/tickets/${ticketId}/close/`, {
      resolution,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Reopen a closed ticket
 * 
 * @param {string|number} ticketId - Ticket ID
 * @param {string} reason - Reason for reopening
 * @returns {Promise<Object>} Updated ticket
 * @throws {Error} If reopen fails
 */
export const reopenTicket = async (ticketId, reason) => {
  try {
    const response = await apiClient.post(`/v1/tickets/${ticketId}/reopen/`, {
      reason,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get ticket statistics
 * Returns summary of tickets by status, priority, category, etc.
 * 
 * @returns {Promise<Object>} Ticket statistics
 * @throws {Error} If request fails
 */
export const getTicketStats = async () => {
  try {
    const response = await apiClient.get('/v1/tickets/stats/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get ticket categories
 * Returns available ticket category options
 * 
 * @returns {Promise<Array>} Array of categories
 * @throws {Error} If request fails
 */
export const getTicketCategories = async () => {
  try {
    const response = await apiClient.get('/v1/tickets/categories/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Search tickets by various criteria
 * 
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of matching tickets
 * @throws {Error} If search fails
 */
export const searchTickets = async (query) => {
  try {
    const response = await apiClient.get('/v1/tickets/search/', {
      params: { q: query },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Export all ticket functions as a grouped object for convenience
export default {
  getTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket,
  updateTicketStatus,
  assignTicket,
  addTicketComment,
  getTicketComments,
  closeTicket,
  reopenTicket,
  getTicketStats,
  getTicketCategories,
  searchTickets,
};
