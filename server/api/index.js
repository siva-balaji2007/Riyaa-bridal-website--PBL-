const app = require('../server');
const connectDB = require('../config/db');
const cors = require('cors');

const allowedOrigins = [
  'https://riyaa-bridal-website.vercel.app',
  process.env.CLIENT_URL,
];

const corsOptions = {
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
  optionsSuccessStatus: 204,
};

// Handle CORS/preflight before connecting to MongoDB so OPTIONS requests
// always receive the required CORS headers, even if the database is unavailable.
module.exports = (req, res) => {
  cors(corsOptions)(req, res, async () => {
    if (req.method === 'OPTIONS') return res.status(204).end();
    try {
      await connectDB();
      return app(req, res);
    } catch (error) {
      console.error('[API startup error]', error);
      return res.status(500).json({
        status: 'ERROR',
        message: 'Backend database connection failed',
      });
    }
  });
};
