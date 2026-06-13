import mongoose from 'mongoose';

/**
 * Database Indexes for 3000+ Concurrent Users
 * These indexes dramatically improve query performance
 * Run once after MongoDB connection is established
 */

export const createIndexes = async () => {
  try {
    console.log("🔍 Creating database indexes for optimal performance...");

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('MongoDB connection is not established for index creation.');
    }

    // TestResult Indexes - Critical for percentile and ranking queries
    await db.collection("testresults").createIndex({ userId: 1, testId: 1 });
    console.log("✅ Index created: testresults.userId + testId (unique attempt check)");

    await db.collection("testresults").createIndex({ testId: 1, percentage: -1 });
    console.log("✅ Index created: testresults.testId + percentage (ranking queries)");

    await db.collection("testresults").createIndex({ createdAt: -1 });
    console.log("✅ Index created: testresults.createdAt (latest results)");

    // Test Indexes - Critical for filtering and sorting
    await db.collection("tests").createIndex({ isPublished: 1, subject: 1 });
    console.log("✅ Index created: tests.isPublished + subject (filter queries)");

    await db.collection("tests").createIndex({ createdAt: -1 });
    console.log("✅ Index created: tests.createdAt (sorting)");

    // User Indexes - Critical for authentication and lookups
    await db.collection("users").createIndex({ email: 1 }, { unique: true });
    console.log("✅ Index created: users.email (unique, auth lookup)");

    // Notes Indexes
    await db.collection("notes").createIndex({ isPublished: 1, subject: 1 });
    console.log("✅ Index created: notes.isPublished + subject");

    await db.collection("notes").createIndex({ createdAt: -1 });
    console.log("✅ Index created: notes.createdAt");

    // Question Indexes
    await db.collection("questions").createIndex({ testId: 1 });
    console.log("✅ Index created: questions.testId");

    console.log("✨ All indexes created successfully!");
  } catch (error) {
    console.error("❌ Index creation failed:", error.message);
  }
};

/**
 * Usage in backend/config/database.js:
 * 
 * import { createIndexes } from './indexSetup.js';
 * 
 * mongoose.connect(mongoURI, options)
 *   .then(() => {
 *     console.log("MongoDB connected");
 *     createIndexes(); // Run after connection
 *   })
 *   .catch(err => console.error(err));
 */
