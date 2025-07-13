require('dotenv').config();
const axios = require('axios');

async function testFronteggAuth() {
  console.log('🔍 Testing Frontegg Authentication Flow\n');

  const baseUrl = process.env.FRONTEGG_BASE_URL;
  const clientId = process.env.FRONTEGG_CLIENT_ID;
  const apiKey = process.env.FRONTEGG_API_KEY;

  console.log('Using:');
  console.log(`  Base URL: ${baseUrl}`);
  console.log(`  Client ID: ${clientId}`);

  // Step 1: Get an access token using client credentials
  console.log('\n1. Getting access token with client credentials...');
  
  try {
    // Try the M2M authentication endpoint
    const tokenResponse = await axios.post(
      `${baseUrl}/auth/v1/api-token/token`,
      {
        clientId: clientId,
        secret: apiKey
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Got access token!');
    const accessToken = tokenResponse.data.accessToken || tokenResponse.data.access_token;
    console.log('Token type:', tokenResponse.data.tokenType || tokenResponse.data.token_type);
    console.log('Expires in:', tokenResponse.data.expiresIn || tokenResponse.data.expires_in);
    
    // Step 2: Use the token to make ReBAC API calls
    console.log('\n2. Testing ReBAC API with access token...');
    
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
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ ReBAC assignment successful with token!');
      console.log('Response:', JSON.stringify(response.data, null, 2));
      
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
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
    } catch (error) {
      console.log('❌ ReBAC API failed even with token');
      console.log('Status:', error.response?.status);
      console.log('Error:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.log('❌ Failed to get access token');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data || error.message);
    
    // Try alternate endpoints
    console.log('\n3. Trying alternate authentication endpoints...');
    
    const alternateEndpoints = [
      '/auth/v1/resources/auth/api-token',
      '/identity/resources/auth/v1/api-token',
      '/auth/v1/m2m/token',
      '/oauth/token'
    ];
    
    for (const endpoint of alternateEndpoints) {
      try {
        console.log(`\nTrying ${endpoint}...`);
        const response = await axios.post(
          `${baseUrl}${endpoint}`,
          {
            clientId: clientId,
            secret: apiKey,
            client_id: clientId,
            client_secret: apiKey,
            grant_type: 'client_credentials'
          },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        console.log('✅ Success! This endpoint works');
        break;
      } catch (e) {
        console.log(`❌ Failed: ${e.response?.status || e.message}`);
      }
    }
  }

  console.log('\n💡 Note: If all authentication attempts fail, it might mean:');
  console.log('   1. The API credentials are not M2M (machine-to-machine) tokens');
  console.log('   2. ReBAC requires user context, not API credentials');
  console.log('   3. The ReBAC API endpoints are different for your Frontegg setup');
}

testFronteggAuth().catch(console.error);