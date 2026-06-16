const mongoose = require('mongoose');

const SavingsGoalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a savings goal title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  targetAmount: {
    type: Number,
    required: [true, 'Please add a target amount']
  },
  currentAmount: {
    type: Number,
    default: 0.0
  },
  deadline: {
    type: Date,
    required: [true, 'Please provide a target deadline date']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SavingsGoal', SavingsGoalSchema);
