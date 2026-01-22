# Error Handling & Validation Guide
## File Integrity Verification System

**Version:** 1.0.0  
**Last Updated:** January 22, 2026  
**Status:** Standardization Guide for Backend Integration

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Error Response Format](#error-response-format)
3. [HTTP Status Codes](#http-status-codes)
4. [Error Code Standards](#error-code-standards)
5. [Validation Rules](#validation-rules)
6. [Frontend Error Handling](#frontend-error-handling)
7. [Backend Error Handling](#backend-error-handling)
8. [User-Friendly Messages](#user-friendly-messages)
9. [Logging & Monitoring](#logging--monitoring)
10. [Testing Error Scenarios](#testing-error-scenarios)

---

## 🎯 Overview

Consistent error handling across frontend and backend is critical for:
- **User Experience** - Clear, actionable error messages
- **Debugging** - Standardized error codes for troubleshooting
- **Security** - Avoid exposing sensitive system information
- **Monitoring** - Track error patterns and system health

### Key Principles

✅ **Consistency** - Same format for all errors  
✅ **Clarity** - User-friendly messages  
✅ **Security** - No sensitive data exposure  
✅ **Actionability** - Tell users what to do next  
✅ **Loggability** - Include enough context for debugging  

---

## 📦 Error Response Format

### Standard Success Response

```json
{
  "success": true,
  "data": {
    // Response data here
  },
  "message": "Operation completed successfully"
}
```

### Standard Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "User-friendly error message",
    "details": {
      // Optional: Additional context
      "field": "email",
      "constraint": "Must be unique"
    }
  },
  "timestamp": "2026-01-22T10:30:00Z"
}
```

### Validation Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "errors": [
        {
          "field": "email",
          "message": "Invalid email format",
          "value": "invalid-email"
        },
        {
          "field": "password",
          "message": "Password must be at least 8 characters",
          "value": null
        }
      ]
    }
  }
}
```

### Examples by Scenario

#### 1. Authentication Error
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password",
    "details": null
  }
}
```

#### 2. Authorization Error
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You don't have permission to access this resource",
    "details": {
      "required_role": "admin",
      "user_role": "staff"
    }
  }
}
```

#### 3. Resource Not Found
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Document not found",
    "details": {
      "resource": "document",
      "id": "doc-123"
    }
  }
}
```

#### 4. File Upload Error
```json
{
  "success": false,
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "File size exceeds maximum allowed size of 10MB",
    "details": {
      "file_size": 15728640,
      "max_size": 10485760,
      "file_name": "large-document.pdf"
    }
  }
}
```

#### 5. Server Error
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred. Please try again later.",
    "details": null
  }
}
```

---

## 🔢 HTTP Status Codes

### Success Codes (2xx)

| Code | Name | Usage |
|------|------|-------|
| 200 | OK | Successful GET, PUT, PATCH requests |
| 201 | Created | Successful POST (resource created) |
| 204 | No Content | Successful DELETE (no response body) |

### Client Error Codes (4xx)

| Code | Name | Usage | Example |
|------|------|-------|---------|
| 400 | Bad Request | Invalid request format, validation errors | Malformed JSON |
| 401 | Unauthorized | Missing or invalid authentication token | No token provided |
| 403 | Forbidden | Valid token but insufficient permissions | Staff trying to access admin endpoint |
| 404 | Not Found | Resource doesn't exist | Document ID not found |
| 409 | Conflict | Resource already exists | Email already registered |
| 422 | Unprocessable Entity | Validation failed on valid JSON | Invalid email format |
| 429 | Too Many Requests | Rate limit exceeded | Too many login attempts |

### Server Error Codes (5xx)

| Code | Name | Usage | Example |
|------|------|-------|---------|
| 500 | Internal Server Error | Unexpected server error | Unhandled exception |
| 502 | Bad Gateway | Upstream service error | Database connection failed |
| 503 | Service Unavailable | Service temporarily down | Maintenance mode |

---

## 🏷 Error Code Standards

### Naming Convention

```
CATEGORY_SPECIFIC_REASON
```

Examples:
- `AUTH_INVALID_CREDENTIALS`
- `VALIDATION_MISSING_FIELD`
- `FILE_TOO_LARGE`

### Standard Error Codes

#### Authentication Errors (AUTH_*)

```javascript
export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',    // Wrong email/password
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',              // Too many failed attempts
  ACCOUNT_INACTIVE: 'ACCOUNT_INACTIVE',          // User account disabled
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',                // JWT expired
  TOKEN_INVALID: 'TOKEN_INVALID',                // JWT signature invalid
  UNAUTHORIZED: 'UNAUTHORIZED',                  // No token provided
  TWO_FACTOR_REQUIRED: 'TWO_FACTOR_REQUIRED',    // 2FA code needed
  TWO_FACTOR_INVALID: 'TWO_FACTOR_INVALID',      // Wrong 2FA code
};
```

**HTTP Status:** 401 Unauthorized

#### Authorization Errors (FORBIDDEN_*)

```javascript
export const AUTHORIZATION_ERRORS = {
  FORBIDDEN: 'FORBIDDEN',                        // No permission
  INSUFFICIENT_ROLE: 'INSUFFICIENT_ROLE',        // Role not high enough
  RESOURCE_FORBIDDEN: 'RESOURCE_FORBIDDEN',      // Can't access specific resource
};
```

**HTTP Status:** 403 Forbidden

#### Validation Errors (VALIDATION_*)

```javascript
export const VALIDATION_ERRORS = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',          // General validation failure
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD', // Required field empty
  INVALID_FORMAT: 'INVALID_FORMAT',              // Wrong format (email, date, etc.)
  INVALID_LENGTH: 'INVALID_LENGTH',              // String too short/long
  INVALID_VALUE: 'INVALID_VALUE',                // Value not in allowed set
  INVALID_TYPE: 'INVALID_TYPE',                  // Wrong data type
};
```

**HTTP Status:** 422 Unprocessable Entity

#### File Upload Errors (FILE_*)

```javascript
export const FILE_ERRORS = {
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',             // Exceeds size limit
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',       // Wrong file extension/MIME
  FILE_UPLOAD_FAILED: 'FILE_UPLOAD_FAILED',     // Upload process error
  FILE_CORRUPT: 'FILE_CORRUPT',                 // File damaged/unreadable
};
```

**HTTP Status:** 400 Bad Request

#### Resource Errors (RESOURCE_*)

```javascript
export const RESOURCE_ERRORS = {
  NOT_FOUND: 'NOT_FOUND',                       // Resource doesn't exist
  ALREADY_EXISTS: 'ALREADY_EXISTS',             // Duplicate resource
  OPERATION_FAILED: 'OPERATION_FAILED',         // Operation couldn't complete
  DEPENDENCY_EXISTS: 'DEPENDENCY_EXISTS',       // Can't delete (has dependencies)
};
```

**HTTP Status:** 404 Not Found, 409 Conflict

#### Rate Limit Errors (RATE_*)

```javascript
export const RATE_LIMIT_ERRORS = {
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',   // Too many requests
  LOGIN_ATTEMPTS_EXCEEDED: 'LOGIN_ATTEMPTS_EXCEEDED', // Too many failed logins
};
```

**HTTP Status:** 429 Too Many Requests

#### Server Errors (SERVER_*)

```javascript
export const SERVER_ERRORS = {
  INTERNAL_ERROR: 'INTERNAL_ERROR',             // Unexpected error
  DATABASE_ERROR: 'DATABASE_ERROR',             // DB connection/query failed
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',   // Service down
};
```

**HTTP Status:** 500 Internal Server Error, 503 Service Unavailable

---

## ✅ Validation Rules

### User Validation

#### Email
```javascript
{
  field: 'email',
  rules: {
    required: true,
    format: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    maxLength: 255
  },
  messages: {
    required: 'Email is required',
    format: 'Please enter a valid email address',
    maxLength: 'Email must not exceed 255 characters'
  }
}
```

#### Password
```javascript
{
  field: 'password',
  rules: {
    required: true,
    minLength: 8,
    maxLength: 128,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
  },
  messages: {
    required: 'Password is required',
    minLength: 'Password must be at least 8 characters',
    pattern: 'Password must include uppercase, lowercase, number, and special character'
  }
}
```

#### Name
```javascript
{
  field: 'name',
  rules: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z\s'-]+$/
  },
  messages: {
    required: 'Name is required',
    minLength: 'Name must be at least 2 characters',
    maxLength: 'Name must not exceed 100 characters',
    pattern: 'Name can only contain letters, spaces, hyphens, and apostrophes'
  }
}
```

### File Upload Validation

#### File Size
```javascript
{
  field: 'file',
  rules: {
    required: true,
    maxSize: 10485760, // 10MB in bytes
  },
  messages: {
    required: 'Please select a file',
    maxSize: 'File size must not exceed 10MB'
  }
}
```

#### File Type
```javascript
{
  field: 'file',
  rules: {
    allowedTypes: ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.png'],
    mimeTypes: ['application/pdf', 'application/msword', 'image/jpeg', 'image/png']
  },
  messages: {
    allowedTypes: 'Only PDF, DOC, DOCX, TXT, JPG, and PNG files are allowed'
  }
}
```

### Document Validation

#### Document Type
```javascript
{
  field: 'documentType',
  rules: {
    required: true,
    enum: ['contract', 'invoice', 'report', 'other']
  },
  messages: {
    required: 'Document type is required',
    enum: 'Invalid document type'
  }
}
```

### Ticket Validation

#### Priority
```javascript
{
  field: 'priority',
  rules: {
    required: true,
    enum: ['low', 'medium', 'high', 'critical']
  },
  messages: {
    required: 'Priority is required',
    enum: 'Invalid priority level'
  }
}
```

#### Title
```javascript
{
  field: 'title',
  rules: {
    required: true,
    minLength: 5,
    maxLength: 200
  },
  messages: {
    required: 'Title is required',
    minLength: 'Title must be at least 5 characters',
    maxLength: 'Title must not exceed 200 characters'
  }
}
```

### Security Key Validation

#### Algorithm
```javascript
{
  field: 'algorithm',
  rules: {
    required: true,
    enum: ['SHA-256', 'SHA-512', 'RSA-2048', 'RSA-4096']
  },
  messages: {
    required: 'Algorithm is required',
    enum: 'Invalid algorithm type'
  }
}
```

---

## 🖥 Frontend Error Handling

### Error Handling Pattern

**File:** `src/utils/errorHandler.js`

```javascript
/**
 * Handle API errors consistently
 * @param {Error} error - Axios error object
 * @param {Function} showToast - Toast notification function
 * @returns {Object} Formatted error object
 */
export const handleApiError = (error, showToast) => {
  if (error.response) {
    // Server responded with error status
    const { code, message, details } = error.response.data.error;
    
    // Show user-friendly message
    showToast(message, 'error');
    
    // Return structured error for further handling
    return {
      code,
      message,
      details,
      status: error.response.status
    };
  } else if (error.request) {
    // Request made but no response
    const message = 'Network error. Please check your connection and try again.';
    showToast(message, 'error');
    
    return {
      code: 'NETWORK_ERROR',
      message,
      details: null,
      status: null
    };
  } else {
    // Something else happened
    const message = 'An unexpected error occurred. Please try again.';
    showToast(message, 'error');
    
    return {
      code: 'UNKNOWN_ERROR',
      message,
      details: error.message,
      status: null
    };
  }
};
```

### Usage in Components

```javascript
import { handleApiError } from '../utils/errorHandler';

const MyComponent = () => {
  const [error, setError] = useState(null);
  
  const handleSubmit = async (data) => {
    try {
      const response = await api.createResource(data);
      showToast('Success!', 'success');
    } catch (error) {
      const errorObj = handleApiError(error, showToast);
      setError(errorObj);
      
      // Handle specific error codes
      if (errorObj.code === 'ALREADY_EXISTS') {
        // Do something specific
      }
    }
  };
};
```

### Custom Hook for API Calls

**File:** `src/hooks/useApiWithToast.js`

```javascript
import { useState } from 'react';
import { handleApiError } from '../utils/errorHandler';

export const useApiWithToast = (apiFunction, showToast) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  
  const execute = async (...args) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiFunction(...args);
      setData(response.data);
      return response.data;
    } catch (err) {
      const errorObj = handleApiError(err, showToast);
      setError(errorObj);
      throw errorObj;
    } finally {
      setLoading(false);
    }
  };
  
  return { execute, loading, error, data };
};
```

### Form Validation (Client-Side)

**File:** `src/utils/validation.js`

```javascript
/**
 * Validate email format
 */
export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'Email is required';
  if (!regex.test(email)) return 'Invalid email format';
  return null;
};

/**
 * Validate password strength
 */
export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Password must include uppercase letter';
  if (!/[a-z]/.test(password)) return 'Password must include lowercase letter';
  if (!/[0-9]/.test(password)) return 'Password must include number';
  if (!/[@$!%*?&]/.test(password)) return 'Password must include special character';
  return null;
};

/**
 * Validate file upload
 */
export const validateFile = (file, maxSize = 10485760, allowedTypes = ['.pdf', '.doc']) => {
  if (!file) return 'File is required';
  
  if (file.size > maxSize) {
    return `File size exceeds ${(maxSize / 1048576).toFixed(0)}MB limit`;
  }
  
  const extension = '.' + file.name.split('.').pop().toLowerCase();
  if (!allowedTypes.includes(extension)) {
    return `File type not allowed. Allowed: ${allowedTypes.join(', ')}`;
  }
  
  return null;
};

/**
 * Validate form data
 */
export const validateForm = (data, rules) => {
  const errors = {};
  
  for (const [field, value] of Object.entries(data)) {
    const rule = rules[field];
    if (!rule) continue;
    
    // Required check
    if (rule.required && !value) {
      errors[field] = `${field} is required`;
      continue;
    }
    
    // Custom validator
    if (rule.validator) {
      const error = rule.validator(value);
      if (error) errors[field] = error;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
```

---

## ⚙️ Backend Error Handling

### Error Handling Middleware (Express Example)

```javascript
/**
 * Custom error class
 */
class AppError extends Error {
  constructor(code, message, statusCode = 500, details = null) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true; // Distinguish from programming errors
  }
}

/**
 * Error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  // Default to 500 server error
  let { statusCode = 500, code = 'INTERNAL_ERROR', message, details } = err;
  
  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production' && !err.isOperational) {
    message = 'An unexpected error occurred';
    details = null;
  }
  
  // Log error for debugging
  console.error('Error:', {
    code,
    message,
    stack: err.stack,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    userId: req.user?.id
  });
  
  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details
    },
    timestamp: new Date().toISOString()
  });
};

/**
 * Async error wrapper
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = { AppError, errorHandler, asyncHandler };
```

### Usage in Controllers

```javascript
const { AppError, asyncHandler } = require('../middleware/errorHandler');

/**
 * Example: Create user
 */
const createUser = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;
  
  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError(
      'ALREADY_EXISTS',
      'User with this email already exists',
      409,
      { field: 'email' }
    );
  }
  
  // Create user
  const user = await User.create({ email, password, name });
  
  res.status(201).json({
    success: true,
    data: { user },
    message: 'User created successfully'
  });
});
```

### Validation Middleware

```javascript
const { validationResult } = require('express-validator');

/**
 * Validate request
 */
const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));
    
    // Check for errors
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    
    // Format validation errors
    const formattedErrors = errors.array().map(err => ({
      field: err.param,
      message: err.msg,
      value: err.value
    }));
    
    // Return validation error
    return res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: { errors: formattedErrors }
      }
    });
  };
};
```

### Example Validation Rules

```javascript
const { body } = require('express-validator');

const userValidationRules = () => {
  return [
    body('email')
      .isEmail().withMessage('Invalid email format')
      .normalizeEmail(),
    
    body('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
      .withMessage('Password must include uppercase, lowercase, number, and special character'),
    
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters')
      .matches(/^[a-zA-Z\s'-]+$/)
      .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes')
  ];
};

// Usage
router.post('/users', validate(userValidationRules()), createUser);
```

---

## 💬 User-Friendly Messages

### Message Guidelines

**DO:**
- Use simple, clear language
- Be specific about what went wrong
- Suggest next steps
- Use consistent tone

**DON'T:**
- Expose technical details
- Use jargon or error codes in message
- Be vague ("Something went wrong")
- Blame the user

### Message Examples

#### Bad Examples ❌
```
"Error 500"
"NULL POINTER EXCEPTION"
"Database query failed: SELECT * FROM..."
"You did something wrong"
```

#### Good Examples ✅
```
"We couldn't process your request. Please try again in a few moments."
"Please enter a valid email address (e.g., user@example.com)"
"This file is too large. Maximum size is 10MB."
"Your session has expired. Please log in again."
```

### Error Message Templates

```javascript
export const ERROR_MESSAGES = {
  // Authentication
  INVALID_CREDENTIALS: 'Invalid email or password. Please try again.',
  ACCOUNT_LOCKED: 'Your account has been locked due to multiple failed login attempts. Please contact support.',
  TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
  
  // Validation
  REQUIRED_FIELD: (field) => `${field} is required`,
  INVALID_EMAIL: 'Please enter a valid email address',
  WEAK_PASSWORD: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character',
  
  // Files
  FILE_TOO_LARGE: (maxSize) => `File size exceeds maximum allowed size of ${maxSize}MB`,
  INVALID_FILE_TYPE: (allowedTypes) => `Only ${allowedTypes.join(', ')} files are allowed`,
  
  // Resources
  NOT_FOUND: (resource) => `${resource} not found`,
  ALREADY_EXISTS: (resource) => `${resource} already exists`,
  
  // Operations
  OPERATION_FAILED: 'The operation could not be completed. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  
  // Server
  INTERNAL_ERROR: 'An unexpected error occurred. Please try again later.',
  SERVICE_UNAVAILABLE: 'The service is temporarily unavailable. Please try again later.',
};
```

---

## 📊 Logging & Monitoring

### What to Log

**DO Log:**
- Error code and message
- Request path and method
- User ID (if authenticated)
- Timestamp
- Stack trace (in development)
- Request body (excluding sensitive data)

**DON'T Log:**
- Passwords
- Tokens
- Credit card numbers
- Personal identifiable information (PII)

### Log Levels

```javascript
const LOG_LEVELS = {
  ERROR: 'error',    // Errors that need immediate attention
  WARN: 'warn',      // Warning conditions
  INFO: 'info',      // Informational messages
  DEBUG: 'debug',    // Debug-level messages
};
```

### Example Logging

```javascript
logger.error('Authentication failed', {
  code: 'INVALID_CREDENTIALS',
  path: '/api/v1/auth/login',
  method: 'POST',
  ip: req.ip,
  timestamp: new Date().toISOString(),
  // DO NOT log: password
});

logger.info('Document uploaded', {
  userId: req.user.id,
  documentId: document.id,
  fileName: document.name,
  fileSize: document.size,
  timestamp: new Date().toISOString()
});
```

### Error Monitoring Tools

**Recommended:**
- **Sentry** - Real-time error tracking
- **LogRocket** - Session replay for debugging
- **Datadog** - Application performance monitoring
- **ELK Stack** - Log aggregation and analysis

---

## 🧪 Testing Error Scenarios

### Test Cases

#### 1. Authentication Errors
```javascript
// Test invalid credentials
test('Login with invalid credentials returns 401', async () => {
  const response = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'wrong@example.com', password: 'wrongpass' })
    .expect(401);
  
  expect(response.body.success).toBe(false);
  expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
});

// Test expired token
test('Request with expired token returns 401', async () => {
  const expiredToken = generateExpiredToken();
  
  const response = await request(app)
    .get('/api/v1/users')
    .set('Authorization', `Bearer ${expiredToken}`)
    .expect(401);
  
  expect(response.body.error.code).toBe('TOKEN_EXPIRED');
});
```

#### 2. Validation Errors
```javascript
// Test missing required field
test('Create user without email returns 422', async () => {
  const response = await request(app)
    .post('/api/v1/users')
    .send({ password: 'password123', name: 'John' })
    .expect(422);
  
  expect(response.body.error.code).toBe('VALIDATION_ERROR');
  expect(response.body.error.details.errors).toContainEqual(
    expect.objectContaining({ field: 'email' })
  );
});
```

#### 3. Resource Errors
```javascript
// Test not found
test('Get non-existent document returns 404', async () => {
  const response = await request(app)
    .get('/api/v1/documents/non-existent-id')
    .set('Authorization', `Bearer ${validToken}`)
    .expect(404);
  
  expect(response.body.error.code).toBe('NOT_FOUND');
});
```

#### 4. File Upload Errors
```javascript
// Test file too large
test('Upload file larger than 10MB returns 400', async () => {
  const largeFile = createLargeFile(11 * 1024 * 1024); // 11MB
  
  const response = await request(app)
    .post('/api/v1/documents/upload')
    .set('Authorization', `Bearer ${validToken}`)
    .attach('file', largeFile)
    .expect(400);
  
  expect(response.body.error.code).toBe('FILE_TOO_LARGE');
});
```

---

## 📝 Quick Reference

### Error Response Checklist

- [ ] Uses standardized format
- [ ] Includes error code
- [ ] Has user-friendly message
- [ ] Includes appropriate HTTP status code
- [ ] Avoids exposing sensitive information
- [ ] Includes timestamp
- [ ] Optional: Includes details for debugging

### Backend Implementation Checklist

- [ ] Custom error class created
- [ ] Error handling middleware implemented
- [ ] Validation middleware configured
- [ ] All errors follow standard format
- [ ] Sensitive data excluded from responses
- [ ] Error logging implemented
- [ ] Different handling for dev/production

### Frontend Implementation Checklist

- [ ] Error handler utility created
- [ ] API calls wrapped with error handling
- [ ] User-friendly messages displayed
- [ ] Network errors handled gracefully
- [ ] Loading states implemented
- [ ] Form validation implemented
- [ ] Error states displayed to user

---

## 📞 Support

### Questions?
- Check error code in constants file
- Review error response format
- Test with mock API first
- Use browser DevTools Network tab

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Jan 22, 2026 | Initial error handling guide |

---

**Document Status:** ✅ Complete and Ready for Implementation

This guide provides comprehensive standards for error handling across the entire application. Both frontend and backend teams should follow these conventions for consistent error handling.
