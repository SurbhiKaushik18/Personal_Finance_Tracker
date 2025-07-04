const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure the data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Create database connection
const dbPath = path.join(dataDir, 'monthly_reports.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  db.serialize(() => {
    // Create monthly_reports table
    db.run(`
      CREATE TABLE IF NOT EXISTS monthly_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        year INTEGER NOT NULL,
        month INTEGER NOT NULL,
        total_spent REAL NOT NULL,
        total_budget REAL NOT NULL,
        top_category TEXT,
        budget_status TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, year, month)
      )
    `, (err) => {
      if (err) {
        console.error('Error creating monthly_reports table:', err.message);
      } else {
        console.log('monthly_reports table initialized');
      }
    });

    // Create category_reports table for detailed category data
    db.run(`
      CREATE TABLE IF NOT EXISTS category_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        report_id INTEGER NOT NULL,
        category TEXT NOT NULL,
        amount_spent REAL NOT NULL,
        budget_amount REAL NOT NULL,
        is_over_budget INTEGER NOT NULL,
        percentage_used REAL NOT NULL,
        FOREIGN KEY (report_id) REFERENCES monthly_reports(id) ON DELETE CASCADE,
        UNIQUE(report_id, category)
      )
    `, (err) => {
      if (err) {
        console.error('Error creating category_reports table:', err.message);
      } else {
        console.log('category_reports table initialized');
      }
    });
  });
}

// Helper function to run queries with promises
function runQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

// Helper function to get query results with promises
function getQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
}

// Helper function to get a single row
function getOne(query, params = []) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row);
    });
  });
}

module.exports = {
  db,
  runQuery,
  getQuery,
  getOne
}; 