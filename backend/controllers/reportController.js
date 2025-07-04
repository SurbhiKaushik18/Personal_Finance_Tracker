const Report = require('../models/reportModel');
const asyncHandler = require('express-async-handler');

/**
 * @desc    Generate monthly report
 * @route   POST /api/reports/generate
 * @access  Private
 */
const generateReport = asyncHandler(async (req, res) => {
  try {
    const { year, month } = req.body;
    
    // Validate input
    if (!year || !month) {
      res.status(400);
      throw new Error('Please provide year and month');
    }
    
    // Parse as integers
    const yearInt = parseInt(year);
    const monthInt = parseInt(month);
    
    // Validate year and month
    if (isNaN(yearInt) || isNaN(monthInt) || monthInt < 1 || monthInt > 12) {
      res.status(400);
      throw new Error('Invalid year or month');
    }
    
    // Generate report
    const report = await Report.generateMonthlyReport(req.user._id, yearInt, monthInt);
    
    res.status(201).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating report'
    });
  }
});

/**
 * @desc    Get a specific monthly report
 * @route   GET /api/reports/:year/:month
 * @access  Private
 */
const getMonthlyReport = asyncHandler(async (req, res) => {
  try {
    const { year, month } = req.params;
    
    // Parse as integers
    const yearInt = parseInt(year);
    const monthInt = parseInt(month);
    
    // Validate year and month
    if (isNaN(yearInt) || isNaN(monthInt) || monthInt < 1 || monthInt > 12) {
      res.status(400);
      throw new Error('Invalid year or month');
    }
    
    // Get report
    const report = await Report.getMonthlyReport(req.user._id, yearInt, monthInt);
    
    if (!report) {
      res.status(404);
      throw new Error('Report not found');
    }
    
    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error getting report:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error getting report'
    });
  }
});

/**
 * @desc    Get recent monthly reports (default: last 3 months)
 * @route   GET /api/reports/recent/:count?
 * @access  Private
 */
const getRecentReports = asyncHandler(async (req, res) => {
  try {
    const count = req.params.count ? parseInt(req.params.count) : 3;
    
    if (isNaN(count) || count < 1) {
      res.status(400);
      throw new Error('Invalid count parameter');
    }
    
    // Get recent reports
    const reports = await Report.getRecentReports(req.user._id, count);
    
    res.status(200).json({
      success: true,
      data: reports
    });
  } catch (error) {
    console.error('Error getting recent reports:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error getting recent reports'
    });
  }
});

/**
 * @desc    Generate current month's report
 * @route   POST /api/reports/generate-current
 * @access  Private
 */
const generateCurrentMonthReport = asyncHandler(async (req, res) => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // JavaScript months are 0-indexed
    
    // Generate report
    const report = await Report.generateMonthlyReport(req.user._id, year, month);
    
    res.status(201).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error generating current month report:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating current month report'
    });
  }
});

module.exports = {
  generateReport,
  getMonthlyReport,
  getRecentReports,
  generateCurrentMonthReport
}; 