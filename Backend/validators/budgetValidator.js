exports.validateBudget = (req, res, next) => {
  const { category, limitAmount, month } = req.body;

  if (!category || category.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'Category is required' });
  }

  if (limitAmount === undefined || isNaN(Number(limitAmount)) || Number(limitAmount) <= 0) {
    return res.status(400).json({ success: false, message: 'Limit amount is required and must be a positive number' });
  }

  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return res.status(400).json({ success: false, message: 'Month is required and must be in YYYY-MM format' });
  }

  next();
};
