import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocuments, useUsers, useTickets, useLogs } from '../../hooks/useData';
import { calculateStats } from '../../services/utils';

function Dashboard() {
  const navigate = useNavigate();
  const { documents, loading: docsLoading } = useDocuments();
  const { users, loading: usersLoading } = useUsers();
  const { tickets, loading: ticketsLoading } = useTickets();
  const { logs, loading: logsLoading } = useLogs();
  
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

  const loading = docsLoading || usersLoading || ticketsLoading || logsLoading;

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

  const statCards = [
    {
      title: 'Total Documents',
      value: stats.totalDocuments,
      subtitle: `${stats.todayUploads} uploaded today`,
      icon: 'bi-file-earmark-text',
      color: 'primary',
      onClick: () => handleCardClick('documents')
    },
    {
      title: 'Active Documents',
      value: stats.activeDocuments,
      subtitle: `${stats.todayVerifications} verified today`,
      icon: 'bi-check-circle',
      color: 'success',
      onClick: () => handleCardClick('documents')
    },
    {
      title: 'Open Tickets',
      value: stats.openTickets,
      subtitle: `${stats.criticalTickets} critical priority`,
      icon: 'bi-ticket-perforated',
      color: 'warning',
      onClick: () => handleCardClick('tickets')
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      subtitle: `${stats.totalUsers} total users`,
      icon: 'bi-people',
      color: 'info',
      onClick: () => handleCardClick('users')
    }
  ];

  return (
    <div>
      <div className="mb-4">
        <h2 className="mb-1">Dashboard</h2>
        <p className="text-muted">Overview of document integrity system</p>
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
          <div className="row g-3 mb-4">
            {statCards.map((stat, index) => (
              <div key={index} className="col-md-3">
                <div 
                  className="card border-0 shadow-sm h-100" 
                  style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                  onClick={stat.onClick}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div className="card-body">
                    <div className="d-flex align-items-center mb-3">
                      <div className={`bg-${stat.color} bg-opacity-10 p-3 rounded me-3`}>
                        <i className={`bi ${stat.icon} text-${stat.color} fs-4`}></i>
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="text-muted mb-1 fw-normal small">{stat.title}</h6>
                        <h2 className="mb-0 fw-bold">{stat.value}</h2>
                      </div>
                    </div>
                    <p className="text-muted small mb-0">
                      <i className="bi bi-arrow-up-right me-1"></i>
                      {stat.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="card-title mb-0">Recent Activity</h5>
                <button 
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => navigate('/admin/audit-logs')}
                >
                  View All Logs
                </button>
              </div>
              
              {stats.recentLogs.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-inbox text-muted" style={{ fontSize: '3rem' }}></i>
                  <p className="text-muted mt-3">No recent activity</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {stats.recentLogs.map((activity, index) => {
                    const iconMap = {
                      'DOCUMENT_UPLOAD': { icon: 'bi-cloud-upload-fill', color: 'info' },
                      'DOCUMENT_VERIFY': { icon: 'bi-check-circle-fill', color: 'success' },
                      'KEY_ROTATION': { icon: 'bi-key-fill', color: 'primary' },
                      'USER_CREATE': { icon: 'bi-person-plus-fill', color: 'secondary' },
                      'SETTINGS_UPDATE': { icon: 'bi-gear-fill', color: 'warning' },
                      'LOGIN_ATTEMPT': { icon: 'bi-box-arrow-in-right', color: 'dark' },
                      'AUTO_BACKUP': { icon: 'bi-database-fill-up', color: 'success' }
                    };
                    
                    const activityIcon = iconMap[activity.action] || { icon: 'bi-circle-fill', color: 'secondary' };
                    const isError = activity.status === 'Failed';
                    
                    return (
                      <div key={index} className="list-group-item border-0 px-0 py-3">
                        <div className="d-flex align-items-start">
                          <div className={`bg-${isError ? 'danger' : activityIcon.color} bg-opacity-10 p-2 rounded me-3`}>
                            <i className={`bi ${isError ? 'bi-x-circle-fill' : activityIcon.icon} text-${isError ? 'danger' : activityIcon.color}`}></i>
                          </div>
                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <h6 className="mb-1">{activity.action.replace(/_/g, ' ')}</h6>
                                <p className="text-muted small mb-0">{activity.details}</p>
                                <small className="text-muted">
                                  <i className="bi bi-person me-1"></i>{activity.userName} 
                                  <span className="mx-2">•</span>
                                  <i className="bi bi-pc-display me-1"></i>{activity.ip}
                                </small>
                              </div>
                              <div className="text-end">
                                <span className="text-muted small">{new Date(activity.timestamp).toLocaleTimeString()}</span>
                                {activity.status && (
                                  <div>
                                    <span className={`badge badge-sm bg-${isError ? 'danger' : 'success'} mt-1`}>
                                      {activity.status}
                                    </span>
                                  </div>
                                )}
                              </div>
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
        </>
      )}
    </div>
  );
}

export default Dashboard;