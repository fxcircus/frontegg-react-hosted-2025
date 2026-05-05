#!/usr/bin/env node
// Provisions the ReBAC schema this sample app expects:
//   entity:  document
//   relations: owner, editor, viewer  (subject = user)
//   actions: read (owner+editor+viewer), write (owner+editor),
//            share (owner), delete (owner)
//
// Reads credentials from backend/.env — does NOT take them as args.
// Required env vars:
//   FRONTEGG_API_TOKEN_CLIENT_ID  (vendor client id)
//   FRONTEGG_API_TOKEN_SECRET     (vendor secret / API key)
//   FRONTEGG_BASE_URL             (workspace URL — host for schema calls)
// Optional:
//   FRONTEGG_REGION               (us|eu|au|ca — picks the auth host)

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
  console.log(`Auth: POST ${host}/auth/vendor`);
  const res = await axios.post(`${host}/auth/vendor`, {
    clientId: FRONTEGG_API_TOKEN_CLIENT_ID,
    secret: FRONTEGG_API_TOKEN_SECRET,
  });
  if (!res.data?.token) throw new Error(`No token in response: ${JSON.stringify(res.data)}`);
  return res.data.token;
}

// Returns { ok: bool, alreadyExists: bool, error? }
async function postOrSkip(client, path, body, label) {
  try {
    await client.post(path, body);
    console.log(`  ✓ ${label}`);
    return { ok: true };
  } catch (err) {
    const status = err.response?.status;
    const data = err.response?.data;
    // Treat 409 (conflict) and any "already exists"-style 400 as idempotent.
    const exists = status === 409 ||
      (status === 400 && JSON.stringify(data || '').toLowerCase().includes('exist'));
    if (exists) {
      console.log(`  • ${label} — already exists, skipping`);
      return { ok: true, alreadyExists: true };
    }
    console.error(`  ✗ ${label} — ${status} ${JSON.stringify(data)}`);
    return { ok: false, error: err };
  }
}

async function main() {
  const token = await getVendorToken();
  // Schema management goes through the regional API host, NOT the workspace URL —
  // the workspace URL's WAF rejects management calls.
  const apiBase = authHost();
  const client = axios.create({
    baseURL: apiBase,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      // WAF blocks requests without a recognizable UA.
      'User-Agent': 'frontegg-rebac-demo-setup/1.0',
    },
  });
  console.log(`API base: ${apiBase}`);

  console.log('\nEntity types:');
  const entities = [
    { key: 'user',     description: 'A Frontegg user (subject of relations)' },
    { key: 'document', description: 'Sample document for ReBAC demo' },
  ];
  for (const e of entities) {
    const res = await postOrSkip(
      client,
      '/entitlements/resources/entity-types/v1',
      e,
      `entity "${e.key}"`,
    );
    if (!res.ok) process.exit(1);
  }

  console.log('\nRelations on "document":');
  const relations = [
    { key: 'owner',  displayName: 'Owner',  subjectEntityKeys: ['user'] },
    { key: 'editor', displayName: 'Editor', subjectEntityKeys: ['user'] },
    { key: 'viewer', displayName: 'Viewer', subjectEntityKeys: ['user'] },
  ];
  const relRes = await postOrSkip(
    client,
    '/entitlements/resources/entity-types/v1/document/relations',
    { relations },
    `relations: ${relations.map((r) => r.key).join(', ')}`,
  );
  if (!relRes.ok) process.exit(1);

  console.log('\nActions on "document":');
  const actions = [
    { key: 'read',   relationKeys: ['owner', 'editor', 'viewer'] },
    { key: 'write',  relationKeys: ['owner', 'editor'] },
    { key: 'share',  relationKeys: ['owner'] },
    { key: 'delete', relationKeys: ['owner'] },
  ];
  const actRes = await postOrSkip(
    client,
    '/entitlements/resources/entity-types/v1/document/actions',
    { actions },
    `actions: ${actions.map((a) => `${a.key}(${a.relationKeys.join('+')})`).join(', ')}`,
  );
  if (!actRes.ok) process.exit(1);

  console.log('\nDone. Restart the Entitlements Agent so it picks up the schema:');
  console.log('  npm run docker:down && npm run docker:up');
}

main().catch((err) => {
  if (err.response) {
    console.error(`Fatal: ${err.response.status} ${JSON.stringify(err.response.data)}`);
  } else {
    console.error('Fatal:', err.message);
  }
  process.exit(1);
});
