#!/usr/bin/env node

/**
 * Backend Integration Validation Script
 * 
 * Automated testing tool for validating frontend-backend integration
 * Run this script to verify all API endpoints and functionality
 * 
 * Usage: node backend-validation.test.js
 */

import https from 'https';
import http from 'http';

// Configuration
const config = {
  apiBaseUrl: process.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  frontendUrl: 'http://localhost:5173',
  testCredentials: {
    admin: {
      username: 'admin',
      password: 'admin123'
    },
    staff: {
      username: 'staff',
      password: 'staff123'
    }
  }
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  skipped: 0,
  tests: []
};

// Utility functions
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
  results.passed++;
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
  results.failed++;
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

function logSkipped(message) {
  log(`⏭️  ${message}`, colors.cyan);
  results.skipped++;
}

// HTTP request helper
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.request(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsed
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// Test suite
class BackendIntegrationTests {
  constructor() {
    this.tokens = {};
  }

  async runAll() {
    log('\n' + '='.repeat(60), colors.bright);
    log('Backend Integration Validation', colors.bright + colors.magenta);
    log('File Integrity Verification System', colors.cyan);
    log('='.repeat(60) + '\n', colors.bright);

    try {
      await this.testPhase1_Connectivity();
      await this.testPhase2_CORS();
      await this.testPhase3_Authentication();
      await this.testPhase4_TokenRefresh();
      await this.testPhase5_ProtectedEndpoints();
      await this.testPhase6_RateLimiting();
      await this.testPhase7_DataOperations();
      
      this.printSummary();
    } catch (error) {
      logError(`Critical error: ${error.message}`);
      process.exit(1);
    }
  }

  async testPhase1_Connectivity() {
    log('\n📡 Phase 1: Backend Connectivity', colors.bright + colors.blue);
    log('-'.repeat(60));

    try {
      const response = await makeRequest(config.apiBaseUrl + '/', {
        method: 'GET',
        timeout: 5000
      });

      if (response.status === 200 || response.status === 404) {
        logSuccess('Backend server is reachable');
      } else {
        logWarning(`Backend returned status ${response.status}`);
      }
    } catch (error) {
      logError(`Cannot connect to backend: ${error.message}`);
      logInfo(`Ensure backend is running at: ${config.apiBaseUrl}`);
      throw error;
    }
  }

  async testPhase2_CORS() {
    log('\n🔒 Phase 2: CORS Configuration', colors.bright + colors.blue);
    log('-'.repeat(60));

    try {
      const response = await makeRequest(config.apiBaseUrl + '/auth/login/', {
        method: 'OPTIONS',
        headers: {
          'Origin': config.frontendUrl,
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type, Authorization'
        }
      });

      const corsHeaders = response.headers['access-control-allow-origin'];
      
      if (corsHeaders) {
        logSuccess('CORS headers present in response');
      } else {
        logError('CORS headers missing - frontend requests will fail');
        logInfo('Add CORS middleware to Django backend');
      }

      if (response.headers['access-control-allow-credentials'] === 'true') {
        logSuccess('CORS credentials allowed');
      } else {
        logWarning('CORS credentials not explicitly allowed');
      }
    } catch (error) {
      logError(`CORS test failed: ${error.message}`);
    }
  }

  async testPhase3_Authentication() {
    log('\n🔐 Phase 3: Authentication Flow', colors.bright + colors.blue);
    log('-'.repeat(60));

    // Test login with valid credentials
    try {
      const response = await makeRequest(config.apiBaseUrl + '/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config.testCredentials.admin)
      });

      if (response.status === 200 || response.status === 201) {
        logSuccess('Login endpoint responds correctly');
        
        if (response.data.access && response.data.refresh) {
          logSuccess('JWT tokens returned in response');
          this.tokens.access = response.data.access;
          this.tokens.refresh = response.data.refresh;
        } else if (response.data.data && response.data.data.access) {
          logSuccess('JWT tokens returned in nested data object');
          this.tokens.access = response.data.data.access;
          this.tokens.refresh = response.data.data.refresh;
        } else {
          logError('Response missing JWT tokens');
          logInfo('Expected: { access: "...", refresh: "..." }');
        }

        if (response.data.user || response.data.data?.user) {
          logSuccess('User object returned in response');
        } else {
          logWarning('User object not in response - may cause issues');
        }
      } else if (response.status === 401) {
        logError('Login failed - check test credentials');
        logInfo(`Tried: ${config.testCredentials.admin.username} / ${config.testCredentials.admin.password}`);
      } else {
        logError(`Unexpected login response: ${response.status}`);
      }
    } catch (error) {
      logError(`Login test failed: ${error.message}`);
    }

    // Test login with invalid credentials
    try {
      const response = await makeRequest(config.apiBaseUrl + '/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: 'invalid',
          password: 'invalid'
        })
      });

      if (response.status === 401 || response.status === 400) {
        logSuccess('Invalid credentials properly rejected');
      } else {
        logWarning(`Expected 401/400, got ${response.status}`);
      }
    } catch (error) {
      logError(`Invalid credentials test failed: ${error.message}`);
    }
  }

  async testPhase4_TokenRefresh() {
    log('\n🔄 Phase 4: Token Refresh', colors.bright + colors.blue);
    log('-'.repeat(60));

    if (!this.tokens.refresh) {
      logSkipped('Token refresh test - no refresh token available');
      return;
    }

    try {
      const response = await makeRequest(config.apiBaseUrl + '/auth/refresh/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          refresh: this.tokens.refresh
        })
      });

      if (response.status === 200 || response.status === 201) {
        logSuccess('Token refresh endpoint working');
        
        if (response.data.access || response.data.data?.access) {
          logSuccess('New access token returned');
        } else {
          logError('Refresh response missing new access token');
        }
      } else {
        logError(`Token refresh failed: ${response.status}`);
      }
    } catch (error) {
      logError(`Token refresh test failed: ${error.message}`);
    }
  }

  async testPhase5_ProtectedEndpoints() {
    log('\n🛡️  Phase 5: Protected Endpoints', colors.bright + colors.blue);
    log('-'.repeat(60));

    const endpoints = [
      '/documents/',
      '/users/',
      '/tickets/',
      '/logs/'
    ];

    for (const endpoint of endpoints) {
      // Test without token
      try {
        const response = await makeRequest(config.apiBaseUrl + endpoint, {
          method: 'GET'
        });

        if (response.status === 401 || response.status === 403) {
          logSuccess(`${endpoint} requires authentication`);
        } else {
          logWarning(`${endpoint} accessible without auth (${response.status})`);
        }
      } catch (error) {
        logError(`Testing ${endpoint} failed: ${error.message}`);
      }

      // Test with token
      if (this.tokens.access) {
        try {
          const response = await makeRequest(config.apiBaseUrl + endpoint, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${this.tokens.access}`
            }
          });

          if (response.status === 200) {
            logSuccess(`${endpoint} accessible with valid token`);
          } else {
            logWarning(`${endpoint} returned ${response.status} with token`);
          }
        } catch (error) {
          logError(`Authenticated request to ${endpoint} failed: ${error.message}`);
        }
      }
    }
  }

  async testPhase6_RateLimiting() {
    log('\n🚦 Phase 6: Rate Limiting (Frontend)', colors.bright + colors.blue);
    log('-'.repeat(60));
    
    logInfo('Rate limiting is implemented in frontend');
    logInfo('To test:');
    logInfo('1. Open http://localhost:5173/login');
    logInfo('2. Enter invalid credentials 5 times');
    logInfo('3. Verify 15-minute lockout activates');
    logInfo('4. Refresh page and verify lockout persists');
    logSkipped('Manual testing required');
  }

  async testPhase7_DataOperations() {
    log('\n📊 Phase 7: Data Operations', colors.bright + colors.blue);
    log('-'.repeat(60));

    if (!this.tokens.access) {
      logSkipped('Data operations test - no access token available');
      return;
    }

    // Test GET documents
    try {
      const response = await makeRequest(config.apiBaseUrl + '/documents/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.tokens.access}`
        }
      });

      if (response.status === 200) {
        logSuccess('Documents endpoint returns data');
        
        const data = response.data.results || response.data.data || response.data;
        if (Array.isArray(data)) {
          logInfo(`Found ${data.length} documents`);
        } else if (response.data.count !== undefined) {
          logInfo(`Total documents: ${response.data.count}`);
        }
      } else {
        logError(`Documents GET failed: ${response.status}`);
      }
    } catch (error) {
      logError(`Documents GET test failed: ${error.message}`);
    }
  }

  printSummary() {
    log('\n' + '='.repeat(60), colors.bright);
    log('Test Summary', colors.bright + colors.magenta);
    log('='.repeat(60), colors.bright);
    
    log(`\n✅ Passed:  ${results.passed}`, colors.green);
    log(`❌ Failed:  ${results.failed}`, colors.red);
    log(`⏭️  Skipped: ${results.skipped}`, colors.cyan);
    
    const total = results.passed + results.failed;
    const percentage = total > 0 ? ((results.passed / total) * 100).toFixed(1) : 0;
    
    log(`\n📊 Success Rate: ${percentage}%`, colors.bright);
    
    if (results.failed === 0) {
      log('\n🎉 All tests passed! Backend integration ready.', colors.green + colors.bright);
    } else {
      log('\n⚠️  Some tests failed. Review errors above.', colors.yellow);
      log('   Check: BACKEND_INTEGRATION_GUIDE.md for troubleshooting', colors.yellow);
    }
    
    log('\n' + '='.repeat(60) + '\n', colors.bright);
  }
}

// Run tests
const tester = new BackendIntegrationTests();
tester.runAll().catch((error) => {
  logError(`Fatal error: ${error.message}`);
  process.exit(1);
});
