require('dotenv').config();
const axios = require('axios');

async function testDirectAPI() {
  console.log('🔍 Testing Direct API Call\n');

  const baseUrl = process.env.FRONTEGG_BASE_URL;
  const clientId = process.env.FRONTEGG_CLIENT_ID;
  const apiKey = process.env.FRONTEGG_API_KEY;

  console.log('Using:');
  console.log(`  Base URL: ${baseUrl}`);
  console.log(`  Client ID: ${clientId}`);
  console.log(`  API Key: ${apiKey?.substring(0, 8)}...`);

  // Create axios instance exactly like the app does
  const apiClient = axios.create({
    baseURL: baseUrl,
    headers: {
      'frontegg-client-id': clientId,
      'frontegg-api-key': apiKey
    }
  });

  console.log('\n1. Testing the exact same API call your app makes...');
  
  const testUserId = 'test-user-' + Date.now();
  const testDocId = 'test-doc-' + Date.now();
  
  try {
    const response = await apiClient.post('/resources/relations/v1/assign', {
      assignments: [{
        subjectEntityTypeKey: 'user',
        subjectKey: testUserId,
        relationKey: 'owner',
        targetEntityTypeKey: 'document',
        targetKey: testDocId
      }]
    });
    
    console.log('✅ SUCCESS! API call worked');
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    // Clean up
    await apiClient.post('/resources/relations/v1/unassign', {
      assignments: [{
        subjectEntityTypeKey: 'user',
        subjectKey: testUserId,
        relationKey: 'owner',
        targetEntityTypeKey: 'document',
        targetKey: testDocId
      }]
    });
    
  } catch (error) {
    console.log('❌ API call failed');
    console.log('Status:', error.response?.status);
    console.log('Status Text:', error.response?.statusText);
    console.log('Error Data:', JSON.stringify(error.response?.data, null, 2));
    console.log('Request URL:', error.config?.url);
    console.log('Full URL:', error.config?.baseURL + error.config?.url);
    console.log('Headers sent:', error.config?.headers);
    
    if (error.response?.status === 403) {
      console.log('\n💡 403 Forbidden - This usually means:');
      console.log('   1. API credentials are valid but lack permissions');
      console.log('   2. The endpoint exists but you cannot access it');
    } else if (error.response?.status === 404) {
      console.log('\n💡 404 Not Found - This could mean:');
      console.log('   1. The endpoint URL is incorrect');
      console.log('   2. ReBAC is not enabled for your environment');
      console.log('   3. The API version might be different');
    }
  }

  // Let's also test if the credentials work for other endpoints
  console.log('\n2. Testing if credentials work for other endpoints...');
  try {
    const response = await apiClient.get('/identity/resources/configurations/v2');
    console.log('✅ Credentials work for identity endpoint');
  } catch (error) {
    console.log('❌ Credentials failed for identity endpoint too');
  }
}

testDirectAPI().catch(console.error);