/**
 * Middleware to restrict access to ADMIN / Beautician roles
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Administrator or beautician privilege required.',
    });
  }
  next();
};

module.exports = { requireAdmin };
