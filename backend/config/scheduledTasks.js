const cron = require('node-cron');
const mongoose = require('mongoose');
const User = require('../models/userModel');
const Report = require('../models/reportModel');

/**
 * Schedule tasks for automatic report generation
 */
function scheduleTasks() {
  console.log('Setting up scheduled tasks...');
  
  // Generate monthly reports on the 1st day of each month at 00:05 AM
  cron.schedule('5 0 1 * *', async () => {
    console.log('Running scheduled task: Monthly report generation');
    
    try {
      // Get previous month and year
      const now = new Date();
      let year = now.getFullYear();
      let month = now.getMonth(); // 0-indexed, so January is 0
      
      // If current month is January (0), then previous month is December (11) of previous year
      if (month === 0) {
        month = 12;
        year -= 1;
      }
      
      console.log(`Generating reports for ${year}-${month}`);
      
      // Get all users
      const users = await User.find({});
      console.log(`Found ${users.length} users for report generation`);
      
      // Generate reports for each user
      let successCount = 0;
      let errorCount = 0;
      
      for (const user of users) {
        try {
          await Report.generateMonthlyReport(user._id, year, month);
          successCount++;
        } catch (error) {
          console.error(`Error generating report for user ${user._id}:`, error);
          errorCount++;
        }
      }
      
      console.log(`Monthly report generation completed: ${successCount} succeeded, ${errorCount} failed`);
    } catch (error) {
      console.error('Error in monthly report generation task:', error);
    }
  }, {
    scheduled: true,
    timezone: "Asia/Kolkata" // Set to Indian timezone
  });
  
  // Weekly backup of reports database every Sunday at 2 AM
  cron.schedule('0 2 * * 0', () => {
    console.log('Running scheduled task: Weekly reports database backup');
    // Implementation for database backup would go here
    // This is a placeholder for future implementation
  }, {
    scheduled: true,
    timezone: "Asia/Kolkata" // Set to Indian timezone
  });
}

module.exports = scheduleTasks; 