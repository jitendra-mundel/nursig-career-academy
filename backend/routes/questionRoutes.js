import express from 'express';
import { createQuestion, createQuestionsBulk, getQuestionsByTest, getQuestionById, updateQuestion, deleteQuestion } from '../controllers/questionController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * Question Routes
 */
router.get('/test/:testId', getQuestionsByTest);
router.get('/:id', getQuestionById);
router.post('/', protect, authorize('admin'), createQuestion);
router.post('/bulk', protect, authorize('admin'), createQuestionsBulk);
router.put('/:id', protect, authorize('admin'), updateQuestion);
router.delete('/:id', protect, authorize('admin'), deleteQuestion);

export default router;
