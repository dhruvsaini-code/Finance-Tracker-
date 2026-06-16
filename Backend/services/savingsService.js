const savingsGoalRepository = require('../repositories/savingsGoalRepository');

class SavingsService {
  async getGoals(userId) {
    return await savingsGoalRepository.find({ user: userId });
  }

  async createGoal(userId, goalData) {
    const { title, targetAmount, currentAmount, deadline } = goalData;
    return await savingsGoalRepository.create({
      user: userId,
      title,
      targetAmount,
      currentAmount: currentAmount || 0,
      deadline
    });
  }

  async updateGoal(userId, goalId, updateData) {
    const goal = await savingsGoalRepository.findById(goalId);
    if (!goal) {
      throw new Error('Savings goal not found');
    }
    if (goal.user.toString() !== userId.toString()) {
      throw new Error('Unauthorized update access');
    }
    return await savingsGoalRepository.update(goalId, updateData);
  }

  async deleteGoal(userId, goalId) {
    const goal = await savingsGoalRepository.findById(goalId);
    if (!goal) {
      throw new Error('Savings goal not found');
    }
    if (goal.user.toString() !== userId.toString()) {
      throw new Error('Unauthorized delete access');
    }
    await savingsGoalRepository.delete(goalId);
    return { success: true };
  }
}

module.exports = new SavingsService();
