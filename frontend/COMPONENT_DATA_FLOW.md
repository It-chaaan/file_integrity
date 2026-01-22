# Component Data Flow Documentation
## File Integrity Verification System

**Version:** 1.0.0  
**Last Updated:** January 22, 2026  
**Status:** Backend Integration Reference

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Data Flow Layers](#data-flow-layers)
3. [Component Hierarchy](#component-hierarchy)
4. [Page Components](#page-components)
5. [Custom Hooks](#custom-hooks)
6. [API Service Layer](#api-service-layer)
7. [State Management](#state-management)
8. [Props and Data Passing](#props-and-data-passing)
9. [Integration Guide](#integration-guide)

---

## 🏗 Architecture Overview

### High-Level Data Flow

```
┌──────────────┐
│   Backend    │
│   REST API   │
└──────┬───────┘
       │
       │ HTTP Requests (JSON)
       │
┌──────▼───────┐
│  API Layer   │
│  (adapter.js)│ ◄─── MOCK/REAL Switch
└──────┬───────┘
       │
       │ JavaScript Objects
       │
┌──────▼───────┐
│ Custom Hooks │
│ (useData.js) │ ◄─── Data Fetching & Caching
└──────┬───────┘
       │
       │ {data, loading, error}
       │
┌──────▼───────┐
│   Page       │
│  Components  │ ◄─── Business Logic
└──────┬───────┘
       │
       │ Props
       │
┌──────▼───────┐
│  Reusable    │
│  Components  │ ◄─── Presentation
└──────────────┘
```

### Layer Responsibilities

| Layer | Responsibility | Files |
|-------|---------------|--------|
| **Backend** | Data storage, business logic, authentication | N/A (Backend team) |
| **API Layer** | HTTP communication, request/response formatting | `api/*.api.js`, `api/client.js` |
| **Adapter** | Switch between mock/real API | `api/adapter.js` |
| **Custom Hooks** | Data fetching, state management, caching | `hooks/useData.js` |
| **Page Components** | Page-specific logic, data aggregation | `pages/**/*.jsx` |
| **Reusable Components** | UI rendering, event handling | `components/*.jsx` |

---

## 🔄 Data Flow Layers

### Layer 1: Backend API

**Responsibility:** Provide REST endpoints with standardized responses

**Example Endpoint:**
```
GET /api/v1/documents
Response: {
  success: true,
  data: {
    documents: [...],
    pagination: {...}
  }
}
```

**Key Points:**
- All responses follow standard format (see [BACKEND_INTEGRATION_GUIDE.md](./BACKEND_INTEGRATION_GUIDE.md))
- JWT token required in Authorization header
- Errors use consistent format

---

### Layer 2: API Service Layer

**Location:** `src/api/`

**Purpose:** Abstract HTTP communication from components

**Example:** `src/api/documents.api.js`

```javascript
import apiClient from './client';

/**
 * Get all documents
 * @param {Object} params - Query parameters {page, limit, status, search}
 * @returns {Promise} API response
 */
export const getAll = async (params = {}) => {
  const response = await apiClient.get('/documents', { params });
  return response.data;
};

/**
 * Upload document
 * @param {FormData} formData - File and metadata
 * @returns {Promise} API response
 */
export const upload = async (formData) => {
  const response = await apiClient.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

/**
 * Delete document
 * @param {string} id - Document ID
 * @returns {Promise} API response
 */
export const deleteDocument = async (id) => {
  const response = await apiClient.delete(`/documents/${id}`);
  return response.data;
};
```

**Key Files:**
- `api/client.js` - Axios instance with interceptors
- `api/adapter.js` - Mock/Real API switch
- `api/auth.api.js` - Authentication endpoints
- `api/documents.api.js` - Document endpoints
- `api/users.api.js` - User management endpoints
- `api/tickets.api.js` - Ticket system endpoints
- `api/keys.api.js` - Security keys endpoints
- `api/logs.api.js` - Audit logs endpoints

---

### Layer 3: Adapter Pattern

**Location:** `src/api/adapter.js`

**Purpose:** Switch between mock data and real API without changing component code

**Current Implementation:**

```javascript
import * as mockData from '../mock';
import * as realAPI from './index';

const API_MODE = import.meta.env.VITE_API_MODE || 'MOCK';

/**
 * API adapter - switches between mock and real API
 */
export const api = API_MODE === 'MOCK' ? mockData : realAPI;

export default api;
```

**Usage in Hooks:**

```javascript
import { api } from '../api/adapter';

// This will use mock or real API based on VITE_API_MODE
const data = await api.documents.getAll();
```

**Environment Control:**

```env
# .env file
VITE_API_MODE=MOCK  # or REAL
```

**To Switch to Real API:**
1. Change `VITE_API_MODE` to `REAL` in `.env`
2. Set `VITE_API_BASE_URL` to backend URL
3. Restart dev server

---

### Layer 4: Custom Hooks

**Location:** `src/hooks/useData.js`

**Purpose:** Encapsulate data fetching logic, provide loading/error states

**Architecture:**

```javascript
import { useState, useEffect } from 'react';
import { api } from '../api/adapter';

/**
 * Generic data fetching hook
 * @param {Function} apiFunction - API function to call
 * @param {Array} dependencies - Dependencies for useEffect
 * @returns {Object} {data, loading, error, refetch}
 */
const useApiData = (apiFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFunction();
      setData(response.data || response);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
};

/**
 * Hook for documents data
 */
export const useDocuments = () => {
  return useApiData(() => api.documents.getAll());
};

/**
 * Hook for tickets data
 */
export const useTickets = () => {
  return useApiData(() => api.tickets.getAll());
};

/**
 * Hook for cryptographic keys data
 */
export const useKeys = () => {
  return useApiData(() => api.keys.getAll());
};

/**
 * Hook for users data (admin only)
 */
export const useUsers = () => {
  return useApiData(() => api.users.getAll());
};

/**
 * Hook for audit logs data (admin only)
 */
export const useLogs = () => {
  return useApiData(() => api.logs.getAll());
};
```

**Return Value Structure:**

```javascript
{
  data: Array | Object | null,    // API response data
  loading: boolean,                // True while fetching
  error: Object | null,            // Error object if failed
  refetch: Function                // Function to refetch data
}
```

**Safe Destructuring Pattern:**

```javascript
// Components use optional chaining and default values
const { data = [], loading = false, error = null } = useDocuments?.() || {};
```

This prevents crashes if hook returns undefined.

---

### Layer 5: Page Components

**Location:** `src/pages/`

**Purpose:** Coordinate data, handle user interactions, manage page state

**Typical Structure:**

```javascript
import React, { useState } from 'react';
import { useDocuments } from '../../hooks/useData';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';

const DocumentRegistry = () => {
  // 1. Data fetching with custom hook
  const { data: documents = [], loading, error, refetch } = useDocuments?.() || {};

  // 2. Local state for UI
  const [showModal, setShowModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  // 3. Event handlers
  const handleView = (doc) => {
    setSelectedDoc(doc);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.documents.deleteDocument(id);
      refetch(); // Refresh data
      showToast('Deleted successfully', 'success');
    } catch (error) {
      showToast('Delete failed', 'error');
    }
  };

  // 4. Loading state
  if (loading) return <div>Loading...</div>;

  // 5. Error state
  if (error) return <div>Error: {error.message}</div>;

  // 6. Render with data
  return (
    <div>
      <h1>Document Registry</h1>
      <DataTable
        data={documents}
        columns={columns}
        onView={handleView}
        onDelete={handleDelete}
      />
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          {/* Modal content */}
        </Modal>
      )}
    </div>
  );
};

export default DocumentRegistry;
```

**Data Flow in Page:**

```
Hook → Page State → Event Handler → API Call → Refetch → UI Update
```

---

### Layer 6: Reusable Components

**Location:** `src/components/`

**Purpose:** Pure presentation components, no data fetching

**Example:** `DataTable.jsx`

```javascript
const DataTable = ({
  data = [],              // Receive data as prop
  columns = [],           // Column configuration
  onView,                 // Event handler from parent
  onEdit,
  onDelete
}) => {
  // Internal state for table features
  const [sortConfig, setSortConfig] = useState(null);
  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Derived data (no API calls)
  const sortedData = useMemo(() => {
    return sortData(data, sortConfig);
  }, [data, sortConfig]);

  const filteredData = useMemo(() => {
    return filterData(sortedData, filterText);
  }, [sortedData, filterText]);

  const paginatedData = useMemo(() => {
    return paginate(filteredData, currentPage);
  }, [filteredData, currentPage]);

  return (
    <table>
      {/* Table rendering */}
      {paginatedData.map(row => (
        <tr key={row.id}>
          <td>{row.name}</td>
          <td>
            <button onClick={() => onView(row)}>View</button>
            <button onClick={() => onDelete(row.id)}>Delete</button>
          </td>
        </tr>
      ))}
    </table>
  );
};
```

**Key Principles:**
- Receive data via props
- Don't fetch data internally
- Emit events upward (onClick handlers)
- Keep state minimal (UI state only)
- Reusable across pages

---

## 🧩 Component Hierarchy

### Admin Portal Structure

```
App
├── Router
    └── AdminLayout
        ├── Sidebar (navigation menu)
        ├── Topbar (user profile, logout)
        └── Outlet (renders current page)
            ├── Dashboard
            │   ├── StatCard × 4
            │   └── RecentActivity
            ├── Users
            │   ├── DataTable
            │   ├── Pagination
            │   └── UserModal
            ├── Registry (Documents)
            │   ├── DataTable
            │   ├── Pagination
            │   └── DocumentModal
            ├── Security (Keys)
            │   ├── DataTable
            │   ├── Pagination
            │   ├── GenerateKeyModal
            │   └── RotateKeyModal
            ├── Tickets
            │   ├── DataTable
            │   ├── Pagination
            │   ├── CreateTicketModal
            │   └── EditTicketModal
            └── AuditLogs
                ├── DataTable
                └── Pagination
```

### Staff Portal Structure

```
App
├── Router
    └── StaffLayout
        ├── Sidebar (limited menu)
        ├── Topbar
        └── Outlet
            ├── Dashboard
            │   ├── StatCard × 3
            │   └── RecentActivity
            ├── Registry (View only)
            │   ├── DataTable
            │   └── Pagination
            └── Tickets (Create/View)
                ├── DataTable
                ├── Pagination
                └── CreateTicketModal
```

---

## 📄 Page Components

### 1. Admin Dashboard

**File:** `src/pages/admin/Dashboard.jsx`

**Data Sources:**
- Statistics API: `GET /dashboard/stats`
- Recent activity: `GET /dashboard/recent`

**Data Flow:**

```javascript
useEffect(() => {
  fetchStats();      // Get overview statistics
  fetchActivity();   // Get recent actions
}, []);

// Stats structure
{
  totalDocuments: 1234,
  verifiedDocuments: 1180,
  totalUsers: 45,
  activeKeys: 3,
  pendingTickets: 8
}

// Activity structure
[
  {
    id: 1,
    action: 'document_upload',
    user: 'John Doe',
    timestamp: '2026-01-22T10:30:00Z',
    details: 'Uploaded contract.pdf'
  }
]
```

**Components Used:**
- `StatCard` - Display single statistic
- `RecentActivity` - List recent actions

---

### 2. Users Management (Admin Only)

**File:** `src/pages/admin/Users.jsx`

**Data Source:** `GET /users`

**Data Flow:**

```javascript
// 1. Fetch users
const { data: users = [], loading, error, refetch } = useUsers?.() || {};

// 2. Create user
const handleCreate = async (userData) => {
  await api.users.create(userData);
  refetch();
};

// 3. Update user
const handleUpdate = async (id, userData) => {
  await api.users.update(id, userData);
  refetch();
};

// 4. Delete user
const handleDelete = async (id) => {
  await api.users.deleteUser(id);
  refetch();
};
```

**User Object Structure:**

```javascript
{
  id: 'user-123',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'admin' | 'staff',
  department: 'IT Security',
  status: 'active' | 'inactive',
  createdAt: '2026-01-01T00:00:00Z',
  lastLogin: '2026-01-22T09:00:00Z'
}
```

**Components Used:**
- `DataTable` - Display users
- `Pagination` - Navigate pages
- `UserModal` - Create/Edit form

---

### 3. Document Registry

**Files:**
- Admin: `src/pages/admin/Registry.jsx`
- Staff: `src/pages/staff/Registry.jsx`

**Data Source:** `GET /documents`

**Data Flow:**

```javascript
// 1. Fetch documents
const { data: documents = [], loading, error, refetch } = useDocuments?.() || {};

// 2. Filter/Search
const filteredDocs = useMemo(() => {
  return documents.filter(doc =>
    doc.fileName.includes(searchText) &&
    (statusFilter === 'all' || doc.status === statusFilter)
  );
}, [documents, searchText, statusFilter]);

// 3. View document details
const handleView = (doc) => {
  setSelectedDoc(doc);
  setShowModal(true);
};

// 4. Delete document (Admin only)
const handleDelete = async (id) => {
  await api.documents.deleteDocument(id);
  refetch();
};
```

**Document Object Structure:**

```javascript
{
  id: 'doc-123',
  fileName: 'contract.pdf',
  fileSize: 2457600,           // bytes
  fileType: 'application/pdf',
  hash: 'abc123def456...',
  status: 'verified' | 'pending' | 'failed' | 'tampered',
  uploadedBy: 'John Doe',
  uploadDate: '2026-01-20T14:30:00Z',
  department: 'HR',
  documentType: 'contract',
  verificationDate: '2026-01-20T14:30:15Z'
}
```

**Components Used:**
- `DataTable` - Display documents
- `Pagination` - Navigate pages
- `StatusBadge` - Show status with color
- `DocumentModal` - View details

---

### 4. Security Keys Management (Admin Only)

**File:** `src/pages/admin/Security.jsx`

**Data Source:** `GET /security/keys`

**Data Flow:**

```javascript
// 1. Fetch keys
const { data: keys = [], loading, error, refetch } = useKeys?.() || {};

// 2. Generate new key
const handleGenerate = async (algorithm, validityPeriod) => {
  await api.keys.generate({ algorithm, validityPeriod });
  refetch();
};

// 3. Rotate key
const handleRotate = async (keyId, reason) => {
  await api.keys.rotate(keyId, { reason });
  refetch();
};

// 4. Revoke key
const handleRevoke = async (keyId) => {
  await api.keys.revoke(keyId);
  refetch();
};
```

**Key Object Structure:**

```javascript
{
  id: 'key-123',
  algorithm: 'SHA-256' | 'SHA-512' | 'RSA-2048' | 'RSA-4096',
  keyHash: 'abc123...',
  status: 'active' | 'rotated' | 'revoked' | 'expired',
  createdAt: '2026-01-01T00:00:00Z',
  createdBy: 'Admin User',
  expiresAt: '2027-01-01T00:00:00Z',
  lastUsed: '2026-01-22T10:00:00Z',
  usageCount: 1523
}
```

**Components Used:**
- `DataTable` - Display keys
- `StatusBadge` - Show status
- `GenerateKeyModal` - Create new key
- `RotateKeyModal` - Rotate existing key

---

### 5. Ticket System

**Files:**
- Admin: `src/pages/admin/Tickets.jsx`
- Staff: `src/pages/staff/Tickets.jsx`

**Data Source:** `GET /tickets`

**Data Flow:**

```javascript
// 1. Fetch tickets
const { data: tickets = [], loading, error, refetch } = useTickets?.() || {};

// 2. Filter by status/priority
const filteredTickets = useMemo(() => {
  return tickets.filter(ticket =>
    (statusFilter === 'all' || ticket.status === statusFilter) &&
    (priorityFilter === 'all' || ticket.priority === priorityFilter)
  );
}, [tickets, statusFilter, priorityFilter]);

// 3. Create ticket
const handleCreate = async (ticketData) => {
  await api.tickets.create(ticketData);
  refetch();
};

// 4. Update ticket (Admin only)
const handleUpdate = async (id, updates) => {
  await api.tickets.update(id, updates);
  refetch();
};
```

**Ticket Object Structure:**

```javascript
{
  id: 'ticket-123',
  ticketNumber: 'TKT-2026-001',
  title: 'Document verification failing',
  description: 'Unable to verify uploaded documents...',
  category: 'technical' | 'access' | 'security' | 'other',
  priority: 'low' | 'medium' | 'high' | 'critical',
  status: 'open' | 'in-progress' | 'resolved' | 'closed',
  reportedBy: 'John Doe',
  reportedAt: '2026-01-20T09:00:00Z',
  assignedTo: 'Admin User',
  resolvedAt: null,
  notes: 'Investigating the issue...'
}
```

**Components Used:**
- `DataTable` - Display tickets
- `Pagination` - Navigate pages
- `StatusBadge` - Show status
- `CreateTicketModal` - Report issue
- `EditTicketModal` - Update ticket (Admin)

---

### 6. Audit Logs (Admin Only)

**File:** `src/pages/admin/AuditLogs.jsx`

**Data Source:** `GET /logs`

**Data Flow:**

```javascript
// 1. Fetch logs
const { data: logs = [], loading, error, refetch } = useLogs?.() || {};

// 2. Filter by action/user/date
const filteredLogs = useMemo(() => {
  return logs.filter(log =>
    (actionFilter === 'all' || log.action === actionFilter) &&
    (userFilter === 'all' || log.userId === userFilter) &&
    isWithinDateRange(log.timestamp, startDate, endDate)
  );
}, [logs, actionFilter, userFilter, startDate, endDate]);

// 3. Export logs (Future)
const handleExport = async () => {
  const response = await api.logs.export({ format: 'csv', filters });
  downloadFile(response.data);
};
```

**Log Object Structure:**

```javascript
{
  id: 'log-123',
  action: 'document_upload' | 'user_created' | 'login' | 'logout' | ...,
  userId: 'user-123',
  userName: 'John Doe',
  timestamp: '2026-01-22T10:30:00Z',
  ipAddress: '192.168.1.100',
  details: {
    resource: 'document',
    resourceId: 'doc-456',
    changes: { ... }
  },
  status: 'success' | 'failure'
}
```

**Components Used:**
- `DataTable` - Display logs
- `Pagination` - Navigate pages
- `FilterPanel` - Advanced filtering

---

## 🎣 Custom Hooks

### Available Hooks

| Hook | Purpose | Returns |
|------|---------|---------|
| `useDocuments()` | Fetch documents | `{data, loading, error, refetch}` |
| `useTickets()` | Fetch tickets | `{data, loading, error, refetch}` |
| `useKeys()` | Fetch security keys | `{data, loading, error, refetch}` |
| `useUsers()` | Fetch users | `{data, loading, error, refetch}` |
| `useLogs()` | Fetch audit logs | `{data, loading, error, refetch}` |

### Creating New Hooks

**Template:**

```javascript
/**
 * Hook for [resource] data
 * @param {Object} params - Optional query parameters
 * @returns {Object} {data, loading, error, refetch}
 */
export const use[Resource] = (params = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.[resource].getAll(params);
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [JSON.stringify(params)]);

  return { data, loading, error, refetch: fetchData };
};
```

---

## 🔌 API Service Layer

### File Structure

```
api/
├── client.js          # Axios instance with interceptors
├── adapter.js         # Mock/Real API switch
├── auth.api.js        # Authentication endpoints
├── documents.api.js   # Document endpoints
├── users.api.js       # User management
├── tickets.api.js     # Ticket system
├── keys.api.js        # Security keys
└── logs.api.js        # Audit logs
```

### Standard API Function Pattern

```javascript
/**
 * [Action description]
 * @param {Type} param - Parameter description
 * @returns {Promise} API response
 */
export const functionName = async (param) => {
  try {
    const response = await apiClient.method('/endpoint', data);
    return response.data;
  } catch (error) {
    // Error handling done by interceptor
    throw error;
  }
};
```

### Example: Document API

```javascript
// Get all documents
export const getAll = async (params = {}) => {
  const response = await apiClient.get('/documents', { params });
  return response.data;
};

// Get single document
export const getById = async (id) => {
  const response = await apiClient.get(`/documents/${id}`);
  return response.data;
};

// Upload document
export const upload = async (formData) => {
  const response = await apiClient.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

// Delete document
export const deleteDocument = async (id) => {
  const response = await apiClient.delete(`/documents/${id}`);
  return response.data;
};

// Verify document
export const verify = async (hashOrFile) => {
  const isFile = hashOrFile instanceof FormData;
  const response = await apiClient.post('/documents/verify', hashOrFile, {
    headers: isFile ? { 'Content-Type': 'multipart/form-data' } : undefined
  });
  return response.data;
};
```

---

## 🧮 State Management

### Current Approach: React Hooks + Local State

**No Redux or Context API** - Keeping it simple

**State Types:**

1. **Server State** (from API)
   - Managed by custom hooks (`useData.js`)
   - Automatically refetched when needed
   - Example: documents, users, tickets

2. **UI State** (component-specific)
   - Managed by `useState` in components
   - Example: modal visibility, selected item, form inputs

3. **Form State** (user input)
   - Managed by controlled components
   - Example: login form, create user form

4. **Auth State** (user session)
   - Stored in `localStorage`
   - Accessed via `authService`
   - Example: token, user role, user name

### State Location Guidelines

**Store in Custom Hook:**
- Data from API
- Loading/error states
- Refetch functionality

**Store in Page Component:**
- Selected item for modal
- Filter/search text
- Pagination state
- Modal visibility

**Store in Reusable Component:**
- Sort configuration
- Expanded row state
- Input focus state

**Store in localStorage:**
- Authentication token
- User preferences (future)
- Sidebar open/closed state

---

## 📦 Props and Data Passing

### DataTable Component Props

```javascript
<DataTable
  data={[...]}              // Array of objects to display
  columns={[...]}           // Column configuration
  loading={false}           // Show loading spinner
  itemsPerPage={10}         // Rows per page
  onView={(row) => {...}}   // View button click
  onEdit={(row) => {...}}   // Edit button click
  onDelete={(id) => {...}}  // Delete button click
/>
```

### Modal Component Props

```javascript
<Modal
  show={true}               // Control visibility
  onClose={() => {...}}     // Close callback
  title="Modal Title"       // Header text
  size="lg"                 // sm | md | lg | xl
>
  {/* Modal content */}
</Modal>
```

### Pagination Component Props

```javascript
<Pagination
  currentPage={1}           // Current page number
  totalPages={10}           // Total pages
  totalItems={100}          // Total items
  startIndex={0}            // First item index
  endIndex={9}              // Last item index
  onPageChange={(page) => {...}}  // Page change callback
/>
```

### StatusBadge Component Props

```javascript
<StatusBadge
  status="verified"         // Status value
  type="document"           // document | ticket | key | user
/>
```

---

## 🔗 Integration Guide

### Step 1: Create API Endpoint

**Backend:** Implement REST endpoint

```
GET /api/v1/resources
Response: {
  success: true,
  data: [...]
}
```

### Step 2: Add API Service Function

**File:** `src/api/resources.api.js`

```javascript
export const getAll = async () => {
  const response = await apiClient.get('/resources');
  return response.data;
};
```

### Step 3: Create Custom Hook

**File:** `src/hooks/useData.js`

```javascript
export const useResources = () => {
  return useApiData(() => api.resources.getAll());
};
```

### Step 4: Use in Page Component

**File:** `src/pages/admin/Resources.jsx`

```javascript
const Resources = () => {
  const { data: resources = [], loading, error } = useResources?.() || {};
  
  if (loading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <DataTable data={resources} />;
};
```

### Step 5: Test Integration

1. Test with mock data first (`VITE_API_MODE=MOCK`)
2. Switch to real API (`VITE_API_MODE=REAL`)
3. Verify data displays correctly
4. Test error scenarios
5. Test loading states

---

## 📊 Data Flow Examples

### Example 1: Viewing Document Details

```
User clicks "View" button
       ↓
DataTable emits onView(document)
       ↓
Page component receives document object
       ↓
Page sets selectedDoc state
       ↓
Page sets showModal to true
       ↓
Modal renders with document data
       ↓
User clicks "Close"
       ↓
Modal emits onClose()
       ↓
Page sets showModal to false
```

### Example 2: Deleting User

```
User clicks "Delete" button
       ↓
DataTable emits onDelete(userId)
       ↓
Page component calls api.users.deleteUser(userId)
       ↓
API service sends DELETE request
       ↓
Backend deletes user
       ↓
Response received
       ↓
Page calls refetch()
       ↓
Custom hook re-fetches users
       ↓
New user list returned
       ↓
Component re-renders with updated list
```

### Example 3: Creating Ticket

```
User clicks "Create Ticket" button
       ↓
Page sets showModal to true
       ↓
Modal renders with empty form
       ↓
User fills form and clicks "Submit"
       ↓
Modal emits onSubmit(formData)
       ↓
Page validates form data
       ↓
Page calls api.tickets.create(formData)
       ↓
API service sends POST request
       ↓
Backend creates ticket
       ↓
Response received with new ticket
       ↓
Page closes modal
       ↓
Page calls refetch()
       ↓
Tickets list updated with new ticket
       ↓
Toast notification shows success
```

---

## 🎯 Best Practices

### Data Fetching

✅ **DO:**
- Use custom hooks for data fetching
- Handle loading and error states
- Use optional chaining for safety: `useHook?.() || {}`
- Provide default values: `const { data = [] } = ...`

❌ **DON'T:**
- Fetch data directly in components
- Ignore error states
- Assume hooks always return data
- Make multiple API calls for same data

### State Management

✅ **DO:**
- Keep state as local as possible
- Lift state up only when needed
- Use `useMemo` for derived data
- Clear state when unmounting

❌ **DON'T:**
- Store derived data in state
- Duplicate state across components
- Forget to clean up timers/subscriptions

### Component Communication

✅ **DO:**
- Pass data down via props
- Emit events upward via callbacks
- Use descriptive prop names
- Document prop types

❌ **DON'T:**
- Directly modify parent state
- Use global variables for communication
- Create circular dependencies

### Error Handling

✅ **DO:**
- Show user-friendly error messages
- Log errors for debugging
- Provide recovery actions
- Handle network errors gracefully

❌ **DON'T:**
- Show raw error objects to users
- Ignore errors silently
- Crash on null/undefined data

---

## 📞 Support

### For Frontend Developers

**Adding New Feature:**
1. Create API endpoint (Backend)
2. Add API service function
3. Create custom hook (if needed)
4. Build page component
5. Test with mock data
6. Connect to real API

**Debugging Data Issues:**
1. Check browser DevTools Network tab
2. Verify API response format
3. Check hook return values
4. Verify component props
5. Check state updates

### For Backend Developers

**Response Format Requirements:**
- Use standard format (see [BACKEND_INTEGRATION_GUIDE.md](./BACKEND_INTEGRATION_GUIDE.md))
- Include success/error flag
- Wrap data in `data` property
- Use consistent date format (ISO 8601)
- Return pagination metadata when applicable

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Jan 22, 2026 | Initial component data flow documentation |

---

**Document Status:** ✅ Complete and Ready for Backend Integration

This document maps the complete data flow from backend to UI components. Use this as a reference when implementing new features or debugging data issues.
