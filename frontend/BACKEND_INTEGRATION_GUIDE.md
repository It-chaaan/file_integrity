# Backend Integration Testing Guide

**Date:** January 22, 2026  
**Status:** Production-Ready for Backend Integration  
**Current Readiness:** ⭐ 95% Complete → Target: 100% Production-Ready

---

## 📋 **PRE-INTEGRATION CHECKLIST**

### Frontend Readiness ✅
- [x] All hardcoded data removed
- [x] Mock services properly isolated
- [x] API layer fully configured
- [x] Authentication flow prepared
- [x] Rate limiting implemented
- [x] Form validation added
- [x] Production-safe code (no console.logs)
- [x] Environment configuration ready
- [x] Error handling comprehensive

### Backend Requirements ⚠️
- [ ] Django REST Framework API running
- [ ] CORS configured for frontend origin
- [ ] JWT authentication endpoints ready
- [ ] All CRUD endpoints implemented
- [ ] Response format matches frontend expectations
- [ ] Database migrations applied
- [ ] Test data seeded (optional)

---

## 🚀 **PHASE 1: Environment Configuration**

### 1.1 Update .env File

The `.env` file has been configured with:
```bash
VITE_USE_MOCK_API=false  # ✅ Real API mode
VITE_API_BASE_URL=http://localhost:8000/api/v1  # ⚠️ Update if different
```

**Action Required:**
1. Open `.env` file
2. Verify `VITE_API_BASE_URL` matches your backend URL
3. For production, update to your production API URL

### 1.2 Verify Environment Variables

Run this command to check loaded variables:

```bash
# In frontend directory
npm run dev
```

Open browser console and check:
```javascript
console.log('API Base:', import.meta.env.VITE_API_BASE_URL);
console.log('Mock Mode:', import.meta.env.VITE_USE_MOCK_API);
```

Expected output:
```
API Base: http://localhost:8000/api/v1
Mock Mode: false
```

---

## 🔌 **PHASE 2: Backend Connectivity Testing**

### 2.1 Start Backend Server

Ensure your Django backend is running:

```bash
# In backend directory
python manage.py runserver
# Should see: Starting development server at http://127.0.0.1:8000/
```

### 2.2 Test Backend Health

Open a new terminal and test connectivity:

```bash
# Test 1: Check API is reachable
curl http://localhost:8000/api/v1/

# Test 2: Check CORS headers
curl -H "Origin: http://localhost:5173" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type, Authorization" \
     -X OPTIONS \
     -v \
     http://localhost:8000/api/v1/auth/login/
```

**Expected:** No connection errors, CORS headers present in response

---

## 🔐 **PHASE 3: Authentication Flow Testing**

### 3.1 Login with Valid Credentials

**Steps:**
1. Open frontend: `http://localhost:5173/login`
2. Complete reCAPTCHA verification
3. Enter valid credentials:
   - Username: `admin` (or your test username)
   - Password: `admin123` (or your test password)
4. Click "SIGN IN"

**Expected Behavior:**
- Loading spinner appears
- Request sent to: `POST /api/v1/auth/login/`
- Success response with tokens
- Redirect to 2FA page: `/two-factor`
- Token stored in localStorage

**Verify in Browser DevTools:**
```javascript
// Check Application → Local Storage
localStorage.getItem('parity_auth_token')     // Should have JWT token
localStorage.getItem('parity_refresh_token')  // Should have refresh token
```

### 3.2 Two-Factor Authentication

**Steps:**
1. Enter 6-digit 2FA code
2. Click "Verify"

**Expected Behavior:**
- Request sent to: `POST /api/v1/auth/2fa/verify/`
- Success response
- Redirect to appropriate dashboard:
  - Admin → `/admin/dashboard`
  - Staff → `/staff/dashboard`

### 3.3 Login with Invalid Credentials

**Test Case 1: Wrong Password**
1. Enter valid username
2. Enter wrong password
3. Submit form

**Expected:**
- Error message: "Invalid credentials..."
- Failed attempts counter increments
- No redirect

**Test Case 2: Non-existent User**
1. Enter non-existent username
2. Submit form

