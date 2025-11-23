// scripts/test-login-flow.js
// Simulates the login flow to test redirect behavior
// Can be run locally or adapted for Netlify testing

const https = require('https');
const http = require('http');

// Configuration
const CONFIG = {
  // Set this to your Netlify URL for testing
  baseUrl: process.env.TEST_URL || 'http://localhost:3000',
  // Test credentials
  credentials: {
    admin: {
      email: 'admin@thespecialistrealty.com',
      password: 'admin123'
    },
    agent: {
      email: 'agent@thespecialistrealty.com',
      password: 'agent123'
    }
  }
};

// Helper to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'Login-Flow-Test/1.0',
        'Cookie': options.cookies || '',
        ...options.headers
      }
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          cookies: res.headers['set-cookie'] || []
        });
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

// Extract cookies from response
function extractCookies(setCookieHeaders) {
  const cookies = {};
  if (Array.isArray(setCookieHeaders)) {
    setCookieHeaders.forEach(cookie => {
      const match = cookie.match(/([^=]+)=([^;]+)/);
      if (match) {
        cookies[match[1]] = match[2];
      }
    });
  }
  return cookies;
}

// Format cookies for request
function formatCookies(cookies) {
  return Object.entries(cookies)
    .map(([key, value]) => `${key}=${value}`)
    .join('; ');
}

// Test login flow
async function testLoginFlow(userType = 'admin') {
  console.log(`\n🧪 Testing login flow for ${userType} user...\n`);
  console.log(`📍 Base URL: ${CONFIG.baseUrl}\n`);

  const credentials = CONFIG.credentials[userType];
  if (!credentials) {
    console.error(`❌ Unknown user type: ${userType}`);
    return;
  }

  let cookies = {};

  try {
    // Step 1: Navigate to login page
    console.log('Step 1: Loading login page...');
    const loginPageResponse = await makeRequest(`${CONFIG.baseUrl}/login`);
    
    if (loginPageResponse.statusCode !== 200) {
      console.error(`❌ Failed to load login page. Status: ${loginPageResponse.statusCode}`);
      return;
    }
    console.log(`✅ Login page loaded (${loginPageResponse.statusCode})`);

    // Extract any initial cookies
    const initialCookies = extractCookies(loginPageResponse.cookies);
    cookies = { ...cookies, ...initialCookies };

    // Step 2: Submit login form
    console.log('\nStep 2: Submitting login form...');
    console.log(`   Email: ${credentials.email}`);
    
    // Note: This is a simplified test. In reality, NextAuth requires CSRF tokens
    // and proper form submission. This test checks if the endpoints are accessible.
    
    // Try to access the auth endpoint (this would normally be done via signIn from client)
    const authResponse = await makeRequest(
      `${CONFIG.baseUrl}/api/auth/callback/credentials`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          email: credentials.email,
          password: credentials.password,
          redirect: 'false',
          json: 'true'
        }).toString(),
        cookies: formatCookies(cookies)
      }
    );

    console.log(`   Auth response status: ${authResponse.statusCode}`);
    
    // Extract new cookies from auth response
    const authCookies = extractCookies(authResponse.cookies);
    cookies = { ...cookies, ...authCookies };

    // Step 3: Check if we can access dashboard
    console.log('\nStep 3: Testing dashboard access...');
    const dashboardResponse = await makeRequest(
      `${CONFIG.baseUrl}/dashboard`,
      {
        cookies: formatCookies(cookies)
      }
    );

    console.log(`   Dashboard response status: ${dashboardResponse.statusCode}`);
    
    if (dashboardResponse.statusCode === 200) {
      console.log('✅ Successfully accessed dashboard');
    } else if (dashboardResponse.statusCode === 307 || dashboardResponse.statusCode === 308) {
      const location = dashboardResponse.headers.location;
      console.log(`⚠️  Redirected to: ${location}`);
      if (location === '/' || location.includes('/login')) {
        console.log('❌ Login failed - redirected to home/login');
      } else if (location.includes('/dashboard')) {
        console.log('✅ Redirected to dashboard (expected)');
      }
    } else {
      console.log(`⚠️  Unexpected status: ${dashboardResponse.statusCode}`);
    }

    // Step 4: Test callback route
    console.log('\nStep 4: Testing /auth/callback route...');
    const callbackResponse = await makeRequest(
      `${CONFIG.baseUrl}/auth/callback`,
      {
        cookies: formatCookies(cookies)
      }
    );

    console.log(`   Callback response status: ${callbackResponse.statusCode}`);
    
    if (callbackResponse.statusCode === 307 || callbackResponse.statusCode === 308) {
      const location = callbackResponse.headers.location;
      console.log(`   Redirected to: ${location}`);
      if (location.includes('/dashboard')) {
        console.log('✅ Callback route redirects to dashboard correctly');
      } else {
        console.log(`⚠️  Callback redirected to unexpected location: ${location}`);
      }
    }

    console.log('\n✅ Login flow test completed\n');

  } catch (error) {
    console.error('\n❌ Error during login flow test:', error.message);
    console.error(error);
  }
}

// Main execution
async function main() {
  console.log('🚀 Login Flow Test Script');
  console.log('========================\n');
  
  // Test admin login
  await testLoginFlow('admin');
  
  // Uncomment to test agent login
  // await testLoginFlow('agent');
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testLoginFlow, CONFIG };

