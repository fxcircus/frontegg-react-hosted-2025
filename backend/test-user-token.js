require('dotenv').config();
const axios = require('axios');

// Get user token from command line
const USER_TOKEN = process.argv[2];

if (!USER_TOKEN) {
  console.log('Usage: node test-user-token.js YOUR_JWT_TOKEN');
  console.log('Get your token from browser DevTools: Application → Local Storage → frontegg → user → accessToken');
  process.exit(1);
}

async function testUserToken() {
  const baseUrl = process.env.FRONTEGG_BASE_URL;
  
  console.log('🔍 Testing User Token with Frontegg APIs\n');
  console.log(`Base URL: ${baseUrl}`);
  console.log(`Token preview: ${USER_TOKEN.substring(0, 30)}...`);
  
  // Decode token to see user info
  try {
    const tokenParts = USER_TOKEN.split('.');
    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
    console.log('\n📋 Token Info:');
    console.log(`  User ID: ${payload.sub}`);
    console.log(`  Email: ${payload.email}`);
    console.log(`  Tenant: ${payload.tenantId}`);
    console.log(`  Expires: ${new Date(payload.exp * 1000).toLocaleString()}`);
  } catch (e) {
    console.log('Could not decode token');
  }

  // Test 1: Get user profile
  console.log('\n1. Testing /identity/resources/users/v2/me endpoint...');
  try {
    const response = await axios.get(`${baseUrl}/identity/resources/users/v2/me`, {
      headers: {
        'Authorization': `Bearer ${USER_TOKEN}`
      }
    });
    console.log('✅ User profile endpoint works!');
    console.log(`   User: ${response.data.email}`);
  } catch (error) {
    console.log('❌ User profile failed:', error.response?.status);
  }

  // Test 2: Try ReBAC endpoint
  console.log('\n2. Testing ReBAC assignment endpoint...');
  const testUserId = 'test-user-' + Date.now();
  const testDocId = 'test-doc-' + Date.now();
  
  try {
    const response = await axios.post(
      `${baseUrl}/resources/relations/v1/assign`,
      {
        assignments: [{
          subjectEntityTypeKey: 'user',
          subjectKey: testUserId,
          relationKey: 'owner',
          targetEntityTypeKey: 'document',
          targetKey: testDocId
        }]
      },
      {
        headers: {
          'Authorization': `Bearer ${USER_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ ReBAC assignment works with user token!');
    
    // Clean up
    await axios.post(
      `${baseUrl}/resources/relations/v1/unassign`,
      {
        assignments: [{
          subjectEntityTypeKey: 'user',
          subjectKey: testUserId,
          relationKey: 'owner',
          targetEntityTypeKey: 'document',
          targetKey: testDocId
        }]
      },
      {
        headers: {
          'Authorization': `Bearer ${USER_TOKEN}`
        }
      }
    );
    
  } catch (error) {
    console.log('❌ ReBAC assignment failed:', error.response?.status);
    
    // Try to extract trace ID from HTML
    if (typeof error.response?.data === 'string' && error.response.data.includes('Trace ID:')) {
      const match = error.response.data.match(/Trace ID:\s*([a-f0-9]+)/i);
      if (match) {
        console.log(`📍 Frontegg Trace ID: ${match[1]}`);
      }
    }
    
    // Check headers for trace ID
    const traceId = error.response?.headers?.['frontegg-trace-id'] || 
                   error.response?.headers?.['x-trace-id'];
    if (traceId) {
      console.log(`📍 Trace ID from headers: ${traceId}`);
    }
  }

  // Test 3: Check what permissions the user has
  console.log('\n3. Checking user permissions...');
  try {
    const response = await axios.get(`${baseUrl}/identity/resources/users/v2/me`, {
      headers: {
        'Authorization': `Bearer ${USER_TOKEN}`
      }
    });
    
    if (response.data.permissions) {
      console.log('User permissions:', response.data.permissions);
    }
    if (response.data.roles) {
      console.log('User roles:', response.data.roles.map(r => r.name));
    }
  } catch (error) {
    console.log('Could not fetch user permissions');
  }
}

testUserToken().catch(console.error);