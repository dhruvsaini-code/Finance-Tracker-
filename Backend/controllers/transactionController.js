const transactionService = require('../services/transactionService');

// @desc    Get all transactions for current user
// @route   GET /api/transactions
// @access  Private
exports.getTransactions = async (req, res, next) => {
  try {
    const transactions = await transactionService.getAll(req.user._id, req.query);
    res.json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new transaction
// @route   POST /api/transactions
// @access  Private
exports.createTransaction = async (req, res, next) => {
  try {
    const transaction = await transactionService.create(req.user._id, req.body);
    res.status(201).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a transaction
// @route   PUT /api/transactions/:id
// @access  Private
exports.updateTransaction = async (req, res, next) => {
  try {
    const transaction = await transactionService.update(req.user._id, req.params.id, req.body);
    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
exports.deleteTransaction = async (req, res, next) => {
  try {
    await transactionService.delete(req.user._id, req.params.id);
    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get transaction summary and stats (charts)
// @route   GET /api/transactions/stats
// @access  Private
exports.getTransactionStats = async (req, res, next) => {
  try {
    const stats = await transactionService.getStats(req.user._id);
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get AI-based financial spending insights and predictions
// @route   GET /api/transactions/ai-insights
// @access  Private
exports.getAIInsights = async (req, res, next) => {
  try {
    const insights = await transactionService.getAIInsights(req.user._id);
    res.json({
      success: true,
      insights
    });
  } catch (error) {
    next(error);
  }
};
