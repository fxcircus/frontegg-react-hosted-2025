#!/usr/bin/env node
// Removes the ReBAC schema this sample app provisions:
//   actions on document, relations on document, document entity, user entity.
//
// Reads creds from backend/.env (same env vars as setup-rebac.js).

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const axios = require('axios');

const {
  FRONTEGG_API_TOKEN_CLIENT_ID,
  FRONTEGG_API_TOKEN_SECRET,
  FRONTEGG_BASE_URL,
  FRONTEGG_REGION,
} = process.env;

if (!FRONTEGG_API_TOKEN_CLIENT_ID || !FRONTEGG_API_TOKEN_SECRET || !FRONTEGG_BASE_URL) {
  console.error('Missing env. Need FRONTEGG_API_TOKEN_CLIENT_ID, FRONTEGG_API_TOKEN_SECRET, FRONTEGG_BASE_URL.');
  process.exit(1);
}

function authHost() {
  const url = FRONTEGG_BASE_URL.toLowerCase();
  if (FRONTEGG_REGION) {
    const r = FRONTEGG_REGION.toLowerCase();
    if (r === 'us') return 'https://api.us.frontegg.com';
    if (r === 'au') return 'https://api.au.frontegg.com';
    if (r === 'ca') return 'https://api.ca.frontegg.com';
    return 'https://api.frontegg.com';
  }
  if (url.includes('.us.')) return 'https://api.us.frontegg.com';
  if (url.includes('.au.')) return 'https://api.au.frontegg.com';
  if (url.includes('.ca.')) return 'https://api.ca.frontegg.com';
  return 'https://api.frontegg.com';
}

async function getVendorToken() {
  const host = authHost();
  const res = await axios.post(`${host}/auth/vendor`, {
    clientId: FRONTEGG_API_TOKEN_CLIENT_ID,
    secret: FRONTEGG_API_TOKEN_SECRET,
  });
  return res.data.token;
}

async function deleteOrSkip(client, path, label) {
  try {
    await client.delete(path);
    console.log(`  ✓ ${label}`);
  } catch (err) {
    const status = err.response?.status;
    if (status === 404) {
      console.log(`  • ${label} — not found, skipping`);
      return;
    }
    console.error(`  ✗ ${label} — ${status} ${JSON.stringify(err.response?.data)}`);
    throw err;
  }
}

async function main() {
  const token = await getVendorToken();
  const apiBase = authHost();
  const client = axios.create({
    baseURL: apiBase,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'frontegg-rebac-demo-teardown/1.0',
    },
  });

  // Order matters: drop dependents (actions, relations) before the entity.
  console.log('Actions on "document":');
  for (const k of ['read', 'write', 'share', 'delete']) {
    await deleteOrSkip(
      client,
      `/entitlements/resources/entity-types/v1/document/actions/${k}`,
      `action "${k}"`,
    );
  }

  console.log('\nRelations on "document":');
  for (const k of ['owner', 'editor', 'viewer']) {
    await deleteOrSkip(
      client,
      `/entitlements/resources/entity-types/v1/document/relations/${k}`,
      `relation "${k}"`,
    );
  }

  console.log('\nEntity types:');
  for (const k of ['document', 'user']) {
    await deleteOrSkip(
      client,
      `/entitlements/resources/entity-types/v1/${k}`,
      `entity "${k}"`,
    );
  }

  console.log('\nDone.');
}

main().catch((err) => {
  if (err.response) {
    console.error(`Fatal: ${err.response.status} ${JSON.stringify(err.response.data)}`);
  } else {
    console.error('Fatal:', err.message);
  }
  process.exit(1);
});
