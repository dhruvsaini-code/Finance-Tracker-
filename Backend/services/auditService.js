const AuditLog = require('../models/AuditLog');
const logger = require('../config/logger');

const logAudit = async (req, action, details = {}) => {
  try {
    const auditData = {
      user: req.user ? req.user._id : null,
      action,
      method: req.method,
      url: req.originalUrl || req.url,
      status: req.res ? req.res.statusCode : 200,
      ip: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'unknown',
      details,
      requestId: req.requestId
    };

    await AuditLog.create(auditData);
    logger.info(`Audit: User ${auditData.user || 'Anonymous'} performed ${action} [Status: ${auditData.status}]`, {
      requestId: req.requestId
    });
  } catch (error) {
    logger.error(`Audit logging failed: ${error.message}`, { requestId: req.requestId });
  }
};

module.exports = { logAudit };
