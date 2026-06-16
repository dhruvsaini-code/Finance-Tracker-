const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// Load env variables from env/.env relative to Backend folder
dotenv.config({ path: path.join(__dirname, '../env/.env') });

// Connect to Database
connectDB();

const app = express();

// Enable CORS
app.use(cors({
  origin: '*', // For local dev, allows any frontend to connect.
  credentials: true
}));

// Body parser
app.use(express.json());

// Set up Router mappings
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/budgets', require('./routes/budgetRoutes'));
app.use('/api/savings', require('./routes/savingsRoutes'));

// Root path diagnostic route
app.get('/', (req, res) => {
  res.json({ message: 'Finance Tracker API is running successfully' });
});

// Use Global Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
