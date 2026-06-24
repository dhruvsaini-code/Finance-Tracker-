const recurringTransactionService = require('../services/recurringTransactionService');
const { logAudit } = require('../services/auditService');

// @desc    Get all user recurring transactions
// @route   GET /api/transactions/recurring
// @access  Private
exports.getRecurringTransactions = async (req, res, next) => {
  try {
    const recurring = await recurringTransactionService.getAll(req.user._id);
    res.json({
      success: true,
      count: recurring.length,
      data: recurring
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a recurring transaction
// @route   POST /api/transactions/recurring
// @access  Private
exports.createRecurringTransaction = async (req, res, next) => {
  try {
    const recurring = await recurringTransactionService.create(req.user._id, req.body);
    
    await logAudit(req, 'RECURRING_CREATE', {
      recurringId: recurring._id,
      amount: recurring.amount,
      frequency: recurring.frequency,
      description: recurring.description
    });

    res.status(201).json({
      success: true,
      data: recurring
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a recurring transaction
// @route   PUT /api/transactions/recurring/:id
// @access  Private
exports.updateRecurringTransaction = async (req, res, next) => {
  try {
    const recurring = await recurringTransactionService.update(req.user._id, req.params.id, req.body);
    
    await logAudit(req, 'RECURRING_UPDATE', {
      recurringId: recurring._id,
      description: recurring.description
    });

    res.json({
      success: true,
      data: recurring
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a recurring transaction
// @route   DELETE /api/transactions/recurring/:id
// @access  Private
exports.deleteRecurringTransaction = async (req, res, next) => {
  try {
    await recurringTransactionService.delete(req.user._id, req.params.id);
    
    await logAudit(req, 'RECURRING_DELETE', { recurringId: req.params.id });

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
