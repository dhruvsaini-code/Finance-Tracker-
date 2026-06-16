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
const { validateTransaction } = require('../validators/transactionValidator');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getTransactions)
  .post(validateTransaction, createTransaction);

router.get('/stats', getTransactionStats);
router.get('/ai-insights', getAIInsights);

router.route('/:id')
  .put(validateTransaction, updateTransaction)
  .delete(deleteTransaction);

module.exports = router;
