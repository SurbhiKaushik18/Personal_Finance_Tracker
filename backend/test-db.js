const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

// Manually read .env file
const envPath = path.join(__dirname, '.env');
console.log('Checking for .env file at:', envPath);

if (fs.existsSync(envPath)) {
  console.log('.env file exists');
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('.env file content:', envContent);
  
  // Parse the .env file
  const envVars = envContent.split('\n').reduce((acc, line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      acc[match[1]] = match[2];
    }
    return acc;
  }, {});
  
  console.log('Parsed environment variables:', envVars);
  
  // Set the variables manually
  if (envVars.MONGO_URI) {
    process.env.MONGO_URI = envVars.MONGO_URI;
  }
  if (envVars.JWT_SECRET) {
    process.env.JWT_SECRET = envVars.JWT_SECRET;
  }
}

// Hardcoded MongoDB URI as fallback
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/finance_tracker';

const testConnection = async () => {
  try {
    console.log('Testing MongoDB connection...');
    console.log('MongoDB URI:', MONGO_URI);
    
    const conn = await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB Connected successfully: ${conn.connection.host}`);
    
    // Create a test collection and document
    const TestModel = mongoose.model('Test', new mongoose.Schema({
      name: String,
      date: { type: Date, default: Date.now }
    }));
    
    const testDoc = await TestModel.create({ name: 'Test Document' });
    console.log('Test document created:', testDoc);
    
    // Clean up
    await TestModel.deleteOne({ _id: testDoc._id });
    console.log('Test document deleted');
    
    // Close connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
    console.log('All tests passed! MongoDB connection is working correctly.');
  } catch (error) {
    console.error(`MongoDB Connection Test Error: ${error.message}`);
    console.error('Full error:', error);
  } finally {
    process.exit(0);
  }
};

testConnection(); 