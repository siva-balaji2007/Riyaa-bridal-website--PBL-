const express = require('express');
const router = express.Router();
const {
  getAllAppointments,
  getDashboardStats,
  getTodayAppointments,
  getUpcomingAppointments,
  updateAppointmentStatus,
  getCustomerHistory,
  verifyRecords,
  cleanupTestData,
} = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleCheck');

// Protect all admin routes
router.use(authenticateToken);
router.use(requireAdmin);

router.get('/appointments', getAllAppointments);
router.get('/stats', getDashboardStats);
router.get('/appointments/today', getTodayAppointments);
router.get('/appointments/upcoming', getUpcomingAppointments);
router.put('/appointments/:id/status', updateAppointmentStatus);
router.get('/customers/history', getCustomerHistory);
router.get('/verify-records', verifyRecords);
router.delete('/cleanup-test-data', cleanupTestData);

module.exports = router;
