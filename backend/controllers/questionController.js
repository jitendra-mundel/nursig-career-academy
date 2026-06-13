import Question from '../models/Question.js';

/**
 * Create Question (Admin Only)
 * POST /api/questions
 */
export const createQuestion = async (req, res, next) => {
  try {
    const { testId, questionText, options, correctAnswer, marks, explanation, difficulty, questionType } = req.body;

    if (!testId || !questionText || !correctAnswer) {
      return res.status(400).json({
        success: false,
        message: 'Please provide testId, questionText, and correctAnswer',
      });
    }

    const question = await Question.create({
      testId,
      questionText,
      options: questionType === 'mcq' ? options : [],
      correctAnswer,
      marks: marks || 1,
      explanation,
      difficulty,
      questionType,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      question,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create Questions in Bulk (Admin Only)
 * POST /api/questions/bulk
 */
export const createQuestionsBulk = async (req, res, next) => {
  try {
    const { questions } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, message: 'questions must be a non-empty array' });
    }

    const docs = questions.map((q) => ({
      testId: q.testId,
      questionText: q.questionText,
      options: q.questionType === 'mcq' ? (q.options || []) : [],
      correctAnswer: q.correctAnswer,
      marks: q.marks || 1,
      explanation: q.explanation,
      difficulty: q.difficulty || 'medium',
      questionType: q.questionType || (q.options && q.options.length ? 'mcq' : 'short_answer'),
      createdBy: req.user.id,
    }));

    const created = await Question.insertMany(docs, { ordered: false });

    res.status(201).json({ success: true, message: `${created.length} questions created`, count: created.length, questions: created });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Questions by Test ID (Optimized for 3000+ users)
 * GET /api/questions/test/:testId?page=1&limit=50
 */
export const getQuestionsByTest = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(200, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Lean queries for performance
    const questions = await Question.find({ testId: req.params.testId })
      .lean()
      .select('questionText options correctAnswer marks explanation difficulty questionType')
      .sort('_id')
      .skip(skip)
      .limit(limitNum)
      .exec();

    const total = await Question.countDocuments({ testId: req.params.testId });
    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      count: questions.length,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalQuestions: total,
        perPage: limitNum,
      },
      questions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Single Question
 * GET /api/questions/:id
 */
export const getQuestionById = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id).populate('createdBy', 'name email');

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    res.status(200).json({
      success: true,
      question,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Question (Admin Only)
 * PUT /api/questions/:id
 */
export const updateQuestion = async (req, res, next) => {
  try {
    let question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    question = await Question.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Question updated successfully',
      question,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Question (Admin Only)
 * DELETE /api/questions/:id
 */
export const deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    await Question.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Question deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export default { createQuestion, getQuestionsByTest, getQuestionById, updateQuestion, deleteQuestion };
