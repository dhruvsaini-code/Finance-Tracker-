const Transaction = require('../models/Transaction');

class TransactionRepository {
  async find(filter, sort = { date: -1 }) {
    return await Transaction.find(filter).sort(sort);
  }

  async findById(id) {
    return await Transaction.findById(id);
  }

  async create(data) {
    return await Transaction.create(data);
  }

  async update(id, data) {
    return await Transaction.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true
    });
  }

  async delete(id) {
    return await Transaction.findByIdAndDelete(id);
  }
}

module.exports = new TransactionRepository();
