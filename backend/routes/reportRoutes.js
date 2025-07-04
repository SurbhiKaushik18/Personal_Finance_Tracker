const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  generateReport,
  getMonthlyReport,
  getRecentReports,
  generateCurrentMonthReport
} = require('../controllers/reportController');

// Generate a monthly report
router.post('/generate', protect, generateReport);

// Generate current month's report
router.post('/generate-current', protect, generateCurrentMonthReport);

// Get recent reports (default: last 3 months)
router.get('/recent/:count?', protect, getRecentReports);

// Get a specific monthly report
router.get('/:year/:month', protect, getMonthlyReport);

module.exports = router; 