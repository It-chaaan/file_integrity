import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocuments, useUsers, useTickets, useLogs, useKeys } from '../../hooks/useData';
import { calculateStats } from '../../services/utils';

function Dashboard() {
  const navigate = useNavigate();
  const { documents, loading: docsLoading } = useDocuments();
  const { users, loading: usersLoading } = useUsers();
  const { tickets, loading: ticketsLoading } = useTickets();
  const { logs, loading: logsLoading } = useLogs();
  const { keys = [], loading: keysLoading } = useKeys();
  
  const [stats, setStats] = useState({
    totalDocuments: 0,
    activeDocuments: 0,
    totalUsers: 0,
    activeUsers: 0,
    totalTickets: 0,
    openTickets: 0,
    criticalTickets: 0,
    recentLogs: [],
    todayUploads: 0,
    todayVerifications: 0
  });

  const loading = docsLoading || usersLoading || ticketsLoading || logsLoading || keysLoading;

  useEffect(() => {
    if (!loading) {
      const calculatedStats = calculateStats(documents, users, tickets, logs);
      setStats(calculatedStats);
    }
  }, [documents, users, tickets, logs, loading]);

  const handleCardClick = (type) => {
    switch (type) {
      case 'documents':
        navigate('/admin/registry');
        break;
      case 'users':
        navigate('/admin/users');
        break;
      case 'tickets':
        navigate('/admin/tickets');
        break;
      case 'critical':
        navigate('/admin/tickets', { state: { filter: 'critical' } });
        break;
      default:
        break;
    }
  };

  const activeKeys = Array.isArray(keys)
    ? keys.filter(k => (k.status || '').toLowerCase() === 'active').length
    : 0;

  const recentActivity = useMemo(() => {
    const list = Array.isArray(stats.recentLogs) ? stats.recentLogs : [];
    return list.slice(0, 4);
  }, [stats.recentLogs]);

  const recentTickets = useMemo(() => {
    const list = Array.isArray(tickets) ? tickets : [];
    return [...list]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  }, [tickets]);

  const getTimeAgo = (dateString) => {
    const diffMs = Date.now() - new Date(dateString).getTime();
    if (!Number.isFinite(diffMs) || diffMs < 0) return 'Just now';
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} mins ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  };

  const getTicketPriority = (priority) => {
    const map = {
      critical: { label: 'HIGH', className: 'bg-danger-subtle text-danger' },
      high: { label: 'HIGH', className: 'bg-danger-subtle text-danger' },
      medium: { label: 'MEDIUM', className: 'bg-warning-subtle text-warning' },
      low: { label: 'LOW', className: 'bg-info-subtle text-info' }
    };
    return map[(priority || '').toLowerCase()] || map.medium;
  };

  const getTicketStatus = (status) => {
    const map = {
      open: { label: 'OPEN', className: 'bg-primary-subtle text-primary' },
      'in-progress': { label: 'IN-PROGRESS', className: 'bg-warning-subtle text-warning' },
      resolved: { label: 'RESOLVED', className: 'bg-success-subtle text-success' },
      closed: { label: 'RESOLVED', className: 'bg-success-subtle text-success' }
    };
    return map[(status || '').toLowerCase()] || map.open;
  };

  const statCards = [
    {
      title: 'Total Enterprise Documents',
      value: stats.totalDocuments,
      trend: '+12%',
      icon: 'bi-file-earmark-text',
      color: '#111827',
      onClick: () => handleCardClick('documents')
    },
    {
      title: 'Security Alerts',
      value: stats.criticalTickets,
      trend: '+5%',
      icon: 'bi-ticket-perforated',
      color: '#F59E0B',
      onClick: () => handleCardClick('tickets')
    },
    {
      title: 'Pending Approvals',
      value: stats.openTickets,
      trend: '+3%',
      icon: 'bi-hourglass-split',
      color: '#3B82F6',
      onClick: () => handleCardClick('users')
    },
    {
      title: 'Active Signing Keys',
      value: activeKeys,
      trend: '0%',
      icon: 'bi-key',
      color: '#8B5CF6',
      onClick: () => navigate('/admin/security')
    }
  ];

  return (
    <div className="dashboard-container">
      {/* Page Header - Responsive */}
      <div className="mb-3 mb-md-4">
        <h2 className="mb-1">Dashboard</h2>
        <p className="text-muted mb-0">Enterprise Operations Portal</p>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mt-3">Loading dashboard data...</p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="row g-3 g-md-4 mb-4">
            {statCards.map((stat) => (
              <div key={stat.title} className="col-12 col-sm-6 col-lg-3">
                <div
                  className="card border-0 shadow-sm h-100"
                  style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                  onClick={stat.onClick}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div className="card-body p-3 p-md-4">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <div
                          className="rounded p-2"
                          style={{ backgroundColor: stat.color, width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <i className={`bi ${stat.icon}`} style={{ color: '#FFFFFF', fontSize: '18px' }}></i>
                        </div>
                        <div className="mt-3">
                          <div className="text-muted small">{stat.title}</div>
                          <div className="h4 fw-bold mb-0">{stat.value}</div>
                        </div>
                      </div>
                      <div className="text-success small">{stat.trend}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="row g-4">
            {/* Recent Activity */}
            <div className="col-12 col-lg-8">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-3 p-md-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="card-title mb-0">Recent Activity</h5>
                    <i className="bi bi-activity text-muted"></i>
                  </div>

                  {recentActivity.length === 0 ? (
                    <div className="text-center py-4 text-muted">No recent activity</div>
                  ) : (
                    <div className="list-group list-group-flush">
                      {recentActivity.map((activity, index) => {
                        const isFailed = (activity.status || '').toLowerCase() === 'failed';
                        const actionLabel = (activity.action || '').replace(/_/g, ' ');
                        const statusLabel = isFailed
                          ? 'failed'
                          : (activity.action === 'DOCUMENT_VERIFY' ? 'verified' : 'uploaded');
                        const statusClass = isFailed ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success';
                        return (
                          <div key={`${activity.timestamp}-${index}`} className="list-group-item border-0 px-0 py-3">
                            <div className="d-flex align-items-start gap-3">
                              <div className={`rounded-circle d-flex align-items-center justify-content-center ${isFailed ? 'bg-danger-subtle' : 'bg-success-subtle'}`} style={{ width: '36px', height: '36px' }}>
                                <i className={`bi ${isFailed ? 'bi-x-lg' : 'bi-check-lg'} ${isFailed ? 'text-danger' : 'text-success'}`}></i>
                              </div>
                              <div className="flex-grow-1">
                                <div className="d-flex justify-content-between">
                                  <div>
                                    <div className="fw-semibold">{activity.details || actionLabel}</div>
                                    <div className="text-muted small">{activity.userName} • {getTimeAgo(activity.timestamp)}</div>
                                  </div>
                                  <span className={`badge ${statusClass}`}>{statusLabel}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Tickets */}
            <div className="col-12 col-lg-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-3 p-md-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="card-title mb-0">Recent Tickets</h5>
                    <i className="bi bi-ticket-perforated text-warning"></i>
                  </div>

                  {recentTickets.length === 0 ? (
                    <div className="text-center py-4 text-muted">No recent tickets</div>
                  ) : (
                    <div className="list-group list-group-flush">
                      {recentTickets.map((ticket) => {
                        const priority = getTicketPriority(ticket.priority);
                        const status = getTicketStatus(ticket.status);
                        return (
                          <div key={ticket.id} className="list-group-item border-0 px-0 py-3">
                            <div className="fw-semibold mb-1">{ticket.title}</div>
                            <div className="text-muted small mb-2">
                              {ticket.ticketId} • {getTimeAgo(ticket.createdAt)}
                            </div>
                            <div className="d-flex gap-2">
                              <span className={`badge ${priority.className}`}>{priority.label}</span>
                              <span className={`badge ${status.className}`}>{status.label}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;