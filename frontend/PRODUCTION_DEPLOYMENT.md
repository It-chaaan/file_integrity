# 🚀 Production Deployment Checklist

**System:** File Integrity Verification System  
**Date:** January 22, 2026  
**Status:** Backend Integration Complete → Production Deployment

---

## ✅ **PRE-DEPLOYMENT VERIFICATION**

### Backend Integration Status
- [ ] All API endpoints tested and working
- [ ] Authentication flow validated
- [ ] Token refresh mechanism verified
- [ ] Rate limiting tested (5 failed attempts → 15min lockout)
- [ ] Protected routes enforce access control
- [ ] User data displays correctly from backend
- [ ] CRUD operations (Create, Read, Update, Delete) working
- [ ] File uploads function correctly
- [ ] Error handling graceful and informative
- [ ] No console errors in production build

---

## 🔧 **ENVIRONMENT CONFIGURATION**

### 1. Create Production .env

Create `.env.production` with:

```bash
# ============================================
# PRODUCTION CONFIGURATION
# ============================================

# API Configuration
VITE_USE_MOCK_API=false
VITE_API_BASE_URL=https://api.yourcompany.com/api/v1

# Application
VITE_APP_NAME=PARITY
VITE_APP_DESCRIPTION=LGU Legal Documents Verification System

# Security
VITE_TOKEN_KEY=parity_auth_token
VITE_REFRESH_KEY=parity_refresh_token

# Environment Settings
VITE_ENV=production
VITE_DEBUG=false
VITE_HTTPS_ONLY=true

# File Upload
VITE_MAX_FILE_SIZE=5242880
VITE_ALLOWED_FILE_TYPES=.pdf,.doc,.docx,.txt

# Features
VITE_ENABLE_2FA=true
VITE_ENABLE_FILE_UPLOAD=true
VITE_ENABLE_PUBLIC_VERIFY=true

# Timeouts
VITE_API_TIMEOUT=30000
VITE_SESSION_TIMEOUT=3600000
```

**Critical Settings:**
- ✅ `VITE_USE_MOCK_API=false`
- ✅ `VITE_DEBUG=false`
- ✅ `VITE_HTTPS_ONLY=true`
- ✅ Production API URL set

---

## 🏗️ **BUILD PROCESS**

### 1. Install Dependencies

```bash
cd frontend
npm install --production
```

### 2. Run Linter

```bash
npm run lint
```

**Expected:** No errors or warnings

### 3. Build Production Bundle

```bash
npm run build
```

**Verify:**
- [ ] Build completes without errors
- [ ] `dist/` folder created
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Bundle size reasonable (< 1MB gzipped)

### 4. Test Production Build Locally

```bash
npm run preview
```

**Test:**
- [ ] Application loads at `http://localhost:4173`
- [ ] Can login successfully
- [ ] Protected routes work
- [ ] All pages render correctly
- [ ] API calls succeed
- [ ] No console errors

---

## 🔒 **SECURITY CHECKLIST**

### Frontend Security
- [ ] No API keys or secrets in frontend code
- [ ] No sensitive data in localStorage
- [ ] XSS protection via React's built-in escaping
- [ ] CSRF protection (backend responsibility)
- [ ] Rate limiting on login (15min after 5 attempts)
- [ ] Input validation on all forms
- [ ] Secure token storage
- [ ] Automatic token expiration
- [ ] HTTPS enforced in production

### Backend Security Requirements
- [ ] CORS properly configured
- [ ] JWT tokens with expiration
- [ ] Refresh token rotation
- [ ] Password hashing (bcrypt/argon2)
- [ ] SQL injection protection (ORM)
- [ ] Rate limiting on API endpoints
- [ ] File upload validation
- [ ] Audit logging enabled

---

## 🌐 **DEPLOYMENT OPTIONS**

### Option 1: Static Hosting (Netlify, Vercel)

**Netlify:**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=dist
```

**Configuration (`netlify.toml`):**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  VITE_API_BASE_URL = "https://api.yourcompany.com/api/v1"
  VITE_USE_MOCK_API = "false"
  VITE_DEBUG = "false"
```

**Vercel:**
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Option 2: Traditional Server (Nginx)

**1. Upload dist/ to server:**
```bash
scp -r dist/* user@server:/var/www/parity/
```

**2. Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name yourfrontend.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourfrontend.com;

    ssl_certificate /etc/ssl/certs/cert.pem;
    ssl_certificate_key /etc/ssl/private/key.pem;

    root /var/www/parity;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' https://api.yourcompany.com; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;

    # SPA routing - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Don't cache HTML
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
}
```

**3. Restart Nginx:**
```bash
sudo nginx -t
sudo systemctl restart nginx
```

### Option 3: Docker Container

**Dockerfile:**
```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Build and run:**
```bash
docker build -t parity-frontend .
docker run -p 80:80 parity-frontend
```

