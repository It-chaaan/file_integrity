# Frontend Handoff for Backend Developers

## Overview
- Stack: React 18 + Vite, React Router, Bootstrap for baseline UI, custom styles in src/styles/custom.css and responsive.css.
- Layouts: Admin and Staff use Sidebar + Topbar shells with sticky headers and responsive margins.
- Data flow: Pages call API adapters in src/api/* (fetch wrappers) via services/hooks; toast/error handling in hooks/useApiWithToast.js and utils/errors.js.
- Auth: src/services/auth.js (token handling), src/services/mockAuth.js for dev; JWT expected (SimpleJWT on backend), tokens stored in storage utilities.
- Routing: Defined per role in src/routes/*. Public/auth/admin/staff route files; <Outlet> renders nested pages.
- State: Mostly local state; API hooks encapsulate loading/error; no global store.

## API Layer
- Adapter: src/api/adapter.js builds requests (base URL, headers, token injection, JSON handling).
- Client: src/api/client.js centralizes axios-like calls (using fetch); error normalization via utils/errors.js.
- Endpoints: src/api/documents.api.js, logs.api.js, tickets.api.js, users.api.js, auth.api.js expose CRUD-style functions consumed by pages.
- Usage pattern: import specific API module -> call function -> handle {data, error}. Hooks/useApiWithToast.js wraps calls with toasts and basic retry handling.
- Env/config: Base URL and keys pulled from Vite env (import.meta.env.*); ensure backend exposes matching endpoints and CORS is enabled.

## Auth & Session
- Token storage: src/services/auth.js sets/gets tokens; src/services/mockStorage.js for local dev.
- Guards: Role is passed to layouts/routes; backend should return role in login payload. Expired/invalid tokens should be signaled with 401 so frontend can redirect to /login.
- Headers: Adapter adds Authorization: Bearer <token> when present.

## Layout & Responsiveness
- Sidebar: src/components/Sidebar.jsx fixed left on desktop/tablet; collapses on mobile (width 0). Menu items are role-based.
- Topbar: src/components/Topbar.jsx sticky, translucent; hides name on small screens; margin adjusts with sidebar width.
- Layout shells: src/layouts/AdminLayout.jsx and src/layouts/StaffLayout.jsx compute sidebar width from viewport and set main content width accordingly.
- Styles: src/styles/custom.css for theme; src/styles/responsive.css for breakpoints (mobile/tablet/desktop/XL). Bootstrap grid utilities also available.

## Pages & Examples
- Example uploads: src/examples/DocumentUploadExample.jsx demonstrates file upload flow.
- Mock data: src/mock/* provides mock payloads for documents/logs/tickets/users.

## Error Handling & Toasts
- Errors normalized in utils/errors.js; toasts surfaced via hooks/useApiWithToast.js and components/Toast.jsx.
- Status badges: components/StatusBadge.jsx for consistent status colors.

## Things Backend Should Confirm
1) Auth payload shape: login response should include access token, refresh token (if used), user role, and display name.
2) CORS/CSRF: Allow Vite dev origin and deployed origin; accept Authorization header.
3) Pagination/filter params: ensure endpoints accept the query shapes used in documents.api.js, logs.api.js, tickets.api.js, users.api.js.
4) Uploads: documents.api.js expects multipart/form-data; backend should return file metadata and integrity hash.
5) Error schema: prefer {message, code, details} to map cleanly to toast/error utilities.

## Running Locally
- Install: npm install
- Dev: npm run dev (Vite) at http://localhost:5173
- Env: create .env.local with VITE_API_BASE_URL and any needed keys.

## Suggested Cleanup (if desired)
- Consolidate role-based routes into a single config map.
- Consider centralizing sidebar width/breakpoints to a context to avoid recalculating in each layout.
- Replace mock auth/storage with real endpoints once backend is ready.
