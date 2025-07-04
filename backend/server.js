const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

console.log('Starting server...');

// Load environment variables - try both project root and backend directory
dotenv.config();
dotenv.config({ path: path.join(__dirname, '.env') });

// Debug environment variables
console.log('Environment variables after dotenv:');
console.log('MONGO_URI exists:', !!process.env.MONGO_URI);
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('PORT:', process.env.PORT);

// Manually read .env file if environment variables are not set
if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
  console.log('Some environment variables missing, trying to load manually...');
  
  // Try backend directory first
  let envPath = path.join(__dirname, '.env');
  console.log('Checking for .env at:', envPath);
  
  if (!fs.existsSync(envPath)) {
    // Try project root
    envPath = path.join(__dirname, '..', '.env');
    console.log('Checking for .env at:', envPath);
  }
  
  if (fs.existsSync(envPath)) {
    console.log('.env file found at:', envPath);
    
    try {
      // Read file with explicit encoding
      const envContent = fs.readFileSync(envPath, 'ascii');
      console.log('.env file content (first 20 chars):', envContent.substring(0, 20) + '...');
      
      // Parse the .env file
      const envVars = {};
      const lines = envContent.split('\n');
      
      console.log(`Found ${lines.length} lines in .env file`);
      
      lines.forEach((line, index) => {
        if (line.trim() === '') return;
        
        console.log(`Processing line ${index + 1}:`, line.substring(0, 10) + '...');
        
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          let value = match[2].trim();
          
          // Remove quotes if present
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.substring(1, value.length - 1);
          }
          
          envVars[key] = value;
          console.log(`Set variable: ${key}=${value.substring(0, 5)}...`);
        }
      });
      
      console.log('Parsed environment variables:', Object.keys(envVars));
      
      // Set the variables manually
      if (envVars.MONGO_URI && !process.env.MONGO_URI) {
        process.env.MONGO_URI = envVars.MONGO_URI;
        console.log('Manually set MONGO_URI from .env file');
      }
      
      if (envVars.JWT_SECRET && !process.env.JWT_SECRET) {
        process.env.JWT_SECRET = envVars.JWT_SECRET;
        console.log('Manually set JWT_SECRET from .env file');
      }
      
      if (envVars.PORT && !process.env.PORT) {
        process.env.PORT = envVars.PORT;
        console.log('Manually set PORT from .env file');
      }
    } catch (err) {
      console.error('Error reading .env file:', err);
    }
  } else {
    console.log('No .env file found');
  }
}

// Set hardcoded defaults if still missing
if (!process.env.MONGO_URI) {
  console.log('MONGO_URI still not set, using hardcoded default');
  process.env.MONGO_URI = 'mongodb://localhost:27017/finance_tracker';
}

if (!process.env.JWT_SECRET) {
  console.log('JWT_SECRET still not set, using hardcoded default');
  process.env.JWT_SECRET = 'defaultsecret123456';
}

// Verify environment variables
console.log('Final environment check:');
console.log('MONGO_URI exists:', !!process.env.MONGO_URI);
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('MONGO_URI:', process.env.MONGO_URI.substring(0, 20) + '...');

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configure CORS with more permissive options
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

// Basic route to test API without database
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Database status route
app.get('/api/status', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const statusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  res.json({
    status: 'API is running',
    database: statusMap[dbStatus] || 'unknown',
    environment: {
      mongoUriExists: !!process.env.MONGO_URI,
      jwtSecretExists: !!process.env.JWT_SECRET
    }
  });
});

// Connect to database
let dbConnected = false;

// Start server first, then try to connect to database
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Now try to connect to database
  console.log('Attempting to connect to MongoDB...');
  connectDB()
    .then(() => {
      dbConnected = true;
      
      // Only set up database-dependent routes after successful connection
      app.use('/api/users', require('./routes/userRoutes'));
      app.use('/api/expenses', require('./routes/expenseRoutes'));
      app.use('/api/budgets', require('./routes/budgetRoutes'));
      app.use('/api/reports', require('./routes/reportRoutes'));
      
      // Initialize SQLite database for reports
      require('./config/sqliteDb');
      
      // Initialize scheduled tasks
      const scheduleTasks = require('./config/scheduledTasks');
      scheduleTasks();
      
      console.log('All routes initialized after successful DB connection');
    })
    .catch(err => {
      console.error('Failed to connect to MongoDB. API will run with limited functionality.');
      console.error('Error details:', err.message);
      
      // Set up error routes
      app.use('/api/users', (req, res) => {
        res.status(503).json({ 
          message: 'Database connection failed. User authentication is currently unavailable.',
          error: 'DATABASE_CONNECTION_ERROR'
        });
      });
      
      app.use('/api/expenses', (req, res) => {
        res.status(503).json({ 
          message: 'Database connection failed. Expense tracking is currently unavailable.',
          error: 'DATABASE_CONNECTION_ERROR'
        });
      });
      
      app.use('/api/budgets', (req, res) => {
        res.status(503).json({ 
          message: 'Database connection failed. Budget management is currently unavailable.',
          error: 'DATABASE_CONNECTION_ERROR'
        });
      });
      
      app.use('/api/reports', (req, res) => {
        res.status(503).json({ 
          message: 'Database connection failed. Report generation is currently unavailable.',
          error: 'DATABASE_CONNECTION_ERROR'
        });
      });
    });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(`Error: ${err.message}`);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
}); 