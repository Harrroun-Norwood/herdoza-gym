/**
 * Authentication middleware
 * This middleware will check if a user is authenticated before allowing access to protected routes
 */

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
};

// Middleware to check if user has an active membership
exports.hasActiveMembership = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res
      .status(401)
      .json({ message: "Unauthorized: Please log in first" });
  }

  if (req.user.membershipStatus !== "active") {
    return res
      .status(403)
      .json({
        message: "Forbidden: This action requires an active membership",
      });
  }

  return next();
};

// Admin middleware
const isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  }
  res.status(403).json({ message: 'Forbidden' });
};

module.exports = {
  isAuthenticated,
  isAdmin
};
