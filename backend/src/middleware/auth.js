const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

// Create JWKS client for Frontegg
const client = jwksClient({
  jwksUri: `${process.env.FRONTEGG_BASE_URL}/.well-known/jwks.json`,
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 10
});

// Get signing key
function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      callback(err);
    } else {
      const signingKey = key.publicKey || key.rsaPublicKey;
      callback(null, signingKey);
    }
  });
}

// Authentication middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  // Verify JWT
  jwt.verify(token, getKey, {
    algorithms: ['RS256'],
    issuer: process.env.FRONTEGG_BASE_URL,
    audience: process.env.FRONTEGG_CLIENT_ID // Add audience verification
  }, (err, decoded) => {
    if (err) {
      let errorMessage = 'Invalid token';
      if (err.name === 'TokenExpiredError') {
        errorMessage = 'Token has expired';
      } else if (err.name === 'JsonWebTokenError') {
        errorMessage = err.message;
      }
      
      return res.status(401).json({ 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
    
    // Add user info to request
    req.frontegg = {
      user: decoded
    };
    
    next();
  });
};

// Comprehensive JWT verification endpoint
const verifyToken = async (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }
  
  const validation = {
    valid: false,
    decoded: null,
    validation: {
      signature: 'invalid',
      audience: 'invalid',
      issuer: 'invalid',
      expiration: 'invalid',
      notBefore: 'valid',
      format: 'valid'
    },
    errors: []
  };
  
  try {
    // First decode without verification to inspect claims
    const unverified = jwt.decode(token, { complete: true });
    
    if (!unverified) {
      validation.validation.format = 'invalid';
      validation.errors.push('Token format is invalid');
      return res.status(400).json(validation);
    }
    
    // Verify with all checks
    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(token, getKey, {
        algorithms: ['RS256'],
        issuer: process.env.FRONTEGG_BASE_URL,
        audience: process.env.FRONTEGG_CLIENT_ID,
        complete: true
      }, (err, decoded) => {
        if (err) reject(err);
        else resolve(decoded);
      });
    });
    
    // All checks passed
    validation.valid = true;
    validation.validation.signature = 'valid';
    validation.validation.audience = 'valid';
    validation.validation.issuer = 'valid';
    validation.validation.expiration = 'valid';
    
    // Return decoded token info
    validation.decoded = {
      header: decoded.header,
      payload: {
        sub: decoded.payload.sub,
        email: decoded.payload.email,
        name: decoded.payload.name,
        aud: decoded.payload.aud,
        iss: decoded.payload.iss,
        exp: decoded.payload.exp,
        iat: decoded.payload.iat,
        type: decoded.payload.type,
        permissions: decoded.payload.permissions,
        roles: decoded.payload.roles,
        tenantId: decoded.payload.tenantId,
        metadata: decoded.payload.metadata
      },
      signature: decoded.signature.substring(0, 20) + '...'
    };
    
    res.json(validation);
    
  } catch (err) {
    // Specific validation failures
    if (err.name === 'TokenExpiredError') {
      validation.validation.expiration = 'invalid';
      validation.errors.push(`Token expired at ${new Date(err.expiredAt).toISOString()}`);
    } else if (err.name === 'JsonWebTokenError') {
      if (err.message.includes('audience')) {
        validation.validation.audience = 'invalid';
        validation.errors.push(`Invalid audience. Expected: ${process.env.FRONTEGG_CLIENT_ID}`);
      } else if (err.message.includes('issuer')) {
        validation.validation.issuer = 'invalid';
        validation.errors.push(`Invalid issuer. Expected: ${process.env.FRONTEGG_BASE_URL}`);
      } else if (err.message.includes('signature')) {
        validation.validation.signature = 'invalid';
        validation.errors.push('Invalid signature');
      } else {
        validation.errors.push(err.message);
      }
    } else {
      validation.errors.push('Verification failed: ' + err.message);
    }
    
    // Still try to decode for inspection
    try {
      const unverified = jwt.decode(token);
      if (unverified) {
        validation.decoded = {
          payload: {
            sub: unverified.sub,
            email: unverified.email,
            aud: unverified.aud,
            iss: unverified.iss,
            exp: unverified.exp,
            warning: 'This data is unverified'
          }
        };
      }
    } catch (decodeErr) {
      // Ignore decode errors
    }
    
    res.status(200).json(validation); // Return 200 even for invalid tokens
  }
};

module.exports = {
  authenticate,
  verifyToken
};