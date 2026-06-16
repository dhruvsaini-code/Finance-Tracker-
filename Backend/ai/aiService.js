const { OpenAI } = require('openai');

let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// 1. Smart Expense Categorization
exports.categorizeTransaction = async (description, amount) => {
  const descLower = description.toLowerCase();
  
  if (openai) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a fintech categorization AI. Categorize the transaction description into one of these exact categories: Housing, Utilities, Groceries, Dining Out, Transport, Entertainment, Shopping, Healthcare, Salary, Investments, Freelance, Other. Return ONLY the category name.'
          },
          {
            role: 'user',
            content: `Description: "${description}", Amount: $${amount}`
          }
        ],
        max_tokens: 10,
        temperature: 0.1
      });
      const category = response.choices[0].message.content.trim();
      return category;
    } catch (error) {
      console.warn('OpenAI error during categorization, falling back to rule-based parser:', error.message);
    }
  }

  // Local Rule-Based Categorization Fallback
  if (descLower.includes('starbucks') || descLower.includes('mcdonald') || descLower.includes('dining') || descLower.includes('restaurant') || descLower.includes('cafe') || descLower.includes('pizza') || descLower.includes('burger')) {
    return 'Dining Out';
  }
  if (descLower.includes('rent') || descLower.includes('mortgage') || descLower.includes('landlord') || descLower.includes('apartment')) {
    return 'Housing';
  }
  if (descLower.includes('electric') || descLower.includes('water') || descLower.includes('gas bill') || descLower.includes('utility') || descLower.includes('wifi') || descLower.includes('internet')) {
    return 'Utilities';
  }
  if (descLower.includes('safeway') || descLower.includes('walmart grocery') || descLower.includes('whole foods') || descLower.includes('groceries') || descLower.includes('supermarket')) {
    return 'Groceries';
  }
  if (descLower.includes('uber') || descLower.includes('lyft') || descLower.includes('subway') || descLower.includes('metro') || descLower.includes('transit') || descLower.includes('gas station') || descLower.includes('petrol')) {
    return 'Transport';
  }
  if (descLower.includes('netflix') || descLower.includes('spotify') || descLower.includes('cinema') || descLower.includes('concert') || descLower.includes('movie') || descLower.includes('steam') || descLower.includes('gaming')) {
    return 'Entertainment';
  }
  if (descLower.includes('amazon') || descLower.includes('target') || descLower.includes('walmart') || descLower.includes('clothing') || descLower.includes('nike') || descLower.includes('shopping') || descLower.includes('mall')) {
    return 'Shopping';
  }
  if (descLower.includes('hospital') || descLower.includes('doctor') || descLower.includes('pharmacy') || descLower.includes('medical') || descLower.includes('dentist') || descLower.includes('health')) {
    return 'Healthcare';
  }
  if (descLower.includes('salary') || descLower.includes('paycheck') || descLower.includes('payroll') || descLower.includes('employer')) {
    return 'Salary';
  }
  if (descLower.includes('stock') || descLower.includes('crypto') || descLower.includes('etf') || descLower.includes('robinhood') || descLower.includes('fidelity')) {
    return 'Investments';
  }
  if (descLower.includes('freelance') || descLower.includes('upwork') || descLower.includes('fiverr') || descLower.includes('gig')) {
    return 'Freelance';
  }
  
  return 'Other';
};

