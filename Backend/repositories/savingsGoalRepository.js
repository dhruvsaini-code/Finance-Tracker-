const SavingsGoal = require('../models/SavingsGoal');

class SavingsGoalRepository {
  async find(filter, sort = { createdAt: -1 }) {
    return await SavingsGoal.find(filter).sort(sort);
  }

  async findById(id) {
    return await SavingsGoal.findById(id);
  }

  async create(data) {
    return await SavingsGoal.create(data);
  }

  async update(id, data) {
    return await SavingsGoal.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true
    });
  }

  async delete(id) {
    return await SavingsGoal.findByIdAndDelete(id);
  }
}

module.exports = new SavingsGoalRepository();
