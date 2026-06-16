const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: [true, 'Please select a category for the budget'],
    trim: true
  },
  limitAmount: {
    type: Number,
    required: [true, 'Please add a budget limit amount']
  },
  month: {
    type: String,
    required: [true, 'Please specify the month (YYYY-MM)'],
    trim: true,
    match: [/^\d{4}-\d{2}$/, 'Please use YYYY-MM format']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure a user can only have one budget limit for a specific category per month
BudgetSchema.index({ user: 1, category: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Budget', BudgetSchema);
