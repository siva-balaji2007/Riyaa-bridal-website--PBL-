const dns = require('dns');
// Ensure SRV records for MongoDB Atlas resolve properly on all local network adapters
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (dnsErr) {
  // Ignore if unsupported
}
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Service = require('../models/Service');
const Appointment = require('../models/Appointment');
const { generateAppointmentId } = require('../utils/generateId');

let mongod = null;

async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/riyaa_makeover';

  try {
    // Connect to MongoDB Atlas (5s timeout for remote cloud SSL handshake)
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      dbName: 'riyaa_makeover',
    });
    // Explicit ping to verify outbound port 27017 allows traffic
    await mongoose.connection.db.admin().ping();
    console.log(`[MongoDB] Successfully connected to MongoDB Atlas!`);
    console.log(`[MongoDB] Database: ${mongoose.connection.name} | Host: ${mongoose.connection.host}`);
  } catch (err) {
    try {
      await mongoose.disconnect();
    } catch (dcErr) {}
    console.warn(`[MongoDB] Could not reach external MongoDB Atlas (${err.message}).`);
    console.warn(`[MongoDB] Initializing local persistent MongoDB database at data/mongo_storage...`);

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const dbDir = path.join(__dirname, '../../data/mongo_storage');
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      mongod = await MongoMemoryServer.create({
        instance: {
          dbPath: dbDir,
        },
      });
      const memUri = mongod.getUri();
      await mongoose.connect(memUri, { dbName: 'riyaa_makeover' });
      console.log(`[MongoDB] Connected to persistent local MongoDB at: ${memUri}`);
    } catch (memErr) {
      console.error('[MongoDB] Failed to start local MongoDB:', memErr.message);
      throw memErr;
    }
  }

  // Seed default data if needed
  await seedInitialData();
}

async function seedInitialData() {
  try {
    // 1. Seed Services
    const serviceCount = await Service.countDocuments();
    if (serviceCount === 0) {
      const datasetPath = path.join(__dirname, '../../data/beauty_services_dataset.json');
      if (fs.existsSync(datasetPath)) {
        const rawData = fs.readFileSync(datasetPath, 'utf8');
        const services = JSON.parse(rawData);
        const mappedServices = services.map((s) => ({
          serviceId: s.id,
          name: s.name,
          category: s.category,
          priceRange: s.price_range,
          duration: s.duration,
          description: s.description || '',
          benefits: s.benefits || [],
          process: s.process || [],
        }));

        await Service.insertMany(mappedServices);
        console.log(`[Seed] Seeded ${mappedServices.length} beauty services.`);
      }
    }

    // 2. Seed Default Admin User
    let admin = await User.findOne({ role: 'ADMIN' });
    if (!admin) {
      admin = await User.create({
        name: 'Riyaa Chief Stylist',
        email: 'admin@riyaa.com',
        phone: '9876543210',
        password: 'admin123', // Will be hashed by User pre-save hook
        role: 'ADMIN',
      });
      console.log('[Seed] Seeded default admin user: admin@riyaa.com / admin123');
    }

    // 3. Seed Sample Customer & Sample Appointment History for demonstration
    let customer = await User.findOne({ email: 'priya@example.com' });
    if (!customer) {
      customer = await User.create({
        name: 'Priya Sharma',
        email: 'priya@example.com',
        phone: '9876500001',
        password: 'priya123',
        role: 'CUSTOMER',
      });
      console.log('[Seed] Seeded sample customer: priya@example.com / priya123');

      // Seed historical appointments
      const sampleAppointments = [
        {
          appointmentId: generateAppointmentId(),
          customer: customer._id,
          customerName: customer.name,
          customerPhone: customer.phone,
          customerEmail: customer.email,
          serviceId: 'bridal_makeup',
          serviceName: 'Bridal Makeup',
          appointmentDate: '2026-08-12',
          appointmentTime: '10:00 AM',
          numberOfPeople: 1,
          notes: 'Pre-wedding photoshoot makeup',
          status: 'Completed',
          paymentStatus: 'Paid',
        },
        {
          appointmentId: generateAppointmentId(),
          customer: customer._id,
          customerName: customer.name,
          customerPhone: customer.phone,
          customerEmail: customer.email,
          serviceId: 'hair_spa',
          serviceName: 'Hair Spa',
          appointmentDate: '2026-08-25',
          appointmentTime: '02:00 PM',
          numberOfPeople: 1,
          notes: 'Nourishing scalp massage requested',
          status: 'Completed',
          paymentStatus: 'Paid',
        },
        {
          appointmentId: generateAppointmentId(),
          customer: customer._id,
          customerName: customer.name,
          customerPhone: customer.phone,
          customerEmail: customer.email,
          serviceId: 'bridal_makeup',
          serviceName: 'Bridal Makeup',
          appointmentDate: '2026-09-20',
          appointmentTime: '11:00 AM',
          numberOfPeople: 2,
          notes: 'Main wedding day makeover for bride and bridesmaid',
          status: 'Confirmed',
          paymentStatus: 'Partial',
        },
      ];

      await Appointment.insertMany(sampleAppointments);
      console.log('[Seed] Seeded sample appointment history for Priya Sharma.');
    }
  } catch (seedErr) {
    console.error('[Seed] Error during seeding:', seedErr.message);
  }
}

module.exports = connectDB;
