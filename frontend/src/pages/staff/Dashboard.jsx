import React from 'react';

function Dashboard() {
  const stats = [
    {
      title: 'Documents Verified',
      value: '47',
      icon: 'bi-shield-check',
      bgColor: '#10B981',
      iconColor: '#FFFFFF'
    },
    {
      title: 'Documents Uploaded',
      value: '23',
      icon: 'bi-cloud-upload',
      bgColor: '#3B82F6',
      iconColor: '#FFFFFF'
    },
    {
      title: 'Assigned Tickets',
      value: '5',
      icon: 'bi-ticket-detailed',
      bgColor: '#F59E0B',
      iconColor: '#FFFFFF'
    },
    {
      title: 'Pending Actions',
      value: '2',
      icon: 'bi-clock',
      bgColor: '#6B7280',
      iconColor: '#FFFFFF'
    }
  ];

  const assignedTickets = [
    {
      id: 'TKT-2847',
      title: 'Verification Issue - Business Permit',
      priority: 'High',
      status: 'In Progress',
      date: 'Jan 15, 2025'
    },
    {
      id: 'TKT-2845',
      title: 'Document Upload Error',
      priority: 'Medium',
      status: 'Open',
      date: 'Jan 14, 2025'
    },
    {
      id: 'TKT-2842',
      title: 'Hash Mismatch Investigation',
      priority: 'High',
      status: 'Pending',
      date: 'Jan 13, 2025'
    }
  ];

  const recentVerifications = [
    {
      document: 'BIR_Certificate_2026.pdf',
      status: 'Verified',
      time: '2 minutes ago'
    },
    {
      document: 'Business_Permit_QC.pdf',
      status: 'Verified',
      time: '15 minutes ago'
    },
    {
      document: 'DTI_Registration.pdf',
      status: 'Verified',
      time: '1 hour ago'
    },
    {
      document: 'Mayor_Permit_2026.pdf',
      status: 'Verified',
      time: '3 hours ago'
    }
  ];

  const getPriorityBadge = (priority) => {
    const badges = {
      'High': 'bg-danger',
      'Medium': 'bg-warning',
      'Low': 'bg-info'
    };
    return badges[priority] || 'bg-secondary';
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="mb-1">Staff Dashboard</h2>
        <p className="text-muted">Welcome back! Here's your overview</p>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        {stats.map((stat, index) => (
          <div key={index} className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
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
        {/* My Assigned Tickets */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="card-title mb-0">My Assigned Tickets</h5>
                <a href="/staff/tickets" className="text-decoration-none small">View All →</a>
              </div>
              <div className="list-group list-group-flush">
                {assignedTickets.map((ticket, index) => (
                  <div key={index} className="list-group-item border-0 px-0 py-3 border-bottom">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <div className="d-flex align-items-center mb-2">
                          <span className="badge bg-secondary me-2">{ticket.id}</span>
                          <span className={`badge ${getPriorityBadge(ticket.priority)}`}>{ticket.priority}</span>
                        </div>
                        <h6 className="mb-1">{ticket.title}</h6>
                        <p className="text-muted small mb-0">Status: {ticket.status} • {ticket.date}</p>
                      </div>
                      <button className="btn btn-sm btn-outline-primary">View</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Verifications */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-4">Recent Verifications</h5>
              <div className="list-group list-group-flush">
                {recentVerifications.map((verification, index) => (
                  <div key={index} className="list-group-item border-0 px-0 py-3">
                    <div className="d-flex align-items-start">
                      <div className="bg-success bg-opacity-10 p-2 rounded me-3">
                        <i className="bi bi-check-circle-fill text-success"></i>
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="mb-1 small">{verification.document}</h6>
                        <p className="text-muted small mb-0">{verification.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;