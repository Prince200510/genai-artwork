require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const path = require('path');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/error');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const recommendationRoutes = require('./routes/recommendations');
const orderRoutes = require('./routes/orders');

const app = express();
connectDB();
app.use(helmet());
app.use(compression());

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// Support text/plain JSON payloads (some clients send wrong Content-Type)
app.use(express.text({ type: 'text/plain', limit: '10mb' }));

// Debug middleware for profile update body issues
app.use((req, res, next) => {
  if (req.path.startsWith('/api/auth/profile') && req.method === 'PUT') {
    console.log('DEBUG: Incoming PUT', req.path, 'Content-Type:', req.headers['content-type']);
    console.log('DEBUG: Parsed body at middleware stage:', req.body);
  }
  next();
});

// Serve static files with proper CORS headers
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
}, express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/orders', orderRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ArtisanHub API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`ArtisanHub Backend Server Running
Port: ${PORT}
Environment: ${process.env.NODE_ENV}
API Base URL: http://localhost:${PORT}/api
Health Check: http://localhost:${PORT}/api/health
`);
});

process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejection:', err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = app;