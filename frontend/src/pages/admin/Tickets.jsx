import React, { useState, useMemo } from 'react';
import DataTable from '../../components/DataTable';
import { useTickets } from '../../hooks/useData';
import { addTicketComment, getTicketById } from '../../api/tickets.api';

function Tickets() {
  const { tickets = [], loading = false, updateTicket, createTicket } = useTickets?.() || {};
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionType, setActionType] = useState('resolve');
  const [actionNotes, setActionNotes] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'open',
    category: 'general'
  });

  const formatUserDisplay = (ticket) => {
    if (!ticket) return 'Anonymous';
    return (
      ticket.requester_name ||
      ticket.created_by_name ||
      ticket.requester_email ||
      'Anonymous'
    );
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      urgent: 'danger',
      high: 'warning',
      medium: 'info',
      low: 'secondary'
    };
    return badges[priority] || 'secondary';
  };

  const getStatusBadge = (status) => {
    const badges = {
      open: 'primary',
      in_progress: 'warning',
      waiting_response: 'info',
      resolved: 'success',
      closed: 'secondary'
    };
    return badges[status] || 'secondary';
  };

  const formatStatusLabel = (status) => {
    const labels = {
      open: 'Open',
      in_progress: 'In Progress',
      waiting_response: 'Waiting Response',
      resolved: 'Resolved',
      closed: 'Closed',
    };
    return labels[status] || '—';
  };

  const formatCategoryLabel = (category) => {
    const labels = {
      general: 'General',
      technical: 'Technical',
      billing: 'Billing',
      verification: 'Verification',
      account: 'Account',
      abuse: 'Abuse',
    };
    return labels[category] || '—';
  };

  const formatRoleLabel = (role) => {
    const labels = {
      super_admin: 'System Administrator',
      admin: 'Administrator',
      staff: 'Staff',
      verifier: 'Verifier',
      client: 'Enterprise User',
    };
    return labels[role] || 'User';
  };

  // Apply filters
  const filteredTickets = useMemo(() => {
    if (!tickets || !Array.isArray(tickets)) {
      return [];
    }
    let result = [...tickets];
    
    if (statusFilter !== 'all') {
      result = result.filter(t => t.status === statusFilter);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(t => 
        (t.ticket_number || '').toLowerCase().includes(term) || 
        (t.title || '').toLowerCase().includes(term)
      );
    }
    
    return result;
  }, [tickets, statusFilter, searchTerm]);

  const columns = [
    {
      key: 'ticket_number',
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
        <span style={{ fontSize: '14px', color: '#374151' }}>
          {formatCategoryLabel(value)}
        </span>
      )
    },
    {
      key: 'requester_email',
      label: 'Reporter',
      sortable: true,
      filterable: true,
      render: (_, row) => (
        <span style={{ fontSize: '14px', color: '#374151' }}>
          {formatUserDisplay(row)}
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
          {formatStatusLabel(value)}
        </span>
      )
    },
    {
      key: 'created_at',
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
        className="btn btn-sm btn-outline-secondary me-2"
        onClick={() => handleViewTicket(ticket)}
      >
        <i className="bi bi-eye me-1"></i>
        Details
      </button>
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

  const handleViewTicket = async (ticket) => {
    try {
      const detailedTicket = await getTicketById(ticket.id);
      const nextTicket = detailedTicket || ticket;
      setSelectedTicket(nextTicket);
      setFormData({
        title: nextTicket.title || '',
        description: nextTicket.description || '',
        priority: nextTicket.priority || 'medium',
        status: nextTicket.status || 'open',
        category: nextTicket.category || 'general'
      });
      setShowEditModal(true);
    } catch {
      setSelectedTicket(ticket);
      setFormData({
        title: ticket.title || '',
        description: ticket.description || '',
        priority: ticket.priority || 'medium',
        status: ticket.status || 'open',
        category: ticket.category || 'general'
      });
      setShowEditModal(true);
    }
  };

  const getActionStatus = (value) => {
    if (value === 'progress') return 'in_progress';
    if (value === 'waiting') return 'waiting_response';
    if (value === 'resolve') return 'resolved';
    return 'closed';
  };

  const formatCommentAuthor = (comment) => {
    if (!comment) return 'System';
    const role = comment.author_role ? ` (${formatRoleLabel(comment.author_role)})` : '';
    return `${comment.author_name || 'System'}${role}`;
  };

  const handleSubmitAction = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;
    setSubmittingReply(true);
    try {
      const newStatus = getActionStatus(actionType);
      const note = actionNotes.trim();

      if (note) {
        await addTicketComment(selectedTicket.id, note, [], newStatus);
      } else if (updateTicket) {
        await updateTicket(selectedTicket.id, { status: newStatus });
      }

      const refreshedTicket = await getTicketById(selectedTicket.id);
      setSelectedTicket(refreshedTicket || selectedTicket);
      setShowActionModal(false);
      setActionNotes('');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleCloseActionModal = () => {
    setShowActionModal(false);
    setSelectedTicket(null);
    setActionNotes('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedTicket && updateTicket) {
      await updateTicket(selectedTicket.id, {
        category: formData.category,
        priority: formData.priority,
      });
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
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="waiting_response">Waiting Response</option>
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
                  {selectedTicket ? 'Ticket Details' : 'Create Ticket'}
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
                        {selectedTicket.ticket_number}
                      </p>
                    </div>
                  )}
                  <div className="mb-3">
                    <label className="form-label text-muted" style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Title</label>
                    <p style={{ fontSize: '14px', color: '#1F2937' }}>
                      {selectedTicket?.title || formData.title || '—'}
                    </p>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted" style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Description</label>
                    <p style={{ fontSize: '14px', color: '#1F2937', whiteSpace: 'pre-wrap' }}>
                      {selectedTicket?.description || formData.description || '—'}
                    </p>
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
                        <option value="technical">Technical</option>
                        <option value="billing">Billing</option>
                        <option value="verification">Verification</option>
                        <option value="account">Account</option>
                        <option value="abuse">Abuse</option>
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
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label text-muted" style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Status</label>
                      <p style={{ fontSize: '14px', color: '#1F2937', marginBottom: 0 }}>
                        {formatStatusLabel(selectedTicket?.status || formData.status)}
                      </p>
                    </div>
                  </div>
                  {selectedTicket && (
                    <div className="mt-3">
                      <label className="form-label text-muted" style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                        Created By
                      </label>
                      <p style={{ fontSize: '14px', color: '#1F2937' }}>{formatUserDisplay(selectedTicket)}</p>
                      <label className="form-label text-muted" style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                        Created At
                      </label>
                      <p style={{ fontSize: '14px', color: '#1F2937' }}>
                        {selectedTicket.created_at ? new Date(selectedTicket.created_at).toLocaleString() : '—'}
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
                    Save Ticket Settings
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
                      {selectedTicket.ticket_number}
                    </p>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted" style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                      Title
                    </label>
                    <p style={{ fontSize: '14px', color: '#1F2937' }}>{selectedTicket.title}</p>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted" style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                      Issue Description
                    </label>
                    <p style={{ fontSize: '14px', color: '#1F2937', whiteSpace: 'pre-wrap' }}>
                      {selectedTicket.description || '—'}
                    </p>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Action Type *</label>
                    <select
                      className="form-select"
                      value={actionType}
                      onChange={(e) => setActionType(e.target.value)}
                    >
                      <option value="progress">Mark as In Progress</option>
                      <option value="waiting">Request More Information</option>
                      <option value="resolve">Mark as Resolved</option>
                      <option value="unnecessary">Mark as Unnecessary</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Reply / Action Notes</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={actionNotes}
                      onChange={(e) => setActionNotes(e.target.value)}
                      placeholder="Add a visible reply to the requester or internal action context..."
                    ></textarea>
                  </div>
                  {selectedTicket.comments?.length > 0 && (
                    <div className="mb-3">
                      <label className="form-label text-muted" style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                        Conversation
                      </label>
                      <div className="border rounded p-3" style={{ maxHeight: '240px', overflowY: 'auto', backgroundColor: '#F9FAFB' }}>
                        {selectedTicket.comments.map((comment) => (
                          <div key={comment.id} className="mb-3 pb-3 border-bottom">
                            <div className="d-flex justify-content-between flex-wrap gap-2">
                              <strong style={{ fontSize: '14px', color: '#0D1526' }}>{formatCommentAuthor(comment)}</strong>
                              <span style={{ fontSize: '12px', color: '#6B7280' }}>
                                {comment.created_at ? new Date(comment.created_at).toLocaleString() : '—'}
                              </span>
                            </div>
                            <div style={{ fontSize: '14px', color: '#1F2937', whiteSpace: 'pre-wrap' }}>{comment.comment}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="modal-footer border-top-0" style={{ backgroundColor: '#F9FAFB' }}>
                  <button type="button" className="btn btn-secondary" onClick={handleCloseActionModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn text-white" style={{ backgroundColor: '#0D1526' }} disabled={submittingReply}>
                    <i className="bi bi-check-circle me-2"></i>
                    {submittingReply ? 'Saving...' : 'Confirm Action'}
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
