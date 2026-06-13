import mongoose from 'mongoose';
import { createIndexes } from './indexSetup.js';

/**
 * Connect to MongoDB Atlas with Connection Pooling
 * Optimized for 3000+ concurrent users
 */
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Connection Pooling (critical for scaling)
      maxPoolSize: 100,        // Max 100 connections in pool
      minPoolSize: 20,         // Min 20 connections
      maxIdleTimeMS: 45000,    // Idle timeout 45 seconds
      
      // Performance settings
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      
      // Retry logic
      retryWrites: true,
      retryReads: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Connection Pool: Min=${20}, Max=${100}`);
    
    // Create indexes for performance
    await createIndexes();
    
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
