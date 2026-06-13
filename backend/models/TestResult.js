import mongoose from 'mongoose';

/**
 * Test Result Schema
 * Stores user test attempts and scores
 */
const testResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test',
      required: true,
    },
    answers: {
      type: Map,
      of: String, // questionId: answer
    },
    marksObtained: {
      type: Number,
      required: true,
    },
    totalMarks: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
    isPassed: {
      type: Boolean,
      required: true,
    },
    attemptNumber: {
      type: Number,
      default: 1,
    },
    timeSpent: {
      type: Number, // in seconds
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const TestResult = mongoose.model('TestResult', testResultSchema);
export default TestResult;
