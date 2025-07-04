const Budget = require('../models/budgetModel');
const Expense = require('../models/expenseModel');

// @desc    Get budgets
// @route   GET /api/budgets
// @access  Private
const getBudgets = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    // Build query filter
    let filter = { user: req.user.id };
    
    if (month && year) {
      filter.month = month;
      filter.year = year;
    }
    
    // Get all budgets for the logged-in user
    const budgets = await Budget.find(filter);
    res.json(budgets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create budget
// @route   POST /api/budgets
// @access  Private
const createBudget = async (req, res) => {
  try {
    const { amount, category, paymentMethod, month, year } = req.body;

    // Check if budget already exists for this category, month and year
    const existingBudget = await Budget.findOne({
      user: req.user.id,
      category,
      month,
      year,
    });

    if (existingBudget) {
      return res.status(400).json({
        message: 'Budget already exists for this category in the selected month',
      });
    }

    // Create budget
    const budget = await Budget.create({
      user: req.user.id,
      amount,
      category,
      paymentMethod,
      month,
      year,
    });

    res.status(201).json(budget);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update budget
// @route   PUT /api/budgets/:id
// @access  Private
const updateBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    // Check if budget belongs to user
    if (budget.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const updatedBudget = await Budget.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedBudget);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete budget
// @route   DELETE /api/budgets/:id
// @access  Private
const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    // Check if budget belongs to user
    if (budget.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await Budget.deleteOne({ _id: req.params.id });

    res.json({ id: req.params.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get budget vs actual spending
// @route   GET /api/budgets/comparison
// @access  Private
const getBudgetComparison = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    console.log('getBudgetComparison called with params:', { month, year, userId: req.user.id });
    
    if (!month || !year) {
      return res.status(400).json({ message: 'Month and year are required' });
    }
    
    // Convert month and year to numbers to ensure proper date creation
    const numMonth = parseInt(month, 10);
    const numYear = parseInt(year, 10);
    
    // Get all budgets for the specified month and year
    const budgets = await Budget.find({
      user: req.user.id,
      month: numMonth,
      year: numYear,
    });
    
    console.log(`Found ${budgets.length} budgets for month ${numMonth}, year ${numYear}`);
    
    // Calculate start and end date for the month
    const startDate = new Date(numYear, numMonth - 1, 1);
    const endDate = new Date(numYear, numMonth, 0, 23, 59, 59, 999); // Last day with time set to end of day
    
    console.log('Date filter for expenses:', { 
      startDate: startDate.toISOString(), 
      endDate: endDate.toISOString()
    });
    
    // Get expenses for the month grouped by category
    const expenses = await Expense.aggregate([
      {
        $match: {
          user: req.user.id,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$category',
          actual: { $sum: '$amount' },
        },
      },
    ]);
    
    console.log(`Found expense data for ${expenses.length} categories:`, expenses);
    
    // Create a map of expenses by category
    const expenseMap = {};
    expenses.forEach((expense) => {
      expenseMap[expense._id] = expense.actual;
    });
    
    // Combine budget and actual data
    const comparison = budgets.map((budget) => {
      const actual = expenseMap[budget.category] || 0;
      const remaining = budget.amount - actual;
      const percentage = budget.amount > 0 ? (actual / budget.amount) * 100 : 0;
      
      return {
        category: budget.category,
        budgeted: budget.amount,
        actual,
        remaining,
        percentage: Math.round(percentage),
      };
    });
    
    console.log('Final budget comparison:', comparison);
    
    res.json(comparison);
  } catch (error) {
    console.error('Error in getBudgetComparison:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetComparison,
}; 