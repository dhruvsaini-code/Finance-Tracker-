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
const {
  getRecurringTransactions,
  createRecurringTransaction,
  updateRecurringTransaction,
  deleteRecurringTransaction
} = require('../controllers/recurringTransactionController');
const { validateTransaction } = require('../validators/transactionValidator');
const { validateRecurringTransaction } = require('../validators/recurringTransactionValidator');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Transactions
 *   description: Personal financial ledger transactions management
 */

router.use(protect);

/**
 * @swagger
 * /transactions:
 *   get:
 *     summary: Retrieve user transactions list (filtered & paginated)
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [income, expense]
 *         description: Filter by income or expense
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by budget category
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search description and notes
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter start date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter end date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: List of transactions retrieved successfully
 *       401:
 *         description: Unauthorized
 */
/**
 * @swagger
 * /transactions:
 *   post:
 *     summary: Create a new financial transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - description
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 25.50
 *               description:
 *                 type: string
 *                 example: Whole Foods grocer run
 *               category:
 *                 type: string
 *                 example: Groceries
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *                 example: expense
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: '2026-06-24T00:00:00.000Z'
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ['food', 'organic']
 *               notes:
 *                 type: string
 *                 example: Weekly grocery supply
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.route('/')
  .get(getTransactions)
  .post(validateTransaction, createTransaction);

/**
 * @swagger
 * /transactions/recurring:
 *   get:
 *     summary: Retrieve user's recurring transactions templates
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of recurring transactions retrieved successfully
 *       401:
 *         description: Unauthorized
 */
/**
 * @swagger
 * /transactions/recurring:
 *   post:
 *     summary: Create a new recurring transaction scheduler entry
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - description
 *               - category
 *               - frequency
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 15.99
 *               description:
 *                 type: string
 *                 example: Netflix Subscription
 *               category:
 *                 type: string
 *                 example: Entertainment
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *                 example: expense
 *               frequency:
 *                 type: string
 *                 enum: [daily, weekly, monthly, yearly]
 *                 example: monthly
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: '2026-06-24'
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ['bills', 'streaming']
 *               notes:
 *                 type: string
 *                 example: Shared plan Netflix
 *     responses:
 *       201:
 *         description: Recurring transaction created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.route('/recurring')
  .get(getRecurringTransactions)
  .post(validateRecurringTransaction, createRecurringTransaction);

/**
 * @swagger
 * /transactions/recurring/{id}:
 *   put:
 *     summary: Update an existing recurring transaction record
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Recurring Transaction ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *               frequency:
 *                 type: string
 *                 enum: [daily, weekly, monthly, yearly]
 *               startDate:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               notes:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Recurring transaction updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
/**
 * @swagger
 * /transactions/recurring/{id}:
 *   delete:
 *     summary: Delete a recurring transaction record
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Recurring Transaction ID
 *     responses:
 *       200:
 *         description: Recurring transaction deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
router.route('/recurring/:id')
  .put(validateRecurringTransaction, updateRecurringTransaction)
  .delete(deleteRecurringTransaction);

/**
 * @swagger
 * /transactions/stats:
 *   get:
 *     summary: Get transaction statistics, aggregate balance, and trends
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Aggregated stats retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/stats', getTransactionStats);

/**
 * @swagger
 * /transactions/ai-insights:
 *   get:
 *     summary: Get AI wealth insights, budgeting recommendations, and predictions
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Insights retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/ai-insights', getAIInsights);

/**
 * @swagger
 * /transactions/{id}:
 *   put:
 *     summary: Update an existing transaction record
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction Object ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *               date:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Transaction updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Transaction not found
 */
/**
 * @swagger
 * /transactions/{id}:
 *   delete:
 *     summary: Delete a transaction record
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction Object ID
 *     responses:
 *       200:
 *         description: Transaction deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Transaction not found
 */
router.route('/:id')
  .put(validateTransaction, updateTransaction)
  .delete(deleteTransaction);

module.exports = router;
