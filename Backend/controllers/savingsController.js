const SavingsGoal = require('../models/SavingsGoal');

// @desc    Get all savings goals for user
// @route   GET /api/savings
// @access  Private
exports.getSavingsGoals = async (req, res, next) => {
  try {
    const goals = await SavingsGoal.find({ user: req.user._id }).sort({ createdAt: -1 });
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
    const { title, targetAmount, currentAmount, desiredDate } = req.body;

    if (!title || !targetAmount) {
      return res.status(400).json({ success: false, message: 'Please provide title and target amount' });
    }

    const goal = await SavingsGoal.create({
      user: req.user._id,
      title,
      targetAmount,
      currentAmount: currentAmount || 0,
      desiredDate
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
    let goal = await SavingsGoal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Savings goal not found' });
    }

    // Verify ownership
    if (goal.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    goal = await SavingsGoal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
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
    const goal = await SavingsGoal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Savings goal not found' });
    }

    // Verify ownership
    if (goal.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    await goal.deleteOne();

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
