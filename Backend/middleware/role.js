const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      const error = new Error('Not authenticated');
      error.statusCode = 401;
      return next(error);
    }
    if (!roles.includes(req.user.role)) {
      const error = new Error('Forbidden: You do not have permission to access this resource');
      error.statusCode = 403;
      return next(error);
    }
    next();
  };
};

module.exports = { restrictTo };
