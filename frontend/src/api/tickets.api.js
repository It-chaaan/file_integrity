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
import { mergeQueryParams } from './utils/axiosConfig';
import { withErrorContext } from './utils/errorContext';
import {
  createFormDataConfig,
  createFormDataFromFiles,
  validateFiles,
} from './utils/formData';

/**
 * Get paginated list of tickets with optional filters (supports page_size and pageSize).
 *
 * @param {Object} params
 * @param {number} [params.page=1] - Page number.
 * @param {number} [params.page_size] - Legacy page size key.
 * @param {number} [params.pageSize] - Page size (preferred key).
 * @param {string} [params.search] - Search query.
 * @param {string} [params.status] - Status filter (open|in_progress|resolved|closed).
 * @param {string} [params.priority] - Priority filter (low|medium|high|urgent).
 * @param {string} [params.category] - Category filter.
 * @param {string} [params.assigned_to] - Assigned staff ID.
 * @param {string} [params.created_by] - Creator user ID.
 * @param {string} [params.ordering='-created_at'] - Sort field.
 * @returns {Promise<Object>} Paginated tickets list.
 */
export const getTickets = async (params = {}) => {
  const { page, page_size: pageSizeLegacy, pageSize, ordering, search, ...filters } = params;
  const pageSizeValue = pageSize || pageSizeLegacy;

  const queryParams = mergeQueryParams({
    pagination: { page, pageSize: pageSizeValue, ordering },
    filters,
    search,
  });

  const response = await withErrorContext(
    () => apiClient.get('/v1/tickets/', { params: queryParams }),
    'tickets.list',
    { resource: 'tickets', action: 'list' }
  );

  return response.data;
};

/**
 * Get single ticket by ID with full details
 * 
 * @param {string|number} ticketId - Ticket ID
 * @returns {Promise<Object>} Ticket details including comments and history
 * @throws {Error} If ticket not found or request fails
 */
export const getTicketById = async (ticketId) => {
  const response = await withErrorContext(
    () => apiClient.get(`/v1/tickets/${ticketId}/`),
    'tickets.detail',
    { resource: 'ticket', action: 'fetch', resourceId: ticketId }
  );

  return response.data;
};

/**
 * Create a new support ticket (validates attachments when present).
 *
 * @param {Object} ticketData
 * @param {string} ticketData.title
 * @param {string} ticketData.description
 * @param {string} ticketData.category
 * @param {string} ticketData.priority
 * @param {Array<File>} [ticketData.attachments]
 * @returns {Promise<Object>} Created ticket data.
 */
export const createTicket = async (ticketData) => {
  const hasAttachments = ticketData.attachments && ticketData.attachments.length > 0;

  if (hasAttachments) {
    const validation = validateFiles(ticketData.attachments);
    if (!validation.valid) {
      const errorMessages = [];
      validation.errors.forEach((errs, fileName) => {
        errorMessages.push(`${fileName}: ${errs.join('; ')}`);
      });
      throw new Error(errorMessages.join(' | '));
    }

    const formData = createFormDataFromFiles(ticketData.attachments, {
      title: ticketData.title,
      description: ticketData.description,
      category: ticketData.category,
      priority: ticketData.priority,
    }, 'attachments');

    const config = createFormDataConfig();

    const response = await withErrorContext(
      () => apiClient.post('/v1/tickets/', formData, config),
      'tickets.create',
      { resource: 'ticket', action: 'create', attachmentCount: ticketData.attachments.length }
    );

    return response.data;
  }

  const response = await withErrorContext(
    () => apiClient.post('/v1/tickets/', {
      title: ticketData.title,
      description: ticketData.description,
      category: ticketData.category,
      priority: ticketData.priority,
    }),
    'tickets.create',
    { resource: 'ticket', action: 'create' }
  );

  return response.data;
};

/**
 * Update ticket details
 * Can update title, description, priority, status, etc.
 * 
 * @param {string|number} ticketId - Ticket ID
 * @param {Object} updateData - Fields to update
 * @param {string} updateData.title - Ticket title
 * @param {string} updateData.description - Ticket description
 * @param {string} updateData.priority - Priority level
 * @param {string} updateData.status - Status (open, in_progress, resolved, closed)
 * @param {string} updateData.category - Ticket category
 * @returns {Promise<Object>} Updated ticket data
 * @throws {Error} If update fails
 */
