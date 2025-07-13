require('dotenv').config();
const axios = require('axios');

// Test script to diagnose ReBAC issues
async function testReBAC() {
  console.log('\n🔍 Testing ReBAC Configuration...\n');

  const baseUrl = process.env.FRONTEGG_BASE_URL;
  const clientId = process.env.FRONTEGG_CLIENT_ID;
  const apiKey = process.env.FRONTEGG_API_KEY;

  console.log('Environment:');
  console.log(`  Base URL: ${baseUrl}`);
  console.log(`  Client ID: ${clientId}`);
  console.log(`  API Key: ${apiKey ? '✓ Present' : '✗ Missing'}`);

  // Test 1: Check API credentials
  console.log('\n1. Testing API Credentials...');
  try {
    // Try a simple API call to verify credentials
    const response = await axios.get(`${baseUrl}/identity/resources/auth/v1/user`, {
      headers: {
        'frontegg-client-id': clientId,
        'frontegg-api-key': apiKey
      }
    });
    console.log('   ✅ API credentials are valid');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('   ❌ API credentials are invalid');
    } else {
      // Try alternate endpoint
      try {
        const response2 = await axios.get(`${baseUrl}/.well-known/openid-configuration`);
        console.log('   ✅ Can reach Frontegg API (credentials might be valid)');
      } catch (e) {
        console.log('   ❌ Cannot reach Frontegg API:', error.message);
        return;
      }
    }
  }

  // Test 2: Check ReBAC configuration
  console.log('\n2. Checking ReBAC Configuration...');
  try {
    const response = await axios.get(`${baseUrl}/resources/configurations/v1/entitlements/rebac`, {
      headers: {
        'frontegg-client-id': clientId,
        'frontegg-api-key': apiKey
      }
    });
    
    const config = response.data;
    console.log('   ✅ ReBAC is configured');
    
    // Check for document entity
    const documentEntity = config.entities?.find(e => e.key === 'document');
    if (documentEntity) {
      console.log('   ✅ Document entity found');
      console.log(`      Relations: ${documentEntity.relations?.map(r => r.key).join(', ') || 'none'}`);
      console.log(`      Actions: ${documentEntity.actions?.map(a => a.key).join(', ') || 'none'}`);
    } else {
      console.log('   ❌ Document entity not found');
    }
  } catch (error) {
    console.log('   ❌ ReBAC configuration check failed:', error.response?.status, error.response?.data?.errors?.[0]?.message || error.message);
  }

  // Test 3: Try to create a test association
  console.log('\n3. Testing Association Creation...');
  const testUserId = 'test-user-' + Date.now();
  const testDocId = 'test-doc-' + Date.now();
  
  try {
    const response = await axios.post(`${baseUrl}/resources/relations/v1/assign`, {
      assignments: [{
        subjectEntityTypeKey: 'user',
        subjectKey: testUserId,
        relationKey: 'owner',
        targetEntityTypeKey: 'document',
        targetKey: testDocId
      }]
    }, {
      headers: {
        'frontegg-client-id': clientId,
        'frontegg-api-key': apiKey
      }
    });
    console.log('   ✅ API credentials CAN create associations');
    
    // Clean up
    await axios.post(`${baseUrl}/resources/relations/v1/unassign`, {
      assignments: [{
        subjectEntityTypeKey: 'user',
        subjectKey: testUserId,
        relationKey: 'owner',
        targetEntityTypeKey: 'document',
        targetKey: testDocId
      }]
    }, {
      headers: {
        'frontegg-client-id': clientId,
        'frontegg-api-key': apiKey
      }
    });
  } catch (error) {
    console.log('   ❌ Association creation failed:', error.response?.status);
    if (error.response?.status === 403) {
      console.log('      Your API credentials do not have permission to create associations.');
      console.log('      Solution: Grant ReBAC permissions to your API token in Frontegg Portal');
    }
    console.log('      Error:', error.response?.data?.errors?.[0]?.message || error.message);
  }

  // Test 4: Check Entitlements Agent
  console.log('\n4. Checking Entitlements Agent...');
  try {
    const agentUrl = process.env.ENTITLEMENTS_AGENT_URL || 'http://localhost:8181';
    const response = await axios.get(`${agentUrl}/health`, { timeout: 2000 });
    console.log('   ✅ Entitlements Agent is running');
  } catch (error) {
    console.log('   ⚠️  Entitlements Agent not accessible');
    console.log('      Run: docker-compose up -d');
  }

  console.log('\n📋 Summary:');
  console.log('   If association creation failed with 403, you need to:');
  console.log('   1. Go to Frontegg Portal → Settings → API Tokens');
  console.log('   2. Find your API key/M2M client');
  console.log('   3. Add ReBAC/Entitlements permissions');
  console.log('   4. Or use user tokens instead of API credentials (already implemented as fallback)');
}

testReBAC().catch(console.error);