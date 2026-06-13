import TestResult from '../models/TestResult.js';
import Test from '../models/Test.js';
import Question from '../models/Question.js';

const calculatePercentile = (totalCandidates, lowerCount, equalCount) => {
  if (!totalCandidates) return 0;
  return ((lowerCount + equalCount / 2) / totalCandidates) * 100;
};

const formatPercentile = (value) => parseFloat(value.toFixed(2));

/**
 * Submit Test
 * POST /api/results/submit
 */
export const submitTest = async (req, res, next) => {
  try {
    const { testId, answers, timeSpent } = req.body;

    if (!testId || !answers) {
      return res.status(400).json({
        success: false,
        message: 'Please provide testId and answers',
      });
    }

    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found',
      });
    }

    // Prevent multiple attempts per user for the same test
    const existing = await TestResult.findOne({ userId: req.user.id, testId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already attempted this test.' });
    }

    // Calculate marks
    let marksObtained = 0;
    const questionIds = Object.keys(answers);

    for (const questionId of questionIds) {
      const question = await Question.findById(questionId);
      if (question && question.correctAnswer === answers[questionId]) {
        marksObtained += question.marks;
      }
    }

    const percentage = (marksObtained / test.totalMarks) * 100;
    const isPassed = marksObtained >= test.passingMarks;

    const result = await TestResult.create({
      userId: req.user.id,
      testId,
      answers,
      marksObtained,
      totalMarks: test.totalMarks,
      percentage: parseFloat(percentage.toFixed(2)),
      isPassed,
      timeSpent,
    });

    res.status(201).json({
      success: true,
      message: 'Test submitted successfully',
      result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get User Test Results (Optimized for 3000+ users)
 * GET /api/results/user?page=1&limit=20
 */
export const getUserResults = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Pagination with lean queries for performance
    const results = await TestResult.find({ userId: req.user.id })
      .lean()
      .select('testId marksObtained totalMarks percentage isPassed createdAt')
      .populate('testId', 'title subject totalMarks')
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum)
      .exec();

    // Calculate percentiles efficiently
    const resultsWithPercentile = await Promise.all(
      results.map(async (result) => {
        const totalParticipants = await TestResult.countDocuments({ testId: result.testId });
        const lowerCount = await TestResult.countDocuments({ testId: result.testId, percentage: { $lt: result.percentage } });
        const equalCount = await TestResult.countDocuments({ testId: result.testId, percentage: result.percentage });
        return {
          ...result,
          percentile: formatPercentile(calculatePercentile(totalParticipants, lowerCount, equalCount)),
        };
      })
    );

    const total = await TestResult.countDocuments({ userId: req.user.id });
    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      count: resultsWithPercentile.length,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalResults: total,
        perPage: limitNum,
      },
      results: resultsWithPercentile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Single Result
 * GET /api/results/:id
 */
export const getResultById = async (req, res, next) => {
  try {
    const result = await TestResult.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('testId', 'title subject totalMarks');

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Result not found',
      });
    }

    // Build detailed question list with user's answer and correctness
    const answerEntries = result.answers instanceof Map ? Array.from(result.answers.entries()) : Object.entries(result.answers || {});
    const questionIds = answerEntries.map(([qid]) => qid);

    const questions = await Question.find({ _id: { $in: questionIds } });
    const questionsById = {};
    questions.forEach((q) => { questionsById[q._id] = q; });

    const detailed = answerEntries.map(([qid, userAnswer]) => {
      const q = questionsById[qid];
      return {
        questionId: q?._id || qid,
        questionText: q?.questionText || '',
        options: q?.options || [],
        userAnswer: userAnswer,
        correctAnswer: q?.correctAnswer || '',
        explanation: q?.explanation || '',
        isCorrect: q ? (String(q.correctAnswer) === String(userAnswer)) : null,
        marks: q?.marks || 0,
      };
    });

    const stats = detailed.reduce(
      (acc, q) => {
        if (q.userAnswer === undefined || q.userAnswer === null || q.userAnswer === '') {
          acc.skipped += 1;
        } else if (q.isCorrect) {
          acc.correct += 1;
        } else {
          acc.wrong += 1;
        }
        return acc;
      },
      { correct: 0, wrong: 0, skipped: 0 }
    );

    const sameTestResults = await TestResult.find({ testId: result.testId?._id || result.testId })
      .select('percentage marksObtained')
      .sort({ percentage: -1, marksObtained: -1, createdAt: 1 });

    const rankPosition = sameTestResults.findIndex((r) => r._id.equals(result._id)) + 1;
    const totalParticipants = sameTestResults.length;

    const lowerCount = sameTestResults.filter((r) => r.percentage < result.percentage).length;
    const equalCount = sameTestResults.filter((r) => r.percentage === result.percentage).length;
    const percentileValue = calculatePercentile(totalParticipants, lowerCount, equalCount);

    res.status(200).json({
      success: true,
      result: {
        ...result.toObject(),
        detailed,
        stats,
        percentile: formatPercentile(percentileValue),
        rank: {
          position: rankPosition || 0,
          totalParticipants,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get All Results (Admin Only, Optimized for 3000+ users)
 * GET /api/results?page=1&limit=50&userId=...&testId=...
 */
export const getAllResults = async (req, res, next) => {
  try {
    const { userId, testId, page = 1, limit = 50 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(200, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    let query = {};
    if (userId) query.userId = userId;
    if (testId) query.testId = testId;

    // Pagination with lean queries for performance
    const results = await TestResult.find(query)
      .lean()
      .select('userId testId marksObtained totalMarks percentage isPassed createdAt')
      .populate('userId', 'name email')
      .populate('testId', 'title subject')
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum)
      .exec();

    const total = await TestResult.countDocuments(query);
    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      count: results.length,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalResults: total,
        perPage: limitNum,
      },
      results,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Result (Admin)
 * DELETE /api/results/:id
 */
export const deleteResult = async (req, res, next) => {
  try {
    const deleted = await TestResult.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Result not found' });
    }

    res.status(200).json({ success: true, message: 'Result deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export default { submitTest, getUserResults, getResultById, getAllResults, deleteResult };
