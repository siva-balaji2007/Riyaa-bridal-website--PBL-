const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const User = require('../models/User');
const { generateAppointmentId } = require('../utils/generateId');

// @desc    Create a new appointment
// @route   POST /api/appointments
// @access  Public or Authenticated
const createAppointment = async (req, res, next) => {
  try {
    const {
      name,
      phone,
      email,
      serviceId,
      appointmentDate,
      appointmentTime,
      numberOfPeople,
      notes,
    } = req.body;

    // 1. Validation
    if (!name || !phone || !email || !serviceId || !appointmentDate || !appointmentTime) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields: name, phone, email, service, date, and time.',
      });
    }

    // Phone format check (at least 10 digits)
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit phone number.',
      });
    }

    // Email format check
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    // Date check: Prevent booking in the past
    const today = new Date().toISOString().split('T')[0];
    if (appointmentDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Appointment date cannot be in the past. Please select today or a future date.',
      });
    }

    // Lookup service details
    const serviceDoc = await Service.findOne({ serviceId });
    const serviceName = serviceDoc ? serviceDoc.name : serviceId;

    // 2. Prevent duplicate booking:
    // Check if the same phone or email already has an active booking on that date & time
    const existingBooking = await Appointment.findOne({
      $or: [{ customerPhone: phone }, { customerEmail: email.toLowerCase() }],
      appointmentDate,
      appointmentTime,
      status: { $ne: 'Cancelled' },
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message:
          'You already have an active appointment scheduled for this date and time slot. Please choose another time or manage your existing booking.',
      });
    }

    // 3. Resolve customer User reference
    let customerId;
    if (req.user) {
      customerId = req.user._id;
    } else {
      // Find or create customer account by email/phone
      let user = await User.findOne({ email: email.toLowerCase().trim() });
      if (!user) {
        user = await User.create({
          name: name.trim(),
          email: email.toLowerCase().trim(),
          phone: phone.trim(),
          password: 'GuestPassword123!', // Random or default guest pass
          role: 'CUSTOMER',
        });
      }
      customerId = user._id;
    }

    // 4. Create appointment
    const appointmentId = generateAppointmentId();

    const appointment = await Appointment.create({
      appointmentId,
      customer: customerId,
      customerName: name.trim(),
      customerPhone: phone.trim(),
      customerEmail: email.toLowerCase().trim(),
      service: serviceDoc ? serviceDoc._id : undefined,
      serviceId,
      serviceName,
      appointmentDate,
      appointmentTime,
      numberOfPeople: Number(numberOfPeople) || 1,
      notes: notes ? notes.trim() : '',
      status: 'Pending',
      paymentStatus: 'Pending',
    });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully!',
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get appointments for the logged-in customer
// @route   GET /api/appointments/my
// @access  Private (Customer)
const getMyAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({
      $or: [{ customer: req.user._id }, { customerEmail: req.user.email }],
    }).sort({ appointmentDate: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
const getAppointmentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { appointmentId: id }],
    }).populate('service customer', 'name email phone');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.',
      });
    }

    // Check authorization: Must be owner or admin
    if (
      req.user.role !== 'ADMIN' &&
      appointment.customer._id.toString() !== req.user._id.toString() &&
      appointment.customerEmail !== req.user.email
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to view this appointment.',
      });
    }

    res.status(200).json({
      success: true,
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel an appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private
const cancelAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { appointmentId: id }],
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.',
      });
    }

    // Only owner or admin can cancel
    if (
      req.user.role !== 'ADMIN' &&
      appointment.customer.toString() !== req.user._id.toString() &&
      appointment.customerEmail !== req.user.email
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You cannot cancel this appointment.',
      });
    }

    appointment.status = 'Cancelled';
    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully.',
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAppointment,
  getMyAppointments,
  getAppointmentById,
  cancelAppointment,
};
