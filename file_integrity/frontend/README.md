# File Integrity Verification System - Frontend

**Version:** 1.0.0  
**Status:** ✅ Backend Integration Ready  
**Last Updated:** January 22, 2026

A secure document verification and file integrity management system with role-based access control (Admin, Staff). Built with React 18, Bootstrap 5, and fully prepared for REST API integration.

---

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Development](#development)
- [Backend Integration](#backend-integration)
- [Documentation](#documentation)
- [Scripts](#scripts)
- [Environment Configuration](#environment-configuration)
- [Deployment](#deployment)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 16.x or higher
- npm 8.x or higher

### Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Default Login (Mock Mode)

**Admin Account:**
- Email: `admin@example.com`
- Password: `password123`

**Staff Account:**
- Email: `staff@example.com`
- Password: `password123`

---

## ✨ Features

### Core Features
- ✅ **Document Upload & Verification** - Hash-based integrity checking
- ✅ **User Management** - CRUD operations with role-based access
- ✅ **Audit Logging** - Complete activity tracking
- ✅ **Ticket System** - Issue reporting and resolution
- ✅ **Security Management** - Cryptographic key management
- ✅ **Public Verification** - Anonymous document verification

### Technical Features
- ✅ **Responsive Design** - Mobile, tablet, and desktop optimized
- ✅ **Role-Based Access Control** - Admin and Staff portals
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Mock API Mode** - Development without backend
- ✅ **Real API Ready** - Seamless backend integration
- ✅ **Error Handling** - Comprehensive error management
- ✅ **Form Validation** - Client-side validation
- ✅ **Loading States** - User feedback for all operations

---

## 🛠 Tech Stack

### Core Technologies
- **React 18.3.1** - UI library with hooks
- **React Router DOM 6.x** - Client-side routing
- **Bootstrap 5.3.x** - Responsive UI framework
- **Vite 5.x** - Build tool and dev server
- **Axios** - HTTP client

### Development Tools
- **ESLint** - Code linting
- **Prettier** (recommended) - Code formatting
- **React DevTools** - Debugging

---

## 📁 Project Structure

```
frontend/
├── public/                     # Static files
│   └── index.html             # HTML template
│
├── src/
│   ├── api/                   # 🔴 API Layer
│   │   ├── adapter.js         # Mock/Real API switch
│   │   ├── client.js          # Axios instance
│   │   ├── auth.api.js        # Authentication endpoints
│   │   ├── documents.api.js   # Document endpoints
│   │   ├── users.api.js       # User endpoints
│   │   ├── tickets.api.js     # Ticket endpoints
│   │   ├── keys.api.js        # Security keys endpoints
│   │   └── logs.api.js        # Audit logs endpoints
│   │
│   ├── components/            # Reusable UI Components
│   │   ├── DataTable.jsx      # Table with pagination
│   │   ├── Sidebar.jsx        # Navigation sidebar
│   │   ├── Topbar.jsx         # Top navigation
│   │   ├── Pagination.jsx     # Pagination controls
│   │   ├── StatusBadge.jsx    # Status indicators
│   │   └── ...
│   │
│   ├── constants/             # 🆕 Constants & Config
│   │   └── api.constants.js   # API endpoints, status codes
│   │
│   ├── hooks/                 # Custom React Hooks
│   │   ├── useData.js         # Data fetching hooks
│   │   └── useApiWithToast.js # API with toast notifications
│   │
│   ├── layouts/               # Layout Wrappers
│   │   ├── AdminLayout.jsx    # Admin portal layout
│   │   ├── StaffLayout.jsx    # Staff portal layout
│   │   └── PublicLayout.jsx   # Public site layout
│   │
│   ├── pages/                 # Page Components
│   │   ├── admin/             # Admin pages
│   │   ├── staff/             # Staff pages
│   │   ├── auth/              # Auth pages (Login, 2FA)
│   │   └── public/            # Public pages
│   │
│   ├── routes/                # Route Configuration
│   │   ├── admin.routes.jsx
│   │   ├── staff.routes.jsx
│   │   └── public.routes.jsx
│   │
│   ├── services/              # Business Logic
│   │   ├── auth.js            # Auth service
│   │   └── utils.js           # Utility functions
│   │
│   ├── mock/                  # 🟡 Mock Data (remove in production)
│   │   ├── documents.js
│   │   ├── users.js
│   │   └── ...
│   │
│   ├── App.jsx                # Root component
│   └── main.jsx               # Entry point
│
├── .env.example               # 🆕 Environment template
├── .env                       # Environment variables (git-ignored)
├── package.json               # Dependencies
├── vite.config.js             # Vite configuration
│
└── 📚 Documentation Files (🆕)
    ├── BACKEND_INTEGRATION_GUIDE.md    # Complete API integration guide
    ├── AUTHENTICATION_FLOW.md          # Auth flow documentation
    ├── ERROR_HANDLING_GUIDE.md         # Error handling standards
    └── COMPONENT_DATA_FLOW.md          # Component architecture
```

**Legend:**
- 🔴 Critical for backend integration
- 🟡 Remove after backend integration
- 🆕 Newly created files

---

## 💻 Development

### Running Development Server

```bash
npm run dev
```

Starts Vite dev server at `http://localhost:5173` with:
- Hot Module Replacement (HMR)
- Fast refresh
- Instant updates

### Mock vs Real API Mode

The application supports two API modes:

**Mock Mode (Default)** - Uses local mock data
```env
VITE_API_MODE=MOCK
```

**Real Mode** - Connects to backend API
```env
VITE_API_MODE=REAL
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### Switching Modes

1. Edit `.env` file
2. Change `VITE_API_MODE` value
3. Restart dev server (`npm run dev`)

---

## 🔌 Backend Integration

### Quick Start (1 Minute)

```bash
# 1. Switch to real API
# Edit .env:
VITE_USE_MOCK_API=false

# 2. Start backend (Django example)
cd ../backend
python manage.py runserver

# 3. Start frontend
cd ../frontend
npm run dev

# 4. Test at http://localhost:5173/login
```

### Prerequisites

Your backend API must have:
- ✅ Running at `http://localhost:8000/api/v1`
- ✅ CORS enabled for `http://localhost:5173`
- ✅ JWT authentication endpoints
- ✅ All CRUD endpoints implemented
- ✅ Response format matches documentation

### Common Issues

**CORS Error:**
```
Access to XMLHttpRequest blocked by CORS policy
```
→ Enable CORS in backend settings

**Connection Refused:**
```
GET http://localhost:8000/api/v1/... net::ERR_CONNECTION_REFUSED
```
→ Backend server is not running. Start it first.

**401 Unauthorized:**
→ Check token in localStorage and JWT configuration

**Duplicate Path Error:**
```
GET http://localhost:8000/api/v1/v1/auth/me/
```
→ Remove `/v1` from `VITE_API_BASE_URL` if backend already prefixes it

### Detailed Integration

📖 See **[BACKEND_INTEGRATION_GUIDE.md](./BACKEND_INTEGRATION_GUIDE.md)** for:
- Complete API endpoint reference
- Authentication flow details
- Request/response format examples
- Testing procedures
- Troubleshooting guide

---

## 📚 Documentation

Complete guides for backend integration and development:

| Document | Purpose |
|----------|---------|
| **[BACKEND_INTEGRATION_GUIDE.md](./BACKEND_INTEGRATION_GUIDE.md)** | 📖 Complete API reference, endpoints, authentication, testing |
| **[.env.example](./.env.example)** | ⚙️ Environment configuration template |

### Quick Reference

**Login Credentials (Mock Mode)**
- Admin: `admin` / `admin123`
- Staff: `staff` / `staff123`

**API Endpoints (Real Mode)**
- Base: `http://localhost:8000/api/v1`
- Auth: `/auth/login`, `/auth/verify-2fa`
- Docs: `/documents`, `/documents/:id`
- Users: `/users`, `/users/:id`
- See [BACKEND_INTEGRATION_GUIDE.md](./BACKEND_INTEGRATION_GUIDE.md) for complete list

**API Constants**
- Endpoints: `src/constants/api.constants.js`
- Status codes and role mappings included

**Development**
- Component architecture: `src/` folder structure above
- Custom hooks: `src/hooks/useData.js`
- Mock data: `src/mock/*.js` (removed after backend integration)

---

## 📜 Scripts

```bash
# Development
npm run dev              # Start dev server (port 5173)
npm run build            # Build for production
npm run preview          # Preview production build

# Linting
npm run lint             # Run ESLint
npm run lint:fix         # Auto-fix ESLint issues

# Testing (if added)
npm test                 # Run tests
npm run test:coverage    # Test coverage report
```

---

## ⚙️ Environment Configuration

### Quick Setup

```bash
# Copy environment template
cp .env.example .env
```

### Mock vs Real API

**Mock Mode (Default - No Backend Required):**
```env
VITE_USE_MOCK_API=true
```

Test without backend. Uses local mock data:
- Admin: `admin` / `admin123`
- Staff: `staff` / `staff123`

**Real Mode (Connect to Backend):**
```env
VITE_USE_MOCK_API=false
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### Required Variables

```env
# API Configuration
VITE_USE_MOCK_API=true                    # true=mock, false=real API

# Backend URL (when VITE_USE_MOCK_API=false)
VITE_API_BASE_URL=http://localhost:8000/api/v1

# Security
VITE_TOKEN_KEY=parity_auth_token          # LocalStorage key for token
VITE_REFRESH_KEY=parity_refresh_token     # LocalStorage key for refresh token

# Application
VITE_APP_NAME=PARITY
VITE_ENV=development                      # development | staging | production

# Optional
VITE_API_TIMEOUT=30000                    # Request timeout (ms)
VITE_MAX_FILE_SIZE=5242880                # Max file size (5MB)
VITE_DEBUG=true                           # Enable debug logs
VITE_HTTPS_ONLY=false                     # Enforce HTTPS
```

### Feature Flags

```env
VITE_ENABLE_2FA=true            # Enable 2FA authentication
VITE_ENABLE_FILE_UPLOAD=true    # Enable document upload
VITE_ENABLE_PUBLIC_VERIFY=true  # Enable public verification
```

See [.env.example](./.env.example) for complete configuration options.

---

## 🚀 Deployment

### Build for Production

```bash
# Create optimized production build
npm run build

# Output directory: dist/
```

### Production Checklist

Before deploying to production:

- [ ] Change `VITE_API_MODE` to `REAL`
- [ ] Set correct `VITE_API_BASE_URL`
- [ ] Remove `src/mock/` directory
- [ ] Remove `src/services/mockAuth.js`
- [ ] Set `VITE_DEBUG=false`
- [ ] Enable HTTPS (`VITE_HTTPS_ONLY=true`)
- [ ] Test all features with real backend
- [ ] Run production build (`npm run build`)
- [ ] Test production build (`npm run preview`)

### Deployment Platforms

**Recommended:**
- **Vercel** - Zero-config deployment
- **Netlify** - Continuous deployment from Git
- **AWS S3 + CloudFront** - Scalable static hosting
- **Azure Static Web Apps** - Enterprise-grade hosting

### Environment Variables in Production

Set these in your deployment platform:
```
VITE_API_MODE=REAL
VITE_API_BASE_URL=https://api.yourcompany.com/api/v1
VITE_DEBUG=false
VITE_HTTPS_ONLY=true
```

---

## 🎨 Customization

### Changing Colors

**Bootstrap Variables:**
Edit `src/styles/custom.css` to override Bootstrap defaults.

### Adding New Pages

1. Create component in `src/pages/[role]/`
2. Add route in `src/routes/[role].routes.jsx`
3. Add menu item in `src/components/Sidebar.jsx`
4. Create API function in `src/api/`
5. Create custom hook (if needed)

### Adding New API Endpoints

1. Add endpoint to `src/constants/api.constants.js`
2. Create API function in appropriate `src/api/*.api.js`
3. Create custom hook in `src/hooks/useData.js`
4. Use hook in page component

---

## 🐛 Troubleshooting

### Common Issues

**1. White Screen on Page Load**
- Check browser console for errors
- Verify API mode is set correctly
- Check if hooks return undefined

**2. Login Not Working**
- Verify API mode (MOCK vs REAL)
- Check network tab for API calls
- Verify backend is running (REAL mode)

**3. 401 Unauthorized**
- Check token in localStorage
- Verify token is being sent in headers
- Check token expiration

**4. CORS Errors**
- Backend must enable CORS
- Check allowed origin matches frontend URL

**5. Components Not Loading**
- Check safe destructuring: `useHook?.() || {}`
- Verify default values: `const { data = [] } = ...`
- Check hook dependencies

---

## 👥 Contributing

### Development Workflow

1. Create feature branch
2. Make changes
3. Test with mock data
4. Test with real API (if available)
5. Update documentation
6. Submit pull request

### Code Standards

- Use functional components
- Use hooks for state management
- Follow safe destructuring pattern
- Handle loading and error states
- Write clear component documentation

---

## 📝 License

[Add your license here]

---

## 📞 Support

### Questions or Issues?

1. Check documentation in root directory
2. Review API constants file
3. Check browser DevTools console/network
4. Review error handling guide

### Contact

[Add contact information]

---

## 🎯 Roadmap

### Current Version (1.0.0)
- ✅ Complete responsive UI
- ✅ Mock API for development
- ✅ Backend integration preparation
- ✅ Comprehensive documentation

### Future Enhancements
- [ ] Real-time notifications (WebSocket)
- [ ] Advanced filtering and search
- [ ] Bulk operations
- [ ] Export to CSV/PDF
- [ ] Dark mode
- [ ] Multi-language support
- [ ] Advanced analytics dashboard

---

**Version:** 1.0.0  
**Status:** Production Ready (Backend Integration Pending)  
**Last Updated:** January 22, 2026

---

## 🙏 Acknowledgments

Built with React, Vite, and Bootstrap. Special thanks to the open-source community.

---

**Ready for Backend Integration** ✅

This frontend application is fully prepared for REST API integration. Review the documentation files for complete backend integration instructions.
