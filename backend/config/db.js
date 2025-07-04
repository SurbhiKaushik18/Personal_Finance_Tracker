const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }
    
    // Log the first few characters of the URI for debugging (don't log full URI for security)
    const uriStart = process.env.MONGO_URI.substring(0, 20) + '...';
    console.log(`Using MongoDB URI: ${uriStart}`);
    
    // Configure MongoDB connection options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      family: 4 // Use IPv4, skip trying IPv6
    };
    
    console.log('Attempting to connect to MongoDB with options:', JSON.stringify(options));
    
    // Try connecting with a timeout
    const connectPromise = mongoose.connect(process.env.MONGO_URI, options);
    
    // Add a timeout to the connection attempt
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('MongoDB connection timeout after 10 seconds'));
      }, 10000);
    });
    
    // Race the connection against the timeout
    const conn = await Promise.race([connectPromise, timeoutPromise]);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    
    // Provide more helpful error messages based on error type
    if (error.name === 'MongoServerSelectionError') {
      console.error('Could not connect to MongoDB server. Please check:');
      console.error('1. Is MongoDB installed and running?');
      console.error('2. Is the connection string correct?');
      console.error('3. Are network settings allowing the connection?');
    } else if (error.name === 'MongoParseError') {
      console.error('Invalid MongoDB connection string. Please check the format.');
    }
    
    throw error;
  }
};

module.exports = connectDB; 