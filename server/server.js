const express = require('express');
const cors = require('cors');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'https://riyaa-bridal-website.vercel.app',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    const isVercelPreview = origin &&
      /^https:\/\/riyaa-bridal-website(?:-[a-z0-9-]+)?\.vercel\.app$/.test(origin);
    if (!origin || allowedOrigins.includes(origin) || isVercelPreview) {
      return callback(null, true);
    }
    return callback(new Error('Origin not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/images', express.static(path.join(__dirname, '../images')));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Riyaa Bridal Makeover API is running',
    timestamp: new Date().toISOString(),
  });
});

app.use(errorHandler);

module.exports = app;
