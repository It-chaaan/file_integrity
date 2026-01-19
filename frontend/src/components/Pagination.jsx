import React from 'react';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  totalItems,
  startIndex,
  endIndex
}) => {
  return (
    <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
      <small className="text-muted">
        Showing {totalItems > 0 ? startIndex + 1 : 0} of {totalItems.toLocaleString()} entries
      </small>

      <nav aria-label="Page navigation">
        <ul className="pagination mb-0">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button 
              className="page-link"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              style={{ 
                color: '#6B7280', 
                border: '1px solid #D1D5DB',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              Previous
            </button>
          </li>

          <li className="page-item disabled">
            <span 
              className="page-link"
              style={{
                backgroundColor: '#0D1526',
                borderColor: '#0D1526',
                color: '#fff',
                minWidth: '40px',
                textAlign: 'center'
              }}
            >
              {currentPage}
            </span>
          </li>

          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button 
              className="page-link"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{ 
                color: '#6B7280', 
                border: '1px solid #D1D5DB',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              Next
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Pagination;

