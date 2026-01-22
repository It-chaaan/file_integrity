/**
 * =============================================================================
 * USE DATA HOOKS - DATA FETCHING AND STATE MANAGEMENT
 * =============================================================================
 * 
 * This file provides custom React hooks for fetching and managing data from
 * the backend API. All hooks work seamlessly with both mock and real API modes.
 * 
 * AVAILABLE HOOKS:
 * - useData()       → Generic data fetching hook
 * - useDocuments()  → Document CRUD operations
 * - useUsers()      → User management operations
 * - useTickets()    → Support ticket operations
 * - useKeys()       → Security key management
 * - useLogs()       → Audit log access
 * 
 * FEATURES:
 * - Automatic loading states
 * - Error handling
 * - Data refetching
 * - Pagination support (handles both paginated and non-paginated responses)
 * - CRUD operations (Create, Read, Update, Delete)
 * 
 * FOR BACKEND DEVELOPERS:
 * - Hooks call adapter functions (src/api/adapter.js)
 * - Adapter routes to real API when VITE_USE_MOCK_API=false
 * - Response format: { results: [...], count: n } for paginated data
 * - Or direct array [...] for non-paginated data
 * 
 * FOR TESTERS:
 * - loading: true while fetching data
 * - error: contains error object if request fails
 * - refetch(): manually trigger data reload
 * - CRUD operations automatically refresh data list
 * 
 * USAGE EXAMPLE:
 * ```javascript
 * const { documents, loading, error, createDocument } = useDocuments();
 * 
 * if (loading) return <Spinner />;
 * if (error) return <ErrorMessage error={error} />;
 * 
 * return <DocumentList documents={documents} onCreate={createDocument} />;
 * ```
 * =============================================================================
 */

import { useState, useEffect, useCallback } from 'react';
import * as adapter from '../api/adapter';

// =============================================================================
// GENERIC DATA HOOK
// =============================================================================

/**
 * Generic Data Fetching Hook
 * 
 * Provides reusable data fetching logic with loading and error states.
 * 
 * @param {Function} fetchFn - Async function that fetches data
 * @param {Array} dependencies - Dependencies that trigger refetch
 * @returns {Object} { data, loading, error, refetch }
 * 
 * @example
 * const { data, loading } = useData(
 *   () => adapter.getDocuments({ status: 'active' }),
 *   [status]
 * );
 */
