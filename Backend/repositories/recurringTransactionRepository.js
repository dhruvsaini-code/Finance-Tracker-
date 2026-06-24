const RecurringTransaction = require('../models/RecurringTransaction');
const mongoose = require('mongoose');

class RecurringTransactionRepository {
  async find(filter, sort = { nextOccurrence: 1 }) {
    return await RecurringTransaction.find(filter).sort(sort);
  }

  async findById(id) {
    return await RecurringTransaction.findById(id);
  }

  async create(data) {
    return await RecurringTransaction.create(data);
  }

  async update(id, data) {
    return await RecurringTransaction.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true
    });
  }

  async delete(id) {
    return await RecurringTransaction.findByIdAndDelete(id);
  }
}

module.exports = new RecurringTransactionRepository();
