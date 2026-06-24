const savingsService = require('../services/savingsService');
const { logAudit } = require('../services/auditService');

// @desc    Get all savings goals for user
// @route   GET /api/savings
// @access  Private
exports.getSavingsGoals = async (req, res, next) => {
  try {
    const goals = await savingsService.getGoals(req.user._id);
    res.json({
      success: true,
      count: goals.length,
      data: goals
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new savings goal
// @route   POST /api/savings
// @access  Private
exports.createSavingsGoal = async (req, res, next) => {
  try {
    const goal = await savingsService.createGoal(req.user._id, req.body);
    
    // Log audit
    await logAudit(req, 'SAVINGS_GOAL_CREATE', {
      goalId: goal._id,
      title: goal.title,
      targetAmount: goal.targetAmount
    });

    res.status(201).json({
      success: true,
      data: goal
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update savings goal progress or info
// @route   PUT /api/savings/:id
// @access  Private
exports.updateSavingsGoal = async (req, res, next) => {
  try {
    const goal = await savingsService.updateGoal(req.user._id, req.params.id, req.body);
    
    // Log audit
    await logAudit(req, 'SAVINGS_GOAL_UPDATE', {
      goalId: goal._id,
      title: goal.title,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount
    });

    res.json({
      success: true,
      data: goal
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete savings goal
// @route   DELETE /api/savings/:id
// @access  Private
exports.deleteSavingsGoal = async (req, res, next) => {
  try {
    await savingsService.deleteGoal(req.user._id, req.params.id);
    
    // Log audit
    await logAudit(req, 'SAVINGS_GOAL_DELETE', { goalId: req.params.id });

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
