import React, { useState, useMemo } from 'react';
import { useLogs } from '../../hooks/useData';
import Pagination from '../../components/Pagination';
import {
  formatAuditActionLabel,
  formatAuditLogDetails,
  formatAuditSeverityLabel,
  formatAuditStatusLabel,
  formatDateTime,
  formatRelativeDateTime,
} from '../../services/utils';

function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { logs: fetchedLogs = [], loading, error } = useLogs();

  const normalizedLogs = useMemo(() => {
    const list = Array.isArray(fetchedLogs) ? fetchedLogs : [];
    return list.map((log) => {
      const details = log.details ?? log.metadata ?? {};
      const timestamp = log.created_at || log.timestamp || '';

      return {
        ...log,
        timestamp,
        timestampLabel: formatRelativeDateTime(timestamp),
        timestampFull: formatDateTime(timestamp),
        userId: log.user_id || log.userId || 'System',
        userName: log.username || log.userName || 'System',
        ipAddress: log.ip_address || log.ipAddress || log.ip || 'Not recorded',
        detailsText: formatAuditLogDetails(details, { action: log.action }),
        status: log.status || 'SUCCESS',
        statusLabel: formatAuditStatusLabel(log.status || 'SUCCESS'),
        severityLabel: formatAuditSeverityLabel(log.severity),
        actionLabel: formatAuditActionLabel(log.action),
      };
    });
  }, [fetchedLogs]);

  const filteredLogs = useMemo(() => {
    let result = normalizedLogs;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((log) => {
        const ip = String(log.ipAddress || '').toLowerCase();
        return (
          String(log.userId || '').toLowerCase().includes(term) ||
          String(log.userName || '').toLowerCase().includes(term) ||
          ip.includes(term) ||
          String(log.action || '').toLowerCase().includes(term) ||
          String(log.actionLabel || '').toLowerCase().includes(term) ||
          String(log.detailsText || '').toLowerCase().includes(term)
        );
      });
    }

    if (statusFilter !== 'all') {
      result = result.filter((log) => String(log.status || '').toLowerCase() === statusFilter.toLowerCase());
    }

    return result;
  }, [normalizedLogs, searchTerm, statusFilter]);

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
        <p className="text-muted">Readable activity history for sign-ins, document checks, key actions, and account changes</p>
      </div>

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
                  placeholder="Search by person, event, IP address, or summary..."
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
                <option value="all">All Results</option>
                <option value="success">Completed</option>
                <option value="failed">Blocked</option>
              </select>
            </div>
          </div>
        </div>
      </div>

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
                  <th>When</th>
                  <th>User</th>
                  <th>IP Address</th>
                  <th>Event</th>
                  <th>Summary</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center text-muted">Loading activity history...</td>
                  </tr>
                ) : paginatedLogs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-muted">No activity found</td>
                  </tr>
                ) : paginatedLogs.map((log, index) => (
                  <tr key={index}>
                    <td>
                      <div className="fw-semibold">{log.timestampLabel}</div>
                      <div className="text-muted small">{log.timestampFull}</div>
                    </td>
                    <td>
                      <div className="fw-semibold">{log.userName}</div>
                      <div className="text-muted small">ID: {log.userId}</div>
                    </td>
                    <td className="font-monospace small">{log.ipAddress}</td>
                    <td>
                      <div className="fw-semibold">{log.actionLabel}</div>
                      <div className="text-muted small">{log.severityLabel}</div>
                    </td>
                    <td>{log.detailsText || 'No additional details'}</td>
                    <td>
                      <span className={`badge ${(log.status || '').toLowerCase() === 'success' ? 'bg-success' : 'bg-danger'}`}>
                        {log.statusLabel}
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
