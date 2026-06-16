exports.validateSavingsGoal = (req, res, next) => {
  const { title, targetAmount, currentAmount, deadline } = req.body;

  if (!title || title.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'Goal title is required' });
  }

  if (targetAmount === undefined || isNaN(Number(targetAmount)) || Number(targetAmount) <= 0) {
    return res.status(400).json({ success: false, message: 'Target amount is required and must be a positive number' });
  }

  if (currentAmount !== undefined && (isNaN(Number(currentAmount)) || Number(currentAmount) < 0)) {
    return res.status(400).json({ success: false, message: 'Current amount must be a non-negative number' });
  }

  if (!deadline || isNaN(Date.parse(deadline))) {
    return res.status(400).json({ success: false, message: 'A valid target deadline date is required' });
  }

  next();
};