export const useData = (fetchFn, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

// =============================================================================
// DOCUMENT OPERATIONS HOOK
// =============================================================================

/**
 * Document Operations Hook
 * 
 * Manages document data and provides CRUD operations.
 * 
 * @returns {Object} {
 *   documents: Array of document objects
 *   loading: Boolean indicating fetch status
 *   error: Error object if fetch failed
 *   createDocument: Function to create new document
 *   updateDocument: Function to update document
 *   deleteDocument: Function to delete document
 *   refetch: Function to manually refresh data
 * }
 * 
 * DOCUMENT OBJECT STRUCTURE:
 * {
 *   id: string,
 *   fileName: string,
 *   type: string,
 *   status: 'pending' | 'verified' | 'rejected',
 *   hash: string,
 *   uploadedBy: string,
 *   uploadDate: string (ISO format),
 *   ...
 * }
 */
export const useDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch all documents
   * Handles both paginated ({ results: [...] }) and array responses
   */
  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await adapter.getDocuments();
      
      // Handle both paginated and non-paginated responses
      // Backend may return: { results: [...], count: n } or just [...]
      const docs = result?.results || result || [];
      setDocuments(Array.isArray(docs) ? docs : []);
    } catch (err) {
      setError(err);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create new document
   * 
   * @param {Object} documentData - Document data to create
   * @returns {Promise<Object>} Created document object
   * @throws {Error} If creation fails
   */
  const createDocument = useCallback(async (documentData) => {
    try {
      const result = await adapter.createDocument(documentData);
      await fetchDocuments(); // Refresh list after creation
      return result;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, [fetchDocuments]);

  /**
   * Update existing document
   * 
   * @param {string} id - Document ID
   * @param {Object} documentData - Updated document data
   * @returns {Promise<Object>} Updated document object
   * @throws {Error} If update fails
   */
  const updateDocument = useCallback(async (id, documentData) => {
    try {
      const result = await adapter.updateDocument(id, documentData);
      await fetchDocuments(); // Refresh list after update
      return result;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, [fetchDocuments]);

  /**
   * Delete document
   * 
   * @param {string} id - Document ID to delete
   * @returns {Promise<void>}
   * @throws {Error} If deletion fails
   */
  const deleteDocument = useCallback(async (id) => {
    try {
      await adapter.deleteDocument(id);
      await fetchDocuments(); // Refresh list after deletion
    } catch (err) {
      setError(err);
      throw err;
    }
  }, [fetchDocuments]);

  // Fetch documents on mount
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return {
    documents,
    loading,
    error,
    createDocument,
    updateDocument,
    deleteDocument,
    refetch: fetchDocuments,
  };
};

/**
 * Hook for user operations
 */
export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await adapter.getUsers();
      // Handle both paginated and non-paginated responses
      const userData = result?.results || result || [];
      setUsers(Array.isArray(userData) ? userData : []);
    } catch (err) {
      setError(err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = useCallback(async (userData) => {
    try {
      const result = await adapter.createUser(userData);
      await fetchUsers(); // Refresh list
      return result;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, [fetchUsers]);

  const updateUser = useCallback(async (id, userData) => {
    try {
      const result = await adapter.updateUser(id, userData);
      await fetchUsers(); // Refresh list
      return result;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, [fetchUsers]);

  const deleteUser = useCallback(async (id) => {
    try {
      await adapter.deleteUser(id);
      await fetchUsers(); // Refresh list
    } catch (err) {
      setError(err);
      throw err;
    }
  }, [fetchUsers]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    refetch: fetchUsers,
  };
};

/**
 * Hook for ticket operations
 */
export const useTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await adapter.getTickets();
      // Handle both paginated and non-paginated responses
      const ticketData = result?.results || result || [];
      setTickets(Array.isArray(ticketData) ? ticketData : []);
    } catch (err) {
      setError(err);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTicket = useCallback(async (ticketData) => {
    try {
      const result = await adapter.createTicket(ticketData);
      await fetchTickets(); // Refresh list
      return result;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, [fetchTickets]);

  const updateTicket = useCallback(async (id, ticketData) => {
    try {
      const result = await adapter.updateTicket(id, ticketData);
      await fetchTickets(); // Refresh list
      return result;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, [fetchTickets]);

  const deleteTicket = useCallback(async (id) => {
    try {
      await adapter.deleteTicket(id);
      await fetchTickets(); // Refresh list
    } catch (err) {
      setError(err);
      throw err;
    }
  }, [fetchTickets]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  return {
    tickets,
    loading,
    error,
    createTicket,
    updateTicket,
    deleteTicket,
    refetch: fetchTickets,
  };
};

/**
 * Hook for security keys operations
 */
export const useKeys = () => {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchKeys = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await adapter.getKeys();
      // Handle both paginated and non-paginated responses
      const keyData = result?.results || result || [];
      setKeys(Array.isArray(keyData) ? keyData : []);
    } catch (err) {
      setError(err);
      setKeys([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createKey = useCallback(async (keyData) => {
    try {
      const result = await adapter.createKey(keyData);
      await fetchKeys(); // Refresh list
      return result;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, [fetchKeys]);

  const deleteKey = useCallback(async (id) => {
    try {
      await adapter.deleteKey(id);
      await fetchKeys(); // Refresh list
    } catch (err) {
      setError(err);
      throw err;
    }
  }, [fetchKeys]);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  return {
    keys,
    loading,
    error,
    createKey,
    deleteKey,
    refetch: fetchKeys,
  };
};

/**
 * Hook for audit logs
 */
export const useLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await adapter.getLogs();
      // Handle both paginated and non-paginated responses
      const logData = result?.results || result || [];
      setLogs(Array.isArray(logData) ? logData : []);
    } catch (err) {
      setError(err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return {
    logs,
    loading,
    error,
    refetch: fetchLogs,
  };
};

/**
 * Hook for table state management (sorting, filtering, pagination)
 */
export const useTableState = (initialState = {}) => {
  const [sortBy, setSortBy] = useState(initialState.sortBy || null);
  const [sortOrder, setSortOrder] = useState(initialState.sortOrder || 'asc');
  const [filters, setFilters] = useState(initialState.filters || {});
  const [currentPage, setCurrentPage] = useState(initialState.currentPage || 1);
  const [pageSize, setPageSize] = useState(initialState.pageSize || 10);

  const handleSort = useCallback((field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  }, [sortBy, sortOrder]);

  const handleFilter = useCallback((filterKey, value) => {
    setFilters(prev => ({ ...prev, [filterKey]: value }));
    setCurrentPage(1); // Reset to first page when filtering
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const handlePageSizeChange = useCallback((size) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({});
    setCurrentPage(1);
  }, []);

  return {
    sortBy,
    sortOrder,
    filters,
    currentPage,
    pageSize,
    handleSort,
    handleFilter,
    handlePageChange,
    handlePageSizeChange,
    resetFilters,
  };
};

/**
 * Hook for form state management
 */
export const useForm = (initialValues = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleBlur = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);

  const setFieldError = useCallback((name, error) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    touched,
    isValid,
    handleChange,
    handleBlur,
    setFieldError,
    resetForm,
    setValues,
  };
};
