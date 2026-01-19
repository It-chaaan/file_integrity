# 🚀 QUICK REFERENCE - Copy & Paste Ready

## 🔐 Test Login
```
Username: admin
Password: admin123
2FA Code: 123456 (any 6 digits)
```

## 📦 Import Services
```jsx
// Authentication
import { mockLogin, mockLogout, getCurrentUser, isAuthenticated } from '../services/mockAuth';

// Data hooks
import { useDocuments, useUsers, useTickets, useKeys, useLogs } from '../hooks/useData';

// Components
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';

// Utils
import { generateHash, formatDate, exportToCSV } from '../services/utils';
```

## 🎣 Use Hooks
```jsx
// Documents
const { documents, loading, createDocument, updateDocument, deleteDocument, verifyDocument } = useDocuments();

// Users  
const { users, loading, createUser, updateUser, deleteUser, searchUsers } = useUsers();

// Tickets
const { tickets, loading, createTicket, updateTicket } = useTickets();

// Keys
const { keys, loading, rotateKey } = useKeys();

// Logs (read-only)
const { logs, loading, addLog } = useLogs();

// Get current user
const currentUser = getCurrentUser(); // { id, username, name, email, role }
```

## 📊 DataTable Template
```jsx
<DataTable
  columns={[
    { field: 'id', header: 'ID', sortable: true },
    { field: 'name', header: 'Name', sortable: true },
    { 
      field: 'status', 
      header: 'Status',
      render: (value) => <StatusBadge status={value} />
    }
  ]}
  data={yourData}
  actions={(row) => (
    <>
      <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(row)}>
        <i className="bi bi-pencil"></i>
      </button>
      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(row)}>
        <i className="bi bi-trash"></i>
      </button>
    </>
  )}
  searchable={true}
  filterable={true}
  filters={[
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' }
      ]
    }
  ]}
  pageSize={10}
  emptyMessage="No data found"
/>
```

## 📝 CRUD Operations
```jsx
// CREATE
const newItem = {
  id: generateDocumentId(), // or generateUserId(role)
  title: 'New Document',
  status: 'Active',
  // ... other fields
};
await createDocument(newItem);

// READ
const allDocs = documents; // From hook
const doc = documents.find(d => d.id === 'DOC-2026-001');

// UPDATE
await updateDocument('DOC-2026-001', { 
  status: 'Inactive' 
});

// DELETE
await deleteDocument('DOC-2026-001');

// SEARCH
const results = await searchDocuments('business permit');
```

## 🎨 Modal Form Pattern
```jsx
const [showModal, setShowModal] = useState(false);
const [formData, setFormData] = useState({ name: '', email: '' });

const handleSubmit = async (e) => {
  e.preventDefault();
  await createItem(formData);
  setShowModal(false);
  // Hook automatically refetches data
};

<Modal show={showModal} onClose={() => setShowModal(false)} title="Add Item">
  <form onSubmit={handleSubmit}>
    <div className="mb-3">
      <label className="form-label">Name</label>
      <input
        type="text"
        className="form-control"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />
    </div>
    <button type="submit" className="btn btn-primary">Save</button>
  </form>
</Modal>
```

## 🔒 Auth Functions
```jsx
// Check if logged in
if (!isAuthenticated()) {
  navigate('/login');
}

// Get current user
const user = getCurrentUser();
console.log(user.name, user.role);

// Logout
const handleLogout = () => {
  mockLogout();
  navigate('/login');
};

// Check role
import { hasRole } from '../services/mockAuth';
if (hasRole('admin')) {
  // Show admin-only content
}
```

## 📊 Stats Calculation
```jsx
import { calculateStats } from '../services/utils';

const stats = calculateStats(documents, users, tickets, logs);
// Returns: {
//   totalDocuments, activeDocuments, totalUsers, activeUsers,
//   totalTickets, openTickets, criticalTickets, recentLogs,
//   todayUploads, todayVerifications
// }
```

## 🎯 Filter & Search
```jsx
import { filterData, sortData, paginateData } from '../services/utils';

// Filter
const filtered = filterData(documents, { 
  status: 'Active', 
  type: 'Business Permit' 
});

// Sort
const sorted = sortData(documents, 'date', 'desc');

// Paginate
const paginated = paginateData(documents, page, pageSize);
// Returns: { data, total, page, pageSize, totalPages }
```

## 📥 Export Data
```jsx
import { exportToCSV, exportToJSON } from '../services/utils';

// Export to CSV
exportToCSV(documents, 'documents.csv');

// Export to JSON
exportToJSON(documents, 'documents.json');
```

## 🎨 Status Badges
```jsx
import StatusBadge from '../components/StatusBadge';

<StatusBadge status="Active" />    // Green
<StatusBadge status="Inactive" />  // Gray
<StatusBadge status="Pending" />   // Yellow
<StatusBadge status="Failed" />    // Red
```

## 🔍 Hash Operations
```jsx
import { generateHash, shortHash } from '../services/utils';

// Generate hash from file
const hash = generateHash(file); // 64-char SHA-256

// Shorten hash for display
const short = shortHash(hash); // "d4735e3a...13ab35"
```

## 📋 Document Verification
```jsx
const { verifyDocument } = useDocuments();

const result = await verifyDocument(hash);
// Returns: {
//   found: boolean,
//   document: {...} or null,
//   status: 'VERIFIED' | 'NOT_FOUND',
//   timestamp: string
// }

if (result.found) {
  console.log('Document verified!', result.document);
} else {
  console.log('Document not found or tampered');
}
```

