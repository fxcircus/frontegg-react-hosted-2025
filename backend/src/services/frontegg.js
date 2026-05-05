const axios = require('axios');

// Frontegg ReBAC relation management goes through the regional API host
// at `/entitlements/resources/relations/v1/...`, authenticated with a vendor
// (M2M) token — NOT through the workspace URL with a user token.

function regionalApiHost() {
  const region = (process.env.FRONTEGG_REGION || '').toLowerCase();
  if (region === 'us') return 'https://api.us.frontegg.com';
  if (region === 'au') return 'https://api.au.frontegg.com';
  if (region === 'ca') return 'https://api.ca.frontegg.com';

  const url = (process.env.FRONTEGG_BASE_URL || '').toLowerCase();
  if (url.includes('.us.')) return 'https://api.us.frontegg.com';
  if (url.includes('.au.')) return 'https://api.au.frontegg.com';
  if (url.includes('.ca.')) return 'https://api.ca.frontegg.com';
  return 'https://api.frontegg.com';
}

class FronteggService {
  constructor() {
    this.apiClient = null;
    this.vendorToken = null;
    this.vendorTokenExpiresAt = 0;
  }

  initialize() {
    this.apiClient = axios.create({
      baseURL: regionalApiHost(),
      headers: { 'Content-Type': 'application/json' },
    });
  }

  async getVendorToken() {
    // Cache with a 60s safety margin.
    if (this.vendorToken && Date.now() < this.vendorTokenExpiresAt - 60_000) {
      return this.vendorToken;
    }

    const clientId = process.env.FRONTEGG_API_TOKEN_CLIENT_ID;
    const secret = process.env.FRONTEGG_API_TOKEN_SECRET;
    if (!clientId || !secret) {
      throw new Error(
        'Missing FRONTEGG_API_TOKEN_CLIENT_ID / FRONTEGG_API_TOKEN_SECRET in env. ' +
        'Required for ReBAC relation management.'
      );
    }

    const res = await axios.post(
      `${regionalApiHost()}/auth/vendor`,
      { clientId, secret },
      { headers: { 'Content-Type': 'application/json' } }
    );
    this.vendorToken = res.data.token;
    // Frontegg vendor tokens are typically valid for 1h; extract from payload.
    try {
      const payload = JSON.parse(Buffer.from(this.vendorToken.split('.')[1], 'base64').toString());
      this.vendorTokenExpiresAt = (payload.exp || 0) * 1000;
    } catch {
      this.vendorTokenExpiresAt = Date.now() + 30 * 60_000;
    }
    return this.vendorToken;
  }

  async authHeaders() {
    const token = await this.getVendorToken();
    return { Authorization: `Bearer ${token}` };
  }

  async assignRelation(subjectUserId, documentId, relation) {
    const headers = await this.authHeaders();
    const body = {
      assignments: [{
        subjectEntityTypeKey: 'user',
        subjectKey: subjectUserId,
        relationKey: relation,
        targetEntityTypeKey: 'document',
        targetKey: documentId,
      }],
    };

    try {
      const response = await this.apiClient.post(
        '/entitlements/resources/relations/v1/assign',
        body,
        { headers }
      );
      console.log(`✅ ReBAC assign: user=${subjectUserId} ${relation} doc=${documentId}`);
      return response;
    } catch (error) {
      const status = error.response?.status;
      const data = error.response?.data;
      console.error(`❌ ReBAC assign failed (${status}):`, JSON.stringify(data));
      if (status === 404) {
        throw new Error(
          'ReBAC schema not provisioned. Run `npm run rebac:setup` from the backend folder.'
        );
      }
      if (status === 401 || status === 403) {
        throw new Error(
          'ReBAC API auth failed. Check FRONTEGG_API_TOKEN_CLIENT_ID / FRONTEGG_API_TOKEN_SECRET.'
        );
      }
      throw error;
    }
  }

  async unassignRelation(subjectUserId, documentId, relation) {
    const headers = await this.authHeaders();
    const body = {
      assignments: [{
        subjectEntityTypeKey: 'user',
        subjectKey: subjectUserId,
        relationKey: relation,
        targetEntityTypeKey: 'document',
        targetKey: documentId,
      }],
    };
    return this.apiClient.post(
      '/entitlements/resources/relations/v1/unassign',
      body,
      { headers }
    );
  }

  // Kept signature compatible with existing callers (userToken arg ignored).
  async assignOwner(ownerId, documentId, _userTokenIgnored) {
    return this.assignRelation(ownerId, documentId, 'owner');
  }

  async shareDocument(documentId, targetUserId, permission) {
    if (!['viewer', 'editor'].includes(permission)) {
      throw new Error('Invalid permission. Must be "viewer" or "editor"');
    }
    return this.assignRelation(targetUserId, documentId, permission);
  }

  async revokeAccess(documentId, targetUserId, permission) {
    return this.unassignRelation(targetUserId, documentId, permission);
  }

  async revokeAllAccess(documentId, targetUserId) {
    const results = [];
    for (const relation of ['viewer', 'editor']) {
      try {
        const result = await this.unassignRelation(targetUserId, documentId, relation);
        results.push({ relation, success: true, result });
      } catch (error) {
        results.push({ relation, success: false, error: error.message });
      }
    }
    return results;
  }
}

module.exports = new FronteggService();
