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
  
  // Track transactions by category to find averages
  const categoryAmounts = {};
  const categoryCounts = {};

  transactions.forEach(t => {
    if (t.type === 'income') {
      income += t.amount;
    } else {
      expense += t.amount;
      expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
      
      if (!categoryAmounts[t.category]) {
        categoryAmounts[t.category] = 0;
        categoryCounts[t.category] = 0;
      }
      categoryAmounts[t.category] += t.amount;
      categoryCounts[t.category] += 1;
    }
  });

  // A. Savings Rate (Savings = Income - Expense)
  const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;
  
  // B. Budget Compliance Rate
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

  // C. Goal Milestone Progress density
  let totalGoalRatio = 0;
  goals.forEach(g => {
    totalGoalRatio += g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) : 0;
  });
  const goalRatio = goals.length > 0 ? (totalGoalRatio / goals.length) * 100 : 50;

  // D. Calculate Financial Health Score (0 - 100)
  // Weighted: 40% Savings Rate, 40% Budget Compliance, 20% Goals density
  let score = 50; // base score
  if (income > 0) {
    const savingsScore = Math.max(0, Math.min(100, (savingsRate / 25) * 100)); // 25% savings rate = 100 score
    score = (savingsScore * 0.4) + (budgetCompliance * 0.4) + (goalRatio * 0.2);
  }
  score = Math.round(Math.max(0, Math.min(100, score)));

  // E. Spending Anomaly Detection (Transactions > 2.2x the average purchase for that category)
  const anomalies = [];
  transactions.forEach(t => {
    if (t.type === 'expense' && categoryCounts[t.category] >= 2) {
      const avg = categoryAmounts[t.category] / categoryCounts[t.category];
      if (t.amount > avg * 2.2 && t.amount > 50) {
        anomalies.push({
          id: t._id,
          description: t.description || t.title,
          amount: t.amount,
          category: t.category,
          date: t.date,
          average: Math.round(avg),
          deviationTimes: (t.amount / avg).toFixed(1)
        });
      }
    }
  });

  // F. Goal Achievement Predictions
  const goalPredictions = [];
  const monthlySavings = Math.max(0, (income - expense));
  goals.forEach(g => {
    const remaining = g.targetAmount - g.currentAmount;
    if (remaining <= 0) {
      goalPredictions.push({
        goalId: g._id,
        title: g.title,
        status: 'Completed',
        projectedMonths: 0,
        projectedDate: new Date(),
        advice: 'Goal fully achieved! Reallocate savings to new targets.'
      });
    } else if (monthlySavings <= 0) {
      goalPredictions.push({
        goalId: g._id,
        title: g.title,
        status: 'At Risk',
        projectedMonths: 999,
        projectedDate: null,
        advice: 'Unreachable at current savings rate. Your expenses exceed or equal income.'
      });
    } else {
      const monthsNeeded = remaining / (monthlySavings || 1);
      const projectedDate = new Date();
      projectedDate.setMonth(projectedDate.getMonth() + Math.ceil(monthsNeeded));
      
      let status = 'On Track';
      let advice = `On track to finish in ${monthsNeeded.toFixed(1)} months.`;

      if (g.deadline) {
        const deadlineDate = new Date(g.deadline);
        if (projectedDate > deadlineDate) {
          status = 'Delayed';
          const diffMs = projectedDate.getTime() - deadlineDate.getTime();
          const diffMonths = Math.ceil(diffMs / (30 * 24 * 60 * 60 * 1000));
          advice = `Projected to miss deadline by ${diffMonths} month(s). Increase savings by $${(remaining / Math.max(1, (deadlineDate.getTime() - Date.now()) / (30 * 24 * 60 * 60 * 1000)) - monthlySavings).toFixed(0)}/mo to catch up.`;
        } else {
          advice = `On track! Expected to complete by ${projectedDate.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}, which is before your deadline.`;
        }
      }

      goalPredictions.push({
        goalId: g._id,
        title: g.title,
        status,
        projectedMonths: Number(monthsNeeded.toFixed(1)),
        projectedDate,
        advice
      });
    }
  });

  // G. Dynamic Recommendations list
  const recommendations = [];
  if (savingsRate < 10) {
    recommendations.push('Savings speed alert: Your savings rate is below the 10% benchmark. Automate a 15% salary transfer into savings at the start of next month.');
  } else if (savingsRate >= 20) {
    recommendations.push('Superb savings discipline! You are saving over 20% of net cash flow. Consider investing surplus funds in diversified index funds.');
  } else {
    recommendations.push('Healthy savings pace: You are saving around 15% of your income. Increase it slightly to accelerate your Tesla or Emergency goals.');
  }

  const highExpenses = Object.keys(expenseByCategory).map(cat => ({ cat, amount: expenseByCategory[cat] }));
  highExpenses.sort((a, b) => b.amount - a.amount);
  if (highExpenses.length > 0 && highExpenses[0].cat !== 'Housing') {
    const topCat = highExpenses[0];
    const cutAmount = topCat.amount * 0.15;
    recommendations.push(`Budget optimization suggestion: Your highest discretionary outflow is ${topCat.cat}. Reducing this by 15% would save an extra $${cutAmount.toFixed(0)} next month.`);
  }

  if (budgets.length === 0) {
    recommendations.push('Action required: Set category spending limits. Active budgets curb impulsive purchasing behavior.');
  }

  // Budget warnings list
  const warnings = [];
  budgets.forEach(b => {
    const spent = expenseByCategory[b.category] || 0;
    if (spent > b.limitAmount) {
      warnings.push(`Exceeded budget: Your ${b.category} spending is $${(spent - b.limitAmount).toFixed(0)} over the set limit.`);
    } else if (spent > b.limitAmount * 0.8) {
      warnings.push(`Critical warning: You have utilized ${((spent / b.limitAmount) * 100).toFixed(0)}% of your ${b.category} budget.`);
    }
  });

  // H. AI Summary (Generate via OpenAI or template fallback)
  let summary = '';
  if (openai) {
    try {
      const prompt = `
        Provide a concise, 3-sentence executive financial audit summary based on the following stats:
        - Monthly Income: $${income}
        - Monthly Expenses: $${expense}
        - Savings Rate: ${savingsRate.toFixed(1)}%
        - Financial Wellness Score: ${score}/100
        - Exceeded Budgets: ${warnings.join('; ') || 'None'}
        Write in a professional, encouraging, staff-architect tone.
      `;
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
        temperature: 0.6
      });
      summary = response.choices[0].message.content.trim();
    } catch (err) {
      console.warn('OpenAI API error during summary generation, using fallback:', err.message);
    }
  }

  if (!summary) {
    const statusText = score >= 80 ? 'excellent' : score >= 60 ? 'moderate' : 'critical';
    summary = `Your financial health is currently in a ${statusText} state with a score of ${score}/100. You registered a savings rate of ${savingsRate.toFixed(1)}% this month. ${
      warnings.length > 0 
        ? 'Urgent attention is needed to resolve active category overruns.' 
        : 'Excellent cost control is being exercised across all category budgets.'
    }`;
  }

  return {
    score,
    summary,
    savingsRate: `${savingsRate.toFixed(1)}%`,
    budgetCompliance: `${budgetCompliance.toFixed(0)}%`,
    budgetWarnings: warnings.length > 0 ? warnings : ['All category limits are healthy. Excellent cost discipline!'],
    recommendations,
    anomalies,
    goalPredictions
  };
};