export const updateTicket = async (ticketId, updateData) => {
  const response = await withErrorContext(
    () => apiClient.patch(`/v1/tickets/${ticketId}/`, updateData),
    'tickets.update',
    { resource: 'ticket', action: 'update', resourceId: ticketId }
  );

  return response.data;
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
  const response = await withErrorContext(
    () => apiClient.delete(`/v1/tickets/${ticketId}/`),
    'tickets.delete',
    { resource: 'ticket', action: 'delete', resourceId: ticketId }
  );

  return response.data;
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
  const response = await withErrorContext(
    () => apiClient.patch(`/v1/tickets/${ticketId}/status/`, { status }),
    'tickets.updateStatus',
    { resource: 'ticket', action: 'updateStatus', resourceId: ticketId, status }
  );

  return response.data;
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
  const response = await withErrorContext(
    () => apiClient.patch(`/v1/tickets/${ticketId}/assign/`, { assigned_to: staffId }),
    'tickets.assign',
    { resource: 'ticket', action: 'assign', resourceId: ticketId, staffId }
  );

  return response.data;
};

/**
 * Add a comment to a ticket (validates attachments when provided).
 *
 * @param {string|number} ticketId - Ticket ID.
 * @param {string} comment - Comment text.
 * @param {Array<File>} [attachments] - Optional attachments.
 * @returns {Promise<Object>} Created comment data.
 */
export const addTicketComment = async (ticketId, comment, attachments = []) => {
  if (attachments.length > 0) {
    const validation = validateFiles(attachments);
    if (!validation.valid) {
      const errorMessages = [];
      validation.errors.forEach((errs, fileName) => {
        errorMessages.push(`${fileName}: ${errs.join('; ')}`);
      });
      throw new Error(errorMessages.join(' | '));
    }

    const formData = createFormDataFromFiles(attachments, { comment }, 'attachments');
    const config = createFormDataConfig();

    const response = await withErrorContext(
      () => apiClient.post(`/v1/tickets/${ticketId}/comments/`, formData, config),
      'tickets.addComment',
      { resource: 'ticket', action: 'addComment', resourceId: ticketId, attachmentCount: attachments.length }
    );

    return response.data;
  }

  const response = await withErrorContext(
    () => apiClient.post(`/v1/tickets/${ticketId}/comments/`, { comment }),
    'tickets.addComment',
    { resource: 'ticket', action: 'addComment', resourceId: ticketId }
  );

  return response.data;
};

/**
 * Get all comments for a ticket
 * 
 * @param {string|number} ticketId - Ticket ID
 * @returns {Promise<Array>} Array of comments
 * @throws {Error} If request fails
 */
export const getTicketComments = async (ticketId) => {
  const response = await withErrorContext(
    () => apiClient.get(`/v1/tickets/${ticketId}/comments/`),
    'tickets.comments',
    { resource: 'ticket', action: 'comments', resourceId: ticketId }
  );

  return response.data;
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
  const response = await withErrorContext(
    () => apiClient.post(`/v1/tickets/${ticketId}/close/`, { resolution }),
    'tickets.close',
    { resource: 'ticket', action: 'close', resourceId: ticketId }
  );

  return response.data;
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
  const response = await withErrorContext(
    () => apiClient.post(`/v1/tickets/${ticketId}/reopen/`, { reason }),
    'tickets.reopen',
    { resource: 'ticket', action: 'reopen', resourceId: ticketId }
  );

  return response.data;
};

/**
 * Get ticket statistics
 * Returns summary of tickets by status, priority, category, etc.
 * 
 * @returns {Promise<Object>} Ticket statistics
 * @throws {Error} If request fails
 */
export const getTicketStats = async () => {
  const response = await withErrorContext(
    () => apiClient.get('/v1/tickets/stats/'),
    'tickets.stats',
    { resource: 'tickets', action: 'stats' }
  );

  return response.data;
};

/**
 * Get ticket categories
 * Returns available ticket category options
 * 
 * @returns {Promise<Array>} Array of categories
 * @throws {Error} If request fails
 */
export const getTicketCategories = async () => {
  const response = await withErrorContext(
    () => apiClient.get('/v1/tickets/categories/'),
    'tickets.categories',
    { resource: 'tickets', action: 'categories' }
  );

  return response.data;
};

/**
 * Search tickets by various criteria
 * 
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of matching tickets
 * @throws {Error} If search fails
 */
export const searchTickets = async (query) => {
  const response = await withErrorContext(
    () => apiClient.get('/v1/tickets/search/', { params: { q: query } }),
    'tickets.search',
    { resource: 'tickets', action: 'search' }
  );

  return response.data;
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
