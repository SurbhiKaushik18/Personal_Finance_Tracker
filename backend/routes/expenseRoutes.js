const express = require('express');
const router = express.Router();
const {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseSummary,
} = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getExpenses).post(protect, createExpense);
router.route('/summary').get(protect, getExpenseSummary);
router
  .route('/:id')
  .put(protect, updateExpense)
  .delete(protect, deleteExpense);

module.exports = router; 