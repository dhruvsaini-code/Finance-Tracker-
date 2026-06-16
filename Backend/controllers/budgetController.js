const Budget = require('../models/Budget');

// @desc    Get user budgets for a specific month
// @route   GET /api/budgets
// @access  Private
exports.getBudgets = async (req, res, next) => {
  try {
    const { month } = req.query; // YYYY-MM
    const query = { user: req.user._id };
    
    if (month) {
      query.month = month;
    }

    const budgets = await Budget.find(query);
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
    const { category, limitAmount, month } = req.body;

    if (!category || !limitAmount || !month) {
      return res.status(400).json({ success: false, message: 'Please provide all fields' });
    }

    // Try finding existing budget to update, or create a new one
    const filter = { user: req.user._id, category, month };
    const update = { limitAmount };
    const options = { new: true, upsert: true, runValidators: true };

    const budget = await Budget.findOneAndUpdate(filter, update, options);

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
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    // Verify ownership
    if (budget.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    await budget.deleteOne();

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
