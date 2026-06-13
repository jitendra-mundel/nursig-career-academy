import Test from '../models/Test.js';
import Question from '../models/Question.js';
import TestResult from '../models/TestResult.js';

/**
 * Create Test (Admin Only)
 * POST /api/tests
 */
export const createTest = async (req, res, next) => {
  try {
    const { title, description, subject, totalQuestions, totalMarks, duration, passingMarks, instructions } = req.body;

    if (!title || !subject || !totalQuestions || !totalMarks || !duration || !passingMarks) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    const test = await Test.create({
      title,
      description,
      subject,
      totalQuestions,
      totalMarks,
      duration,
      passingMarks,
      instructions,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Test created successfully',
      test,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get All Tests (Optimized for 3000+ users)
 * GET /api/tests?page=1&limit=20&subject=Math
 * - Regular users: only published tests
 * - Admins: all tests (draft + published)
 * - Pagination: prevents loading all tests at once
 */
export const getAllTests = async (req, res, next) => {
  try {
    const { subject, page = 1, limit = 20 } = req.query;
    const isAdmin = req.user?.role === 'admin';
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    let query = isAdmin ? {} : { isPublished: true };

    if (subject) {
      query.subject = subject;
    }

    // Lean queries for read-heavy operations (faster for 3000+ users)
    const tests = await Test.find(query)
      .lean()
      .select('title subject totalMarks duration totalQuestions')
      .populate('createdBy', 'name')
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum)
      .exec();

    const total = await Test.countDocuments(query);
    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      count: tests.length,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalTests: total,
        perPage: limitNum,
      },
      tests,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Test by ID
 * GET /api/tests/:id
 */
export const getTestById = async (req, res, next) => {
  try {
    const test = await Test.findById(req.params.id).populate('createdBy', 'name email');

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found',
      });
    }

    res.status(200).json({
      success: true,
      test,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Test (Admin Only)
 * PUT /api/tests/:id
 */
export const updateTest = async (req, res, next) => {
  try {
    let test = await Test.findById(req.params.id);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found',
      });
    }

    test = await Test.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Test updated successfully',
      test,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Test (Admin Only)
 * DELETE /api/tests/:id
 */
export const deleteTest = async (req, res, next) => {
  try {
    const test = await Test.findById(req.params.id);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found',
      });
    }

    // Delete all questions associated with this test
    await Question.deleteMany({ testId: req.params.id });

    // Delete all user results associated with this test
    await TestResult.deleteMany({ testId: req.params.id });

    await Test.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Test deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Publish Test (Admin Only)
 * PUT /api/tests/:id/publish
 */
export const publishTest = async (req, res, next) => {
  try {
    const test = await Test.findByIdAndUpdate(
      req.params.id,
      { isPublished: true },
      { new: true, runValidators: true }
    );

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Test published successfully',
      test,
    });
  } catch (error) {
    next(error);
  }
};

export default { createTest, getAllTests, getTestById, updateTest, deleteTest, publishTest };
