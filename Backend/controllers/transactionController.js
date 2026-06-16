const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const SavingsGoal = require('../models/SavingsGoal');

// @desc    Get all transactions for current user
// @route   GET /api/transactions
// @access  Private
exports.getTransactions = async (req, res, next) => {
  try {
    const { type, category, search, startDate, endDate } = req.query;
    
    // Build filter object
    const filter = { user: req.user._id };

    if (type) {
      filter.type = type;
    }
    if (category) {
      filter.category = category;
    }
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(filter).sort({ date: -1 });

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
    const { title, amount, category, type, date, notes } = req.body;

    if (!title || !amount || !category || !type) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const transaction = await Transaction.create({
      user: req.user._id,
      title,
      amount,
      category,
      type,
      date: date || new Date(),
      notes
    });

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
    let transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    // Make sure user owns transaction
    if (transaction.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this transaction' });
    }

    transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

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
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    // Make sure user owns transaction
    if (transaction.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this transaction' });
    }

    await transaction.deleteOne();

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
    const transactions = await Transaction.find({ user: req.user._id });

    let totalIncome = 0;
    let totalExpenses = 0;
    const categoryBreakdown = {};
    const monthlyTrends = {};

    transactions.forEach(tx => {
      const amt = tx.amount;
      const dateObj = new Date(tx.date);
      const monthStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;

      // Initialize monthly trends tracker
      if (!monthlyTrends[monthStr]) {
        monthlyTrends[monthStr] = { income: 0, expense: 0 };
      }

      if (tx.type === 'income') {
        totalIncome += amt;
        monthlyTrends[monthStr].income += amt;
      } else {
        totalExpenses += amt;
        monthlyTrends[monthStr].expense += amt;
        
        // Category breakdown for expenses
        if (!categoryBreakdown[tx.category]) {
          categoryBreakdown[tx.category] = 0;
        }
        categoryBreakdown[tx.category] += amt;
      }
    });

    res.json({
      success: true,
      stats: {
        balance: totalIncome - totalExpenses,
        totalIncome,
        totalExpenses,
        categoryBreakdown,
        monthlyTrends
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get AI-based financial spending insights
// @route   GET /api/transactions/ai-insights
// @access  Private
exports.getAIInsights = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const transactions = await Transaction.find({ user: userId });
    const budgets = await Budget.find({ user: userId });
    const goals = await SavingsGoal.find({ user: userId });

    // Calculate details for AI analysis
    let income = 0;
    let expense = 0;
    const expenseByCategory = {};

    transactions.forEach(t => {
      if (t.type === 'income') {
        income += t.amount;
      } else {
        expense += t.amount;
        expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
      }
    });

    const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;

    // Check budget limit overruns
    const budgetWarnings = [];
    budgets.forEach(b => {
      const spent = expenseByCategory[b.category] || 0;
      if (spent > b.limitAmount) {
        const excess = spent - b.limitAmount;
        budgetWarnings.push(`You have exceeded your ${b.category} budget by $${excess.toFixed(2)} ($${spent.toFixed(2)} spent out of $${b.limitAmount.toFixed(2)} limit).`);
      } else if (spent > b.limitAmount * 0.8) {
        budgetWarnings.push(`Warning: You have used ${((spent / b.limitAmount) * 100).toFixed(0)}% of your ${b.category} budget.`);
      }
    });

    // Generate smart insight tips
    const tips = [];
    
    // General assessment
    if (income === 0 && expense === 0) {
      tips.push("Your tracker is empty! Add your first income or expense transaction to unlock customized insights.");
    } else if (savingsRate < 0) {
      tips.push("ALERT: Your spending exceeds your income. We recommend identifying non-essential subscriptions or lifestyle costs to cut back immediately.");
    } else if (savingsRate < 15) {
      tips.push(`Your current savings rate is ${savingsRate.toFixed(1)}%. Aiming for a standard 20% savings rate could help accelerate your financial freedom.`);
    } else {
      tips.push(`Excellent job! You are saving a healthy ${savingsRate.toFixed(1)}% of your total income. Keep this consistency!`);
    }

    // Category analysis
    const categories = Object.keys(expenseByCategory);
    if (categories.length > 0) {
      const topCategory = categories.reduce((a, b) => expenseByCategory[a] > expenseByCategory[b] ? a : b);
      const topCatPercentage = expense > 0 ? (expenseByCategory[topCategory] / expense) * 100 : 0;
      if (topCatPercentage > 35) {
        tips.push(`High Concentration: Your largest spending category is "${topCategory}", making up ${topCatPercentage.toFixed(0)}% of total expenses. Consider setting a budget constraint here.`);
      }
    }

    // Savings goals progress check
    if (goals.length > 0) {
      goals.forEach(g => {
        const percent = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0;
        if (percent >= 100) {
          tips.push(`Goal Accomplished! You met your target for "${g.title}". Consider shifting those savings to a new financial goal.`);
        } else if (percent < 50) {
          tips.push(`Goal Action Needed: Your "${g.title}" goal is at ${percent.toFixed(0)}% progress. Consider automated monthly contributions to speed up achievement.`);
        }
      });
    } else {
      tips.push("Set up a new Savings Goal in the dashboard to start tracking milestones for your major purchases or emergency funds.");
    }

    // Send final advice package
    res.json({
      success: true,
      insights: {
        summary: `Financial Health Grade: ${savingsRate >= 20 ? 'A-' : savingsRate >= 10 ? 'B' : savingsRate >= 0 ? 'C+' : 'D'}.`,
        savingsRate: `${savingsRate.toFixed(1)}%`,
        budgetWarnings: budgetWarnings.length > 0 ? budgetWarnings : ["No active budgets are currently exceeded. Great control!"],
        recommendations: tips
      }
    });
  } catch (error) {
    next(error);
  }
};
