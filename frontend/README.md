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

### Prerequisites

Before connecting to backend:
1. Backend API must be running
2. CORS must be enabled for frontend origin
3. JWT authentication implemented
4. API endpoints match documented format

### Integration Steps

**Step 1: Configure Environment**

```bash
# Edit .env file
VITE_API_MODE=REAL
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

**Step 2: Start Backend**

```bash
# Start your backend server (example)
cd ../backend
python manage.py runserver
```

**Step 3: Start Frontend**

```bash
npm run dev
```

**Step 4: Test Login**

- Navigate to `http://localhost:5173/login`
- Enter credentials from backend database
- Verify token is stored and API calls work

### Troubleshooting

**CORS Errors:**
```javascript
// Backend must allow frontend origin
Access-Control-Allow-Origin: http://localhost:5173
```

**401 Unauthorized:**
- Check token is being sent in Authorization header
- Verify backend JWT configuration
- Check token expiration

**API Format Mismatch:**
- Review [BACKEND_INTEGRATION_GUIDE.md](./BACKEND_INTEGRATION_GUIDE.md)
- Ensure response format matches documentation

---

## 📚 Documentation

Comprehensive documentation for backend integration:

| Document | Purpose | Location |
|----------|---------|----------|
| **Backend Integration Guide** | Complete API reference, endpoints, authentication | [BACKEND_INTEGRATION_GUIDE.md](./BACKEND_INTEGRATION_GUIDE.md) |
| **Authentication Flow** | Login, 2FA, token management | [AUTHENTICATION_FLOW.md](./AUTHENTICATION_FLOW.md) |
| **Error Handling Guide** | Error codes, validation, standards | [ERROR_HANDLING_GUIDE.md](./ERROR_HANDLING_GUIDE.md) |
| **Component Data Flow** | Architecture, data flow, hooks | [COMPONENT_DATA_FLOW.md](./COMPONENT_DATA_FLOW.md) |
| **API Constants** | Endpoints, status codes, roles | [src/constants/api.constants.js](./src/constants/api.constants.js) |

### Quick Links

**For Frontend Developers:**
- [Component Data Flow](./COMPONENT_DATA_FLOW.md) - Understand component architecture
- [API Constants](./src/constants/api.constants.js) - Use centralized constants

**For Backend Developers:**
- [Backend Integration Guide](./BACKEND_INTEGRATION_GUIDE.md) - API requirements
- [Authentication Flow](./AUTHENTICATION_FLOW.md) - JWT implementation
- [Error Handling Guide](./ERROR_HANDLING_GUIDE.md) - Response formats

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

### Required Variables

```env
# API Mode
VITE_API_MODE=MOCK              # MOCK | REAL

# Backend URL (when REAL mode)
VITE_API_BASE_URL=http://localhost:8000/api/v1

# Optional
VITE_API_TIMEOUT=30000          # Request timeout (ms)
VITE_MAX_FILE_SIZE=10485760     # Max file size (bytes)
```

### Feature Flags

```env
VITE_ENABLE_2FA=true            # Enable 2FA feature
VITE_ENABLE_FILE_UPLOAD=true    # Enable file upload
VITE_DEBUG=true                 # Enable debug logs
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
