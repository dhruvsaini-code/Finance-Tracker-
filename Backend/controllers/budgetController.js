const budgetService = require('../services/budgetService');

// @desc    Get user budgets for a specific month
// @route   GET /api/budgets
// @access  Private
exports.getBudgets = async (req, res, next) => {
  try {
    const { month } = req.query; // YYYY-MM
    const budgets = await budgetService.getBudgets(req.user._id, month);
    res.json({
      success: true,
      count: budgets.length,
      data: budgets
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upsert user budget (create or update if exists)
// @route   POST /api/budgets
// @access  Private
exports.upsertBudget = async (req, res, next) => {
  try {
    const budget = await budgetService.upsertBudget(req.user._id, req.body);
    res.status(201).json({
      success: true,
      data: budget
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user budget
// @route   DELETE /api/budgets/:id
// @access  Private
exports.deleteBudget = async (req, res, next) => {
  try {
    await budgetService.deleteBudget(req.user._id, req.params.id);
    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
