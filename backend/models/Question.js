import mongoose from 'mongoose';

/**
 * Question Schema
 * Stores multiple choice questions for tests
 */
const questionSchema = new mongoose.Schema(
  {
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test',
      required: true,
    },
    questionText: {
      type: String,
      required: [true, 'Please provide question text'],
    },
    questionType: {
      type: String,
      enum: ['mcq', 'short_answer'],
      default: 'mcq',
    },
    options: {
      type: [String],
      required: function () {
        return this.questionType === 'mcq';
      },
    },
    correctAnswer: {
      type: String,
      required: [true, 'Please provide correct answer'],
    },
    marks: {
      type: Number,
      required: true,
      default: 1,
    },
    explanation: {
      type: String,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

const Question = mongoose.model('Question', questionSchema);
export default Question;
