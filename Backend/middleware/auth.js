const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../config/logger');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_finance_tracker_key_123456');

      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        const error = new Error('Not authorized, user not found');
        error.statusCode = 401;
        return next(error);
      }

      next();
    } catch (error) {
      logger.warn(`JWT verification failed for IP ${req.ip}: ${error.message}`, { requestId: req.requestId });
      error.statusCode = 401;
      return next(error);
    }
  }

  if (!token) {
    const error = new Error('Not authorized, no token provided');
    error.statusCode = 401;
    return next(error);
  }
};

module.exports = { protect };
