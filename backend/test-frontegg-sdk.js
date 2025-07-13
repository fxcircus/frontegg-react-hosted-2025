require('dotenv').config();
const { FronteggContext } = require('@frontegg/client');
const { FronteggApiClient } = require('@frontegg/rest-api');

async function testFronteggSDK() {
  console.log('🔍 Testing Frontegg SDK Approach\n');

  const clientId = process.env.FRONTEGG_CLIENT_ID;
  const apiKey = process.env.FRONTEGG_API_KEY;
  const baseUrl = process.env.FRONTEGG_BASE_URL;

  try {
    // Initialize Frontegg SDK
    console.log('1. Initializing Frontegg SDK...');
    
    FronteggContext.init({
      baseUrl: baseUrl,
      clientId: clientId,
      appId: clientId // Sometimes appId is same as clientId
    });

    // Try creating API client
    const apiClient = new FronteggApiClient({
      baseUrl: baseUrl,
      clientId: clientId,
      apiKey: apiKey
    });

    console.log('✅ SDK initialized');

    // Test if we can make API calls
    console.log('\n2. Testing API calls with SDK...');
    
    // The SDK might handle authentication differently
    // Let's see what methods are available
    console.log('Available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(apiClient)));
    
  } catch (error) {
    console.log('❌ SDK initialization failed:', error.message);
  }

  // Based on the documentation, it seems ReBAC requires user context
  console.log('\n💡 Key Insight:');
  console.log('   ReBAC (Relationship-Based Access Control) is designed to work with user tokens');
  console.log('   because it manages relationships between users and resources.');
  console.log('   ');
  console.log('   The correct flow appears to be:');
  console.log('   1. User logs in and gets a JWT token');
  console.log('   2. Backend uses that user token to create ReBAC relationships');
  console.log('   3. This ensures users can only create relationships for themselves');
  console.log('   ');
  console.log('   Your API credentials are for server-to-server auth (like JWT verification)');
  console.log('   but not for creating user-specific ReBAC relationships.');
}

testFronteggSDK().catch(console.error);