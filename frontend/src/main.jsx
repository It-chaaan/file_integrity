/**
 * =============================================================================
 * MAIN.JSX - APPLICATION BOOTSTRAP
 * =============================================================================
 * 
 * This is the application entry point that initializes React and renders
 * the root component.
 * 
 * WHAT THIS FILE DOES:
 * 1. Creates React root DOM node
 * 2. Wraps App in BrowserRouter for client-side routing
 * 3. Enables React.StrictMode for development checks
 * 4. Imports global styles (Bootstrap + custom CSS)
 * 
 * DEPENDENCIES:
 * - React 18.3.1: Core React library
 * - ReactDOM: React's DOM rendering engine
 * - React Router: Client-side routing
 * - Bootstrap 5: CSS framework
 * 
 * FOR BACKEND DEVELOPERS:
 * - This file rarely needs modification
 * - Backend integration happens through API layer (src/api/)
 * - Environment variables are loaded automatically by Vite
 * 
 * FOR TESTERS:
 * - Application starts here after index.html
 * - StrictMode may cause double-rendering in development (expected behavior)
 * - Router provides navigation without page reloads
 * =============================================================================
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// ============================================================================
// ROOT COMPONENT
// ============================================================================
import App from './App';

// ============================================================================
// GLOBAL STYLES
// ============================================================================
import 'bootstrap/dist/css/bootstrap.min.css';  // Bootstrap framework
import './styles/custom.css';                     // Custom overrides
import './styles/responsive.css';                 // Responsive utilities

// Use the packaged logo as the favicon at runtime so builds don't require
// copying the file to `public/`. Vite will provide the correct URL.
import faviconUrl from './assets/icons/Logo - Integrity Verification.png';

function _setFavicon(url) {
  try {
    const head = document.getElementsByTagName('head')[0];
    let link = head.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      head.appendChild(link);
    }
    link.href = url;
  } catch (err) {
    // Fail silently in environments without DOM (SSR/test harnesses)
    // eslint-disable-next-line no-console
    console.warn('Could not set favicon', err);
  }
}

_setFavicon(faviconUrl);

/**
 * Initialize React Application
 * 
 * Creates the root React DOM node and renders the application.
 * 
 * REACT STRICT MODE:
 * - Enabled in development for additional checks
 * - May cause components to render twice (intentional)
 * - Helps identify side effects and deprecated patterns
 * 
 * BROWSER ROUTER:
 * - Provides client-side routing (URLs without page reloads)
 * - Uses HTML5 History API
 * - Base URL can be configured in vite.config.js
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);