**Expected:**
- Generic error message (don't expose "user not found")
- Failed attempts counter increments

### 3.4 Protected Routes Testing

**Test:**
1. Without logging in, navigate to: `http://localhost:5173/admin/dashboard`

**Expected:**
- Automatic redirect to `/login`
- No flash of admin content

---

## 🛡️ **PHASE 4: Rate Limiting Verification**

### 4.1 Trigger Rate Limit

**Steps:**
1. Open login page
2. Enter invalid credentials
3. Submit 5 times in succession

**Expected Behavior:**

**Attempt 1-2:**
```
Error: "Invalid credentials. Please check your username and password."
```

**Attempt 3-4:**
```
Error: "Invalid credentials. X attempts remaining before temporary lockout."
```

**Attempt 5:**
```
Error: "Account temporarily locked due to too many failed attempts. 
Please try again in 15 minutes."
```

- Submit button shows: "🔒 LOCKED (900s)"
- Button is disabled
- Countdown timer updates every second

### 4.2 Verify Persistence

**Steps:**
1. After triggering lockout
2. Refresh the page (F5)

**Expected:**
- Lockout state persists
- Countdown continues from correct remaining time
- Button still disabled

### 4.3 Verify Expiration

**Steps:**
1. Wait 15 minutes (or modify localStorage for testing)
2. Try to login

**Expected:**
- Lockout cleared
- Login attempts reset to 0
- Can attempt login again

**Quick Test (Manual):**
```javascript
// In browser console, simulate expired lockout:
localStorage.setItem('login_attempts', JSON.stringify({
  attempts: 5,
  lockoutTime: Date.now() - 1000 // Already expired
}));
// Refresh page - lockout should clear
```

---

## 📊 **PHASE 5: Data Fetching Validation**

### 5.1 Dashboard Data Loading

**After successful login:**
1. Navigate to Dashboard
2. Open Network tab in DevTools

**Expected Requests:**
```
GET /api/v1/documents/    → Status 200
GET /api/v1/users/        → Status 200
GET /api/v1/tickets/      → Status 200
GET /api/v1/logs/         → Status 200
```

**Verify:**
- All requests include `Authorization: Bearer <token>` header
- Data displays in dashboard cards
- Loading states appear briefly
- No errors in console

### 5.2 User Data Display

**Check Layout:**
1. Observe Topbar user name
2. Observe Sidebar user initials

**Expected:**
- Real user data from backend (not "James Alba" or "Martin Luspo")
- User name from authenticated session
- Correct role badge (Admin/Staff)

**Verify in React DevTools:**
```javascript
// getCurrentUser() should return real user object
```

### 5.3 Documents List

**Navigate to Registry:**
1. Click "Registry" in sidebar
2. Wait for data to load

**Expected:**
- Documents fetched from `GET /api/v1/documents/`
- Table populated with real data
- Sorting/filtering works
- Pagination controls visible

---

## 📤 **PHASE 6: Document Upload Testing**

### 6.1 Upload a Document

**Steps:**
1. Navigate to Upload page
2. Select a PDF file (< 5MB)
3. Fill in title, type, department
4. Click "Upload Document"

**Expected Network Activity:**
```
POST /api/v1/documents/
Content-Type: multipart/form-data
Authorization: Bearer <token>

Response:
{
  "data": {
    "id": "DOC-2026-001234",
    "title": "...",
    "hash": "...",
    "status": "pending"
  }
}
```

**Expected UI:**
- Progress bar shows 0% → 100%
- Success message displays
- Document appears in Registry

### 6.2 Upload Validation

**Test Invalid File:**
1. Try uploading a .exe file

**Expected:**
- Error: "Invalid file type. Allowed: PDF, DOC, DOCX, TXT."
- No API request sent

**Test Oversized File:**
1. Try uploading a 10MB file

**Expected:**
- Error: "File size exceeds 5MB limit."
- No API request sent

---

## 🔄 **PHASE 7: Token Refresh Testing**

### 7.1 Simulate Expired Token

**Manual Test:**
```javascript
// In browser console:
localStorage.setItem('parity_auth_token', 'expired_or_invalid_token');
```

**Then:**
1. Navigate to any protected page
2. Make any API request (e.g., view documents)

**Expected:**
- Frontend receives 401 Unauthorized
- Token refresh automatically triggered
- Request to `POST /api/v1/auth/refresh/` with refresh token
- New access token received
- Original request retried with new token
- User stays logged in

### 7.2 Expired Refresh Token

**Test:**
```javascript
// Set both tokens as expired
localStorage.setItem('parity_auth_token', 'invalid');
localStorage.setItem('parity_refresh_token', 'invalid');
```

**Expected:**
- Token refresh fails
- User automatically redirected to `/login`
- Tokens cleared from localStorage
- No infinite redirect loop

---

## 🚨 **PHASE 8: Error Handling Verification**

### 8.1 Network Errors

**Simulate:**
1. Stop backend server
2. Try to login

**Expected:**
- Error toast: "Network error. Please check your internet connection."
- No white screen of death
- Error logged (if VITE_DEBUG=true)

### 8.2 Server Errors (500)

**Test:** (Backend must support this)
1. Trigger a 500 error from backend
2. Observe frontend response

**Expected:**
- Error toast with user-friendly message
- Error details logged to console (dev mode)
- Application remains functional

### 8.3 Validation Errors (400)

**Test:**
1. Submit form with invalid data that passes frontend validation
2. Backend returns 400 with field errors

**Expected Response Format:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": {
      "email": ["Enter a valid email address"],
      "password": ["Password too short"]
    }
  }
}
```

**Expected UI:**
- Field-specific errors displayed
- Form not cleared
- User can fix and resubmit

---

## ✅ **PHASE 9: Production Readiness**

### 9.1 Update .env for Production

Create `.env.production`:

```bash
VITE_USE_MOCK_API=false
VITE_API_BASE_URL=https://api.yourcompany.com/api/v1
VITE_ENV=production
VITE_DEBUG=false
VITE_HTTPS_ONLY=true
VITE_ENABLE_CSP=true
```

### 9.2 Build Production Bundle

```bash
npm run build
```

**Verify:**
- No TypeScript errors
- No ESLint warnings
- Build completes successfully
- `dist/` folder created

### 9.3 Preview Production Build

```bash
npm run preview
```

**Test in Preview:**
- All functionality works
- API calls successful
- No console errors
- Assets load correctly

---

## 🔍 **FINAL VALIDATION CHECKLIST**

### Authentication ✅
- [ ] Login with valid credentials works
- [ ] Login with invalid credentials shows error
- [ ] Rate limiting triggers after 5 attempts
- [ ] Lockout persists across refresh
- [ ] Token refresh works automatically
- [ ] Logout clears tokens and redirects
- [ ] 2FA flow completes successfully

### Data Operations ✅
- [ ] Documents list loads from API
- [ ] Users list loads from API
- [ ] Tickets list loads from API
- [ ] Audit logs load from API
- [ ] Document upload works
- [ ] User CRUD operations work
- [ ] Ticket CRUD operations work

### Security ✅
- [ ] Protected routes enforce authentication
- [ ] Role-based access control works
- [ ] No sensitive data in error messages
- [ ] CORS configured correctly
- [ ] Tokens stored securely
- [ ] No XSS vulnerabilities
- [ ] No CSRF vulnerabilities

### User Experience ✅
- [ ] Loading states display properly
- [ ] Error messages are clear
- [ ] Success toasts appear
- [ ] Forms validate correctly
- [ ] Navigation works smoothly
- [ ] Mobile responsive
- [ ] No UI glitches

### Performance ✅
- [ ] Initial load < 3 seconds
- [ ] API responses < 2 seconds
- [ ] No memory leaks
- [ ] Smooth transitions
- [ ] Optimized bundle size

---

## 🐛 **TROUBLESHOOTING GUIDE**

### Issue: "Network error"

**Causes:**
1. Backend not running
2. Wrong API URL in .env
3. CORS not configured

**Solutions:**
```bash
# Check backend is running
curl http://localhost:8000/api/v1/

