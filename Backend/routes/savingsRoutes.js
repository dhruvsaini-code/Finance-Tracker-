const express = require('express');
const router = express.Router();
const {
  getSavingsGoals,
  createSavingsGoal,
  updateSavingsGoal,
  deleteSavingsGoal
} = require('../controllers/savingsController');
const { validateSavingsGoal } = require('../validators/savingsGoalValidator');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Savings Goals
 *   description: Savings plans and goals progression tracking
 */

router.use(protect);

/**
 * @swagger
 * /savings:
 *   get:
 *     summary: Retrieve user savings goals list
 *     tags: [Savings Goals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of goals retrieved successfully
 *       401:
 *         description: Unauthorized
 */
/**
 * @swagger
 * /savings:
 *   post:
 *     summary: Establish a new savings goal target
 *     tags: [Savings Goals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - targetAmount
 *               - deadline
 *             properties:
 *               title:
 *                 type: string
 *                 example: Emergency Fund
 *               targetAmount:
 *                 type: number
 *                 example: 10000
 *               currentAmount:
 *                 type: number
 *                 example: 1500
 *               deadline:
 *                 type: string
 *                 format: date-time
 *                 example: '2027-06-24T00:00:00.000Z'
 *     responses:
 *       201:
 *         description: Savings goal created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.route('/')
  .get(getSavingsGoals)
  .post(validateSavingsGoal, createSavingsGoal);

/**
 * @swagger
 * /savings/{id}:
 *   put:
 *     summary: Update an existing savings goal or modify current saved balances
 *     tags: [Savings Goals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Savings Goal Object ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               targetAmount:
 *                 type: number
 *               currentAmount:
 *                 type: number
 *               deadline:
 *                 type: string
 *     responses:
 *       200:
 *         description: Savings goal updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Savings goal not found
 */
/**
 * @swagger
 * /savings/{id}:
 *   delete:
 *     summary: Remove a savings goal target record
 *     tags: [Savings Goals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Savings Goal Object ID
 *     responses:
 *       200:
 *         description: Savings goal deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Savings goal not found
 */
router.route('/:id')
  .put(validateSavingsGoal, updateSavingsGoal)
  .delete(deleteSavingsGoal);

module.exports = router;