---

## 🧪 **POST-DEPLOYMENT TESTING**

### 1. Smoke Tests

**Visit production URL and verify:**
- [ ] Homepage loads correctly
- [ ] Login page renders
- [ ] Can complete authentication flow
- [ ] Dashboard loads with real data
- [ ] Document upload works
- [ ] All protected routes accessible after login
- [ ] Logout works and clears session

### 2. Cross-Browser Testing

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

### 3. Device Testing

- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

### 4. Performance Testing

**Use Lighthouse (Chrome DevTools):**
- [ ] Performance score > 90
- [ ] Accessibility score > 90
- [ ] Best Practices score > 90
- [ ] SEO score > 80

**Check:**
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 3s
- [ ] Total bundle size < 1MB
- [ ] No console errors
- [ ] No memory leaks

---

## 📊 **MONITORING SETUP**

### 1. Error Tracking (Sentry - Optional)

**Install:**
```bash
npm install @sentry/react
```

**Configure (src/main.jsx):**
```javascript
import * as Sentry from "@sentry/react";

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: "YOUR_SENTRY_DSN",
    environment: "production",
    tracesSampleRate: 0.1,
  });
}
```

### 2. Analytics (Google Analytics - Optional)

Add to `index.html` or use react-ga4:
```bash
npm install react-ga4
```

### 3. Uptime Monitoring

Set up monitoring with:
- UptimeRobot
- Pingdom
- StatusCake

Monitor:
- Frontend URL (https://yourfrontend.com)
- Backend API health endpoint

---

## 🔄 **ROLLBACK PLAN**

### If Deployment Fails:

**1. Quick Rollback (Static hosting):**
```bash
# Netlify
netlify rollback

# Vercel
vercel rollback
```

**2. Server Rollback:**
```bash
# Restore previous dist/ backup
cp -r /var/www/parity-backup/* /var/www/parity/
sudo systemctl restart nginx
```

**3. Re-enable Mock Mode (Emergency):**
- Update environment variable: `VITE_USE_MOCK_API=true`
- Rebuild and redeploy
- Users can continue with mock data while fixing backend issues

---

## ✅ **FINAL CHECKLIST**

### Pre-Go-Live
- [ ] Backend API fully functional and tested
- [ ] Frontend build successful
- [ ] Production .env configured correctly
- [ ] HTTPS certificate valid
- [ ] CORS configured for production domain
- [ ] Rate limiting tested
- [ ] Security headers configured
- [ ] Error tracking set up (optional)
- [ ] Monitoring configured
- [ ] Backup/rollback plan ready
- [ ] Team notified of deployment

### Post-Go-Live
- [ ] Homepage accessible
- [ ] Login flow working
- [ ] All features functional
- [ ] No console errors
- [ ] Performance metrics acceptable
- [ ] Mobile responsive
- [ ] Cross-browser compatible
- [ ] Monitoring active
- [ ] Team can access admin panel
- [ ] Documentation updated

---

## 📞 **SUPPORT CONTACTS**

**Frontend Issues:**
- Check browser console for errors
- Review: `BACKEND_INTEGRATION_GUIDE.md`
- Check: `.env` configuration

**Backend Issues:**
- Check Django logs
- Verify CORS configuration
- Test API endpoints directly

**Production Issues:**
- Check server logs
- Verify DNS settings
- Check SSL certificate
- Review Nginx/hosting logs

---

## 🎉 **SUCCESS CRITERIA**

Deployment is successful when:

- ✅ Users can access the application at production URL
- ✅ Authentication works without errors
- ✅ All features function as expected
- ✅ Performance meets targets
- ✅ No critical errors in logs
- ✅ Security headers properly configured
- ✅ Mobile and desktop both work
- ✅ Data persists correctly
- ✅ Backups working
- ✅ Monitoring active

---

**Status Updates:**
- 🟢 Deployed successfully
- 🟡 Deployed with minor issues
- 🔴 Deployment failed - rollback initiated

**Post-Deployment:**
1. Monitor for 24 hours
2. Review error logs daily
3. Check performance metrics weekly
4. Plan maintenance windows
5. Document any issues and resolutions

---

## 📝 **MAINTENANCE SCHEDULE**

**Daily:**
- Check error logs
- Monitor uptime
- Review user feedback

**Weekly:**
- Security updates (npm audit)
- Performance review
- Backup verification

**Monthly:**
- Dependency updates
- Security audit
- Performance optimization
- Documentation updates

---

**Deployment Complete!** 🚀

Next: Monitor, optimize, and iterate based on user feedback.
