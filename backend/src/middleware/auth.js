const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

// Create JWKS client for Frontegg
const client = jwksClient({
  jwksUri: `${process.env.FRONTEGG_BASE_URL}/.well-known/jwks.json`,
  cache: true,
  rateLimit: true
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
    issuer: process.env.FRONTEGG_BASE_URL
  }, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    // Add user info to request
    req.frontegg = {
      user: decoded
    };
    
    next();
  });
};

module.exports = {
  authenticate
};