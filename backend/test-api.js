#!/usr/bin/env node

const http = require('http');

const API_BASE = 'http://localhost:8000';

// Helper function to make HTTP requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    if (data) {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }

    const req = http.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonBody
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: body
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test functions
async function testHealthCheck() {
  console.log('\n🩺 Testing Health Check...');
  try {
    const response = await makeRequest('GET', '/health');
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return response.status === 200;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
}

async function testAPIDocs() {
  console.log('\n📝 Testing API Documentation...');
  try {
    const response = await makeRequest('GET', '/api/docs');
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return response.status === 200;
  } catch (error) {
    console.error('❌ API docs failed:', error.message);
    return false;
  }
}

async function testAuthRoutes() {
  console.log('\n🔐 Testing Auth Routes...');
  
  // Test registration
  console.log('\n- Testing registration...');
  try {
    const regData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    };
    const response = await makeRequest('POST', '/api/auth/register', regData);
    console.log(`Registration Status: ${response.status}`);
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Registration failed:', error.message);
  }

  // Test login
  console.log('\n- Testing login...');
  try {
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };
    const response = await makeRequest('POST', '/api/auth/login', loginData);
    console.log(`Login Status: ${response.status}`);
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Login failed:', error.message);
  }
}

async function testUserRoutes() {
  console.log('\n👤 Testing User Routes...');
  
  // Test get profile
  console.log('\n- Testing get profile...');
  try {
    const response = await makeRequest('GET', '/api/users/profile');
    console.log(`Profile Status: ${response.status}`);
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Get profile failed:', error.message);
  }

  // Test get stats
  console.log('\n- Testing get stats...');
  try {
    const response = await makeRequest('GET', '/api/users/stats');
    console.log(`Stats Status: ${response.status}`);
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Get stats failed:', error.message);
  }
}

async function testCardRoutes() {
  console.log('\n🎴 Testing Card Routes...');
  
  // Test get cards
  console.log('\n- Testing get cards...');
  try {
    const response = await makeRequest('GET', '/api/cards?page=1&limit=5');
    console.log(`Cards Status: ${response.status}`);
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Get cards failed:', error.message);
  }

  // Test get card by ID
  console.log('\n- Testing get card by ID...');
  try {
    const response = await makeRequest('GET', '/api/cards/card-001');
    console.log(`Card by ID Status: ${response.status}`);
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Get card by ID failed:', error.message);
  }

  // Test roll cards
  console.log('\n- Testing card rolling...');
  try {
    const rollData = {
      packType: 'basic',
      count: 1
    };
    const response = await makeRequest('POST', '/api/cards/roll', rollData);
    console.log(`Roll Status: ${response.status}`);
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Card rolling failed:', error.message);
  }
}

async function testGameRoutes() {
  console.log('\n🎮 Testing Game Routes...');
  
  // Test create match
  console.log('\n- Testing create match...');
  try {
    const matchData = {
      deckId: 'deck-001',
      matchType: 'casual'
    };
    const response = await makeRequest('POST', '/api/game/match/create', matchData);
    console.log(`Create Match Status: ${response.status}`);
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Create match failed:', error.message);
  }

  // Test get match
  console.log('\n- Testing get match...');
  try {
    const response = await makeRequest('GET', '/api/game/match/match-001');
    console.log(`Get Match Status: ${response.status}`);
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Get match failed:', error.message);
  }
}

async function testMatchmakingRoutes() {
  console.log('\n🔍 Testing Matchmaking Routes...');
  
  // Test join queue
  console.log('\n- Testing join queue...');
  try {
    const queueData = {
      deckId: 'deck-001',
      matchType: 'casual',
      preferredRegion: 'us-east'
    };
    const response = await makeRequest('POST', '/api/matchmaking/queue', queueData);
    console.log(`Join Queue Status: ${response.status}`);
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Join queue failed:', error.message);
  }

  // Test get status
  console.log('\n- Testing matchmaking status...');
  try {
    const response = await makeRequest('GET', '/api/matchmaking/status');
    console.log(`Status Status: ${response.status}`);
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Get status failed:', error.message);
  }

  // Test leave queue
  console.log('\n- Testing leave queue...');
  try {
    const response = await makeRequest('DELETE', '/api/matchmaking/queue');
    console.log(`Leave Queue Status: ${response.status}`);
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Leave queue failed:', error.message);
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting API Tests...');
  console.log('=' .repeat(50));

  const tests = [
    testHealthCheck,
    testAPIDocs,
    testAuthRoutes,
    testUserRoutes,
    testCardRoutes,
    testGameRoutes,
    testMatchmakingRoutes
  ];

  let passed = 0;
  let total = tests.length;

  for (const test of tests) {
    try {
      const result = await test();
      if (result !== false) passed++;
    } catch (error) {
      console.error('❌ Test failed with error:', error.message);
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n' + '=' .repeat(50));
  console.log(`🎯 Tests Completed: ${passed}/${total} passed`);
  console.log('=' .repeat(50));
}

// Check if server is running first
async function checkServer() {
  try {
    const response = await makeRequest('GET', '/health');
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

// Run tests
async function main() {
  console.log('Checking if server is running...');
  
  const isRunning = await checkServer();
  
  if (!isRunning) {
    console.error('❌ Server is not running on http://localhost:8000');
    console.error('Please start the server with: npm run dev');
    process.exit(1);
  }
  
  console.log('✅ Server is running!');
  await runAllTests();
}

main().catch(console.error);
