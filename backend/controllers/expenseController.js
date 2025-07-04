const Expense = require('../models/expenseModel');

// @desc    Get expenses
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res) => {
  try {
    // Get all expenses for the logged-in user
    const expenses = await Expense.find({ user: req.user.id }).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create expense
// @route   POST /api/expenses
// @access  Private
const createExpense = async (req, res) => {
  try {
    const { amount, description, category, date } = req.body;

    // Create expense
    const expense = await Expense.create({
      user: req.user.id,
      amount,
      description,
      category,
      date: date || Date.now(),
    });

    res.status(201).json(expense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Check if expense belongs to user
    if (expense.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedExpense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Check if expense belongs to user
    if (expense.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await Expense.deleteOne({ _id: req.params.id });

    res.json({ id: req.params.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get expense summary by category
// @route   GET /api/expenses/summary
// @access  Private
const getExpenseSummary = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    console.log('getExpenseSummary called with params:', { month, year, userId: req.user.id });
    
    // Build date filter
    let dateFilter = { user: req.user.id };
    
    if (month && year) {
      // Convert month and year to numbers to ensure proper date creation
      const numMonth = parseInt(month, 10);
      const numYear = parseInt(year, 10);
      
      // Create start date (first day of month) and end date (last day of month)
      const startDate = new Date(numYear, numMonth - 1, 1);
      const endDate = new Date(numYear, numMonth, 0, 23, 59, 59, 999); // Last day with time set to end of day
      
      console.log('Date filter:', { 
        startDate: startDate.toISOString(), 
        endDate: endDate.toISOString(),
        numMonth,
        numYear
      });
      
      dateFilter.date = {
        $gte: startDate,
        $lte: endDate,
      };
    }
    
    console.log('Final query filter:', JSON.stringify(dateFilter));
    
    // Aggregate expenses by category
    const summary = await Expense.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    console.log('Expense summary results:', summary);

    res.json(summary);
  } catch (error) {
    console.error('Error in getExpenseSummary:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseSummary,
}; 