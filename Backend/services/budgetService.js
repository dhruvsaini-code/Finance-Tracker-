const budgetRepository = require('../repositories/budgetRepository');

class BudgetService {
  async getBudgets(userId, month) {
    const filter = { user: userId };
    if (month) {
      filter.month = month;
    }
    return await budgetRepository.find(filter);
  }

  async upsertBudget(userId, budgetData) {
    const { category, limitAmount, month } = budgetData;
    const filter = { user: userId, category, month };
    return await budgetRepository.upsert(filter, limitAmount);
  }

  async deleteBudget(userId, budgetId) {
    const budget = await budgetRepository.findById(budgetId);
    if (!budget) {
      throw new Error('Budget not found');
    }
    if (budget.user.toString() !== userId.toString()) {
      throw new Error('Unauthorized delete access');
    }
    await budgetRepository.delete(budgetId);
    return { success: true };
  }
}

module.exports = new BudgetService();