# Check .env file
cat .env | grep VITE_API_BASE_URL

# Check CORS headers
# Add to Django settings.py:
CORS_ALLOWED_ORIGINS = ['http://localhost:5173']
```

### Issue: "401 Unauthorized" loop

**Causes:**
1. Token format mismatch
2. Backend not recognizing token
3. Token expired and refresh failed

**Solutions:**
```javascript
// Clear tokens and try fresh login
localStorage.clear();
// Then login again
```

### Issue: User data not displaying

**Causes:**
1. getCurrentUser() returning null
2. Token not being sent
3. Backend response format mismatch

**Solutions:**
```javascript
// Check token exists
console.log(localStorage.getItem('parity_auth_token'));

// Check API response format
// Should return: { data: { user: {...} } }
```

### Issue: Rate limiting not working

**Causes:**
1. localStorage disabled
2. Browser in incognito mode

**Solutions:**
```javascript
// Test localStorage
try {
  localStorage.setItem('test', '1');
  localStorage.removeItem('test');
  console.log('localStorage working');
} catch(e) {
  console.error('localStorage blocked');
}
```

---

## 📞 **BACKEND INTEGRATION REQUIREMENTS**

### Required Endpoints

Your Django backend must implement:

```python
# Authentication
POST   /api/v1/auth/login/          # Returns: access, refresh, user
POST   /api/v1/auth/logout/         # Invalidates tokens
POST   /api/v1/auth/refresh/        # Returns: access
POST   /api/v1/auth/2fa/verify/     # Validates 2FA code
POST   /api/v1/auth/register/       # Creates new user
POST   /api/v1/auth/password/change/ # Changes password

