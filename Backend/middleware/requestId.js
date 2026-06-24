const crypto = require('crypto');

const requestId = (req, res, next) => {
  const id = req.header('x-request-id') || crypto.randomUUID();
  req.requestId = id;
  res.setHeader('x-request-id', id);
  next();
};

module.exports = requestId;
