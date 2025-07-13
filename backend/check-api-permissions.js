require('dotenv').config();
const axios = require('axios');

async function checkAPIPermissions() {
  console.log('🔍 Checking API Credentials and Permissions\n');

  const baseUrl = process.env.FRONTEGG_BASE_URL;
  const clientId = process.env.FRONTEGG_CLIENT_ID;
  const apiKey = process.env.FRONTEGG_API_KEY;

  console.log('Configuration:');
  console.log(`  Base URL: ${baseUrl}`);
  console.log(`  Client ID: ${clientId}`);
  console.log(`  API Key: ${apiKey ? '✓ Present' : '✗ Missing'}\n`);

  const results = {
    apiAccess: false,
    rebacRead: false,
    rebacWrite: false,
    m2mToken: false
  };

  // Test 1: Basic API Access
  console.log('1. Testing Basic API Access...');
  try {
    const response = await axios.get(`${baseUrl}/.well-known/openid-configuration`);
    console.log('   ✅ Can reach Frontegg API');
    results.apiAccess = true;
  } catch (error) {
    console.log('   ❌ Cannot reach Frontegg API:', error.message);
  }

  // Test 2: Testing with header-based authentication (which is what your app uses)
  console.log('\n2. Testing API Authentication...');
  try {
    // Test with the same headers your app uses
    const headers = {
      'frontegg-client-id': clientId,
      'frontegg-api-key': apiKey
    };
    
    // Test a simple endpoint first
    const testResponse = await axios.post(
      `${baseUrl}/resources/relations/v1/assign`,
      {
        assignments: [{
          subjectEntityTypeKey: 'user',
          subjectKey: 'test-user-' + Date.now(),
          relationKey: 'owner',
          targetEntityTypeKey: 'document',
          targetKey: 'test-doc-' + Date.now()
        }]
      },
      { headers }
    );
    
    console.log('   ✅ API credentials work correctly!');
    console.log('   ✅ Can create ReBAC assignments');
    results.m2mToken = true;
    results.rebacWrite = true;
    
    // Clean up
    await axios.post(
      `${baseUrl}/resources/relations/v1/unassign`,
      testResponse.config.data,
      { headers }
    );
    
  } catch (error) {
    console.log('   ❌ API authentication failed:', error.response?.status);
    console.log('   Error:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      console.log('\n   Checking if ReBAC is enabled...');
      
      // Let's check the actual endpoint your app uses
      try {
        const testCall = await axios.get(`${baseUrl}/resources/configurations/v1`, {
          headers: {
            'frontegg-client-id': clientId,
            'frontegg-api-key': apiKey
          }
        });
        console.log('   ✅ API credentials are valid');
        results.m2mToken = true;
        console.log('   ❌ But ReBAC endpoints return 404 - ReBAC might not be enabled');
      } catch (e) {
        console.log('   ❌ API credentials might be invalid');
      }
    }
  }

  // Summary
  console.log('\n📊 Summary:');
  console.log(`   API Access: ${results.apiAccess ? '✅' : '❌'}`);
  console.log(`   M2M Token Valid: ${results.m2mToken ? '✅' : '❌'}`);
  console.log(`   ReBAC Read: ${results.rebacRead ? '✅' : '❌'}`);
  console.log(`   ReBAC Write: ${results.rebacWrite ? '✅' : '❌'}`);

  if (!results.rebacWrite) {
    console.log('\n🔧 To Fix ReBAC Write Permissions:');
    console.log('   1. Go to Frontegg Portal → Settings → API Tokens');
    console.log(`   2. Find your token (Client ID: ${clientId})`);
    console.log('   3. Edit the token and add these permissions:');
    console.log('      - Entitlements: Read');
    console.log('      - Entitlements: Write');
    console.log('      - ReBAC: Manage Relations');
    console.log('   4. Or create a new M2M token with these permissions');
  }
}

checkAPIPermissions().catch(console.error);