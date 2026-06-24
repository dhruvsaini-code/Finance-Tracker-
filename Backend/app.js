const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');

// Load env variables from env/.env first
dotenv.config({ path: path.join(__dirname, '../env/.env') });

// Validate environment configurations using Zod schema
const validateEnv = require('./config/envSchema');
validateEnv();

// Connect to Database
const connectDB = require('./config/db');
connectDB();

// Initialize logs and core helpers
const logger = require('./config/logger');
const requestId = require('./middleware/requestId');
const errorHandler = require('./middleware/error');
const setupSwagger = require('./config/swagger');

const app = express();

// 1. Set Security HTTP Headers
app.use(helmet());

// 2. Cookie Parser
app.use(cookieParser());

// 3. Body Parser and NoSQL Query Injection Defense
app.use(express.json());
app.use(mongoSanitize());

// 4. Request Trace IDs
app.use(requestId);

// HTTP Access Logging Middleware
app.use((req, res, next) => {
  logger.http(`${req.method} ${req.originalUrl} - IP: ${req.ip}`, { requestId: req.requestId });
  next();
});

// 5. Rate Limiter (Max 200 requests per 15 minutes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api', limiter);

// 6. CORS Configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:80', 'http://localhost'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Setup Swagger interactive API UI
setupSwagger(app);

// Setup Router mappings
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/budgets', require('./routes/budgetRoutes'));
app.use('/api/savings', require('./routes/savingsRoutes'));

// Health check endpoint for container probes
app.get('/health', (req, res) => {
  const mongoose = require('mongoose');
  const dbStatus = mongoose.connection.readyState === 1 ? 'healthy' : 'unhealthy';
  res.json({
    status: 'UP',
    timestamp: new Date(),
    services: {
      database: dbStatus
    }
  });
});

// Diagnostic route
app.get('/', (req, res) => {
  res.json({ message: 'AI-powered Finance Tracker Production API. View docs at /api-docs' });
});

// Use Global Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  
  // Initialize background tasks scheduler
  const initScheduler = require('./config/scheduler');
  initScheduler();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection Error: ${err.message}`, { stack: err.stack });
  server.close(() => process.exit(1));
});
