import mongoose from 'mongoose';

/**
 * Test Schema
 * Stores test/exam information created by admin
 */
const testSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    totalMarks: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number, // in minutes
      required: true,
    },
    passingMarks: {
      type: Number,
      required: true,
    },
    instructions: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    allowedAttempts: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

const Test = mongoose.model('Test', testSchema);
export default Test;
