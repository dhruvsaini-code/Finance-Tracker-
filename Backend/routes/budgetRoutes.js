const express = require('express');
const router = express.Router();
const { getBudgets, upsertBudget, deleteBudget } = require('../controllers/budgetController');
const { validateBudget } = require('../validators/budgetValidator');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getBudgets)
  .post(validateBudget, upsertBudget);

router.route('/:id')
  .delete(deleteBudget);

module.exports = router;
