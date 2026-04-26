import React from 'react';
import PropTypes from 'prop-types';

/**
 * Simple pagination control with item range display.
 * @param {number} currentPage - Current page (1-based).
 * @param {number} totalPages - Total pages available.
 * @param {(page: number) => void} onPageChange - Callback when navigating pages.
 * @param {number} totalItems - Total item count (for range text).
 * @param {number} startIndex - Zero-based start index of current page slice.
 * @param {number} endIndex - Zero-based end index (exclusive) of current page slice.
 */
const Pagination = ({ 
  currentPage = 1, 
  totalPages = 1, 
  onPageChange = () => {}, 
  totalItems = 0,
  startIndex = 0,
  endIndex = 0
}) => {
  return (
    <div className="d-flex justify-content-between align-items-center mt-3">
      <p className="text-muted mb-0">
        Showing {totalItems > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + (endIndex - startIndex), totalItems)} of {(totalItems || 0).toLocaleString()} entries
      </p>
      <div className="btn-group">
        <button 
          className="btn btn-outline-secondary" 
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <i className="bi bi-chevron-left"></i> Previous
        </button>
        <span className="btn btn-outline-secondary" style={{ pointerEvents: 'none', borderLeft: 'none', borderRight: 'none' }}>
          Page {currentPage} of {totalPages}
        </span>
        <button 
          className="btn btn-outline-secondary"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next <i className="bi bi-chevron-right"></i>
        </button>
      </div>
    </div>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
};

export default Pagination;

