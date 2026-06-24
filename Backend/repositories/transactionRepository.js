const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

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

  async getStats(userId) {
    return await Transaction.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: '$type',
                total: { $sum: '$amount' }
              }
            }
          ],
          categoryBreakdown: [
            { $match: { type: 'expense' } },
            {
              $group: {
                _id: '$category',
                total: { $sum: '$amount' }
              }
            }
          ],
          monthlyTrends: [
            {
              $group: {
                _id: {
                  month: { $dateToString: { format: '%Y-%m', date: '$date' } },
                  type: '$type'
                },
                total: { $sum: '$amount' }
              }
            }
          ]
        }
      }
    ]);
  }
}

module.exports = new TransactionRepository();

