const mongoose = require('mongoose');

const RecurringTransactionSchema = new mongoose.Schema({
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
  frequency: {
    type: String,
    required: [true, 'Please specify frequency'],
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    default: 'monthly'
  },
  startDate: {
    type: Date,
    required: [true, 'Please add a start date'],
    default: Date.now
  },
  lastTriggered: {
    type: Date
  },
  nextOccurrence: {
    type: Date,
    required: [true, 'Please add next occurrence date']
  },
  tags: {
    type: [String],
    default: []
  },
  notes: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for query optimization
RecurringTransactionSchema.index({ user: 1, nextOccurrence: 1, isActive: 1 });

module.exports = mongoose.model('RecurringTransaction', RecurringTransactionSchema);
