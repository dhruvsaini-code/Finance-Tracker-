const express = require('express');
const router = express.Router();
const {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionStats,
  getAIInsights
} = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

// Apply protection to all transaction routes
router.use(protect);

router.route('/')
  .get(getTransactions)
  .post(createTransaction);

router.get('/stats', getTransactionStats);
router.get('/ai-insights', getAIInsights);

router.route('/:id')
  .put(updateTransaction)
  .deleteOne(deleteTransaction);

module.exports = router;
