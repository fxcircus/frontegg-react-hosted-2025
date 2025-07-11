# Backend SDK Demo - API Protection with Frontegg

## Overview

This demo showcases how to protect your backend APIs using Frontegg's authentication and authorization features. While we use a fun Pokemon game as the example, the patterns demonstrated here apply to any backend API that needs:

- 🔐 **JWT-based authentication** - Verify user identity
- 👮 **Permission-based authorization** - Control what users can do
- 👥 **User-specific data isolation** - Keep user data separate
- 🤝 **Secure user interactions** - Enable safe user-to-user features

## Why This Matters for Your Application

Every SaaS application needs to:
1. **Verify users are who they claim to be** (Authentication)
2. **Control what actions users can perform** (Authorization)
3. **Protect sensitive API endpoints** from unauthorized access
4. **Scale permissions** as your application grows

This demo shows exactly how Frontegg handles all of this for you.

## How Frontegg Protects Your Backend

### The Protection Flow

```
User Request → JWT Verification → Permission Check → Your Business Logic → Response
```

### Step 1: JWT Verification (`/backend/src/middleware/auth.js`)

Every API request includes a JWT token that Frontegg validates:

```javascript
// Your backend automatically:
1. Extracts the Bearer token from Authorization header
2. Fetches Frontegg's public keys (JWKS)
3. Verifies the token signature
4. Validates audience (your app) and issuer (Frontegg)
5. Checks token hasn't expired
```

**Result**: You know the request comes from an authenticated user.

### Step 2: Permission Checking (`/backend/src/middleware/permissions.js`)

After authentication, check what the user can do:

```javascript
// Middleware checks if user has required permission
app.get('/api/pokemon/catch', 
  authenticate,                    // Step 1: Verify JWT
  checkPermission('pokemon.catch'), // Step 2: Check permission
  controller.catch                 // Step 3: Your logic
);
```

**Result**: Only authorized users can access specific endpoints.

## Required Permissions

Configure these permissions in your Frontegg Portal:

### Setting Up Permissions in Frontegg

👉 **Real-World Example**: Replace "Pokemon" with your business entities (e.g., "documents", "reports", "invoices")

1. Log into [Frontegg Portal](https://portal.frontegg.com)
2. Navigate to **[Environment]** → **Authorization** → **Permissions**
3. Click **"Add Permission"** and create:

| Demo Permission | Real-World Equivalent | Use Case |
|-----------------|----------------------|----------|
| `pokemon.catch` | `resource.create` | Creating new resources |
| `pokemon.view` | `resource.read` | Viewing/listing resources |
| `pokemon.trade` | `resource.share` | Sharing between users |

**Example for a Document Management System:**
- `document.create` - Create new documents
- `document.read` - View documents
- `document.share` - Share with other users
- `document.delete` - Delete documents
- `document.export` - Export to PDF/Excel

### Assigning Permissions to Roles

1. Go to **[Environment]** → **Authorization** → **Roles**
2. Create or edit roles:
   - **Pokemon Master**: All permissions (catch, view, trade)
   - **Pokemon Trainer**: catch + view permissions
   - **Pokemon Observer**: view permission only
3. Assign roles to users in **[Environment]** → **Users**

## API Endpoints

### 1. Catch Pokemon
**Endpoint:** `GET /api/pokemon/catch`  
**Permission Required:** `pokemon.catch`  
**Description:** Catch a random Pokemon with rarity-based chances

**Response:**
```json
{
  "success": true,
  "message": "You caught a rare Snorlax!",
  "pokemon": {
    "id": "uuid",
    "name": "Snorlax",
    "type": "normal",
    "rarity": "rare",
    "level": 1,
    "emoji": "😴",
    "caughtAt": "2024-01-20T10:30:00Z"
  },
  "celebratory": "✨ Rare catch! ✨"
}
```

### 2. View Collection
**Endpoint:** `GET /api/pokemon/my-collection`  
**Permission Required:** `pokemon.view`  
**Description:** Get all Pokemon owned by the authenticated user

**Response:**
```json
{
  "success": true,
  "pokemon": [
    {
      "id": "uuid",
      "name": "Pikachu",
      "type": "electric",
      "rarity": "uncommon",
      "level": 1,
      "emoji": "⚡",
      "caughtAt": "2024-01-20T10:00:00Z"
    }
  ],
  "stats": {
    "total": 15,
    "byRarity": {
      "legendary": 1,
      "rare": 2,
      "uncommon": 5,
      "common": 7
    },
    "uniqueTypes": 6
  }
}
```

### 3. Trade Pokemon
**Endpoint:** `POST /api/pokemon/trade/:userId`  
**Permission Required:** `pokemon.trade`  
**Description:** Trade a random Pokemon with another user

**Response:**
```json
{
  "success": true,
  "message": "Trade successful!",
  "trade": {
    "gave": {
      "name": "Charmander",
      "emoji": "🔥",
      "rarity": "uncommon"
    },
    "received": {
      "name": "Squirtle",
      "emoji": "💧",
      "rarity": "uncommon"
    }
  }
}
```

### 4. JWT Verification (No Permission Required)
**Endpoint:** `POST /api/auth/verify-token`  
**Permission Required:** None  
**Description:** Comprehensive JWT validation utility

**Request:**
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIs..."
}
```

**Response:**
```json
{
  "valid": true,
  "decoded": {
    "header": {
      "alg": "RS256",
      "typ": "JWT"
    },
    "payload": {
      "sub": "user-id",
      "email": "user@example.com",
      "aud": "your-client-id",
      "iss": "https://app-xxx.frontegg.com",
      "permissions": ["pokemon.catch", "pokemon.view"],
      "exp": 1234567890
    }
  },
  "validation": {
    "signature": "valid",
    "audience": "valid",
    "issuer": "valid",
    "expiration": "valid"
  }
}
```

## Error Responses

### 401 Unauthorized
```json
{
  "error": "No token provided"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions",
  "message": "This action requires the 'pokemon.catch' permission",
  "required": "pokemon.catch",
  "hint": "Contact your administrator to request this permission"
}
```

## Implementation in Your Application

### 1. Install Frontegg Backend SDK

```bash
npm install @frontegg/client jsonwebtoken jwks-rsa
```

### 2. Create Authentication Middleware

```javascript
// Similar to our auth.js
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const client = jwksClient({
  jwksUri: `${process.env.FRONTEGG_BASE_URL}/.well-known/jwks.json`
});

