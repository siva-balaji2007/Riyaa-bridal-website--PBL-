const Appointment = require('../models/Appointment');
const User = require('../models/User');

// Helper to get formatted today string: YYYY-MM-DD
const getTodayString = () => new Date().toISOString().split('T')[0];

// @desc    Get all appointments with search & filter
// @route   GET /api/admin/appointments
// @access  Private (Admin)
const getAllAppointments = async (req, res, next) => {
  try {
    const { search, status, service, date, tab } = req.query;
    const today = getTodayString();

    let query = {};

    // Tab shortcuts
    if (tab === 'today') {
      query.appointmentDate = today;
    } else if (tab === 'upcoming') {
      query.appointmentDate = { $gte: today };
      query.status = { $in: ['Pending', 'Confirmed'] };
    } else if (tab === 'completed') {
      query.status = 'Completed';
    } else if (tab === 'cancelled') {
      query.status = 'Cancelled';
    } else if (tab === 'pending') {
      query.status = 'Pending';
    }

    // Status filter
    if (status && status !== 'All' && !query.status) {
      query.status = status;
    }

    // Service filter
    if (service && service !== 'All') {
      query.serviceId = service;
    }

    // Specific date filter
    if (date) {
      query.appointmentDate = date;
    }

    // Search by Name, Phone, Email, or Appointment ID
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { customerName: searchRegex },
        { customerPhone: searchRegex },
        { customerEmail: searchRegex },
        { appointmentId: searchRegex },
      ];
    }

    const appointments = await Appointment.find(query)
      .sort({ appointmentDate: -1, appointmentTime: 1 })
      .lean();

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Dashboard Statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getDashboardStats = async (req, res, next) => {
  try {
    const today = getTodayString();

    const [todayCount, upcomingCount, completedCount, cancelledCount, pendingCount, totalCount] =
      await Promise.all([
        Appointment.countDocuments({ appointmentDate: today }),
        Appointment.countDocuments({
          appointmentDate: { $gte: today },
          status: { $in: ['Pending', 'Confirmed'] },
        }),
        Appointment.countDocuments({ status: 'Completed' }),
        Appointment.countDocuments({ status: 'Cancelled' }),
        Appointment.countDocuments({ status: 'Pending' }),
        Appointment.countDocuments({}),
      ]);

    res.status(200).json({
      success: true,
      stats: {
        today: todayCount,
        upcoming: upcomingCount,
        completed: completedCount,
        cancelled: cancelledCount,
        pending: pendingCount,
        total: totalCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Today's Appointments
// @route   GET /api/admin/appointments/today
// @access  Private (Admin)
const getTodayAppointments = async (req, res, next) => {
  try {
    const today = getTodayString();
    const appointments = await Appointment.find({ appointmentDate: today })
      .sort({ appointmentTime: 1 })
      .lean();

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Upcoming Appointments
// @route   GET /api/admin/appointments/upcoming
// @access  Private (Admin)
const getUpcomingAppointments = async (req, res, next) => {
  try {
    const today = getTodayString();
    const appointments = await Appointment.find({
      appointmentDate: { $gte: today },
      status: { $in: ['Pending', 'Confirmed'] },
    })
      .sort({ appointmentDate: 1, appointmentTime: 1 })
      .lean();

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Appointment Status & Notes
// @route   PUT /api/admin/appointments/:id/status
// @access  Private (Admin)
const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes, paymentStatus, appointmentDate, appointmentTime } = req.body;

    const appointment = await Appointment.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { appointmentId: id }],
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.',
      });
    }

    if (status) appointment.status = status;
    if (notes !== undefined) appointment.notes = notes;
    if (paymentStatus) appointment.paymentStatus = paymentStatus;
    if (appointmentDate) appointment.appointmentDate = appointmentDate;
    if (appointmentTime) appointment.appointmentTime = appointmentTime;

    await appointment.save();

    res.status(200).json({
      success: true,
      message: `Appointment status updated to ${appointment.status}.`,
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Customer History by Query (name, phone, email) or ID
// @route   GET /api/admin/customers/history
// @access  Private (Admin)
const getCustomerHistory = async (req, res, next) => {
  try {
    const { query, customerId } = req.query;

    let customer = null;
    let appointmentFilter = {};

    if (customerId && customerId.match(/^[0-9a-fA-F]{24}$/)) {
      customer = await User.findById(customerId).select('-password');
      if (customer) {
        appointmentFilter = {
          $or: [{ customer: customer._id }, { customerPhone: customer.phone }],
        };
      }
    } else if (query && query.trim() !== '') {
      const q = query.trim();
      const regex = new RegExp(q, 'i');

      // Try to find customer in User table
      customer = await User.findOne({
        $or: [{ name: regex }, { phone: regex }, { email: regex }],
      }).select('-password');

      if (customer) {
        appointmentFilter = {
          $or: [
            { customer: customer._id },
            { customerPhone: customer.phone },
            { customerEmail: customer.email },
          ],
        };
      } else {
        // Search directly in Appointments collection if user wasn't registered
        appointmentFilter = {
          $or: [{ customerName: regex }, { customerPhone: regex }, { customerEmail: regex }],
        };
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please provide a search query (name, phone, or email).',
      });
    }

    const appointments = await Appointment.find(appointmentFilter)
      .sort({ appointmentDate: -1, createdAt: -1 })
      .lean();

    if (!customer && appointments.length > 0) {
      // Build a synthetic customer profile from the appointment records
      const latest = appointments[0];
      customer = {
        name: latest.customerName,
        phone: latest.customerPhone,
        email: latest.customerEmail,
      };
    }

    res.status(200).json({
      success: true,
      customer,
      totalVisits: appointments.length,
      completedVisits: appointments.filter((a) => a.status === 'Completed').length,
      appointments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify database document records directly (for automated test verification)
// @route   GET /api/admin/verify-records
// @access  Private (Admin)
const verifyRecords = async (req, res, next) => {
  try {
    const { email, appointmentId } = req.query;
    const userDoc = email ? await User.findOne({ email }).select('+password').lean() : null;
    const apptDoc = appointmentId ? await Appointment.findOne({ appointmentId }).lean() : null;
    res.status(200).json({
      success: true,
      user: userDoc
        ? {
            _id: userDoc._id,
            name: userDoc.name,
            email: userDoc.email,
            role: userDoc.role,
            isHashed: userDoc.password ? userDoc.password.startsWith('$2') : false,
            passwordPrefix: userDoc.password ? userDoc.password.substring(0, 10) + '...' : null,
            createdAt: userDoc.createdAt,
            updatedAt: userDoc.updatedAt,
          }
        : null,
      appointment: apptDoc,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cleanup test data after end-to-end verification
// @route   DELETE /api/admin/cleanup-test-data
// @access  Private (Admin)
const cleanupTestData = async (req, res, next) => {
  try {
    const { email } = req.query;
    if (email && (email.includes('test') || email.includes('pbl'))) {
      const userRes = await User.deleteMany({ email });
      const apptRes = await Appointment.deleteMany({ customerEmail: email });
      return res.status(200).json({
        success: true,
        message: 'Test data cleaned up successfully.',
        deletedUsers: userRes.deletedCount,
        deletedAppointments: apptRes.deletedCount,
      });
    }
    res.status(400).json({
      success: false,
      message: 'Invalid test email specified for cleanup.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllAppointments,
  getDashboardStats,
  getTodayAppointments,
  getUpcomingAppointments,
  updateAppointmentStatus,
  getCustomerHistory,
  verifyRecords,
  cleanupTestData,
};
