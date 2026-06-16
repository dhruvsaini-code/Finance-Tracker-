exports.validateTransaction = (req, res, next) => {
  const { amount, description, type, date } = req.body;

  if (amount === undefined || isNaN(Number(amount)) || Number(amount) <= 0) {
    return res.status(400).json({ success: false, message: 'Amount is required and must be a positive number' });
  }

  if (!description || description.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'Description is required' });
  }

  if (type && !['income', 'expense'].includes(type)) {
    return res.status(400).json({ success: false, message: 'Type must be either "income" or "expense"' });
  }

  if (date && isNaN(Date.parse(date))) {
    return res.status(400).json({ success: false, message: 'Please provide a valid date string' });
  }

  next();
};
