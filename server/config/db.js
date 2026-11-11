const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const Service = require('../models/Service');

let connectionPromise;

async function connectDB() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured');
  }
  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      dbName: 'riyaa_makeover',
    }).then(async () => {
      console.log('[MongoDB] Connected');
      await seedServices();
      return mongoose.connection;
    }).catch((error) => {
      connectionPromise = null;
      throw error;
    });
  }
  return connectionPromise;
}

async function seedServices() {
  const count = await Service.countDocuments();
  if (count > 0) return;
  const datasetPath = path.join(__dirname, '../../data/beauty_services_dataset.json');
  if (!fs.existsSync(datasetPath)) return;
  const services = JSON.parse(fs.readFileSync(datasetPath, 'utf8')).map((s) => ({
    serviceId: s.id,
    name: s.name,
    category: s.category,
    priceRange: s.price_range,
    duration: s.duration,
    description: s.description || '',
    benefits: s.benefits || [],
    process: s.process || [],
  }));
  if (services.length) await Service.insertMany(services);
}

module.exports = connectDB;
