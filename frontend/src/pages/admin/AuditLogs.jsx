import React, { useState, useMemo } from 'react';

function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const logs = [
    {
      timestamp: '2026-01-08 14:32:15',
      userId: 'USR-ADM-001',
      userName: 'Christian',
      ipAddress: '192.168.1.100',
      action: 'DOCUMENT_UPLOAD',
      details: 'Uploaded Business_Permit_2026.pdf',
      status: 'Success'
    },
    {
      timestamp: '2026-01-08 14:28:43',
      userId: 'USR-STF-012',
      userName: 'James',
      ipAddress: '192.168.1.145',
      action: 'DOCUMENT_VERIFY',
      details: 'Verified BIR_Certificate_2026.pdf',
      status: 'Success'
    },
    {
      timestamp: '2026-01-08 14:15:22',
      userId: 'USR-STF-008',
      userName: 'Shynalee',
      ipAddress: '192.168.1.132',
      action: 'KEY_ROTATION',
      details: 'Rotated ECDSA key pair',
      status: 'Success'
    },
    {
      timestamp: '2026-01-08 13:58:11',
      userId: 'USR-ADM-001',
      userName: 'Martin',
      ipAddress: '192.168.1.100',
      action: 'USER_CREATE',
      details: 'Created new staff user: Anna Cruz',
      status: 'Success'
    },
    {
      timestamp: '2026-01-08 13:42:05',
      userId: 'USR-STF-012',
      userName: 'Dominic',
      ipAddress: '192.168.1.145',
      action: 'DOCUMENT_VERIFY',
      details: 'Verification failed hash mismatch',
      status: 'Failed'
    },
    {
      timestamp: '2026-01-08 13:20:33',
      userId: 'SYSTEM',
      userName: 'Joshua',
      ipAddress: '127.0.0.1',
      action: 'AUTO_BACKUP',
      details: 'Automated database backup completed',
      status: 'Success'
    },
    {
      timestamp: '2026-01-08 12:55:47',
      userId: 'USR-ADM-001',
      userName: 'Nelson',
      ipAddress: '192.168.1.100',
      action: 'SETTINGS_UPDATE',
      details: 'Changed verification timeout to 30s',
      status: 'Success'
    },
    {
      timestamp: '2026-01-08 12:30:18',
      userId: 'USR-STF-008',
      userName: 'Nathaniel',
      ipAddress: '192.168.1.132',
      action: 'LOGIN_ATTEMPT',
      details: 'Failed login attempt invalid credentials',
      status: 'Failed'
    },
    {
      timestamp: '2026-01-08 12:15:55',
      userId: 'USR-ADM-002',
      userName: 'Rebecca',
      ipAddress: '192.168.1.105',
      action: 'DOCUMENT_UPLOAD',
      details: 'Uploaded Mayor_Certification_2026.pdf',
      status: 'Success'
    },
    {
      timestamp: '2026-01-08 12:00:22',
      userId: 'USR-STF-003',
      userName: 'Maria',
      ipAddress: '192.168.1.110',
      action: 'DOCUMENT_VERIFY',
      details: 'Verified Provincial_Permit.pdf',
      status: 'Success'
    },
    {
      timestamp: '2026-01-08 11:45:33',
      userId: 'USR-ADM-001',
      userName: 'Christian',
      ipAddress: '192.168.1.100',
      action: 'KEY_ROTATION',
      details: 'Rotated backup ECDSA key',
      status: 'Success'
    },
    {
      timestamp: '2026-01-08 11:30:10',
      userId: 'USR-STF-012',
      userName: 'James',
      ipAddress: '192.168.1.145',
      action: 'LOGIN_ATTEMPT',
      details: 'Successful login',
      status: 'Success'
    }
  ];

  // Filter logs based on search term and status
  const filteredLogs = useMemo(() => {
    let result = logs;
    
    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(log => 
        log.userId.toLowerCase().includes(term) ||
        log.userName.toLowerCase().includes(term) ||
        log.ipAddress.toLowerCase().includes(term) ||
        log.action.toLowerCase().includes(term) ||
        log.details.toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(log => log.status === statusFilter);
    }
    
    return result;
  }, [searchTerm, statusFilter]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div>
      <div className="mb-4">
        <h2 className="mb-1">Audit Logs</h2>
        <p className="text-muted">Comprehensive audit trail of all system activities</p>
      </div>

      {/* Search and Filter */}
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
                  placeholder="Search by user ID, IP address, or action..."
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
                <option value="Success">Success</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User ID</th>
                  <th>User Name</th>
                  <th>IP Address</th>
                  <th>Action</th>
                  <th>Details</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLogs.map((log, index) => (
                  <tr key={index}>
                    <td className="font-monospace small">{log.timestamp}</td>
                    <td className="font-monospace small">{log.userId}</td>
                    <td>{log.userName}</td>
                    <td className="font-monospace small">{log.ipAddress}</td>
                    <td>
                      <span className="badge bg-secondary">{log.action}</span>
                    </td>
                    <td>{log.details}</td>
                    <td>
                      <span className={`badge ${log.status === 'Success' ? 'bg-success' : 'bg-danger'}`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-3">
            <p className="text-muted mb-0">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredLogs.length)} of {filteredLogs.length} entries
            </p>
            <div className="btn-group">
              <button 
                className="btn btn-outline-secondary" 
                onClick={handlePrevious}
                disabled={currentPage === 1}
              >
                <i className="bi bi-chevron-left"></i> Previous
              </button>
              <span className="btn btn-outline-secondary" style={{ pointerEvents: 'none', borderLeft: 'none', borderRight: 'none' }}>
                Page {currentPage} of {totalPages}
              </span>
              <button 
                className="btn btn-outline-secondary"
                onClick={handleNext}
                disabled={currentPage === totalPages}
              >
                Next <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuditLogs;