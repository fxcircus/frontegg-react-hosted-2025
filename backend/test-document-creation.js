require('dotenv').config();
const axios = require('axios');

// Get a user token first (you'll need to provide this)
const USER_TOKEN = process.argv[2];

if (!USER_TOKEN) {
  console.log('Usage: node test-document-creation.js YOUR_JWT_TOKEN');
  console.log('Get your token from browser DevTools: Application → Local Storage → frontegg → user → accessToken');
  process.exit(1);
}

async function testDocumentCreation() {
  try {
    console.log('Creating a test document...\n');

    // Create document
    const response = await axios.post('http://localhost:5000/api/documents', {
      title: 'Test Document ' + new Date().toISOString(),
      content: 'This is a test document to verify ReBAC associations work'
    }, {
      headers: {
        'Authorization': `Bearer ${USER_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Document created successfully!');
    console.log('Document ID:', response.data.document.id);
    console.log('Owner ID:', response.data.document.ownerId);

    // Try to fetch it back
    const getResponse = await axios.get(`http://localhost:5000/api/documents/${response.data.document.id}`, {
      headers: {
        'Authorization': `Bearer ${USER_TOKEN}`
      }
    });

    console.log('\n✅ Document retrieved successfully!');
    console.log('This means ReBAC associations are working.');

    // List all documents
    const listResponse = await axios.get('http://localhost:5000/api/documents', {
      headers: {
        'Authorization': `Bearer ${USER_TOKEN}`
      }
    });

    console.log('\n📄 Your accessible documents:', listResponse.data.documents.length);

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.status === 403) {
      console.log('\nThis might mean:');
      console.log('1. ReBAC associations are not being created');
      console.log('2. The user token doesn\'t have permission to create associations');
      console.log('3. ReBAC is not properly configured in Frontegg Portal');
    }
  }
}

testDocumentCreation();