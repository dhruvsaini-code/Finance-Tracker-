const transactionRepository = require('../repositories/transactionRepository');
const budgetRepository = require('../repositories/budgetRepository');
const savingsGoalRepository = require('../repositories/savingsGoalRepository');
const aiService = require('../ai/aiService');

class TransactionService {
  async getAll(userId, queryParams) {
    const { type, category, search, startDate, endDate } = queryParams;
    const filter = { user: userId };

    if (type) {
      filter.type = type;
    }
    if (category) {
      filter.category = category;
    }
    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    return await transactionRepository.find(filter);
  }

  async create(userId, transactionData) {
    const { amount, description, type, date, tags, notes } = transactionData;
    let { category } = transactionData;

    // Automatic AI Categorization if category is unspecified
    if (!category || category.trim() === '') {
      category = await aiService.categorizeTransaction(description, amount);
    }

    return await transactionRepository.create({
      user: userId,
      amount,
      category,
      description,
      type: type || 'expense',
      date: date || new Date(),
      tags: tags || [],
      notes: notes || ''
    });
  }

  async update(userId, transactionId, updateData) {
    const transaction = await transactionRepository.findById(transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    if (transaction.user.toString() !== userId.toString()) {
      throw new Error('Unauthorized update access');
    }

    return await transactionRepository.update(transactionId, updateData);
  }

  async delete(userId, transactionId) {
    const transaction = await transactionRepository.findById(transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    if (transaction.user.toString() !== userId.toString()) {
      throw new Error('Unauthorized delete access');
    }

    await transactionRepository.delete(transactionId);
    return { success: true };
  }

  async getStats(userId) {
    const statsResult = await transactionRepository.getStats(userId);
    const raw = statsResult[0] || {};

    let totalIncome = 0;
    let totalExpenses = 0;

    if (raw.totals) {
      raw.totals.forEach(t => {
        if (t._id === 'income') totalIncome = t.total;
        if (t._id === 'expense') totalExpenses = t.total;
      });
    }

    const categoryBreakdown = {};
    if (raw.categoryBreakdown) {
      raw.categoryBreakdown.forEach(c => {
        categoryBreakdown[c._id] = c.total;
      });
    }

    const monthlyTrends = {};
    if (raw.monthlyTrends) {
      raw.monthlyTrends.forEach(m => {
        if (m._id && m._id.month) {
          const month = m._id.month;
          const type = m._id.type;
          if (!monthlyTrends[month]) {
            monthlyTrends[month] = { income: 0, expense: 0 };
          }
          if (type === 'income') {
            monthlyTrends[month].income = m.total;
          } else if (type === 'expense') {
            monthlyTrends[month].expense = m.total;
          }
        }
      });
    }

    return {
      balance: totalIncome - totalExpenses,
      totalIncome,
      totalExpenses,
      categoryBreakdown,
      monthlyTrends
    };
  }

  async getAIInsights(userId) {
    const transactions = await transactionRepository.find({ user: userId });
    const budgets = await budgetRepository.find({ user: userId });
    const goals = await savingsGoalRepository.find({ user: userId });

    // 1. Analyze general advice & budget check alerts
    const insights = await aiService.generateAIInsights(transactions, budgets, goals);

    // 2. Generate forecasting data
    const forecast = aiService.forecastFinancials(transactions);

    return {
      ...insights,
      forecast
    };
  }
}

module.exports = new TransactionService();
