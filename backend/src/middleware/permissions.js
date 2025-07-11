// Frontegg Permission Middleware
// This middleware checks if the authenticated user has the required permissions

const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    // Ensure user is authenticated first
    if (!req.frontegg || !req.frontegg.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please provide a valid JWT token'
      });
    }

    // Get user permissions from the JWT
    // Permissions can be in different places depending on Frontegg configuration
    const user = req.frontegg.user;
    const permissions = user.permissions || user.roles?.flatMap(role => role.permissions || []) || [];
    
    // Log for debugging
    console.log(`Checking permission: ${requiredPermission}`);
    console.log(`User permissions:`, permissions);

    // Check if user has the required permission
    const hasPermission = Array.isArray(permissions) && permissions.includes(requiredPermission);

    if (!hasPermission) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        message: `This action requires the '${requiredPermission}' permission`,
        required: requiredPermission,
        hint: 'Contact your administrator to request this permission'
      });
    }

    // Permission granted, continue to next middleware
    next();
  };
};

// Convenience functions for common permissions
const pokemonPermissions = {
  catch: checkPermission('pokemon.catch'),
  view: checkPermission('pokemon.view'),
  trade: checkPermission('pokemon.trade')
};

// Check multiple permissions (user must have ALL)
const checkAllPermissions = (...permissions) => {
  return (req, res, next) => {
    const middlewares = permissions.map(p => checkPermission(p));
    
    // Execute all permission checks
    let index = 0;
    const executeNext = (err) => {
      if (err) return next(err);
      if (index >= middlewares.length) return next();
      
      const middleware = middlewares[index++];
      middleware(req, res, executeNext);
    };
    
    executeNext();
  };
};

// Check if user has ANY of the permissions
const checkAnyPermission = (...permissions) => {
  return (req, res, next) => {
    if (!req.frontegg || !req.frontegg.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please provide a valid JWT token'
      });
    }

    const user = req.frontegg.user;
    const userPermissions = user.permissions || user.roles?.flatMap(role => role.permissions || []) || [];
    
    const hasAnyPermission = permissions.some(permission => 
      Array.isArray(userPermissions) && userPermissions.includes(permission)
    );

    if (!hasAnyPermission) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        message: `This action requires one of: ${permissions.join(', ')}`,
        required: permissions,
        hint: 'Contact your administrator to request these permissions'
      });
    }

    next();
  };
};

module.exports = {
  checkPermission,
  checkAllPermissions,
  checkAnyPermission,
  pokemonPermissions
};