const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {
  createAppointment,
  getMyAppointments,
  getAppointmentById,
  cancelAppointment,
} = require('../controllers/appointmentController');
const { authenticateToken } = require('../middleware/auth');

// Optional auth middleware: Attaches req.user if Bearer token is provided
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) return next();

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'riyaa_bridal_makeover_secret_jwt_2026_pbl_college'
    );
    const user = await User.findById(decoded.id).select('-password');
    if (user) {
      req.user = user;
    }
  } catch (err) {
    // Ignore invalid token for optional auth
  }
  next();
};

router.post('/', optionalAuth, createAppointment);
router.get('/my', authenticateToken, getMyAppointments);
router.get('/:id', authenticateToken, getAppointmentById);
router.put('/:id/cancel', authenticateToken, cancelAppointment);

module.exports = router;
