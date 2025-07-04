const { runQuery, getQuery, getOne } = require('../config/sqliteDb');
const Expense = require('./expenseModel');
const Budget = require('./budgetModel');
const mongoose = require('mongoose');

class Report {
  /**
   * Generate and save a monthly report for a user
   * @param {string} userId - User ID
   * @param {number} year - Year (e.g., 2023)
   * @param {number} month - Month (1-12)
   */
  static async generateMonthlyReport(userId, year, month) {
    try {
      // Convert userId to ObjectId if it's a string
      const userObjectId = typeof userId === 'string' ? mongoose.Types.ObjectId(userId) : userId;
      
      // Get start and end dates for the month
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      
      // Get all expenses for the month
      const expenses = await Expense.find({
        user: userObjectId,
        date: { $gte: startDate, $lte: endDate }
      });
      
      // Get all budgets for the user
      const budgets = await Budget.find({ user: userObjectId });
      
      // Calculate total spent
      const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      // Calculate total budget
      const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
      
      // Group expenses by category
      const expensesByCategory = expenses.reduce((acc, expense) => {
        if (!acc[expense.category]) {
          acc[expense.category] = 0;
        }
        acc[expense.category] += expense.amount;
        return acc;
      }, {});
      
      // Find top spending category
      let topCategory = null;
      let maxSpent = 0;
      
      for (const [category, amount] of Object.entries(expensesByCategory)) {
        if (amount > maxSpent) {
          maxSpent = amount;
          topCategory = category;
        }
      }
      
      // Determine budget status
      let budgetStatus = 'Under Budget';
      if (totalSpent > totalBudget) {
        budgetStatus = 'Over Budget';
      } else if (totalSpent >= totalBudget * 0.8) {
        budgetStatus = 'Near Budget';
      }
      
      // Save the monthly report
      const reportResult = await runQuery(
        `INSERT OR REPLACE INTO monthly_reports 
         (user_id, year, month, total_spent, total_budget, top_category, budget_status) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId.toString(), year, month, totalSpent, totalBudget, topCategory, budgetStatus]
      );
      
      const reportId = reportResult.id;
      
      // Process each category
      for (const budget of budgets) {
        const category = budget.category;
        const budgetAmount = budget.amount;
        const amountSpent = expensesByCategory[category] || 0;
        const percentageUsed = budgetAmount > 0 ? (amountSpent / budgetAmount) * 100 : 0;
        const isOverBudget = amountSpent > budgetAmount ? 1 : 0;
        
        // Save category report
        await runQuery(
          `INSERT OR REPLACE INTO category_reports
           (report_id, category, amount_spent, budget_amount, is_over_budget, percentage_used)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [reportId, category, amountSpent, budgetAmount, isOverBudget, percentageUsed]
        );
      }
      
      return {
        id: reportId,
        userId,
        year,
        month,
        totalSpent,
        totalBudget,
        topCategory,
        budgetStatus
      };
    } catch (error) {
      console.error('Error generating monthly report:', error);
      throw error;
    }
  }
  
  /**
   * Get a specific monthly report
   * @param {string} userId - User ID
   * @param {number} year - Year
   * @param {number} month - Month (1-12)
   */
  static async getMonthlyReport(userId, year, month) {
    try {
      // Get the main report
      const report = await getOne(
        `SELECT * FROM monthly_reports WHERE user_id = ? AND year = ? AND month = ?`,
        [userId.toString(), year, month]
      );
      
      if (!report) {
        return null;
      }
      
      // Get category details
      const categories = await getQuery(
        `SELECT * FROM category_reports WHERE report_id = ?`,
        [report.id]
      );
      
      return {
        ...report,
        categories
      };
    } catch (error) {
      console.error('Error getting monthly report:', error);
      throw error;
    }
  }
  
  /**
   * Get reports for the last N months
   * @param {string} userId - User ID
   * @param {number} count - Number of months to retrieve (default: 3)
   */
  static async getRecentReports(userId, count = 3) {
    try {
      const reports = await getQuery(
        `SELECT * FROM monthly_reports 
         WHERE user_id = ? 
         ORDER BY year DESC, month DESC 
         LIMIT ?`,
        [userId.toString(), count]
      );
      
      // Get categories for each report
      const result = [];
      for (const report of reports) {
        const categories = await getQuery(
          `SELECT * FROM category_reports WHERE report_id = ?`,
          [report.id]
        );
        
        result.push({
          ...report,
          categories
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error getting recent reports:', error);
      throw error;
    }
  }
}

module.exports = Report; 