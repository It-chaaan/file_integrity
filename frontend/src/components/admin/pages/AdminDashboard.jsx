import React, { useState } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { useRegistry } from '../../../contexts/RegistryContext';
import { useAuth } from '../../../contexts/AuthContext';
import { formatTimestamp, downloadFile } from '../../../utils/crypto';
import DetailsModal from '../../common/modals/DetailsModal';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const { registry } = useRegistry();
  const { user } = useAuth();

  const handleShowDetails = (index) => {
    setSelectedEntry(registry[index]);
    setShowDetails(true);
  };

  const recentActivity = [...registry].reverse().slice(0, 5);

  return (
    <div className="admin-dashboard">
      {/* Stats Grid */}
      <Row className="g-3 mb-4">
        <Col lg={3} md={6}>
          <div className="admin-dashboard__stat-card">
            <div className="admin-dashboard__stat-icon admin-dashboard__stat-icon--blue">
              <i className="bi bi-files"></i>
            </div>
            <div className="admin-dashboard__stat-info">
              <div className="admin-dashboard__stat-value">{registry.length}</div>
              <div className="admin-dashboard__stat-label">Total Documents</div>
            </div>
          </div>
        </Col>
        <Col lg={3} md={6}>
          <div className="admin-dashboard__stat-card">
            <div className="admin-dashboard__stat-icon admin-dashboard__stat-icon--green">
              <i className="bi bi-shield-check"></i>
            </div>
            <div className="admin-dashboard__stat-info">
              <div className="admin-dashboard__stat-value">Verified</div>
              <div className="admin-dashboard__stat-label">System Status</div>
            </div>
          </div>
        </Col>
        <Col lg={3} md={6}>
          <div className="admin-dashboard__stat-card">
            <div className="admin-dashboard__stat-icon admin-dashboard__stat-icon--purple">
              <i className="bi bi-clock-history"></i>
            </div>
            <div className="admin-dashboard__stat-info">
              <div className="admin-dashboard__stat-value">{recentActivity.length}</div>
              <div className="admin-dashboard__stat-label">Recent Activity</div>
            </div>
          </div>
        </Col>
        <Col lg={3} md={6}>
          <div className="admin-dashboard__stat-card">
            <div className="admin-dashboard__stat-icon admin-dashboard__stat-icon--orange">
              <i className="bi bi-exclamation-triangle"></i>
            </div>
            <div className="admin-dashboard__stat-info">
              <div className="admin-dashboard__stat-value">3</div>
              <div className="admin-dashboard__stat-label">Pending Issues</div>
            </div>
          </div>
        </Col>
      </Row>

      <Row className="g-3">
        {/* Recent Activity */}
        <Col lg={8}>
          <div className="admin-dashboard__panel">
            <div className="admin-dashboard__panel-header">
              <div>
                <h5>Recent Activity</h5>
                <small>Latest document registrations and verifications</small>
              </div>
            </div>
            <div className="admin-dashboard__activity-list">
              {recentActivity.length === 0 ? (
                <div className="admin-dashboard__empty-state">
                  <i className="bi bi-inbox"></i>
                  <p>No recent activity</p>
                </div>
              ) : (
                recentActivity.map((entry, idx) => {
                  const originalIndex = registry.indexOf(entry);
                  return (
                    <div 
                      key={idx} 
                      className="admin-dashboard__activity-item"
                      onClick={() => handleShowDetails(originalIndex)}
                    >
                      <div className="admin-dashboard__activity-icon">
                        <i className="bi bi-file-earmark-check"></i>
                      </div>
                      <div className="admin-dashboard__activity-content">
                        <div className="admin-dashboard__activity-title">{entry.name}</div>
                        <div className="admin-dashboard__activity-meta">
                          <span className="admin-dashboard__activity-badge">{entry.type}</span>
                          <span className="admin-dashboard__activity-time">
                            <i className="bi bi-clock me-1"></i>
                            {formatTimestamp(entry.timestamp)}
                          </span>
                        </div>
                      </div>
                      <div className="admin-dashboard__activity-hash">
                        <code>{entry.hash.slice(0, 8)}...{entry.hash.slice(-6)}</code>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </Col>

        {/* Quick Actions & Alerts */}
        <Col lg={4}>
          <div className="admin-dashboard__panel admin-dashboard__panel--compact mb-3">
            <div className="admin-dashboard__panel-header">
              <h5>Quick Actions</h5>
            </div>
            <div className="admin-dashboard__quick-actions">
              <Button className="admin-dashboard__quick-action-btn">
                <i className="bi bi-cloud-upload"></i>
                <span>Upload Document</span>
              </Button>
            </div>
          </div>

          <div className="admin-dashboard__panel admin-dashboard__panel--compact">
            <div className="admin-dashboard__panel-header">
              <div className="d-flex justify-content-between align-items-center w-100">
                <h5>System Alerts</h5>
                <span className="badge bg-danger rounded-pill">3</span>
              </div>
            </div>
            <div className="admin-dashboard__alert-list">
              <div className="admin-dashboard__alert-item admin-dashboard__alert-item--warning">
                <i className="bi bi-exclamation-triangle"></i>
                <div>
                  <div className="admin-dashboard__alert-title">Hash Mismatch</div>
                  <div className="admin-dashboard__alert-desc">Document verification failed</div>
                </div>
              </div>
              <div className="admin-dashboard__alert-item admin-dashboard__alert-item--danger">
                <i className="bi bi-shield-x"></i>
                <div>
                  <div className="admin-dashboard__alert-title">Tampering Detected</div>
                  <div className="admin-dashboard__alert-desc">Record integrity compromised</div>
                </div>
              </div>
              <div className="admin-dashboard__alert-item admin-dashboard__alert-item--info">
                <i className="bi bi-info-circle"></i>
                <div>
                  <div className="admin-dashboard__alert-title">System Update</div>
                  <div className="admin-dashboard__alert-desc">New security patch available</div>
                </div>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      <DetailsModal 
        show={showDetails}
        onHide={() => setShowDetails(false)}
        entry={selectedEntry}
      />
    </div>
  );
};

export default AdminDashboard;