import React, { useState, useMemo } from 'react';
import DataTable from '../../components/DataTable';
import { useUsers } from '../../hooks/useData';

function Users() {
  const { users, loading, updateUser, createUser } = useUsers();
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Enterprise User',
    department: '',
    status: 'Active'
  });

  // Filter users
  const filteredUsers = useMemo(() => {
    if (!users || !Array.isArray(users)) return [];
    
    let result = [...users];
    
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(user =>
        user.id.toLowerCase().includes(term) ||
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
      );
    }
    
    if (roleFilter !== 'all') {
      result = result.filter(user => user.role === roleFilter);
    }
    
    return result;
  }, [users, searchTerm, roleFilter]);

  const columns = [
    {
      key: 'id',
      label: 'User ID',
      sortable: true,
      render: (value) => (
        <span className="fw-semibold" style={{ fontSize: '14px', color: '#0D1526' }}>
          {value}
        </span>
      )
    },
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      filterable: true,
      render: (value) => (
        <span style={{ fontSize: '14px', color: '#1F2937' }}>{value}</span>
      )
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      filterable: true,
      render: (value) => (
        <span style={{ fontSize: '14px', color: '#1E3A8A' }}>{value}</span>
      )
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      filterable: true,
      render: (value) => {
        const bgColor = value === 'System Administrator' ? '#DC2626' : '#3B82F6';
        return (
          <span 
            className="badge"
            style={{ backgroundColor: bgColor, fontSize: '12px', padding: '6px 12px' }}
          >
            {value}
          </span>
        );
      }
    },
    {
      key: 'department',
      label: 'Department',
      sortable: true,
      filterable: true,
      render: (value) => (
        <span style={{ fontSize: '14px', color: '#8B4513' }}>{value}</span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      filterable: true,
      render: (value) => (
        <span 
          className={`badge ${value === 'Active' ? 'bg-success' : 'bg-secondary'}`}
          style={{ fontSize: '12px', padding: '6px 12px' }}
        >
          {value}
        </span>
      )
    }
  ];

  const actions = (user) => (
    <>
      <button
        className="btn btn-sm btn-primary"
        onClick={() => {
          setSelectedUser(user);
          setFormData({
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            status: user.status
          });
          setShowEditModal(true);
        }}
      >
        <i className="bi bi-pencil me-1"></i>
        Edit
      </button>
    </>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedUser) {
      await updateUser(selectedUser.id, formData);
    } else {
      await createUser(formData);
    }
    setShowEditModal(false);
    setSelectedUser(null);
    setFormData({
      name: '',
      email: '',
      role: 'Enterprise User',
      department: '',
      status: 'Active'
    });
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setSelectedUser(null);
    setFormData({
      name: '',
      email: '',
      role: 'Enterprise User',
      department: '',
      status: 'Active'
    });
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="mb-2" style={{ fontSize: '28px', fontWeight: '700', color: '#0D1526' }}>
          Enterprise Access Management
        </h2>
        <p className="text-muted" style={{ fontSize: '14px' }}>
          Manage enterprise users, roles, and department access controls
        </p>
      </div>

      {/* Filter Bar */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-search" style={{ color: '#6B7280' }}></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search by user ID, name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ borderRadius: '0 6px 6px 0' }}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select 
                className="form-select"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="System Administrator">System Administrator</option>
                <option value="Compliance Officer">Compliance Officer</option>
                <option value="Legal Officer">Legal Officer</option>
                <option value="Finance Manager">Finance Manager</option>
                <option value="HR Manager">HR Manager</option>
                <option value="Department Head">Department Head</option>
                <option value="Auditor">Auditor</option>
                <option value="Enterprise User">Enterprise User</option>
                <option value="External Verifier">External Verifier</option>
              </select>
            </div>
            <div className="col-md-3 d-flex justify-content-end">
              <button
                className="btn btn-primary btn-sm px-3"
                onClick={() => {
                  setSelectedUser(null);
                  setFormData({
                    name: '',
                    email: '',
                    role: 'Enterprise User',
                    department: '',
                    status: 'Active'
                  });
                  setShowEditModal(true);
                }}
              >
                <i className="bi bi-person-plus me-2"></i>
                Add User
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DataTable */}
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <DataTable
            columns={columns}
            data={filteredUsers}
            actions={actions}
            loading={loading}
            searchable={false}
          />
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered" style={{ position: 'relative', zIndex: 1051 }}>
            <div className="modal-content border-0 shadow" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
              <div className="modal-header" style={{ backgroundColor: '#0D1526', borderBottom: 'none', position: 'sticky', top: 0, zIndex: 1052 }}>
                <h5 className="modal-title text-white">
                  <i className={`bi ${selectedUser ? 'bi-pencil' : 'bi-person-plus'} me-2`}></i>
                  {selectedUser ? 'Edit User' : 'Add User'}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={handleCloseModal}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  {selectedUser && (
                    <div className="mb-3">
                      <label className="form-label text-muted" style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                        User ID
                      </label>
                      <p className="fw-semibold" style={{ fontSize: '14px', color: '#0D1526' }}>
                        {selectedUser.id}
                      </p>
                    </div>
                  )}
                  <div className="mb-3">
                    <label className="form-label">Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      className="form-control"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Role</label>
                      <select
                        className="form-select"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      >
                        <option value="System Administrator">System Administrator</option>
                        <option value="Compliance Officer">Compliance Officer</option>
                        <option value="Legal Officer">Legal Officer</option>
                        <option value="Finance Manager">Finance Manager</option>
                        <option value="HR Manager">HR Manager</option>
                        <option value="Department Head">Department Head</option>
                        <option value="Auditor">Auditor</option>
                        <option value="Enterprise User">Enterprise User</option>
                        <option value="External Verifier">External Verifier</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Status</label>
                      <select
                        className="form-select"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Department</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer border-top-0" style={{ backgroundColor: '#F9FAFB' }}>
                  <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn text-white" style={{ backgroundColor: '#0D1526' }}>
                    <i className="bi bi-check-circle me-2"></i>
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default Users;