// Custom React Hooks for Data Management
import { useState, useEffect, useCallback } from 'react';
import { 
  mockDocumentService, 
  mockUserService, 
  mockTicketService, 
  mockLogService, 
  mockKeyService 
} from '../services/mockStorage';
import { parseSearchQuery, filterData, sortData, paginateData } from '../services/utils';

// Generic data fetching hook
export const useData = (service, initialLoad = true) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(initialLoad);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await service.getAll();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [service]);

  useEffect(() => {
    if (initialLoad) {
      fetchData();
    }
  }, [fetchData, initialLoad]);

  return { data, loading, error, refetch: fetchData };
};

// Documents hook
export const useDocuments = () => {
  const { data, loading, error, refetch } = useData(mockDocumentService);
  
  const createDocument = async (docData) => {
    const result = await mockDocumentService.create(docData);
    await refetch();
    return result;
  };
  
  const updateDocument = async (id, updates) => {
    const result = await mockDocumentService.update(id, updates);
    await refetch();
    return result;
  };
  
  const deleteDocument = async (id) => {
    await mockDocumentService.delete(id);
    await refetch();
  };
  
  const searchDocuments = async (term) => {
    return await mockDocumentService.search(term);
  };
  
  const verifyDocument = async (hash) => {
    return await mockDocumentService.verifyHash(hash);
  };
  
  return {
    documents: data,
    loading,
    error,
    refetch,
    createDocument,
    updateDocument,
    deleteDocument,
    searchDocuments,
    verifyDocument
  };
};

// Users hook
export const useUsers = () => {
  const { data, loading, error, refetch } = useData(mockUserService);
  
  const createUser = async (userData) => {
    const result = await mockUserService.create(userData);
    await refetch();
    return result;
  };
  
  const updateUser = async (id, updates) => {
    const result = await mockUserService.update(id, updates);
    await refetch();
    return result;
  };
  
  const deleteUser = async (id) => {
    await mockUserService.delete(id);
    await refetch();
  };
  
  const searchUsers = async (term) => {
    return await mockUserService.search(term);
  };
  
  return {
    users: data,
    loading,
    error,
    refetch,
    createUser,
    updateUser,
    deleteUser,
    searchUsers
  };
};

// Tickets hook
export const useTickets = () => {
  const { data, loading, error, refetch } = useData(mockTicketService);
  
  const createTicket = async (ticketData) => {
    const result = await mockTicketService.create(ticketData);
    await refetch();
    return result;
  };
  
  const updateTicket = async (id, updates) => {
    const result = await mockTicketService.update(id, updates);
    await refetch();
    return result;
  };
  
  const deleteTicket = async (id) => {
    await mockTicketService.delete(id);
    await refetch();
  };
  
  const searchTickets = async (term) => {
    return await mockTicketService.search(term);
  };
  
  return {
    tickets: data,
    loading,
    error,
    refetch,
    createTicket,
    updateTicket,
    deleteTicket,
    searchTickets
  };
};

// Keys hook
export const useKeys = () => {
  const { data, loading, error, refetch } = useData(mockKeyService);
  
  const createKey = async (keyData) => {
    const result = await mockKeyService.create(keyData);
    await refetch();
    return result;
  };
  
  const updateKey = async (id, updates) => {
    const result = await mockKeyService.update(id, updates);
    await refetch();
    return result;
  };
  
  const rotateKey = async (keyId) => {
    const result = await mockKeyService.rotate(keyId);
    await refetch();
    return result;
  };
  
  return {
    keys: data,
    loading,
    error,
    refetch,
    createKey,
    updateKey,
    rotateKey
  };
};

// Logs hook (read-only)
export const useLogs = () => {
  const { data, loading, error, refetch } = useData(mockLogService);
  
  const addLog = async (logData) => {
    await mockLogService.create(logData);
    await refetch();
  };
  
  return {
    logs: data,
    loading,
    error,
    refetch,
    addLog
  };
};

// Table state management hook
export const useTableState = (initialData = []) => {
  const [filteredData, setFilteredData] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    let result = [...initialData];
    
    // Apply search
    if (searchTerm) {
      const query = parseSearchQuery(searchTerm);
      result = result.filter(item =>
        Object.values(item).some(val =>
          String(val).toLowerCase().includes(query)
        )
      );
    }
    
    // Apply filters
    result = filterData(result, filters);
    
    // Apply sorting
    if (sortBy) {
      result = sortData(result, sortBy, sortOrder);
    }
    
    setFilteredData(result);
    setCurrentPage(1); // Reset to first page when data changes
  }, [initialData, searchTerm, filters, sortBy, sortOrder]);

  const paginatedResult = paginateData(filteredData, currentPage, pageSize);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleFilter = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({});
    setSortBy('');
    setSortOrder('asc');
    setCurrentPage(1);
  };

  return {
    data: paginatedResult.data,
    totalItems: paginatedResult.total,
    currentPage: paginatedResult.page,
    pageSize: paginatedResult.pageSize,
    totalPages: paginatedResult.totalPages,
    searchTerm,
    filters,
    sortBy,
    sortOrder,
    handleSearch,
    handleFilter,
    handleSort,
    handlePageChange,
    handlePageSizeChange,
    clearFilters
  };
};

// Form state management hook
export const useForm = (initialState = {}, validationRules = {}) => {
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate field on blur
    if (validationRules[name]) {
      const error = validationRules[name](values[name], values);
      if (error) {
        setErrors(prev => ({ ...prev, [name]: error }));
      }
    }
  };

  const validate = () => {
    const newErrors = {};
    Object.keys(validationRules).forEach(field => {
      const error = validationRules[field](values[field], values);
      if (error) {
        newErrors[field] = error;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (onSubmit) => {
    setIsSubmitting(true);
    const isValid = validate();
    
    if (isValid) {
      try {
        await onSubmit(values);
        return true;
      } catch (error) {
        setErrors({ submit: error.message });
        return false;
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setIsSubmitting(false);
      return false;
    }
  };

  const reset = () => {
    setValues(initialState);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setValues,
    setErrors
  };
};