// 3. Predictive Multi-Month Cashflow Extrapolation
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
    const incomes = sortedMonths.map(m => monthlyTotals[m].income);
    const expenses = sortedMonths.map(m => monthlyTotals[m].expense);
    
    const avgInc = incomes.reduce((a, b) => a + b, 0) / incomes.length;
    const avgExp = expenses.reduce((a, b) => a + b, 0) / expenses.length;
    
    nextMonthIncome = avgInc * 1.03; // 3% projected growth
    nextMonthExpense = avgExp * 0.98; // 2% projected savings target
  }

  // Create a 3-month forecast timeline payload for Recharts graphing
  const historical = sortedMonths.map(month => ({
    month,
    Income: Math.round(monthlyTotals[month].income),
    Expenses: Math.round(monthlyTotals[month].expense),
    type: 'historical'
  }));

  const forecastData = [];
  const lastMonthKey = sortedMonths[sortedMonths.length - 1] || '2026-06';
  const [lastYear, lastMonth] = lastMonthKey.split('-').map(Number);

  for (let i = 1; i <= 3; i++) {
    const fDate = new Date(lastYear, lastMonth - 1 + i, 1);
    const fMonthKey = `${fDate.getFullYear()}-${String(fDate.getMonth() + 1).padStart(2, '0')}`;
    
    // Scale forecasts across months
    const factorInc = 1 + (0.02 * i); // progressive growth
    const factorExp = 1 - (0.015 * i); // progressive savings
    
    forecastData.push({
      month: fMonthKey,
      Income: Math.round(nextMonthIncome * factorInc),
      Expenses: Math.round(nextMonthExpense * factorExp),
      type: 'forecast'
    });
  }

  return {
    projectedIncome: Math.round(nextMonthIncome),
    projectedExpense: Math.round(nextMonthExpense),
    projectedNet: Math.round(nextMonthIncome - nextMonthExpense),
    chartData: [...historical, ...forecastData]
  };
};
