const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
const dotenv = require('dotenv');

// Models
const User = require('./models/User');
const Transaction = require('./models/Transaction');
const Budget = require('./models/Budget');
const SavingsGoal = require('./models/SavingsGoal');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../env/.env') });

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/finance_tracker';
    await mongoose.connect(mongoUri);
    console.log('Seed connection established to MongoDB...');

    // Clear existing database collections
    await User.deleteMany({});
    await Transaction.deleteMany({});
    await Budget.deleteMany({});
    await SavingsGoal.deleteMany({});
    console.log('Cleared existing records...');

    // 1. Create a Default Demo User
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    const demoUser = await User.create({
      username: 'demouser',
      email: 'demo@example.com',
      password: hashedPassword,
      role: 'user'
    });
    console.log('Demo user seeded: demo@example.com / password123');

    // 2. Create Category Budgets (for current month)
    const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
    const budgets = await Budget.insertMany([
      { user: demoUser._id, category: 'Housing', limitAmount: 1500, month: currentMonth },
      { user: demoUser._id, category: 'Utilities', limitAmount: 300, month: currentMonth },
      { user: demoUser._id, category: 'Groceries', limitAmount: 500, month: currentMonth },
      { user: demoUser._id, category: 'Dining Out', limitAmount: 400, month: currentMonth },
      { user: demoUser._id, category: 'Transport', limitAmount: 250, month: currentMonth },
      { user: demoUser._id, category: 'Entertainment', limitAmount: 200, month: currentMonth },
      { user: demoUser._id, category: 'Shopping', limitAmount: 300, month: currentMonth },
      { user: demoUser._id, category: 'Healthcare', limitAmount: 150, month: currentMonth }
    ]);
    console.log('Category budgets seeded...');

    // 3. Create Savings Goals
    const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    const savingsGoals = await SavingsGoal.insertMany([
      { user: demoUser._id, title: 'Emergency Fund', targetAmount: 12000, currentAmount: 6500, deadline: oneYearFromNow },
      { user: demoUser._id, title: 'Tesla Downpayment', targetAmount: 8000, currentAmount: 3200, deadline: oneYearFromNow },
      { user: demoUser._id, title: 'Japan Vacation', targetAmount: 4000, currentAmount: 4000, deadline: new Date() } // completed
    ]);
    console.log('Savings goals seeded...');

    // 4. Create Historical and Current Transactions
    const now = new Date();
    const getDateDaysAgo = (days) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const transactions = await Transaction.insertMany([
      // Incomes
      { user: demoUser._id, amount: 4800, category: 'Salary', description: 'Monthly Salary Paycheck', type: 'income', date: getDateDaysAgo(1), tags: ['salary', 'direct-deposit'] },
      { user: demoUser._id, amount: 650, category: 'Freelance', description: 'Web Consulting Gig', type: 'income', date: getDateDaysAgo(8), tags: ['freelance', 'contract'] },
      { user: demoUser._id, amount: 150, category: 'Investments', description: 'Quarterly Dividends', type: 'income', date: getDateDaysAgo(15), tags: ['dividends', 'passive'] },
      { user: demoUser._id, amount: 4800, category: 'Salary', description: 'Previous Month Salary', type: 'income', date: getDateDaysAgo(30), tags: ['salary'] },

      // Expenses - Dining Out
      { user: demoUser._id, amount: 12.50, category: 'Dining Out', description: 'Starbucks Coffee', type: 'expense', date: getDateDaysAgo(2), tags: ['coffee', 'caffeine'] },
      { user: demoUser._id, amount: 45.80, category: 'Dining Out', description: 'McDonalds Dinner', type: 'expense', date: getDateDaysAgo(5), tags: ['fastfood'] },
      { user: demoUser._id, amount: 128.00, category: 'Dining Out', description: 'Sushi Dinner Date', type: 'expense', date: getDateDaysAgo(12), tags: ['date-night'] },

      // Expenses - Housing / Rent
      { user: demoUser._id, amount: 1350.00, category: 'Housing', description: 'Monthly Rent Payment', type: 'expense', date: getDateDaysAgo(16), tags: ['rent', 'housing'] },

      // Expenses - Groceries
      { user: demoUser._id, amount: 89.40, category: 'Groceries', description: 'Whole Foods Grocery Run', type: 'expense', date: getDateDaysAgo(3), tags: ['food', 'organic'] },
      { user: demoUser._id, amount: 145.20, category: 'Groceries', description: 'Safeway Shopping Trip', type: 'expense', date: getDateDaysAgo(10), tags: ['groceries'] },

      // Expenses - Utilities
      { user: demoUser._id, amount: 85.00, category: 'Utilities', description: 'Comcast Internet Bill', type: 'expense', date: getDateDaysAgo(4), tags: ['wifi', 'internet'] },
      { user: demoUser._id, amount: 120.00, category: 'Utilities', description: 'Electric Power Bill', type: 'expense', date: getDateDaysAgo(14), tags: ['electricity'] },

      // Expenses - Transport
      { user: demoUser._id, amount: 35.00, category: 'Transport', description: 'Gas Fill Station', type: 'expense', date: getDateDaysAgo(6), tags: ['petrol'] },
      { user: demoUser._id, amount: 18.50, category: 'Transport', description: 'Uber Ride City Center', type: 'expense', date: getDateDaysAgo(9), tags: ['rideshare'] },

      // Expenses - Entertainment
      { user: demoUser._id, amount: 15.99, category: 'Entertainment', description: 'Netflix Subscription', type: 'expense', date: getDateDaysAgo(7), tags: ['streaming'] },
      { user: demoUser._id, amount: 9.99, category: 'Entertainment', description: 'Spotify Premium Family', type: 'expense', date: getDateDaysAgo(20), tags: ['music'] },

      // Expenses - Shopping
      { user: demoUser._id, amount: 110.00, category: 'Shopping', description: 'Target Store Purchases', type: 'expense', date: getDateDaysAgo(11), tags: ['household'] },
      { user: demoUser._id, amount: 75.00, category: 'Shopping', description: 'Amazon Order Book Shelves', type: 'expense', date: getDateDaysAgo(25), tags: ['books'] }
    ]);
    console.log('Ledger transactions seeded...');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDatabase();