## 🔑 ID Generation
```jsx
import { generateDocumentId, generateUserId, generateTicketId } from '../services/utils';

const docId = generateDocumentId();      // "DOC-2026-001234"
const userId = generateUserId('Admin');  // "USR-ADM-042"
const ticketId = generateTicketId('SYS');// "TKT-SYS-089"
```

## 🕒 Date Formatting
```jsx
import { formatDate, formatDateTime } from '../services/utils';

formatDate('2026-01-15');           // "Jan 15, 2026"
formatDateTime('2026-01-15T14:30'); // "Jan 15, 2026, 2:30 PM"
```

## ⚡ Loading State Pattern
```jsx
const [loading, setLoading] = useState(false);

const handleAction = async () => {
  setLoading(true);
  try {
    await someAsyncOperation();
  } finally {
    setLoading(false);
  }
};

{loading ? (
  <div className="text-center py-5">
    <div className="spinner-border text-primary"></div>
    <p className="text-muted mt-3">Loading...</p>
  </div>
) : (
  <YourContent />
)}
```

## 🎨 Card with Stats
```jsx
<div className="card border-0 shadow-sm">
  <div className="card-body">
    <h6 className="text-muted mb-2 small">Total Documents</h6>
    <h2 className="mb-0 text-primary fw-bold">{documents.length}</h2>
    <p className="text-muted small mb-0">
      <i className="bi bi-arrow-up-right me-1"></i>
      {todayCount} uploaded today
    </p>
  </div>
</div>
```

## 🚨 Error Handling
```jsx
const [error, setError] = useState('');

try {
  await someOperation();
} catch (err) {
  setError(err.message);
}

{error && (
  <div className="alert alert-danger">
    <i className="bi bi-exclamation-circle me-2"></i>
    {error}
  </div>
)}
```

## 🎯 Button States
```jsx
<button 
  className="btn btn-primary" 
  disabled={loading}
>
  {loading ? (
    <>
      <span className="spinner-border spinner-border-sm me-2"></span>
      Processing...
    </>
  ) : (
    <>
      <i className="bi bi-check me-2"></i>
      Submit
    </>
  )}
</button>
```

## 📱 Responsive Grid
```jsx
<div className="row g-3">
  <div className="col-md-6 col-lg-4">
    <div className="card">...</div>
  </div>
  <div className="col-md-6 col-lg-4">
    <div className="card">...</div>
  </div>
  <div className="col-md-6 col-lg-4">
    <div className="card">...</div>
  </div>
</div>
```

## 🎨 Bootstrap Icons
```jsx
// Common icons used
<i className="bi bi-file-earmark-text"></i>     // Document
<i className="bi bi-people"></i>                // Users
<i className="bi bi-shield-check"></i>          // Security
<i className="bi bi-ticket-perforated"></i>     // Tickets
<i className="bi bi-check-circle"></i>          // Success
<i className="bi bi-x-circle"></i>              // Error
<i className="bi bi-exclamation-circle"></i>    // Warning
<i className="bi bi-pencil"></i>                // Edit
<i className="bi bi-trash"></i>                 // Delete
<i className="bi bi-eye"></i>                   // View
<i className="bi bi-download"></i>              // Download
<i className="bi bi-upload"></i>                // Upload
```

## 🔄 Auto-Refresh Pattern
```jsx
const { refetch } = useDocuments();

// Refresh every 30 seconds
useEffect(() => {
  const interval = setInterval(() => {
    refetch();
  }, 30000);
  
  return () => clearInterval(interval);
}, [refetch]);
```

## 🎨 Color Classes
```css
/* Text colors */
.text-primary   // Blue
.text-success   // Green
.text-danger    // Red
.text-warning   // Yellow
.text-info      // Light blue
.text-muted     // Gray

/* Background colors */
.bg-primary     // Blue
.bg-success     // Green
.bg-danger      // Red
.bg-warning     // Yellow
.bg-light       // Light gray
.bg-white       // White

/* Badges */
.badge.bg-success   // Green badge
.badge.bg-danger    // Red badge
.badge.bg-warning   // Yellow badge
```

## 📐 Spacing Classes
```css
.m-3    // margin all sides
.mb-4   // margin bottom
.mt-2   // margin top
.p-3    // padding all sides
.py-5   // padding top & bottom
.px-4   // padding left & right
.gap-2  // gap in flex/grid
```

---

## 🔥 Copy This Entire Page Template

```jsx
import React, { useState } from 'react';
import { useDocuments } from '../../hooks/useData';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';

function YourPage() {
  const { documents, loading, createDocument, updateDocument, deleteDocument } = useDocuments();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  
  const columns = [
    { field: 'id', header: 'ID', sortable: true },
    { field: 'title', header: 'Title', sortable: true },
    { 
      field: 'status', 
      header: 'Status',
      render: (value) => <StatusBadge status={value} />
    }
  ];
  
  const actions = (row) => (
    <>
      <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(row)}>
        <i className="bi bi-pencil"></i>
      </button>
      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(row)}>
        <i className="bi bi-trash"></i>
      </button>
    </>
  );
  
  const handleEdit = (row) => {
    setEditing(row);
    setShowModal(true);
  };
  
  const handleDelete = async (row) => {
    if (confirm(`Delete ${row.title}?`)) {
      await deleteDocument(row.id);
    }
  };
  
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Your Page Title</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <i className="bi bi-plus-circle me-2"></i>
          Add New
        </button>
      </div>
      
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border"></div>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={documents}
              actions={actions}
              searchable={true}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default YourPage;
```

---

**That's it! Copy what you need and build fast! 🚀**
