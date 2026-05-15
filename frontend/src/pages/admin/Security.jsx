import React, { useState, useMemo } from 'react';
import DataTable from '../../components/DataTable';
import { useKeys } from '../../hooks/useData';
import apiClient from '../../api/client';

function Security() {
  const { keys = [], updateKey, createKey, loading = false, refetch } = useKeys();
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showRotateModal, setShowRotateModal] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [rotationReason, setRotationReason] = useState('');
  const [keyName, setKeyName] = useState('');
  const [algorithm, setAlgorithm] = useState('ecdsa_p256');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [operationError, setOperationError] = useState('');
  const [isOperating, setIsOperating] = useState(false);

  // Filter keys
  const filteredKeys = useMemo(() => {
    if (!keys || !Array.isArray(keys)) return [];
    
    let result = [...keys];
    
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(key =>
        (key.name || '').toLowerCase().includes(term) ||
        (key.fingerprint || '').toLowerCase().includes(term)
      );
    }
    
    if (statusFilter !== 'all') {
      result = result.filter(key => (key.status || '').toLowerCase() === statusFilter);
    }
    
    return result;
  }, [keys, searchTerm, statusFilter]);

  const stats = [
    { label: 'Active Keys', value: keys.filter(k => (k.status || '').toLowerCase() === 'active').length, color: 'success' },
    { label: 'Rotated Keys', value: keys.filter(k => (k.status || '').toLowerCase() === 'rotated').length, color: 'info' },
    { label: 'Revoked Keys', value: keys.filter(k => (k.status || '').toLowerCase() === 'revoked').length, color: 'warning' },
    { label: 'Total Keys', value: keys.length, color: 'secondary' }
  ];

  const columns = [
    { 
      key: 'name', 
      label: 'Key Name', 
      sortable: true,
      render: (value) => <span className="fw-semibold">{value || 'Unnamed'}</span>
    },
    { 
      key: 'algorithm', 
      label: 'Algorithm', 
      sortable: true,
      render: (value) => <span className="badge bg-info">{value === 'ecdsa_p256' ? 'ECDSA P-256' : value || 'Unknown'}</span>
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <span className={`badge bg-${value === 'active' ? 'success' : value === 'revoked' ? 'danger' : value === 'rotated' ? 'warning' : 'secondary'}`}>
          {value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Unknown'}
        </span>
      )
    },
    { 
      key: 'fingerprint', 
      label: 'Fingerprint', 
      sortable: true,
      render: (value) => <code className="text-monospace small">{value ? value.substring(0, 12) + '...' : 'N/A'}</code>
    },
    { 
      key: 'created_at', 
      label: 'Created', 
      sortable: true,
      render: (value) => <span>{value ? new Date(value).toLocaleDateString() : 'N/A'}</span>
    }
  ];

  const handleRotateClick = (key) => {
    setSelectedKey(key);
    setRotationReason('');
    setShowRotateModal(true);
  };

  const handleRevokeKey = async (key) => {
    if (!key) return;
    
    setIsOperating(true);
    setOperationError('');
    
    try {
      await apiClient.post(`/v1/security-keys/${key.id}/revoke/`);
      await refetch();
    } catch (error) {
      setOperationError(error?.response?.data?.message || 'Failed to revoke key.');
    } finally {
      setIsOperating(false);
    }
  };

  const handleRotateKey = async () => {
    if (!selectedKey) return;

    setIsOperating(true);
    setOperationError('');

    try {
      await apiClient.post(`/v1/security-keys/${selectedKey.id}/rotate/`, {
        rotation_reason: rotationReason || 'Manual rotation via admin panel'
      });
      setShowRotateModal(false);
      setSelectedKey(null);
      setRotationReason('');
      await refetch();
    } catch (error) {
      setOperationError(error?.response?.data?.message || 'Failed to rotate key.');
    } finally {
      setIsOperating(false);
    }
  };

  const handleGenerateKey = async () => {
    if (!keyName.trim()) {
      setOperationError('Key name is required.');
      return;
    }

    setIsOperating(true);
    setOperationError('');

    try {
      await apiClient.post('/v1/security-keys/', {
        name: keyName,
        algorithm: algorithm,
        key_type: 'signing'
      });
      setShowGenerateModal(false);
      setKeyName('');
      setAlgorithm('ecdsa_p256');
      await refetch();
    } catch (error) {
      setOperationError(error?.response?.data?.message || 'Failed to generate key.');
    } finally {
      setIsOperating(false);
    }
  };

  const actions = (row) => {
    const isActive = (row.status || '').toLowerCase() === 'active';
    const isRevoked = (row.status || '').toLowerCase() === 'revoked';
    const canOperate = !isRevoked;
    
    return (
      <div className="btn-group" role="group">
        {isActive && canOperate && (
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => handleRotateClick(row)}
            title="Rotate this key"
            disabled={isOperating}
          >
            <i className="bi bi-arrow-repeat"></i> Rotate
          </button>
        )}
        {canOperate && (
          <button
            className="btn btn-sm"
            onClick={() => handleRevokeKey(row)}
            title="Revoke this key"
            disabled={isOperating}
            style={{ 
              border: '1.5px solid #dc3545', 
              color: '#dc3545',
              padding: '0.4rem 0.75rem',
              fontWeight: '500'
            }}
            onMouseEnter={(e) => { e.target.style.backgroundColor = '#dc3545'; e.target.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#dc3545'; }}
          >
            <i className="bi bi-slash-circle"></i> Revoke
          </button>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Enterprise Key Lifecycle Management</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowGenerateModal(true)}
          disabled={isOperating}
        >
          <i className="bi bi-plus"></i> Generate New Key
        </button>
      </div>

      {operationError && (
        <div className="alert alert-danger mb-4" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {operationError}
        </div>
      )}

      {/* Stats Cards */}
      <div className="row mb-4">
        {stats.map((stat, index) => (
          <div key={index} className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h6 className="card-title text-muted">{stat.label}</h6>
                <h2 className={`mb-0 text-${stat.color}`}>{stat.value}</h2>
              </div>
            </div>
          </div>
        ))}
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
                  placeholder="Search by name or fingerprint..."
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
                <option value="active">Active</option>
                <option value="rotated">Rotated</option>
                <option value="revoked">Revoked</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Keys Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          {filteredKeys && filteredKeys.length > 0 ? (
            <DataTable
              data={filteredKeys}
              columns={columns}
              actions={actions}
              title="ECDSA Key Pairs"
              searchable={false}
            />
          ) : (
            <div className="text-center py-5">
              <i className="bi bi-key text-muted" style={{ fontSize: '3rem' }}></i>
              <p className="text-muted mt-2">No keys found</p>
            </div>
          )}
        </div>
      </div>

      {/* Generate Key Modal */}
      {showGenerateModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered" style={{ position: 'relative', zIndex: 1051 }}>
            <div className="modal-content" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
              <div className="modal-header" style={{ position: 'sticky', top: 0, zIndex: 1052 }}>
                <h5 className="modal-title">Generate New ECDSA Key Pair</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowGenerateModal(false)}
                  disabled={isOperating}
                ></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-info">
                  <strong>Database-Driven Key Management:</strong> New keys are generated and stored securely in the database with full lifecycle tracking and rotation history.
                </div>
                <form onSubmit={(e) => { e.preventDefault(); handleGenerateKey(); }}>
                  <div className="mb-3">
                    <label className="form-label">Key Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g., Primary Signing Key"
                      value={keyName}
                      onChange={(e) => setKeyName(e.target.value)}
                      disabled={isOperating}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Algorithm</label>
                    <select 
                      className="form-select"
                      value={algorithm}
                      onChange={(e) => setAlgorithm(e.target.value)}
                      disabled={isOperating}
                    >
                      <option value="ecdsa_p256">ECDSA P-256 (secp256r1)</option>
                    </select>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowGenerateModal(false);
                    setKeyName('');
                    setAlgorithm('ecdsa_p256');
                  }}
                  disabled={isOperating}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={isOperating}
                  onClick={handleGenerateKey}
                >
                  {isOperating ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Generating...
                    </>
                  ) : (
                    'Generate Key'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rotate Key Modal */}
      {showRotateModal && selectedKey && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered" style={{ position: 'relative', zIndex: 1051 }}>
            <div className="modal-content" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
              <div className="modal-header" style={{ position: 'sticky', top: 0, zIndex: 1052 }}>
                <h5 className="modal-title">Rotate Key</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowRotateModal(false);
                    setSelectedKey(null);
                    setRotationReason('');
                  }}
                  disabled={isOperating}
                ></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label className="form-label">Key Fingerprint</label>
                    <input
                      type="text"
                      className="form-control"
                      value={selectedKey.fingerprint || selectedKey.id}
                      disabled
                      readOnly
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Algorithm</label>
                    <input
                      type="text"
                      className="form-control"
                      value={selectedKey.algorithm === 'ecdsa_p256' ? 'ECDSA P-256' : selectedKey.algorithm}
                      disabled
                      readOnly
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Rotation Reason</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={rotationReason}
                      onChange={(e) => setRotationReason(e.target.value)}
                      placeholder="e.g., Compliance requirement, security best practice, scheduled maintenance"
                    />
                  </div>
                  <div className="alert alert-info">
                    <strong>What happens during rotation:</strong>
                    <ul className="mb-0 mt-2">
                      <li>A new ECDSA key pair will be generated</li>
                      <li>The current key will be marked as rotated</li>
                      <li>All new signatures will use the new key</li>
                      <li>Old signatures remain valid for verification</li>
                    </ul>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowRotateModal(false);
                    setSelectedKey(null);
                    setRotationReason('');
                  }}
                  disabled={isOperating}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleRotateKey}
                  disabled={isOperating}
                >
                  {isOperating ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Rotating...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-arrow-repeat me-2"></i>
                      Confirm Rotation
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Security;
