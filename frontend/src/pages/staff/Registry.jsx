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
        (doc.reference_number || '').toLowerCase().includes(term) ||
        (doc.file_name || '').toLowerCase().includes(term) ||
        (doc.document_type || '').toLowerCase().includes(term) ||
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
      key: 'reference_number',
      label: 'Reference Number',
      sortable: true,
      filterable: true,
      render: (value, row) => (
        <span className="fw-semibold" style={{ fontSize: '14px', color: '#0D1526' }}>
          {value}
        </span>
      )
    },
    {
      key: 'file_name',
      label: 'Document Name',
      sortable: true,
      filterable: true,
      render: (value) => (
        <span style={{ fontSize: '14px', color: '#1E3A8A' }}>{value}</span>
      )
    },
    {
      key: 'document_type',
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
      key: 'file_size',
      label: 'Size',
      sortable: true,
      render: (value) => (
        <span style={{ fontSize: '14px', color: '#1F2937' }}>{formatFileSize(value)}</span>
      )
    },
    {
      key: 'created_at',
      label: 'Upload Date',
      sortable: true,
      filterable: true,
      render: (value) => (
        <span style={{ fontSize: '14px', color: '#1F2937' }}>
          {value ? new Date(value).toLocaleDateString() : '—'}
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
                      {selectedDoc.reference_number}
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
                      {selectedDoc.file_name}
                    </p>
                  </div>
                  <div className="col-md-6">
                      <label className="form-label text-muted" style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                        Document Type
                      </label>
                      <p style={{ fontSize: '14px', color: '#1F2937' }}>{selectedDoc.document_type || '—'}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted" style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                      File Size
                    </label>
                    <p style={{ fontSize: '14px', color: '#1F2937' }}>{formatFileSize(selectedDoc.file_size)}</p>
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
                      {selectedDoc.created_at ? new Date(selectedDoc.created_at).toLocaleDateString() : '—'}
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
                      {selectedDoc.document_hash}
                    </div>
                  </div>
                  <div className="col-12">
                    <label className="form-label text-muted" style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                      Uploaded By
                    </label>
                    <p style={{ fontSize: '14px', color: '#1F2937' }}>{selectedDoc.uploaded_by}</p>
                  </div>
                  
                  {/* Processing Time Information */}
                  {selectedDoc.metadata && selectedDoc.metadata.upload_timing && (
                    <div className="col-12">
                      <label className="form-label text-muted" style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                        <i className="bi bi-stopwatch me-1"></i>
                        Processing Time (Upload)
                      </label>
                      <div className="p-3 rounded" style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                        <div className="row g-2" style={{ fontSize: '13px' }}>
                          <div className="col-6 col-md-4">
                            <span className="text-muted">Hashing:</span>
                            <span className="fw-semibold ms-2">{selectedDoc.metadata.upload_timing.hashing_ms} ms</span>
                          </div>
                          <div className="col-6 col-md-4">
                            <span className="text-muted">Key Loading:</span>
                            <span className="fw-semibold ms-2">{selectedDoc.metadata.upload_timing.key_loading_ms} ms</span>
                          </div>
                          <div className="col-6 col-md-4">
                            <span className="text-muted">Signature Generation:</span>
                            <span className="fw-semibold ms-2">{selectedDoc.metadata.upload_timing.signing_ms} ms</span>
                          </div>
                          <div className="col-6 col-md-4">
                            <span className="text-muted">Serialization:</span>
                            <span className="fw-semibold ms-2">{selectedDoc.metadata.upload_timing.serialization_ms} ms</span>
                          </div>
                          <div className="col-12 mt-2 pt-2 border-top">
                            <span className="text-muted">Total:</span>
                            <span className="fw-bold text-primary ms-2">{selectedDoc.metadata.upload_timing.total_ms} ms</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Performance Metrics (CPU & RAM) */}
                  {selectedDoc.metadata && selectedDoc.metadata.upload_performance && (
                    <div className="col-12">
                      <label className="form-label text-muted" style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                        <i className="bi bi-speedometer2 me-1"></i>
                        Performance Metrics (Upload)
                      </label>
                      <div className="p-3 rounded" style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                        {/* Hashing Performance */}
                        {selectedDoc.metadata.upload_performance.hashing && (
                          <div className="mb-3 pb-3 border-bottom" style={{ fontSize: '13px' }}>
                            <p className="small fw-semibold mb-2 text-muted">Hashing</p>
                            <div className="row g-2">
                              <div className="col-6 col-md-3">
                                <span className="text-muted">Before:</span>
                                <span className="fw-semibold ms-1">{selectedDoc.metadata.upload_performance.hashing.memory_before_mb} MB</span>
                              </div>
                              <div className="col-6 col-md-3">
                                <span className="text-muted">After:</span>
                                <span className="fw-semibold ms-1">{selectedDoc.metadata.upload_performance.hashing.memory_after_mb} MB</span>
                              </div>
                              <div className="col-6 col-md-3">
                                <span className="text-muted">Delta:</span>
                                <span className={`fw-semibold ms-1 ${selectedDoc.metadata.upload_performance.hashing.memory_delta_mb > 0 ? 'text-warning' : 'text-success'}`}>
                                  {selectedDoc.metadata.upload_performance.hashing.memory_delta_mb > 0 ? '+' : ''}{selectedDoc.metadata.upload_performance.hashing.memory_delta_mb} MB
                                </span>
                              </div>
                              <div className="col-6 col-md-3">
                                <span className="text-muted">CPU:</span>
                                <span className="fw-semibold ms-1">{selectedDoc.metadata.upload_performance.hashing.cpu_percent}%</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Key Loading Performance */}
                        {selectedDoc.metadata.upload_performance.key_loading && (
                          <div className="mb-3 pb-3 border-bottom" style={{ fontSize: '13px' }}>
                            <p className="small fw-semibold mb-2 text-muted">Key Loading</p>
                            <div className="row g-2">
                              <div className="col-6 col-md-3">
                                <span className="text-muted">Before:</span>
                                <span className="fw-semibold ms-1">{selectedDoc.metadata.upload_performance.key_loading.memory_before_mb} MB</span>
                              </div>
                              <div className="col-6 col-md-3">
                                <span className="text-muted">After:</span>
                                <span className="fw-semibold ms-1">{selectedDoc.metadata.upload_performance.key_loading.memory_after_mb} MB</span>
                              </div>
                              <div className="col-6 col-md-3">
                                <span className="text-muted">Delta:</span>
                                <span className={`fw-semibold ms-1 ${selectedDoc.metadata.upload_performance.key_loading.memory_delta_mb > 0 ? 'text-warning' : 'text-success'}`}>
                                  {selectedDoc.metadata.upload_performance.key_loading.memory_delta_mb > 0 ? '+' : ''}{selectedDoc.metadata.upload_performance.key_loading.memory_delta_mb} MB
                                </span>
                              </div>
                              <div className="col-6 col-md-3">
                                <span className="text-muted">CPU:</span>
                                <span className="fw-semibold ms-1">{selectedDoc.metadata.upload_performance.key_loading.cpu_percent}%</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Signing Performance */}
                        {selectedDoc.metadata.upload_performance.signing && (
                          <div className="mb-3 pb-3 border-bottom" style={{ fontSize: '13px' }}>
                            <p className="small fw-semibold mb-2 text-muted">Signature Generation</p>
                            <div className="row g-2">
                              <div className="col-6 col-md-3">
                                <span className="text-muted">Before:</span>
                                <span className="fw-semibold ms-1">{selectedDoc.metadata.upload_performance.signing.memory_before_mb} MB</span>
                              </div>
                              <div className="col-6 col-md-3">
                                <span className="text-muted">After:</span>
                                <span className="fw-semibold ms-1">{selectedDoc.metadata.upload_performance.signing.memory_after_mb} MB</span>
                              </div>
                              <div className="col-6 col-md-3">
                                <span className="text-muted">Delta:</span>
                                <span className={`fw-semibold ms-1 ${selectedDoc.metadata.upload_performance.signing.memory_delta_mb > 0 ? 'text-warning' : 'text-success'}`}>
                                  {selectedDoc.metadata.upload_performance.signing.memory_delta_mb > 0 ? '+' : ''}{selectedDoc.metadata.upload_performance.signing.memory_delta_mb} MB
                                </span>
                              </div>
                              <div className="col-6 col-md-3">
                                <span className="text-muted">CPU:</span>
                                <span className="fw-semibold ms-1">{selectedDoc.metadata.upload_performance.signing.cpu_percent}%</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Serialization Performance */}
                        {selectedDoc.metadata.upload_performance.serialization && (
                          <div className="mb-3 pb-3 border-bottom" style={{ fontSize: '13px' }}>
                            <p className="small fw-semibold mb-2 text-muted">Serialization</p>
                            <div className="row g-2">
                              <div className="col-6 col-md-3">
                                <span className="text-muted">Before:</span>
                                <span className="fw-semibold ms-1">{selectedDoc.metadata.upload_performance.serialization.memory_before_mb} MB</span>
                              </div>
                              <div className="col-6 col-md-3">
                                <span className="text-muted">After:</span>
                                <span className="fw-semibold ms-1">{selectedDoc.metadata.upload_performance.serialization.memory_after_mb} MB</span>
                              </div>
                              <div className="col-6 col-md-3">
                                <span className="text-muted">Delta:</span>
                                <span className={`fw-semibold ms-1 ${selectedDoc.metadata.upload_performance.serialization.memory_delta_mb > 0 ? 'text-warning' : 'text-success'}`}>
                                  {selectedDoc.metadata.upload_performance.serialization.memory_delta_mb > 0 ? '+' : ''}{selectedDoc.metadata.upload_performance.serialization.memory_delta_mb} MB
                                </span>
                              </div>
                              <div className="col-6 col-md-3">
                                <span className="text-muted">CPU:</span>
                                <span className="fw-semibold ms-1">{selectedDoc.metadata.upload_performance.serialization.cpu_percent}%</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Total Performance */}
                        {selectedDoc.metadata.upload_performance.total && (
                          <div className="pt-2 mt-2 border-top" style={{ fontSize: '13px' }}>
                            <p className="small fw-semibold mb-2 text-muted">Overall</p>
                            <div className="row g-2">
                              <div className="col-6 col-md-3">
                                <span className="text-muted">Peak Before:</span>
                                <span className="fw-semibold ms-1">{selectedDoc.metadata.upload_performance.total.memory_before_mb} MB</span>
                              </div>
                              <div className="col-6 col-md-3">
                                <span className="text-muted">Peak After:</span>
                                <span className="fw-semibold ms-1">{selectedDoc.metadata.upload_performance.total.memory_after_mb} MB</span>
                              </div>
                              <div className="col-6 col-md-3">
                                <span className="text-muted">Peak Delta:</span>
                                <span className={`fw-bold ms-1 ${selectedDoc.metadata.upload_performance.total.memory_delta_mb > 0 ? 'text-warning' : 'text-success'}`}>
                                  {selectedDoc.metadata.upload_performance.total.memory_delta_mb > 0 ? '+' : ''}{selectedDoc.metadata.upload_performance.total.memory_delta_mb} MB
                                </span>
                              </div>
                              <div className="col-6 col-md-3">
                                <span className="text-muted">Peak CPU:</span>
                                <span className="fw-semibold text-danger ms-1">{selectedDoc.metadata.upload_performance.total.cpu_percent}%</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Verification Time & Performance */}
                  {selectedDoc.metadata && selectedDoc.metadata.last_verification_timing && selectedDoc.metadata.last_verification_performance && (
                    <div className="col-12 mt-4">
                      <label className="form-label text-muted" style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                        <i className="bi bi-shield-check me-1"></i>
                        Latest Verification (Registry)
                      </label>
                      <div className="p-3 rounded" style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                        <div className="row g-2" style={{ fontSize: '13px' }}>
                          <div className="col-6 col-md-4">
                            <span className="text-muted">Hashing:</span>
                            <span className="fw-semibold ms-2">{selectedDoc.metadata.last_verification_timing.hashing_ms} ms</span>
                          </div>
                          <div className="col-6 col-md-4">
                            <span className="text-muted">Lookup:</span>
                            <span className="fw-semibold ms-2">{selectedDoc.metadata.last_verification_timing.document_lookup_ms} ms</span>
                          </div>
                          <div className="col-6 col-md-4">
                            <span className="text-muted">Verification:</span>
                            <span className="fw-semibold ms-2">{selectedDoc.metadata.last_verification_timing.verification_ms} ms</span>
                          </div>
                          <div className="col-12 mt-2 pt-2 border-top">
                            <span className="text-muted">Total:</span>
                            <span className="fw-bold text-primary ms-2">{selectedDoc.metadata.last_verification_timing.total_ms} ms</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedDoc.metadata && selectedDoc.metadata.last_verification_performance && (
                    <div className="col-12 mt-3">
                      <label className="form-label text-muted" style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                        <i className="bi bi-cpu me-1"></i>
                        Verification Performance Metrics
                      </label>
                      <div className="p-3 rounded" style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                        {selectedDoc.metadata.last_verification_performance.lookup && (
                          <div className="mb-3 pb-3 border-bottom" style={{ fontSize: '13px' }}>
                            <p className="small fw-semibold mb-2 text-muted">Lookup</p>
                            <div className="row g-2">
                              <div className="col-6 col-md-3">
                                <span className="text-muted">Before:</span>
                                <span className="fw-semibold ms-1">{selectedDoc.metadata.last_verification_performance.lookup.memory_before_mb} MB</span>
                              </div>
                              <div className="col-6 col-md-3">
                                <span className="text-muted">After:</span>
                                <span className="fw-semibold ms-1">{selectedDoc.metadata.last_verification_performance.lookup.memory_after_mb} MB</span>
                              </div>
                              <div className="col-6 col-md-3">
                                <span className="text-muted">Delta:</span>
                                <span className={`fw-semibold ms-1 ${selectedDoc.metadata.last_verification_performance.lookup.memory_delta_mb > 0 ? 'text-warning' : 'text-success'}`}>
                                  {selectedDoc.metadata.last_verification_performance.lookup.memory_delta_mb > 0 ? '+' : ''}{selectedDoc.metadata.last_verification_performance.lookup.memory_delta_mb} MB
                                </span>
                              </div>
                              <div className="col-6 col-md-3">
                                <span className="text-muted">CPU:</span>
                                <span className="fw-semibold ms-1">{selectedDoc.metadata.last_verification_performance.lookup.cpu_percent}%</span>
                              </div>
                            </div>
                          </div>
                        )}
                        {selectedDoc.metadata.last_verification_performance.verification && (
                          <div className="mb-3 pb-3 border-bottom" style={{ fontSize: '13px' }}>
                            <p className="small fw-semibold mb-2 text-muted">Verification</p>
                            <div className="row g-2">
                              <div className="col-6 col-md-3">
                                <span className="text-muted">Before:</span>
                                <span className="fw-semibold ms-1">{selectedDoc.metadata.last_verification_performance.verification.memory_before_mb} MB</span>
                              </div>
                              <div className="col-6 col-md-3">
                                <span className="text-muted">After:</span>
                                <span className="fw-semibold ms-1">{selectedDoc.metadata.last_verification_performance.verification.memory_after_mb} MB</span>
                              </div>
                              <div className="col-6 col-md-3">
                                <span className="text-muted">Delta:</span>
                                <span className={`fw-semibold ms-1 ${selectedDoc.metadata.last_verification_performance.verification.memory_delta_mb > 0 ? 'text-warning' : 'text-success'}`}>
                                  {selectedDoc.metadata.last_verification_performance.verification.memory_delta_mb > 0 ? '+' : ''}{selectedDoc.metadata.last_verification_performance.verification.memory_delta_mb} MB
                                </span>
                              </div>
                              <div className="col-6 col-md-3">
                                <span className="text-muted">CPU:</span>
                                <span className="fw-semibold ms-1">{selectedDoc.metadata.last_verification_performance.verification.cpu_percent}%</span>
                              </div>
                            </div>
                          </div>
                        )}
                        {selectedDoc.metadata.last_verification_performance.total && (
                          <div className="pt-2 mt-2 border-top" style={{ fontSize: '13px' }}>
                            <p className="small fw-semibold mb-2 text-muted">Overall</p>
                            <div className="row g-2">
                              <div className="col-6 col-md-3">
                                <span className="text-muted">Peak Before:</span>
                                <span className="fw-semibold ms-1">{selectedDoc.metadata.last_verification_performance.total.memory_before_mb} MB</span>
                              </div>
                              <div className="col-6 col-md-3">
                                <span className="text-muted">Peak After:</span>
                                <span className="fw-semibold ms-1">{selectedDoc.metadata.last_verification_performance.total.memory_after_mb} MB</span>
                              </div>
                              <div className="col-6 col-md-3">
                                <span className="text-muted">Peak Delta:</span>
                                <span className={`fw-bold ms-1 ${selectedDoc.metadata.last_verification_performance.total.memory_delta_mb > 0 ? 'text-warning' : 'text-success'}`}>
                                  {selectedDoc.metadata.last_verification_performance.total.memory_delta_mb > 0 ? '+' : ''}{selectedDoc.metadata.last_verification_performance.total.memory_delta_mb} MB
                                </span>
                              </div>
                              <div className="col-6 col-md-3">
                                <span className="text-muted">Peak CPU:</span>
                                <span className="fw-semibold text-danger ms-1">{selectedDoc.metadata.last_verification_performance.total.cpu_percent}%</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
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