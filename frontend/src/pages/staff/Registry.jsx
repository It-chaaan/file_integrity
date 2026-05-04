import React, { useState, useMemo } from 'react';
import DataTable from '../../components/DataTable';
import { useDocuments } from '../../hooks/useData';
import { formatFileSize } from '../../services/utils';

function Registry() {
  const { documents = [], loading = false } = useDocuments();
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter documents
  const filteredDocuments = useMemo(() => {
    if (!documents || !Array.isArray(documents)) return [];
    
    let result = [...documents];
    
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(doc =>
        (doc.referenceNumber || doc.documentId || '').toLowerCase().includes(term) ||
        (doc.fileName || '').toLowerCase().includes(term) ||
        (doc.documentType || doc.type || '').toLowerCase().includes(term) ||
        (doc.department || '').toLowerCase().includes(term)
      );
    }
    
    if (statusFilter !== 'all') {
      result = result.filter(doc => doc.status === statusFilter);
    }
    
    return result;
  }, [documents, searchTerm, statusFilter]);

  const columns = [
    {
      key: 'documentId',
      label: 'Reference Number',
      sortable: true,
      filterable: true,
      render: (value, row) => (
        <span className="fw-semibold" style={{ fontSize: '14px', color: '#0D1526' }}>
          {row?.referenceNumber || value}
        </span>
      )
    },
    {
      key: 'fileName',
      label: 'Document Name',
      sortable: true,
      filterable: true,
      render: (value) => (
        <span style={{ fontSize: '14px', color: '#1E3A8A' }}>{value}</span>
      )
    },
    {
      key: 'documentType',
      label: 'Document Type',
      sortable: true,
      filterable: true,
      render: (value) => (
        <span style={{ fontSize: '14px', color: '#1F2937' }}>{value || '—'}</span>
      )
    },
    {
      key: 'department',
      label: 'Department',
      sortable: true,
      filterable: true,
      render: (value) => (
        <span style={{ fontSize: '14px', color: '#8B4513' }}>{value}</span>
      )
    },
    {
      key: 'fileSize',
      label: 'Size',
      sortable: true,
      render: (value) => (
        <span style={{ fontSize: '14px', color: '#1F2937' }}>{formatFileSize(value)}</span>
      )
    },
    {
      key: 'uploadDate',
      label: 'Upload Date',
      sortable: true,
      filterable: true,
      render: (value) => (
        <span style={{ fontSize: '14px', color: '#1F2937' }}>
          {new Date(value).toLocaleDateString()}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      filterable: true,
      render: (value) => {
        const statusConfig = {
          verified: { bg: 'success', text: 'Verified' },
          pending: { bg: 'warning', text: 'Pending' },
          failed: { bg: 'danger', text: 'Failed' },
          expired: { bg: 'secondary', text: 'Expired' }
        };
        const config = statusConfig[value] || statusConfig.pending;
        return (
          <span 
            className={`badge bg-${config.bg}`} 
            style={{ fontSize: '12px', fontWeight: '500', padding: '6px 12px' }}
          >
            {config.text}
          </span>
        );
      }
    }
  ];

  const actions = (doc) => (
    <>
      <button
        className="btn btn-sm text-white"
        style={{ backgroundColor: '#0D1526' }}
        onClick={() => {
          setSelectedDoc(doc);
          setShowDetailsModal(true);
        }}
      >
        <i className="bi bi-eye me-1"></i>
        View Details
      </button>
    </>
  );

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedDoc(null);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
          <h2 className="mb-2" style={{ fontSize: '28px', fontWeight: '700', color: '#0D1526' }}>
            Enterprise Document Registry
          </h2>
          <p className="text-muted" style={{ fontSize: '14px' }}>
            Browse and manage enterprise documents and cryptographic records
          </p>
      </div>

      {/* Filter Bar */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-8">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-search" style={{ color: '#6B7280' }}></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                    placeholder="Search by document ID, name, type, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ borderRadius: '0 6px 6px 0' }}
                />
              </div>
            </div>
            <div className="col-md-4">
              <select 
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* DataTable with search, filter, sort, pagination */}
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-muted mt-2">Loading documents...</p>
            </div>
          ) : filteredDocuments && filteredDocuments.length > 0 ? (
            <DataTable
              columns={columns}
              data={filteredDocuments}
              actions={actions}
              loading={loading}
              searchable={false}
            />
          ) : (
            <div className="text-center py-5">
              <i className="bi bi-inbox text-muted" style={{ fontSize: '3rem' }}></i>
              <p className="text-muted mt-2">No documents found</p>
            </div>
          )}
        </div>
      </div>

      {/* Document Details Modal */}
      {showDetailsModal && selectedDoc && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header" style={{ backgroundColor: '#0D1526', borderBottom: 'none' }}>
                <h5 className="modal-title text-white">
                  <i className="bi bi-file-earmark-text me-2"></i>
                  Document Details
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={handleCloseDetails}></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label text-muted" style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                      Reference Number
                    </label>
                    <p className="fw-semibold" style={{ fontSize: '14px', color: '#0D1526' }}>
                      {selectedDoc.referenceNumber || selectedDoc.documentId}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted" style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                      Status
                    </label>
                    <p>
                      <span className={`badge bg-${selectedDoc.status === 'verified' ? 'success' : 'warning'}`}>
                        {selectedDoc.status}
                      </span>
                    </p>
                  </div>
                  <div className="col-12">
                    <label className="form-label text-muted" style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                      File Name
                    </label>
                    <p className="fw-semibold" style={{ fontSize: '14px', color: '#1E3A8A' }}>
                      {selectedDoc.fileName}
                    </p>
                  </div>
                  <div className="col-md-6">
                      <label className="form-label text-muted" style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                        Document Type
                      </label>
                      <p style={{ fontSize: '14px', color: '#1F2937' }}>{selectedDoc.documentType || selectedDoc.type || '—'}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted" style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                      File Size
                    </label>
                    <p style={{ fontSize: '14px', color: '#1F2937' }}>{formatFileSize(selectedDoc.fileSize)}</p>
                  </div>
                  <div className="col-md-6">
                      <label className="form-label text-muted" style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                        Department
                      </label>
                      <p style={{ fontSize: '14px', color: '#8B4513' }}>{selectedDoc.department}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted" style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                      Upload Date
                    </label>
                    <p style={{ fontSize: '14px', color: '#1F2937' }}>
                      {new Date(selectedDoc.uploadDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="col-12">
                    <label className="form-label text-muted" style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                      SHA-256 Hash
                    </label>
                    <div 
                      className="p-3 rounded"
                      style={{ 
                        backgroundColor: '#F9FAFB', 
                        border: '1px solid #E5E7EB',
                        fontFamily: 'monospace',
                        fontSize: '13px',
                        wordBreak: 'break-all',
                        color: '#374151'
                      }}
                    >
                      {selectedDoc.hash}
                    </div>
                  </div>
                  <div className="col-12">
                    <label className="form-label text-muted" style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                      Uploaded By
                    </label>
                    <p style={{ fontSize: '14px', color: '#1F2937' }}>{selectedDoc.uploadedBy}</p>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-top-0" style={{ backgroundColor: '#F9FAFB' }}>
                <button 
                  type="button" 
                  className="btn text-white" 
                  style={{ backgroundColor: '#0D1526' }}
                  onClick={handleCloseDetails}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Registry;