import React, { useMemo, useState } from 'react';
import { createTicket } from '../../api/adapter';
import { addTicketComment, getTicketById } from '../../api/tickets.api';
import { useTickets } from '../../hooks/useData';
import { getCurrentUser } from '../../services/auth';

function Report() {
  const currentUser = getCurrentUser();
  const { tickets = [], loading: loadingTickets, refetch: refetchTickets } = useTickets();
  const categoryOptions = [
    { value: 'technical', label: 'Technical' },
    { value: 'verification', label: 'Verification' },
    { value: 'account', label: 'Account' },
    { value: 'billing', label: 'Billing' },
    { value: 'abuse', label: 'Abuse' },
    { value: 'general', label: 'General' },
  ];
  const [formData, setFormData] = useState({
    category: 'technical',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [ticketNumber, setTicketNumber] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loadingTicketDetail, setLoadingTicketDetail] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyError, setReplyError] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const myTickets = useMemo(() => {
    if (!Array.isArray(tickets)) return [];
    return [...tickets].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  }, [tickets]);

  const currentUserDisplayName = [
    currentUser?.first_name,
    currentUser?.last_name,
  ].filter(Boolean).join(' ') || currentUser?.full_name || currentUser?.username || currentUser?.email || '';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);

    try {
      const response = await createTicket({
        title: 'System issue report',
        description: formData.message.trim(),
        category: formData.category,
        priority: 'medium'
      });

      const createdTicket = response?.data || response;
      setTicketNumber(createdTicket?.ticket_number || '');
      setSubmitted(true);
      setFormData({ category: 'technical', message: '' });
      refetchTickets();
    } catch (error) {
      setSubmitError(error?.message || 'We could not submit the report right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenTicket = async (ticket) => {
    setLoadingTicketDetail(true);
    setReplyError('');
    try {
      const detailedTicket = await getTicketById(ticket.id);
      setSelectedTicket(detailedTicket || ticket);
    } catch {
      setSelectedTicket(ticket);
    } finally {
      setLoadingTicketDetail(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) {
      setReplyError('Please enter a reply before sending.');
      return;
    }

    setIsReplying(true);
    setReplyError('');
    try {
      await addTicketComment(selectedTicket.id, replyMessage.trim());
      const refreshedTicket = await getTicketById(selectedTicket.id);
      setSelectedTicket(refreshedTicket || selectedTicket);
      setReplyMessage('');
      refetchTickets();
    } catch (error) {
      setReplyError(error?.message || 'We could not send your reply right now.');
    } finally {
      setIsReplying(false);
    }
  };

  const formatCommentAuthor = (comment) => {
    if (!comment) return 'System';
    const roleLabels = {
      super_admin: 'System Administrator',
      admin: 'Administrator',
      staff: 'Staff',
      verifier: 'Verifier',
      client: 'Enterprise User',
    };
    const role = comment.author_role ? ` (${roleLabels[comment.author_role] || 'User'})` : '';
    return `${comment.author_name || 'System'}${role}`;
  };

  const getStatusBadge = (status) => {
    const badges = {
      open: 'primary',
      in_progress: 'warning',
      waiting_response: 'info',
      resolved: 'success',
      closed: 'secondary',
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

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="text-center mb-5">
            <h1 className="display-5 fw-bold mb-3">Report System Issue</h1>
            <p className="lead text-muted">
              Report any technical issues or system problems to our admin team
            </p>
          </div>

          {submitted && (
            <div className="alert alert-success" role="alert">
              <i className="bi bi-check-circle-fill me-2"></i>
              Thank you! Your report has been received. Our system admin team will investigate and respond shortly.
              {ticketNumber && <div className="fw-semibold mt-2">Reference: {ticketNumber}</div>}
            </div>
          )}

          {submitError && !submitted && (
            <div className="alert alert-danger" role="alert">
              {submitError}
            </div>
          )}

          <div className="row g-4">
            <div className="col-lg-6">
              <form onSubmit={handleSubmit} className="card shadow-sm border-0 p-4 h-100">
                <div className="mb-4">
                  <label htmlFor="category" className="form-label fw-semibold">
                    Category <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select form-select-lg"
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    {categoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label htmlFor="message" className="form-label fw-semibold">
                    Issue Description <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control form-control-lg"
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="5"
                    required
                    placeholder="Describe the system issue, error messages, affected features, and what you were trying to do..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-100 py-3"
                  style={{ fontSize: '1rem' }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </form>
            </div>
            <div className="col-lg-6">
              <div className="card shadow-sm border-0 p-4 h-100">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0">My Tickets</h5>
                  <small className="text-muted">{currentUserDisplayName}</small>
                </div>
                {loadingTickets ? (
                  <div className="text-muted">Loading your tickets...</div>
                ) : myTickets.length === 0 ? (
                  <div className="text-muted">No tickets submitted yet.</div>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {myTickets.map((ticket) => (
                      <button
                        key={ticket.id}
                        type="button"
                        className="btn btn-light text-start border"
                        onClick={() => handleOpenTicket(ticket)}
                      >
                        <div className="d-flex justify-content-between align-items-start gap-3">
                          <div>
                            <div className="fw-semibold">{ticket.ticket_number}</div>
                            <div style={{ fontSize: '14px' }}>{ticket.title}</div>
                            <small className="text-muted">{ticket.created_at ? new Date(ticket.created_at).toLocaleString() : '—'}</small>
                          </div>
                          <span className={`badge bg-${getStatusBadge(ticket.status)}`}>
                            {formatStatusLabel(ticket.status)}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="alert alert-info mt-4">
            <small>
              <strong>Note:</strong> Your report will be reviewed by our system administration team. For urgent issues, please contact your department administrator directly.
            </small>
          </div>
        </div>
      </div>

      {selectedTicket && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header" style={{ backgroundColor: '#0D1526', borderBottom: 'none' }}>
                <h5 className="modal-title text-white">Ticket Conversation</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedTicket(null)}></button>
              </div>
              <div className="modal-body p-4">
                {loadingTicketDetail ? (
                  <div className="text-muted">Loading ticket details...</div>
                ) : (
                  <>
                    <div className="mb-3">
                      <div className="fw-semibold">{selectedTicket.ticket_number}</div>
                      <div>{selectedTicket.title}</div>
                      <small className="text-muted">
                        Status: {formatStatusLabel(selectedTicket.status)}
                      </small>
                    </div>
                    <div className="mb-3 p-3 border rounded" style={{ backgroundColor: '#F9FAFB' }}>
                      <div className="fw-semibold mb-1">Original issue</div>
                      <div style={{ whiteSpace: 'pre-wrap' }}>{selectedTicket.description}</div>
                    </div>
                    <div className="mb-3">
                      <div className="fw-semibold mb-2">Conversation</div>
                      <div className="border rounded p-3" style={{ maxHeight: '280px', overflowY: 'auto', backgroundColor: '#fff' }}>
                        {selectedTicket.comments?.length ? selectedTicket.comments.map((comment) => (
                          <div key={comment.id} className="mb-3 pb-3 border-bottom">
                            <div className="d-flex justify-content-between flex-wrap gap-2">
                              <strong>{formatCommentAuthor(comment)}</strong>
                              <small className="text-muted">{comment.created_at ? new Date(comment.created_at).toLocaleString() : '—'}</small>
                            </div>
                            <div style={{ whiteSpace: 'pre-wrap' }}>{comment.comment}</div>
                          </div>
                        )) : (
                          <div className="text-muted">No replies yet.</div>
                        )}
                      </div>
                    </div>
                    {(selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed') && (
                      <form onSubmit={handleReply}>
                        <label className="form-label fw-semibold">Send Reply</label>
                        <textarea
                          className="form-control mb-3"
                          rows="3"
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                          placeholder={selectedTicket.status === 'waiting_response' ? 'Provide the requested details here...' : 'Add more context to help the team resolve this issue...'}
                        />
                        {replyError && <div className="alert alert-danger py-2">{replyError}</div>}
                        <button type="submit" className="btn btn-primary" disabled={isReplying}>
                          {isReplying ? 'Sending...' : 'Send Reply'}
                        </button>
                      </form>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Report;
