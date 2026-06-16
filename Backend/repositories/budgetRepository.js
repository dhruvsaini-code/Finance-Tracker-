const Budget = require('../models/Budget');

class BudgetRepository {
  async find(filter) {
    return await Budget.find(filter);
  }

  async findById(id) {
    return await Budget.findById(id);
  }

  async upsert(filter, limitAmount) {
    return await Budget.findOneAndUpdate(
      filter,
      { limitAmount },
      { new: true, upsert: true, runValidators: true }
    );
  }

  async delete(id) {
    return await Budget.findByIdAndDelete(id);
  }
}

module.exports = new BudgetRepository();
