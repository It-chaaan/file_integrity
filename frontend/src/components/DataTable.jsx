import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import StatusBadge from './StatusBadge';
import Pagination from './Pagination';

/**
 * Responsive data table with search, filter, sort, pagination, and optional actions column.
 * @param {Object[]} columns - Column configs ({ key, label, sortable?, render? }).
 * @param {Object[]} [data=[]] - Row data; keys should match column keys.
 * @param {(row: Object) => React.ReactNode} [actions] - Renderer for actions cell per row.
 * @param {boolean} [searchable=true] - Enable text search across columns.
 * @param {boolean} [filterable=false] - Enable dropdown filters.
 * @param {Array<{key: string, label: string, options: Array<{label: string, value: string}>}>} [filters=[]] - Filter configs.
 * @param {number} [pageSize=10] - Initial page size.
 * @param {boolean} [sortable=true] - Enable column sorting (can be disabled per column).
 * @param {(row: Object) => void} [onRowClick] - Row click handler.
 * @param {string} [emptyMessage='No data available'] - Message when no rows.
 */
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
  const [pageSize] = useState(initialPageSize);
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
    <div className="data-table-container">
      {/* Search and Filters - Responsive Layout */}
      {(searchable || filterable) && (
        <div className="row g-3 mb-3">
          {searchable && (
            <div className="col-12 col-md-6 col-lg-8">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  id="data-table-search"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  aria-label="Search table"
                  style={{ fontSize: '0.95rem' }}
                />
              </div>
            </div>
          )}

          {filterable && filters.length > 0 && (
            <div className="col-12 col-md-6 col-lg-4">
              <div className="d-flex flex-wrap gap-2">
                {filters.map((filter) => (
                  <select
                    key={filter.key}
                    className="form-select form-select-sm flex-grow-1"
                    value={activeFilters[filter.key] || 'all'}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    id={`filter-${filter.key}`}
                    aria-label={`Filter by ${filter.label}`}
                    style={{ minWidth: '120px', fontSize: '0.9rem' }}
                  >
                    <option value="all">{filter.label}: All</option>
                    {filter.options.map((option) => (
                      <option key={option.value} value={option.value}>
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

      {/* Table Container with Responsive Wrapper */}
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              {columns.map((col) => (
                <th 
                  key={col.key} 
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  style={{ 
                    cursor: col.sortable !== false ? 'pointer' : 'default',
                    userSelect: 'none',
                    whiteSpace: 'nowrap',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    padding: '0.875rem 0.75rem'
                  }}
                >
                  <div className="d-flex align-items-center gap-2">
                    {col.label}
                    {col.sortable !== false && (
                      <i 
                        className={`bi ${getSortIcon(col.key)} text-muted`}
                        style={{ fontSize: '0.75rem' }}
                      ></i>
                    )}
                  </div>
                </th>
              ))}
              {actions && <th style={{ width: '150px', fontSize: '0.9rem', fontWeight: '600' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length + (actions ? 1 : 0)} 
                  className="text-center text-muted py-5"
                  style={{ fontSize: '0.95rem' }}
                >
                  <i className="bi bi-inbox fs-1 d-block mb-3 text-muted opacity-50"></i>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr 
                  key={idx}
                  onClick={() => onRowClick && onRowClick(row)}
                  style={{ 
                    cursor: onRowClick ? 'pointer' : 'default',
                    transition: 'background-color 0.15s'
                  }}
                >
                  {columns.map((col) => (
                    <td 
                      key={col.key}
                      style={{ 
                        fontSize: '0.9rem',
                        padding: '0.875rem 0.75rem'
                      }}
                    >
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                  {actions && (
                    <td style={{ padding: '0.875rem 0.75rem' }}>
                      <div className="d-flex gap-2 flex-wrap">
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

      {/* Pagination Footer - Responsive */}
      {paginatedData.length > 0 && (
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3 mt-3 pt-3 border-top">
          {/* Results Info */}
          <div className="text-muted small text-center text-sm-start">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} results
          </div>

          {/* Pagination Controls */}
          <div className="d-flex align-items-center gap-2 flex-wrap justify-content-center">
            {/* Pagination Component */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={sortedData.length}
              startIndex={(currentPage - 1) * pageSize}
              endIndex={Math.min(currentPage * pageSize, sortedData.length)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

DataTable.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    sortable: PropTypes.bool,
    render: PropTypes.func,
  })).isRequired,
  data: PropTypes.arrayOf(PropTypes.object),
  actions: PropTypes.func,
  searchable: PropTypes.bool,
  filterable: PropTypes.bool,
  filters: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    })).isRequired,
  })),
  pageSize: PropTypes.number,
  sortable: PropTypes.bool,
  onRowClick: PropTypes.func,
  emptyMessage: PropTypes.string,
};

export default DataTable;