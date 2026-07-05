import React, { useState, useMemo } from 'react';
import { useLogs } from '../../hooks/useData';
import Pagination from '../../components/Pagination';
import { formatAuditLogDetails } from '../../services/utils';

function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch logs via hook (adapter-backed to backend API modules)
  const { logs: fetchedLogs = [], loading, error } = useLogs();

  const normalizedLogs = useMemo(() => {
    const list = Array.isArray(fetchedLogs) ? fetchedLogs : [];
    return list.map((log) => {
      const details = log.details ?? log.metadata ?? {};
      const detailsText = formatAuditLogDetails(details, { action: log.action });
      return {
        ...log,
        timestamp: log.created_at || log.timestamp || '—',
        userId: log.user_id || log.userId || '—',
        userName: log.username || log.userName || '—',
        ipAddress: log.ip_address || log.ipAddress || log.ip || '—',
        detailsText,
        status: log.status || 'SUCCESS',
      };
    });
  }, [fetchedLogs]);

  // Filter logs based on search term and status
  const filteredLogs = useMemo(() => {
    let result = normalizedLogs;
    
    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(log => {
        const ip = (log.ipAddress || log.ip || '').toLowerCase();
        return (
          (log.userId || '').toLowerCase().includes(term) ||
          (log.userName || '').toLowerCase().includes(term) ||
          ip.includes(term) ||
          (log.action || '').toLowerCase().includes(term) ||
          (log.detailsText || '').toLowerCase().includes(term)
        );
      });
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(log => (log.status || '').toLowerCase() === statusFilter.toLowerCase());
    }
    
    return result;
  }, [fetchedLogs, searchTerm, statusFilter]);

  // Calculate pagination
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

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
          {error && (
            <div className="alert alert-danger mb-3">
              <i className="bi bi-exclamation-circle me-2"></i>
              {error.message || 'Failed to load logs'}
            </div>
          )}

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
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center text-muted">Loading logs…</td>
                  </tr>
                ) : paginatedLogs.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-muted">No logs found</td>
                  </tr>
                ) : paginatedLogs.map((log, index) => (
                  <tr key={index}>
                    <td className="font-monospace small">{log.timestamp}</td>
                    <td className="font-monospace small">{log.userId}</td>
                    <td>{log.userName}</td>
                    <td className="font-monospace small">{log.ipAddress}</td>
                    <td>
                      <span className="badge bg-secondary">{log.action}</span>
                    </td>
                    <td>{log.detailsText || '—'}</td>
                    <td>
                      <span className={`badge ${(log.status || '').toLowerCase() === 'success' ? 'bg-success' : 'bg-danger'}`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredLogs.length}
            startIndex={startIndex}
            endIndex={Math.min(startIndex + itemsPerPage, filteredLogs.length)}
          />
        </div>
      </div>
    </div>
  );
}

export default AuditLogs;