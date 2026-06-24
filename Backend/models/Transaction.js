const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Please add an amount']
  },
  category: {
    type: String,
    required: [true, 'Please select or add a category'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    trim: true,
    maxlength: [150, 'Description cannot be more than 150 characters']
  },
  type: {
    type: String,
    required: [true, 'Please specify transaction type'],
    enum: ['income', 'expense']
  },
  date: {
    type: Date,
    required: [true, 'Please add a transaction date'],
    default: Date.now
  },
  tags: {
    type: [String],
    default: []
  },
  notes: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for query optimization
TransactionSchema.index({ user: 1, date: -1 });
TransactionSchema.index({ user: 1, category: 1 });
TransactionSchema.index({ user: 1, type: 1 });

module.exports = mongoose.model('Transaction', TransactionSchema);

