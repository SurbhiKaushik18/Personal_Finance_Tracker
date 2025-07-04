const express = require('express');
const router = express.Router();
const {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetComparison,
} = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getBudgets).post(protect, createBudget);
router.route('/comparison').get(protect, getBudgetComparison);
router
  .route('/:id')
  .put(protect, updateBudget)
  .delete(protect, deleteBudget);

module.exports = router; 