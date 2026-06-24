const express = require('express');
const router = express.Router();
const { getBudgets, upsertBudget, deleteBudget } = require('../controllers/budgetController');
const { validateBudget } = require('../validators/budgetValidator');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Budgets
 *   description: Category expense budgets management
 */

router.use(protect);

/**
 * @swagger
 * /budgets:
 *   get:
 *     summary: Retrieve user budgets list (filtered by month)
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         schema:
 *           type: string
 *           pattern: '^\d{4}-\d{2}$'
 *         description: Budget month filter (YYYY-MM)
 *         example: '2026-06'
 *     responses:
 *       200:
 *         description: List of budgets retrieved successfully
 *       401:
 *         description: Unauthorized
 */
/**
 * @swagger
 * /budgets:
 *   post:
 *     summary: Create or update a budget limit for a category and month
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category
 *               - limitAmount
 *               - month
 *             properties:
 *               category:
 *                 type: string
 *                 example: Groceries
 *               limitAmount:
 *                 type: number
 *                 example: 500
 *               month:
 *                 type: string
 *                 pattern: '^\d{4}-\d{2}$'
 *                 example: '2026-06'
 *     responses:
 *       201:
 *         description: Budget created or updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.route('/')
  .get(getBudgets)
  .post(validateBudget, upsertBudget);

/**
 * @swagger
 * /budgets/{id}:
 *   delete:
 *     summary: Remove a category budget limit record
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Budget Object ID
 *     responses:
 *       200:
 *         description: Budget deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Budget not found
 */
router.route('/:id')
  .delete(deleteBudget);

module.exports = router;