// 2. Spending Insights, Financial Health Score & Recommendations
exports.generateAIInsights = async (transactions, budgets, goals) => {
  let income = 0;
  let expense = 0;
  const expenseByCategory = {};

  transactions.forEach(t => {
    if (t.type === 'income') {
      income += t.amount;
    } else {
      expense += t.amount;
      expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
    }
  });

  // Calculate Savings Rate (Savings = Income - Expense)
  const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;
  
  // Calculate Budget Compliance Rate
  let totalBudgeted = 0;
  let totalExceeded = 0;
  budgets.forEach(b => {
    totalBudgeted += b.limitAmount;
    const spent = expenseByCategory[b.category] || 0;
    if (spent > b.limitAmount) {
      totalExceeded += (spent - b.limitAmount);
    }
  });
  const budgetCompliance = totalBudgeted > 0 ? Math.max(0, 100 - (totalExceeded / totalBudgeted) * 100) : 100;

  // Calculate Financial Health Score (0 - 100)
  // Weighted: 40% Savings Rate, 40% Budget Compliance, 20% Goals density
  let score = 50; // base score
  if (income > 0) {
    const savingsScore = Math.max(0, Math.min(100, (savingsRate / 25) * 100)); // 25% savings rate = 100 score
    const goalRatio = goals.length > 0 ? (goals.reduce((acc, g) => acc + (g.currentAmount / g.targetAmount), 0) / goals.length) * 100 : 50;
    score = (savingsScore * 0.4) + (budgetCompliance * 0.4) + (goalRatio * 0.2);
  }
  score = Math.round(Math.max(0, Math.min(100, score)));

  // Generate spending recommendations
  const recommendations = [];
  if (savingsRate < 10) {
    recommendations.push('Savings Rate warning: Your savings rate is currently below 10%. Try establishing automated transfers of 15% on salary payouts.');
  } else {
    recommendations.push('Savings Rate healthy: Great work saving more than 15% of total inflow this period.');
  }

  // Specific category cut recommendations
  const highExpenses = Object.keys(expenseByCategory).map(cat => ({ cat, amount: expenseByCategory[cat] }));
  highExpenses.sort((a, b) => b.amount - a.amount);
  if (highExpenses.length > 0 && highExpenses[0].cat !== 'Housing') {
    const topCat = highExpenses[0];
    const cutAmount = topCat.amount * 0.2;
    recommendations.push(`Budget optimization: Consider lowering your ${topCat.cat} spending by 20% to save around $${cutAmount.toFixed(0)} next month.`);
  }

  if (budgets.length === 0) {
    recommendations.push('Budget missing: No spending limits are active. Establish a budget for Dining Out or Shopping to curb impulsive outflows.');
  }

  // Budget warnings
  const warnings = [];
  budgets.forEach(b => {
    const spent = expenseByCategory[b.category] || 0;
    if (spent > b.limitAmount) {
      warnings.push(`You exceeded your ${b.category} limit by $${(spent - b.limitAmount).toFixed(0)}.`);
    } else if (spent > b.limitAmount * 0.8) {
      warnings.push(`Warning: You have used ${((spent / b.limitAmount) * 100).toFixed(0)}% of your ${b.category} budget.`);
    }
  });

  return {
    score,
    savingsRate: `${savingsRate.toFixed(1)}%`,
    budgetCompliance: `${budgetCompliance.toFixed(0)}%`,
    budgetWarnings: warnings.length > 0 ? warnings : ['No active budgets exceeded. Excellent cost discipline!'],
    recommendations
  };
};

// 3. Predictive Cashflow Extrapolation
exports.forecastFinancials = (transactions) => {
  const monthlyTotals = {};
  
  transactions.forEach(t => {
    const date = new Date(t.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyTotals[monthKey]) {
      monthlyTotals[monthKey] = { income: 0, expense: 0 };
    }
    
    if (t.type === 'income') {
      monthlyTotals[monthKey].income += t.amount;
    } else {
      monthlyTotals[monthKey].expense += t.amount;
    }
  });

  const sortedMonths = Object.keys(monthlyTotals).sort();
  let nextMonthIncome = 0;
  let nextMonthExpense = 0;

  if (sortedMonths.length > 0) {
    // Simple average extrapolation
    const incomes = sortedMonths.map(m => monthlyTotals[m].income);
    const expenses = sortedMonths.map(m => monthlyTotals[m].expense);
    
    const avgInc = incomes.reduce((a, b) => a + b, 0) / incomes.length;
    const avgExp = expenses.reduce((a, b) => a + b, 0) / expenses.length;
    
    // Extrapolate with minor trends
    nextMonthIncome = avgInc * 1.03; // 3% projected growth
    nextMonthExpense = avgExp * 0.98; // 2% projected savings target
  }

  return {
    projectedIncome: Math.round(nextMonthIncome),
    projectedExpense: Math.round(nextMonthExpense),
    projectedNet: Math.round(nextMonthIncome - nextMonthExpense)
  };
};
