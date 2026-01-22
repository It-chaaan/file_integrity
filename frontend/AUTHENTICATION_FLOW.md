# Authentication Flow Documentation
## File Integrity Verification System

**Version:** 1.0.0  
**Last Updated:** January 22, 2026  
**Status:** Backend Integration Ready

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Authentication Architecture](#authentication-architecture)
3. [Login Flow](#login-flow)
4. [Two-Factor Authentication](#two-factor-authentication)
5. [Token Management](#token-management)
6. [Protected Routes](#protected-routes)
7. [Logout Flow](#logout-flow)
8. [Backend Requirements](#backend-requirements)
9. [Frontend Implementation](#frontend-implementation)
10. [Security Best Practices](#security-best-practices)
11. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The authentication system uses JWT (JSON Web Token) based authentication with role-based access control (RBAC). The system supports two user roles:
- **Admin** - Full system access including user management
- **Staff** - Limited access to document management features

### Authentication Methods
✅ Email/Password Authentication  
✅ Two-Factor Authentication (2FA) - Optional  
✅ JWT Token-Based Sessions  
✅ Automatic Token Refresh (Backend requirement)  
✅ Role-Based Access Control  

---

## 🏗 Authentication Architecture

### High-Level Flow
```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Browser   │ ──────> │   Frontend   │ ──────> │   Backend   │
│             │         │              │         │             │
│  Login Form │         │  Auth Service│         │  JWT Auth   │
│             │ <────── │              │ <────── │             │
└─────────────┘         └──────────────┘         └─────────────┘
      │                        │                        │
      │                        ▼                        │
      │                  localStorage                   │
      │              (authToken, userRole)              │
      │                        │                        │
      └────────────────────────┴────────────────────────┘
                    All Requests Include Token
```

### Component Structure
```
src/
├── services/
│   ├── auth.js              # 🔴 Main auth service (connect to backend)
│   └── mockAuth.js          # 🟡 Mock auth (remove in production)
│
├── api/
│   ├── auth.api.js          # 🔴 Authentication API endpoints
│   └── client.js            # 🔴 Axios instance with interceptors
│
├── pages/
│   └── auth/
│       ├── Login.jsx        # Login page
│       └── TwoFactor.jsx    # 2FA verification page
│
└── App.jsx                  # Route protection logic
```

---

## 🔐 Login Flow

### Step-by-Step Process

#### 1. User Enters Credentials
**File:** `src/pages/auth/Login.jsx`

User provides:
- Email address
- Password

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validate inputs
  if (!email || !password) {
    showError('Please enter email and password');
    return;
  }
  
  // Call login service
  try {
    const response = await authService.login(email, password);
    // Handle response...
  } catch (error) {
    showError('Login failed');
  }
};
```

#### 2. Frontend Sends Login Request
**File:** `src/api/auth.api.js`

```javascript
// POST /auth/login
export const login = async (email, password) => {
  const response = await apiClient.post('/auth/login', {
    email,
    password
  });
  return response.data;
};
```

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "securePassword123!"
}
```

#### 3. Backend Validates Credentials

**Expected Backend Process:**
1. Find user by email
2. Verify password hash (bcrypt recommended)
3. Check user status (active/inactive/suspended)
4. Check if 2FA is enabled for user
5. Generate JWT token (if 2FA disabled) or temporary token (if 2FA enabled)

**Success Response (No 2FA):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-123",
      "name": "John Doe",
      "email": "admin@example.com",
      "role": "admin",
      "department": "IT Security"
    }
  },
  "message": "Login successful"
}
```

**Success Response (2FA Enabled):**
```json
{
  "success": true,
  "data": {
    "requires2FA": true,
    "tempToken": "temp-token-abc123",
    "user": {
      "email": "admin@example.com"
    }
  },
  "message": "2FA code sent to your device"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}
```

#### 4. Frontend Handles Response
**File:** `src/services/auth.js`

```javascript
export const login = async (email, password) => {
  try {
    const response = await authAPI.login(email, password);
    
    if (response.success) {
      // Check if 2FA required
      if (response.data.requires2FA) {
        // Store temp token and redirect to 2FA page
        sessionStorage.setItem('tempToken', response.data.tempToken);
        return { requires2FA: true };
      }
      
      // No 2FA - store token and user data
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('userRole', response.data.user.role);
      localStorage.setItem('userName', response.data.user.name);
      localStorage.setItem('userEmail', response.data.user.email);
      
      return { success: true, user: response.data.user };
    }
  } catch (error) {
    throw error;
  }
};
```

#### 5. Redirect Based on Role

```javascript
// In Login.jsx after successful login
const { user, requires2FA } = await authService.login(email, password);

if (requires2FA) {
  navigate('/2fa');
} else {
  // Redirect based on role
  if (user.role === 'admin') {
    navigate('/admin');
  } else if (user.role === 'staff') {
    navigate('/staff');
  }
}
```

---

## 🔢 Two-Factor Authentication

### Flow Diagram
```
Login Success → Check 2FA → Generate Code → Send to User → 
User Enters Code → Verify Code → Issue JWT → Store Token → Redirect
```

### Step 1: Backend Sends 2FA Code

**Backend Requirements:**
- Generate 6-digit OTP code
- Store code in database with expiration (5 minutes recommended)
- Send code via email/SMS/authenticator app
- Return temporary token for verification step

### Step 2: User Enters Code
**File:** `src/pages/auth/TwoFactor.jsx`

```javascript
const handleVerify = async (code) => {
  const tempToken = sessionStorage.getItem('tempToken');
  
  try {
    const response = await authService.verify2FA(code, tempToken);
    // Store actual JWT token
    localStorage.setItem('authToken', response.token);
    // Redirect to dashboard
    navigate(response.user.role === 'admin' ? '/admin' : '/staff');
  } catch (error) {
    showError('Invalid or expired code');
  }
};
```

### Step 3: Backend Verifies Code

**API Endpoint:** `POST /auth/2fa/verify`

**Request:**
```json
{
  "code": "123456",
  "tempToken": "temp-token-abc123"
}
```

**Backend Process:**
1. Validate temp token
2. Find stored 2FA code for user
3. Check if code matches
4. Check if code is not expired
5. Generate actual JWT token
6. Delete used 2FA code

**Success Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-123",
      "name": "John Doe",
      "email": "admin@example.com",
      "role": "admin"
    }
  }
}
```

---

## 🎫 Token Management

### JWT Token Structure (Backend)

**Recommended Payload:**
```json
{
  "userId": "user-123",
  "email": "admin@example.com",
  "role": "admin",
  "iat": 1706000000,
  "exp": 1706086400
}
```

**Recommended Settings:**
- Algorithm: HS256 or RS256
- Expiration: 24 hours
- Secret: Strong random string (environment variable)
- Include: userId, email, role
- Optional: permissions array

### Token Storage (Frontend)

**Current Implementation:**
```javascript
// Stored in localStorage for persistence across sessions
localStorage.setItem('authToken', token);
localStorage.setItem('userRole', role);
localStorage.setItem('userName', name);
localStorage.setItem('userEmail', email);
```

**Alternative: sessionStorage**
```javascript
// Use sessionStorage for auto-logout when browser closes
sessionStorage.setItem('authToken', token);
```

### Automatic Token Inclusion

**File:** `src/api/client.js`

```javascript
// Request Interceptor - Adds token to all requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```

### Token Validation

**Frontend Check:**
```javascript
// On app initialization
const token = localStorage.getItem('authToken');

if (token) {
  // Verify token is still valid
  try {
    await authAPI.verifyToken();
    // Token valid - user stays logged in
  } catch (error) {
    // Token invalid - clear storage and redirect to login
    localStorage.clear();
    navigate('/login');
  }
}
```

**Backend Endpoint:** `GET /auth/verify`

**Request:**
```
GET /auth/verify
Headers: {
  Authorization: Bearer eyJhbGci...
}
```

**Response:**
```json
{
  "valid": true,
  "user": {
    "id": "user-123",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

### Token Expiration Handling

**File:** `src/api/client.js`

```javascript
// Response Interceptor - Handles 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### Token Refresh (Backend TODO)

**Recommended Implementation:**

1. **Issue Two Tokens:**
   - Access Token (short-lived: 15-60 minutes)
   - Refresh Token (long-lived: 7-30 days)

2. **Refresh Endpoint:** `POST /auth/refresh`

**Request:**
```json
{
  "refreshToken": "refresh-token-xyz789"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "new-access-token",
    "refreshToken": "new-refresh-token"
  }
}
```

3. **Frontend Auto-Refresh:**
```javascript
// Check token expiration before each request
// If expired, refresh before making actual request
```

---

## 🛡 Protected Routes

### Route Protection Implementation

**File:** `src/App.jsx`

```javascript
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('authToken');
  const userRole = localStorage.getItem('userRole');
  
  // No token - redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  // Check role authorization
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
};
```

### Usage Example

```javascript
// Admin-only route
<Route
  path="/admin/*"
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminLayout />
    </ProtectedRoute>
  }
/>

// Staff and Admin route
<Route
  path="/staff/*"
  element={
    <ProtectedRoute allowedRoles={['staff', 'admin']}>
      <StaffLayout />
    </ProtectedRoute>
  }
/>
```

### Authorization Check on Backend

**Every Protected Endpoint Should:**
1. Verify JWT token signature
2. Check token expiration
3. Extract user role from token
4. Verify user has permission for requested action

**Example Middleware (Backend):**
```javascript
// Pseudocode
function requireRole(allowedRoles) {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'No token provided' }
      });
    }
    
    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      
      if (!allowedRoles.includes(decoded.role)) {
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Insufficient permissions' }
        });
      }
      
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: { code: 'TOKEN_EXPIRED', message: 'Invalid or expired token' }
      });
    }
  };
}

// Usage
app.get('/api/v1/users', requireRole(['admin']), getUsersController);
```

---

## 🚪 Logout Flow

### Frontend Logout Process

**File:** `src/services/auth.js`

```javascript
export const logout = async () => {
  try {
    // 1. Call backend logout endpoint (invalidate token)
    await authAPI.logout();
  } catch (error) {
    console.error('Logout API error:', error);
  } finally {
    // 2. Clear local storage regardless of API success
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    
    // 3. Redirect to login
    window.location.href = '/login';
  }
};
```

### Backend Logout Endpoint

**API:** `POST /auth/logout`

**Request:**
```
POST /auth/logout
Headers: {
  Authorization: Bearer eyJhbGci...
}
```

**Backend Process:**
1. Extract token from header
2. Add token to blacklist/revoked tokens list
3. Optional: Store with expiration matching token's exp claim
4. Return success response

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Token Blacklist Strategy (Backend)

**Option 1: In-Memory (Redis)**
```
Key: blacklist:token_hash
Value: 1
TTL: token's remaining lifetime
```

**Option 2: Database**
```sql
CREATE TABLE revoked_tokens (
  token_hash VARCHAR(255) PRIMARY KEY,
  revoked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP
);

-- Add index on expires_at for cleanup
CREATE INDEX idx_expires ON revoked_tokens(expires_at);
```

---

## 🔧 Backend Requirements

### 1. User Model/Table

**Required Fields:**
```javascript
{
  id: string (UUID),
  email: string (unique),
  passwordHash: string,
  name: string,
  role: enum('admin', 'staff'),
  department: string,
  status: enum('active', 'inactive', 'suspended'),
  twoFactorEnabled: boolean,
  twoFactorSecret: string (nullable),
  createdAt: timestamp,
  updatedAt: timestamp,
  lastLoginAt: timestamp
}
```

### 2. JWT Configuration

**Environment Variables:**
```env
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRES_IN=24h
JWT_ALGORITHM=HS256
```

### 3. Password Requirements

**Hashing:**
- Use bcrypt (recommended rounds: 10-12)
- Never store plain text passwords

**Validation Rules:**
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character

### 4. Rate Limiting

**Recommended Limits:**
- Login endpoint: 5 attempts per 15 minutes per IP
- 2FA verification: 3 attempts per 5 minutes per session
- Password reset: 3 requests per hour per email

### 5. Security Headers

**Required Headers:**
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
```

### 6. CORS Configuration

**Allow Frontend Origin:**
```javascript
// Development
Access-Control-Allow-Origin: http://localhost:5173

// Production
Access-Control-Allow-Origin: https://your-production-domain.com

// Required Headers
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
```

---

## 💻 Frontend Implementation

### Current Files Overview

**1. `src/api/auth.api.js`** - API call functions
```javascript
export const login = async (email, password) => {...}
export const verify2FA = async (code, tempToken) => {...}
export const logout = async () => {...}
export const verifyToken = async () => {...}
```

**2. `src/services/auth.js`** - Business logic
```javascript
export const login = async (email, password) => {...}
export const logout = async () => {...}
export const getCurrentUser = () => {...}
export const isAuthenticated = () => {...}
```

**3. `src/api/client.js`** - Axios configuration
```javascript
// Base URL from environment
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000
});

// Request interceptor - adds token
apiClient.interceptors.request.use(...);

// Response interceptor - handles 401
apiClient.interceptors.response.use(...);
```

### Integration Checklist for Frontend Dev

- [x] Auth API functions ready (`src/api/auth.api.js`)
- [x] Axios interceptors configured
- [x] Protected routes implemented
- [x] Login page functional
- [x] 2FA page ready
- [x] Logout functionality working
- [x] Role-based navigation
- [ ] Connect to real backend API
- [ ] Test all error scenarios
- [ ] Test token expiration handling

---

## 🔒 Security Best Practices

### Frontend Security

**1. Never Store Sensitive Data in localStorage**
```javascript
// ❌ Don't store password
localStorage.setItem('password', password);

// ✅ Only store token and non-sensitive user info
localStorage.setItem('authToken', token);
localStorage.setItem('userRole', role);
```

**2. Validate Input Client-Side**
```javascript
// Email validation
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Password strength
const isStrongPassword = (password) => {
  return password.length >= 8 &&
         /[A-Z]/.test(password) &&
         /[a-z]/.test(password) &&
         /[0-9]/.test(password) &&
         /[@$!%*?&]/.test(password);
};
```

**3. Clear Sensitive Data on Logout**
```javascript
// Clear all auth data
localStorage.clear();
sessionStorage.clear();
```

**4. HTTPS Only in Production**
```javascript
// Check protocol in production
if (import.meta.env.VITE_ENV === 'production' && location.protocol !== 'https:') {
  location.replace(`https:${location.href.substring(location.protocol.length)}`);
}
```

### Backend Security

**1. Use HTTPS Only**
- Force HTTPS in production
- Redirect HTTP to HTTPS

**2. Implement CSRF Protection**
- Use CSRF tokens for state-changing operations
- Validate Origin/Referer headers

**3. SQL Injection Prevention**
- Use parameterized queries
- ORM/query builder recommended

**4. XSS Prevention**
- Sanitize all user input
- Escape output
- Set Content-Security-Policy header

**5. Rate Limiting**
- Prevent brute force attacks
- Use Redis for distributed rate limiting

---

## 🐛 Troubleshooting

### Common Issues

#### 1. 401 Unauthorized on Every Request

**Symptoms:**
- User can login but immediately redirected to login again
- All API calls return 401

**Possible Causes:**
- Token not being sent in headers
- Token format incorrect
- Backend not reading Authorization header

**Solution:**
```javascript
// Check token is stored
console.log('Token:', localStorage.getItem('authToken'));

// Check request headers in Network tab
// Should see: Authorization: Bearer {token}

// Verify interceptor is working
apiClient.interceptors.request.use((config) => {
  console.log('Request headers:', config.headers);
  return config;
});
```

#### 2. CORS Errors

**Symptoms:**
- Network errors in browser console
- "Access-Control-Allow-Origin" errors

**Solution (Backend):**
```javascript
// Enable CORS for frontend origin
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

#### 3. Token Expired Immediately

**Symptoms:**
- Login successful but token expires right away

**Check:**
- Backend token expiration setting
- Server time vs client time synchronization
- JWT exp claim value

#### 4. Redirect Loop

**Symptoms:**
- Page keeps redirecting between login and dashboard

**Possible Causes:**
- Token validation failing
- Role check failing
- Protected route logic error

**Solution:**
```javascript
// Add debugging
console.log('Token exists:', !!localStorage.getItem('authToken'));
console.log('User role:', localStorage.getItem('userRole'));
console.log('Current path:', window.location.pathname);
```

#### 5. 2FA Code Not Working

**Symptoms:**
- User enters correct code but verification fails

**Check:**
- Code expiration time (should be 5 minutes)
- Server time synchronization
- Code generation algorithm consistency
- Temp token validity

---

## 📞 Support

### For Frontend Developers
- Check this document first
- Review [BACKEND_INTEGRATION_GUIDE.md](./BACKEND_INTEGRATION_GUIDE.md)
- Test with mock mode before connecting to backend
- Use browser DevTools Network tab to debug

### For Backend Developers
- Implement endpoints as documented
- Use consistent response format
- Test with Postman/cURL before frontend integration
- Provide detailed error messages for debugging

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Jan 22, 2026 | Initial authentication flow documentation |

---

**Document Status:** ✅ Complete and Ready for Implementation

This authentication flow is fully designed and frontend implementation is complete. Backend team should implement the documented endpoints and follow the response formats exactly as specified.