# Documents
GET    /api/v1/documents/           # List with pagination
POST   /api/v1/documents/           # Upload document
GET    /api/v1/documents/{id}/      # Get details
PUT    /api/v1/documents/{id}/      # Update
DELETE /api/v1/documents/{id}/      # Delete
POST   /api/v1/documents/{id}/verify/ # Verify integrity

# Users
GET    /api/v1/users/               # List users
POST   /api/v1/users/               # Create user
GET    /api/v1/users/{id}/          # Get user
PUT    /api/v1/users/{id}/          # Update user
DELETE /api/v1/users/{id}/          # Delete user

# Tickets
GET    /api/v1/tickets/             # List tickets
POST   /api/v1/tickets/             # Create ticket
GET    /api/v1/tickets/{id}/        # Get ticket
PUT    /api/v1/tickets/{id}/        # Update ticket
DELETE /api/v1/tickets/{id}/        # Delete ticket

# Audit Logs
GET    /api/v1/logs/                # List logs
GET    /api/v1/logs/export/         # Export logs
```

### Response Format

**Success (2xx):**
```json
{
  "data": {
    "id": 1,
    "name": "Example"
  },
  "message": "Operation successful"
}
```

**Error (4xx, 5xx):**
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {}
  }
}
```

### CORS Configuration

Django settings.py:
```python
INSTALLED_APPS = [
    'corsheaders',
    # ...
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    # ...
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Development
    "https://yourfrontend.com",  # Production
]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = [
    'accept',
    'authorization',
    'content-type',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]
```

---

## ✨ **COMPLETION CRITERIA**

Frontend is **100% Production-Ready** when:

- ✅ All authentication flows work without errors
- ✅ All CRUD operations complete successfully
- ✅ Rate limiting enforces correctly
- ✅ Token refresh works automatically
- ✅ Protected routes enforce access control
- ✅ Real user data displays correctly
- ✅ No console errors in production build
- ✅ All network requests succeed
- ✅ Error handling graceful and informative
- ✅ Performance metrics met

---

## 📊 **SUCCESS METRICS**

| Metric | Target | How to Verify |
|--------|--------|---------------|
| Login Success Rate | 100% | Test valid credentials |
| API Response Time | < 2s | Network tab timing |
| Token Refresh Success | 100% | Simulate expired token |
| Rate Limit Enforcement | 100% | Test 5 failed attempts |
| Error Recovery | 100% | Test network errors |
| Protected Route Security | 100% | Access without auth |
| Data Load Success | 100% | All pages load data |

---

**Next Steps After Validation:**
1. ✅ Mark any remaining issues
2. 🔧 Apply fixes if needed
3. ✅ Re-test affected areas
4. 🚀 Deploy to staging
5. ✅ Final production testing
6. 🎉 Go live!

---

**For Support:**
- Review: [AUTHENTICATION_FLOW.md](AUTHENTICATION_FLOW.md)
- Review: [ERROR_HANDLING_GUIDE.md](ERROR_HANDLING_GUIDE.md)
- Check: API client configuration in `src/api/client.js`
- Check: Adapter logic in `src/api/adapter.js`
