import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocuments } from '../../hooks/useData';

function Dashboard() {
  const navigate = useNavigate();
  const { documents = [], loading = false, refetch: refetchDocuments } = useDocuments();
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);

  const refreshDashboard = useCallback(async () => {
    await refetchDocuments();
    setLastUpdatedAt(new Date());
  }, [refetchDocuments]);

  useEffect(() => {
    if (!loading) {
      setLastUpdatedAt(new Date());
    }
  }, [documents, loading]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      refreshDashboard();
    }, 15000);

    const handleFocus = () => {
      refreshDashboard();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
    };
  }, [refreshDashboard]);

  const normalizedDocuments = useMemo(
    () => documents.map((doc) => ({
      ...doc,
      status: String(doc.status || '').toLowerCase(),
    })),
    [documents]
  );

  const totalDocs = normalizedDocuments.length;
  const verifiedDocs = normalizedDocuments.filter(doc => doc.status === 'verified').length;
  const failedDocs = normalizedDocuments.filter(doc => doc.status === 'failed').length;
  const successRate = totalDocs > 0 ? Math.round((verifiedDocs / totalDocs) * 1000) / 10 : 0;

  const recentVerifications = useMemo(() => {
    return normalizedDocuments
      .filter(doc => doc.status === 'verified')
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 4);
  }, [normalizedDocuments]);

  const stats = [
    {
      title: 'Total Documents',
      value: totalDocs,
      subtitle: 'All uploaded documents in registry',
      icon: 'bi-file-earmark-text',
      accent: '#111827',
      iconBg: '#111827',
      onClick: () => navigate('/staff/registry')
    },
    {
      title: 'Verified Documents',
      value: verifiedDocs,
      subtitle: `${successRate.toFixed(1)}% success rate`,
      icon: 'bi-shield-check',
      accent: '#10B981',
      iconBg: '#10B981',
      onClick: () => navigate('/staff/verify')
    },
    {
      title: 'Failed Verification',
      value: failedDocs,
      subtitle: 'Tampering detected',
      icon: 'bi-exclamation-triangle',
      accent: '#EF4444',
      iconBg: '#EF4444',
      onClick: () => navigate('/staff/report')
    }
  ];

  const formatNumber = useCallback((value) => {
    return new Intl.NumberFormat('en-US').format(Number(value) || 0);
  }, []);

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
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h2 className="mb-1">Dashboard</h2>
          <p className="text-muted mb-0">Enterprise User Portal</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        {stats.map((stat) => (
          <div key={stat.title} className="col-12 col-lg-4">
            <button
              type="button"
              className="card border-1 shadow-sm h-100 text-start w-100 p-0"
              onClick={stat.onClick}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
              style={{
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                border: '1px solid rgba(15, 23, 42, 0.08)',
                background: 'linear-gradient(180deg, #FFFFFF 0%, #FBFBFD 100%)',
                borderRadius: '18px',
                appearance: 'none',
                WebkitAppearance: 'none'
              }}
            >
              <div className="card-body p-4 position-relative overflow-hidden">
                <div className="d-flex flex-column gap-3 position-relative">
                  <div
                    className="d-inline-flex align-items-center justify-content-center rounded-3"
                    style={{
                      width: '34px',
                      height: '34px',
                      backgroundColor: stat.iconBg,
                      color: '#FFFFFF'
                    }}
                  >
                    <i className={`bi ${stat.icon}`} style={{ fontSize: '1rem' }} />
                  </div>
                  <div>
                    <div className="text-muted small mb-1">{stat.title}</div>
                    <div className="display-6 fw-semibold mb-2" style={{ letterSpacing: '-0.04em', color: '#0F172A' }}>
                      {loading ? '—' : formatNumber(stat.value)}
                    </div>
                    <div className="small" style={{ color: stat.accent }}>
                      {stat.subtitle}
                    </div>
                  </div>
                </div>
              </div>
            </button>
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