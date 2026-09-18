const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    customerPhone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      index: true,
    },
    customerEmail: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      index: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
    },
    serviceId: {
      type: String,
      required: true,
    },
    serviceName: {
      type: String,
      required: [true, 'Service name is required'],
    },
    appointmentDate: {
      type: String, // 'YYYY-MM-DD'
      required: [true, 'Appointment date is required'],
      index: true,
    },
    appointmentTime: {
      type: String, // e.g. '10:00 AM'
      required: [true, 'Appointment time is required'],
    },
    numberOfPeople: {
      type: Number,
      default: 1,
      min: 1,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
      default: 'Pending',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Partial', 'Not Required'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for searching and filtering
appointmentSchema.index({ customerPhone: 1, appointmentDate: -1 });
appointmentSchema.index({ customerEmail: 1, appointmentDate: -1 });
appointmentSchema.index({ appointmentDate: 1, appointmentTime: 1 });
appointmentSchema.index({ status: 1, appointmentDate: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
