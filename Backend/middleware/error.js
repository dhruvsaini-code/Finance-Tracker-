const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || err.status || 500;

  // Log the complete stack trace and details to Winston
  logger.error(`${req.method} ${req.originalUrl} - Error: ${err.message}`, {
    requestId: req.requestId,
    stack: err.stack,
    userId: req.user ? req.user._id : undefined
  });

  // Mongoose bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = new Error(message);
    error.statusCode = 404;
  }

  // Mongoose duplicate key (11000)
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new Error(message);
    error.statusCode = 400;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new Error(message);
    error.statusCode = 400;
  }

  // JWT / Auth errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Not authorized, token validation failed';
    error = new Error(message);
    error.statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Not authorized, token has expired';
    error = new Error(message);
    error.statusCode = 401;
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal Server Error',
    requestId: req.requestId
  });
};

module.exports = errorHandler;
