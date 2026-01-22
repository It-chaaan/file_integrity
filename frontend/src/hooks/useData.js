/**
 * Data Hooks for API Integration
 * Provides custom hooks for fetching and managing data from API endpoints
 * Works with both mock and real API through the adapter pattern
 */

import { useState, useEffect, useCallback } from 'react';
import * as adapter from '../api/adapter';

/**
 * Generic data fetching hook
 * @param {Function} fetchFn - Function that fetches data
 * @param {Array} dependencies - Dependencies for re-fetching
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

/**
 * Hook for document operations
 */
export const useDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await adapter.getDocuments();
      setDocuments(result || []);
    } catch (err) {
      setError(err);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createDocument = useCallback(async (documentData) => {
    try {
      const result = await adapter.createDocument(documentData);
      await fetchDocuments(); // Refresh list
      return result;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, [fetchDocuments]);

  const updateDocument = useCallback(async (id, documentData) => {
    try {
      const result = await adapter.updateDocument(id, documentData);
      await fetchDocuments(); // Refresh list
      return result;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, [fetchDocuments]);

  const deleteDocument = useCallback(async (id) => {
    try {
      await adapter.deleteDocument(id);
      await fetchDocuments(); // Refresh list
    } catch (err) {
      setError(err);
      throw err;
    }
  }, [fetchDocuments]);

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
      setUsers(result || []);
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
      setTickets(result || []);
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
      setKeys(result || []);
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
      setLogs(result || []);
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
