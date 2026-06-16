const savingsService = require('../services/savingsService');

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
    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
