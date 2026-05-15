import React, { useState, useMemo } from 'react';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import { useUsers } from '../../hooks/useData';

function Users() {
  const { users, loading, updateUser, createUser, deleteUser } = useUsers();
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    role: 'client',
    password: '',
    department: '',
    is_active: true
  });

  const roleLabelMap = {
    super_admin: 'System Administrator',
    admin: 'Administrator',
    staff: 'Staff',
    verifier: 'Verifier',
    client: 'Enterprise User',
  };

  // Filter users
  const filteredUsers = useMemo(() => {
    if (!users || !Array.isArray(users)) return [];
    
    let result = [...users].map((user) => ({
      ...user,
      displayName: [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username,
      displayRole: roleLabelMap[user.role] || user.role,
      displayStatus: user.is_active ? 'Active' : 'Inactive',
    }));
    
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(user =>
        String(user.id).toLowerCase().includes(term) ||
        String(user.displayName || '').toLowerCase().includes(term) ||
        String(user.username || '').toLowerCase().includes(term) ||
        String(user.email || '').toLowerCase().includes(term)
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
      key: 'displayName',
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
      key: 'displayRole',
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
      key: 'displayStatus',
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
    <div className="d-flex gap-2 align-items-center" style={{ flexWrap: 'nowrap' }}>
      <button
        className="btn btn-sm btn-dark"
        onClick={() => {
          setSelectedUser(user);
          setFormData({
            username: user.username || '',
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            email: user.email || '',
            role: user.role || 'client',
            password: '',
            department: user.department || '',
            is_active: Boolean(user.is_active),
          });
          setShowEditModal(true);
        }}
        style={{ whiteSpace: 'nowrap' }}
      >
        <i className="bi bi-pencil me-1"></i>
        Edit
      </button>
      <button
        className="btn btn-sm btn-outline-danger"
        onClick={() => {
          setDeleteTarget(user);
          setShowDeleteModal(true);
        }}
        style={{ whiteSpace: 'nowrap' }}
      >
        <i className="bi bi-trash me-1"></i>
        Delete
      </button>
    </div>
  );

  const passwordTooShort = !selectedUser && formData.password.length > 0 && formData.password.length < 8;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedUser) {
      const updatePayload = {
        username: formData.username,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        role: formData.role,
        department: formData.department,
        is_active: formData.is_active,
      };
      await updateUser(selectedUser.id, updatePayload);
    } else {
      if (formData.password.length < 8) {
        return;
      }
      const createPayload = {
        username: formData.username,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        role: formData.role,
        password: formData.password,
        department: formData.department,
        is_active: formData.is_active,
      };
      await createUser(createPayload);
    }
    setShowEditModal(false);
    setSelectedUser(null);
    setFormData({
      username: '',
      first_name: '',
      last_name: '',
      email: '',
      role: 'client',
      password: '',
      department: '',
      is_active: true
    });
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setSelectedUser(null);
    setFormData({
      username: '',
      first_name: '',
      last_name: '',
      email: '',
      role: 'client',
      password: '',
      department: '',
      is_active: true
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
                <option value="super_admin">System Administrator</option>
                <option value="admin">Administrator</option>
                <option value="staff">Staff</option>
                <option value="verifier">Verifier</option>
                <option value="client">Enterprise User</option>
              </select>
            </div>
            <div className="col-md-3 d-flex justify-content-end">
              <button
                className="btn btn-primary btn-sm px-3"
                onClick={() => {
                  setSelectedUser(null);
                  setFormData({
                    username: '',
                    first_name: '',
                    last_name: '',
                    email: '',
                    role: 'client',
                    password: '',
                    department: '',
                    is_active: true
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
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label">Username *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">First Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Last Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      />
                    </div>
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
                  {!selectedUser && (
                    <div className="mb-3">
                      <label className="form-label">Password *</label>
                      <input
                        type="password"
                        className="form-control"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        minLength={8}
                        required
                      />
                      {passwordTooShort && (
                        <div className="text-danger small mt-1">
                          Password must be at least 8 characters long.
                        </div>
                      )}
                    </div>
                  )}
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Department *</label>
                      <select
                        className="form-select"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        required
                      >
                        <option value="">Select Department</option>
                        <option value="Sales & Procurement">Sales & Procurement</option>
                        <option value="Finance">Finance</option>
                        <option value="Human Resources">Human Resources</option>
                        <option value="Legal & Compliance">Legal & Compliance</option>
                        <option value="Operations">Operations</option>
                        <option value="IT & Risk Management">IT & Risk Management</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Status</label>
                      <select
                        className="form-select"
                        value={formData.is_active ? 'Active' : 'Inactive'}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'Active' })}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Role *</label>
                    <select
                      className="form-select"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      required
                    >
                      <option value="super_admin">System Administrator</option>
                      <option value="admin">Administrator</option>
                      <option value="staff">Staff</option>
                      <option value="verifier">Verifier</option>
                      <option value="client">Enterprise User</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer border-top-0" style={{ backgroundColor: '#F9FAFB' }}>
                  <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn text-white"
                    style={{ backgroundColor: '#0D1526' }}
                    disabled={passwordTooShort}
                  >
                    <i className="bi bi-check-circle me-2"></i>
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <Modal
        show={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteTarget(null);
        }}
        title="Delete User"
        footer={(
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteTarget(null);
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={async () => {
                if (!deleteTarget) return;
                await deleteUser(deleteTarget.id);
                setShowDeleteModal(false);
                setDeleteTarget(null);
              }}
            >
              Delete
            </button>
          </>
        )}
      >
        <p className="mb-0">
          This will permanently remove <strong>{deleteTarget?.displayName || deleteTarget?.username}</strong>. This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
export default Users;