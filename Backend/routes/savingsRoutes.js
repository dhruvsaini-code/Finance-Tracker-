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

router.use(protect);

router.route('/')
  .get(getSavingsGoals)
  .post(validateSavingsGoal, createSavingsGoal);

router.route('/:id')
  .put(validateSavingsGoal, updateSavingsGoal)
  .delete(deleteSavingsGoal);

module.exports = router;
