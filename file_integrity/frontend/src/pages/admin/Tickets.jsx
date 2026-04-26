import React, { useState, useMemo } from 'react';
import DataTable from '../../components/DataTable';
import { useTickets } from '../../hooks/useData';

function Tickets() {
  const { tickets = [], loading = false, updateTicket, createTicket } = useTickets?.() || {};
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionType, setActionType] = useState('resolve');
  const [actionNotes, setActionNotes] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'open',
    category: 'general'
  });

  const getPriorityBadge = (priority) => {
    const badges = {
      critical: 'danger',
      high: 'warning',
      medium: 'info',
      low: 'secondary'
    };
    return badges[priority] || 'secondary';
  };

  const getStatusBadge = (status) => {
    const badges = {
      open: 'primary',
      'in-progress': 'warning',
      resolved: 'success',
      closed: 'secondary'
    };
    return badges[status] || 'secondary';
  };

  // Apply filters
  const filteredTickets = useMemo(() => {
    if (!tickets || !Array.isArray(tickets)) {
      return [];
    }
    let result = [...tickets];
    
    if (priorityFilter !== 'all') {
      result = result.filter(t => t.priority === priorityFilter);
    }
    
    if (statusFilter !== 'all') {
      result = result.filter(t => t.status === statusFilter);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(t => 
        (t.ticketId || '').toLowerCase().includes(term) || 
        (t.title || '').toLowerCase().includes(term)
      );
    }
    
    return result;
  }, [tickets, priorityFilter, statusFilter, searchTerm]);

  const columns = [
    {
      key: 'ticketId',
      label: 'Ticket ID',
      sortable: true,
      filterable: true,
      render: (value) => (
        <span className="fw-semibold" style={{ fontSize: '14px', color: '#0D1526' }}>
          {value}
        </span>
      )
    },
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      filterable: true,
      render: (value) => (
        <span style={{ fontSize: '14px', color: '#1F2937' }}>{value}</span>
      )
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      filterable: true,
      render: (value) => (
        <span style={{ fontSize: '14px', color: '#374151', textTransform: 'capitalize' }}>
          {value}
        </span>
      )
    },
    {
      key: 'priority',
      label: 'Priority',
      sortable: true,
      filterable: true,
      render: (value) => (
        <span 
          className={`badge bg-${getPriorityBadge(value)}`}
          style={{ fontSize: '12px', fontWeight: '500', padding: '6px 12px', textTransform: 'capitalize' }}
        >
          {value}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      filterable: true,
      render: (value) => (
        <span 
          className={`badge bg-${getStatusBadge(value)}`}
          style={{ fontSize: '12px', fontWeight: '500', padding: '6px 12px', textTransform: 'capitalize' }}
        >
          {value === 'in-progress' ? 'In Progress' : value}
        </span>
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (value) => (
        <span style={{ fontSize: '14px', color: '#1F2937' }}>
          {value ? new Date(value).toLocaleString() : '—'}
        </span>
      )
    }
  ];

  const actions = (ticket) => (
    <>
      <button
        className="btn btn-sm btn-primary"
        onClick={() => {
          setSelectedTicket(ticket);
          setShowActionModal(true);
          setActionType('resolve');
          setActionNotes('');
        }}
      >
        <i className="bi bi-check-circle me-1"></i>
        Action
      </button>
    </>
  );

  const handleSubmitAction = async (e) => {
    e.preventDefault();
    if (selectedTicket && updateTicket) {
      const newStatus = actionType === 'resolve' ? 'resolved' : actionType === 'progress' ? 'in-progress' : 'closed';
      await updateTicket(selectedTicket.id, { status: newStatus });
    }
    setShowActionModal(false);
    setSelectedTicket(null);
    setActionNotes('');
  };

  const handleCloseActionModal = () => {
    setShowActionModal(false);
    setSelectedTicket(null);
    setActionNotes('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedTicket && updateTicket) {
      await updateTicket(selectedTicket.id, formData);
    } else if (createTicket) {
      await createTicket(formData);
    }
    setShowEditModal(false);
    setSelectedTicket(null);
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      status: 'open',
      category: 'general'
    });
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setSelectedTicket(null);
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      status: 'open',
      category: 'general'
    });
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
    <div>
      {/* Header */}
      <div className="mb-4">
        <h2 className="mb-2" style={{ fontSize: '28px', fontWeight: '700', color: '#0D1526' }}>
          Enterprise Incident Management
        </h2>
        <p className="text-muted" style={{ fontSize: '14px' }}>
          Resolve contract, compliance, access, and cryptographic integrity incidents
        </p>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-search" style={{ color: '#6B7280' }}></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search by incident ID or title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ borderRadius: '0 6px 6px 0' }}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select 
                className="form-select"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className="col-md-3">
              <select 
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* DataTable */}
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          {filteredTickets && filteredTickets.length > 0 ? (
            <DataTable
              columns={columns}
              data={filteredTickets}
              actions={actions}
              loading={loading}
              searchable={false}
            />
          ) : (
            <div className="text-center py-5">
              <i className="bi bi-inbox text-muted" style={{ fontSize: '3rem' }}></i>
              <p className="text-muted mt-2">No incidents found</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit/Create Modal */}
      {showEditModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered" style={{ position: 'relative', zIndex: 1051 }}>
            <div className="modal-content border-0 shadow" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
              <div className="modal-header" style={{ backgroundColor: '#0D1526', borderBottom: 'none', position: 'sticky', top: 0, zIndex: 1052 }}>
                <h5 className="modal-title text-white">
                  <i className="bi bi-ticket-detailed me-2"></i>
                  {selectedTicket ? 'Edit Ticket' : 'Create Ticket'}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={handleCloseModal}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  {selectedTicket && (
                    <div className="mb-3">
                      <label className="form-label text-muted" style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                        Ticket ID
                      </label>
                      <p className="fw-semibold" style={{ fontSize: '14px', color: '#0D1526' }}>
                        {selectedTicket.ticketId}
                      </p>
                    </div>
                  )}
                  <div className="mb-3">
                    <label className="form-label">Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      placeholder="Brief description of the issue"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description *</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                      placeholder="Detailed description of the issue, error messages, steps to reproduce..."
                    ></textarea>
                  </div>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label">Category</label>
                      <select
                        className="form-select"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        <option value="general">General</option>
                        <option value="hash">Hash Verification</option>
                        <option value="upload">Upload Issue</option>
                        <option value="key">Key Management</option>
                        <option value="authentication">Authentication</option>
                        <option value="database">Database</option>
                        <option value="network">Network</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Priority</label>
                      <select
                        className="form-select"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Status</label>
                      <select
                        className="form-select"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="open">Open</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  </div>
                  {selectedTicket && (
                    <div className="mt-3">
                      <label className="form-label text-muted" style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                        Created By
                      </label>
                      <p style={{ fontSize: '14px', color: '#1F2937' }}>{selectedTicket.createdBy}</p>
                      <label className="form-label text-muted" style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                        Created At
                      </label>
                      <p style={{ fontSize: '14px', color: '#1F2937' }}>
                        {selectedTicket.createdAt ? new Date(selectedTicket.createdAt).toLocaleString() : '—'}
                      </p>
                    </div>
                  )}
                </div>
                <div className="modal-footer border-top-0" style={{ backgroundColor: '#F9FAFB' }}>
                  <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn text-white" style={{ backgroundColor: '#0D1526' }}>
                    <i className="bi bi-check-circle me-2"></i>
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal */}
      {showActionModal && selectedTicket && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered" style={{ position: 'relative', zIndex: 1051 }}>
            <div className="modal-content border-0 shadow" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
              <div className="modal-header" style={{ backgroundColor: '#0D1526', borderBottom: 'none', position: 'sticky', top: 0, zIndex: 1052 }}>
                <h5 className="modal-title text-white">
                  <i className="bi bi-lightning-charge me-2"></i>
                  Take Action on Ticket
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={handleCloseActionModal}></button>
              </div>
              <form onSubmit={handleSubmitAction}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label text-muted" style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                      Ticket ID
                    </label>
                    <p className="fw-semibold" style={{ fontSize: '14px', color: '#0D1526' }}>
                      {selectedTicket.ticketId}
                    </p>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted" style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                      Title
                    </label>
                    <p style={{ fontSize: '14px', color: '#1F2937' }}>{selectedTicket.title}</p>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Action Type *</label>
                    <select
                      className="form-select"
                      value={actionType}
                      onChange={(e) => setActionType(e.target.value)}
                    >
                      <option value="progress">Mark as In Progress</option>
                      <option value="resolve">Mark as Resolved</option>
                      <option value="unnecessary">Mark as Unnecessary</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Action Notes</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={actionNotes}
                      onChange={(e) => setActionNotes(e.target.value)}
                      placeholder="Add notes about the action taken..."
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-top-0" style={{ backgroundColor: '#F9FAFB' }}>
                  <button type="button" className="btn btn-secondary" onClick={handleCloseActionModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn text-white" style={{ backgroundColor: '#0D1526' }}>
                    <i className="bi bi-check-circle me-2"></i>
                    Confirm Action
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tickets;
