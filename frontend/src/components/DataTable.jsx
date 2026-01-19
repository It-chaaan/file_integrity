import React, { useState, useMemo } from 'react';
import StatusBadge from './StatusBadge';
import Pagination from './Pagination';

const DataTable = ({ 
  columns, 
  data = [], 
  actions, 
  searchable = true,
  filterable = false,
  filters = [],
  pageSize: initialPageSize = 10,
  sortable = true,
  onRowClick = null,
  emptyMessage = 'No data available'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [activeFilters, setActiveFilters] = useState({});

  // Filter data
  const filteredData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    let result = [...data];

    // Apply search
    if (searchTerm) {
      result = result.filter(row =>
        columns.some(col => {
          const value = row[col.key];
          return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Apply filters
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        result = result.filter(row => row[key] === value);
      }
    });

    return result;
  }, [data, searchTerm, activeFilters, columns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal === bVal) return 0;

      const comparison = aVal < bVal ? -1 : 1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortConfig]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (key) => {
    if (!sortable) return;
    
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handlePageChange = (page) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  };

  const handleFilterChange = (filterKey, value) => {
    setActiveFilters(prev => ({ ...prev, [filterKey]: value }));
    setCurrentPage(1);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return 'bi-arrow-down-up';
    return sortConfig.direction === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down';
  };

  return (
    <div>
      {/* Search and Filters */}
      {(searchable || filterable) && (
        <div className="row mb-3">
          {searchable && (
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
          )}
          
          {filterable && filters.length > 0 && (
            <div className="col-md-6">
              <div className="d-flex gap-2">
                {filters.map((filter, idx) => (
                  <select
                    key={idx}
                    className="form-select"
                    value={activeFilters[filter.key] || 'all'}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  >
                    <option value="all">{filter.label}: All</option>
                    {filter.options.map((option, optIdx) => (
                      <option key={optIdx} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Table */}
      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              {columns.map((col, idx) => (
                <th 
                  key={idx} 
                  style={{ 
                    fontSize: '0.85rem', 
                    fontWeight: '600',
                    cursor: sortable && col.sortable !== false ? 'pointer' : 'default',
                    userSelect: 'none'
                  }}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                >
                  <div className="d-flex align-items-center justify-content-between">
                    <span>{col.label}</span>
                    {sortable && col.sortable !== false && (
                      <i className={`bi ${getSortIcon(col.key)} ms-2 text-muted`} style={{ fontSize: '0.75rem' }}></i>
                    )}
                  </div>
                </th>
              ))}
              {actions && <th style={{ fontSize: '0.85rem', fontWeight: '600', width: '150px' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="text-center py-5">
                  <i className="bi bi-inbox text-muted" style={{ fontSize: '3rem' }}></i>
                  <p className="text-muted mt-2">{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIdx) => (
                <tr 
                  key={rowIdx}
                  onClick={() => onRowClick && onRowClick(row)}
                  style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} style={{ fontSize: '0.9rem' }}>
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                  {actions && (
                    <td>
                      <div className="d-flex gap-1">
                        {actions(row)}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {sortedData.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={sortedData.length}
          startIndex={(currentPage - 1) * pageSize}
          endIndex={Math.min(currentPage * pageSize, sortedData.length)}
        />
      )}
    </div>
  );
};

export default DataTable;