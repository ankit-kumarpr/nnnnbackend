const mongoose = require("mongoose");

function connectToDb() {
  // Production-optimized connection options for newer MongoDB driver
  const options = {
    // Connection timeout settings
    serverSelectionTimeoutMS: 30000, // 30 seconds
    socketTimeoutMS: 45000, // 45 seconds
    connectTimeoutMS: 30000, // 30 seconds
    
    // Connection pool settings
    maxPoolSize: 10, // Maximum number of connections in the pool
    minPoolSize: 2, // Minimum number of connections in the pool
    maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
    
    // Retry settings
    retryWrites: true,
    retryReads: true,
    
    // Heartbeat settings
    heartbeatFrequencyMS: 10000, // Send a ping every 10 seconds
    
    // Additional production settings
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  mongoose
    .connect(process.env.MONGO_URI, options)
    .then(() => {
      console.log("✅ Connected successfully to MongoDB");
      
      // Handle connection events
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err);
      });
      
      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️ MongoDB disconnected');
      });
      
      mongoose.connection.on('reconnected', () => {
        console.log('🔄 MongoDB reconnected');
      });
    })
    .catch((error) => {
      console.error("❌ Error connecting to MongoDB:", error);
      process.exit(1); // Exit process on connection failure
    });
}

module.exports = connectToDb;
