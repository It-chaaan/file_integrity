import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocuments, useTickets } from '../../hooks/useData';

function Dashboard() {
  const navigate = useNavigate();
  const { documents = [], loading = false } = useDocuments();
  const { tickets = [] } = useTickets();

  const { verifiedDocs } = useMemo(() => {
    const verified = documents.filter(doc => doc.status === 'verified').length;
    return { verifiedDocs: verified };
  }, [documents]);

  const openTickets = useMemo(() => {
    return tickets.filter(ticket => ['open', 'waiting_response'].includes(ticket.status)).length;
  }, [tickets]);

  const urgentTickets = useMemo(() => {
    return tickets.filter(ticket => ticket.priority === 'urgent').length;
  }, [tickets]);

  const recentVerifications = useMemo(() => {
    return documents
      .filter(doc => doc.status === 'verified')
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 4);
  }, [documents]);

  const stats = [
    {
      title: 'Signed Contracts',
      value: verifiedDocs,
      icon: 'bi-shield-check',
      bgColor: '#10B981',
      iconColor: '#FFFFFF',
      onClick: () => navigate('/staff/registry')
    },
    {
      title: 'Open Tickets',
      value: openTickets,
      icon: 'bi-exclamation-triangle',
      bgColor: '#3B82F6',
      iconColor: '#FFFFFF',
      onClick: () => navigate('/staff/report')
    },
    {
      title: 'Urgent Tickets',
      value: urgentTickets,
      icon: 'bi-exclamation-circle',
      bgColor: '#F59E0B',
      iconColor: '#FFFFFF',
      onClick: () => navigate('/staff/report')
    }
  ];

  const getTimeAgo = (dateString) => {
    const diffMs = Date.now() - new Date(dateString).getTime();
    if (!Number.isFinite(diffMs) || diffMs < 0) return 'Just now';
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="mb-1">Dashboard</h2>
        <p className="text-muted">Enterprise User Portal</p>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        {stats.map((stat, index) => (
          <div key={index} className="col-12 col-md-6 col-xl-3">
            <div 
              className="card border-0 shadow-sm h-100"
              style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
              onClick={stat.onClick}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="rounded p-3 me-3" style={{ backgroundColor: stat.bgColor }}>
                    <i className={`bi ${stat.icon} fs-4`} style={{ color: stat.iconColor }}></i>
                  </div>
                  <div>
                    <h6 className="text-muted mb-1 fw-normal small">{stat.title}</h6>
                    <h3 className="mb-0 fw-bold">{stat.value}</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="card-title mb-0">Recent Verifications</h5>
              </div>

              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : recentVerifications.length === 0 ? (
                <div className="text-center py-4 text-muted">No recent verifications</div>
              ) : (
                <div className="list-group list-group-flush">
                  {recentVerifications.slice(0, 3).map((doc) => (
                    <div key={doc.id} className="list-group-item border-0 px-0 py-3">
                      <div className="d-flex align-items-start">
                        <div className="bg-success bg-opacity-10 p-2 rounded me-3">
                          <i className="bi bi-check-circle-fill text-success"></i>
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="mb-1 small">
                            {doc.document_type || 'Document'} #{doc.reference_number}
                          </h6>
                          <p className="text-muted small mb-0">{getTimeAgo(doc.created_at)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mt-1">
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center gap-3">
                <div className="bg-primary bg-opacity-10 p-3 rounded">
                  <i className="bi bi-file-earmark-check text-primary fs-4"></i>
                </div>
                <div>
                  <h6 className="mb-1">Verify Document</h6>
                  <p className="text-muted small mb-0">Validate the integrity of enterprise agreements and records</p>
                </div>
              </div>
              <button
                className="btn btn-outline-primary btn-sm mt-3"
                onClick={() => navigate('/staff/verify')}
              >
                Start Verification
              </button>
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center gap-3">
                <div className="bg-warning bg-opacity-10 p-3 rounded">
                  <i className="bi bi-exclamation-triangle text-warning fs-4"></i>
                </div>
                <div>
                  <h6 className="mb-1">Report Incident</h6>
                  <p className="text-muted small mb-0">Escalate compliance or document integrity incidents</p>
                </div>
              </div>
              <button
                className="btn btn-outline-warning btn-sm mt-3"
                onClick={() => navigate('/staff/report')}
              >
                Create Incident
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;