function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  jwt.verify(token, getKey, {
    algorithms: ['RS256'],
    audience: process.env.FRONTEGG_CLIENT_ID,
    issuer: process.env.FRONTEGG_BASE_URL
  }, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    req.user = decoded;
    next();
  });
}
```

### 3. Create Permission Middleware

```javascript
// Similar to our permissions.js
function requirePermission(permission) {
  return (req, res, next) => {
    const userPermissions = req.user.permissions || [];
    
    if (!userPermissions.includes(permission)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: permission 
      });
    }
    
    next();
  };
}
```

### 4. Protect Your Endpoints

```javascript
// Your actual business endpoints
app.post('/api/invoices', 
  authenticate, 
  requirePermission('invoice.create'),
  createInvoice
);

app.get('/api/reports/:id', 
  authenticate, 
  requirePermission('report.view'),
  getReport
);
```

## Testing the Demo

### Using cURL

1. **Get your JWT token** from the browser's developer tools (Application → Local Storage → frontegg → user → accessToken)

2. **Test the Pokemon endpoints** (or your own):
```bash
curl -X GET http://localhost:5000/api/pokemon/catch \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

3. **View your collection:**
```bash
curl -X GET http://localhost:5000/api/pokemon/my-collection \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

4. **Trade with another user:**
```bash
curl -X POST http://localhost:5000/api/pokemon/trade/OTHER_USER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

## Security Implementation Details

### JWT Validation Process

The authentication middleware performs these checks:

1. **Token Presence**: Ensures Authorization header contains a Bearer token
2. **Signature Verification**: Validates against Frontegg's public keys (JWKS)
3. **Audience Check**: Ensures token was issued for your application
4. **Issuer Verification**: Confirms token came from your Frontegg workspace
5. **Expiration Check**: Rejects expired tokens

### Permission Extraction

Permissions can be in the JWT as:
- Direct array: `permissions: ["pokemon.catch", "pokemon.view"]`
- Within roles: `roles: [{ permissions: ["pokemon.catch"] }]`

The middleware checks both locations for maximum compatibility.

## Troubleshooting

### Common Issues

1. **"No token provided"**
   - Ensure you're sending the Authorization header
   - Format: `Authorization: Bearer <token>`

2. **"Invalid audience"**
   - Token was issued for a different application
   - Check FRONTEGG_CLIENT_ID in backend/.env

3. **"Insufficient permissions"**
   - User doesn't have required permission
   - Check user's roles in Frontegg Portal
   - Ensure permissions are assigned to roles

4. **"Token has expired"**
   - JWT has expired
   - User needs to log in again to get fresh token

## Best Practices for Production

### 1. Permission Design
- **Start simple**: Basic CRUD permissions (create, read, update, delete)
- **Add granularity**: As needed (e.g., `document.read.own` vs `document.read.all`)
- **Group logically**: Use prefixes (`billing.*`, `admin.*`, `report.*`)

### 2. Security Considerations
- **Always validate JWT**: Never trust client-side permission checks alone
- **Use HTTPS**: Protect tokens in transit
- **Token refresh**: Implement token refresh for long sessions
- **Audit logging**: Track who accessed what and when

### 3. Performance Tips
- **Cache JWKS**: Frontegg SDK does this automatically
- **Cache permissions**: For high-traffic endpoints
- **Batch permission checks**: When checking multiple resources

## Common Use Cases

### Multi-Tenant SaaS
```javascript
// Isolate data by tenant
app.get('/api/data', authenticate, (req, res) => {
  const tenantId = req.user.tenantId;
  const data = await getData({ tenantId });
  res.json(data);
});
```

### Role-Based Features
```javascript
// Premium features for specific roles
app.post('/api/export', 
  authenticate,
  requireRole('premium_user'),
  exportData
);
```

### API Rate Limiting
```javascript
// Different limits based on plan
const limits = {
  'free': 100,
  'premium': 1000,
  'enterprise': 10000
};
```

## Integration with Frontend

The frontend checks permissions before enabling UI elements:

```javascript
const userPermissions = user?.permissions || [];
const canCatch = userPermissions.includes('pokemon.catch');

<Button disabled={!canCatch}>
  Catch Pokemon
</Button>
```

This provides immediate user feedback about available actions.