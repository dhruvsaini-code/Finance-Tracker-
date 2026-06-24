const recurringTransactionService = require('../services/recurringTransactionService');
const logger = require('./logger');

const initScheduler = () => {
  logger.info('Initializing background scheduler...');
  
  // Run on startup (delayed slightly to ensure database connections are fully ready)
  setTimeout(() => {
    recurringTransactionService.processRecurringTransactions();
  }, 5000);
  
  // Run every hour
  const intervalMs = 60 * 60 * 1000;
  setInterval(() => {
    recurringTransactionService.processRecurringTransactions();
  }, intervalMs);
};

module.exports = initScheduler;
