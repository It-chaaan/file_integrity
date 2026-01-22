import React, { useState, useMemo } from 'react';
import StatusBadge from '../../components/StatusBadge';
import DataTable from '../../components/DataTable';
import { useKeys } from '../../hooks/useData';

function Security() {
  const { keys = [], updateKey, loading = false } = useKeys?.() || {};
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showRotateModal, setShowRotateModal] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [rotationReason, setRotationReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter keys
  const filteredKeys = useMemo(() => {
    if (!keys || !Array.isArray(keys)) return [];
    
    let result = [...keys];
    
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(key =>
        (key.keyId || '').toLowerCase().includes(term) ||
        (key.algorithm || '').toLowerCase().includes(term)
      );
    }
    
    if (statusFilter !== 'all') {
      result = result.filter(key => (key.status || '').toLowerCase() === statusFilter);
    }
    
    return result;
  }, [keys, searchTerm, statusFilter]);

  const stats = [
    { label: 'Active Keys', value: keys.filter(k => (k.status || '').toLowerCase() === 'active').length, color: 'success' },
    { label: 'Revoked Keys', value: keys.filter(k => (k.status || '').toLowerCase() === 'revoked').length, color: 'warning' },
    { label: 'Expired Keys', value: keys.filter(k => (k.status || '').toLowerCase() === 'expired').length, color: 'danger' }
  ];

  const columns = [
    { key: 'keyId', label: 'Key ID', sortable: true },
    { key: 'algorithm', label: 'Algorithm', sortable: true },
    { key: 'created', label: 'Created', sortable: true },
    { key: 'expires', label: 'Expires', sortable: true },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <span className={`badge bg-${value === 'active' ? 'success' : value === 'revoked' ? 'warning' : 'danger'}`}>
          {value || 'Unknown'}
        </span>
      )
    },
    { key: 'lastUsed', label: 'Last Used', sortable: true }
  ];

  const handleRotateClick = (key) => {
    setSelectedKey(key);
    setRotationReason('');
    setShowRotateModal(true);
  };

  const handleRevokeKey = (key) => {
    if (updateKey && key) {
      updateKey(key.id, {
        ...key,
        status: 'revoked',
        lastUsed: 'Revoked now'
      });
    }
  };

  const handleRotateKey = () => {
    if (selectedKey && updateKey) {
      updateKey(selectedKey.id, {
        ...selectedKey,
        status: 'active',
        created: new Date().toISOString().split('T')[0],
        expires: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        lastUsed: 'Now'
      });
      setShowRotateModal(false);
      setSelectedKey(null);
      setRotationReason('');
    }
  };

  const actions = (row) => {
    // Only show rotate button for active keys
    const isActive = (row.status || '').toLowerCase() === 'active';
    const isRevoked = (row.status || '').toLowerCase() === 'revoked';
    const isExpired = (row.status || '').toLowerCase() === 'expired';
    const canRevoke = !isRevoked && !isExpired;
    
    return (
      <div className="btn-group" role="group">
        {isActive && (
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => handleRotateClick(row)}
            title="Rotate this key"
          >
            <i className="bi bi-arrow-repeat"></i> Rotate
          </button>
        )}
        {canRevoke && (
          <button
            className="btn btn-sm"
            onClick={() => handleRevokeKey(row)}
            title="Revoke this key"
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
        <h1 className="h3 mb-0">Security & Keys Management</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowGenerateModal(true)}
        >
          <i className="bi bi-plus"></i> Generate New Key
        </button>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        {stats.map((stat, index) => (
          <div key={index} className="col-md-4">
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
                  placeholder="Search by key ID or algorithm..."
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
                <option value="revoked">Revoked</option>
                <option value="expired">Expired</option>
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
                <h5 className="modal-title">Generate New Key Pair</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowGenerateModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label className="form-label">Algorithm</label>
                    <select className="form-select">
                      <option>ECDSA secp256k1</option>
                      <option>ECDSA secp256r1</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Validity Period (days)</label>
                    <input type="number" className="form-control" defaultValue="365" />
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowGenerateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    alert('Key pair generated successfully');
                    setShowGenerateModal(false);
                  }}
                >
                  Generate
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
                ></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label className="form-label">Key ID</label>
                    <input
                      type="text"
                      className="form-control"
                      value={selectedKey.keyId}
                      disabled
                      readOnly
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Algorithm</label>
                    <input
                      type="text"
                      className="form-control"
                      value={selectedKey.algorithm}
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
                      placeholder="Enter reason for key rotation"
                    />
                  </div>
                  <div className="alert alert-info">
                    <strong>New Key:</strong> A new key pair will be generated and the current key will be marked as inactive.
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
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleRotateKey}
                >
                  Rotate Key
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
