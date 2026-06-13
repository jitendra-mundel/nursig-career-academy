import express from 'express';
import { submitTest, getUserResults, getResultById, getAllResults, deleteResult } from '../controllers/resultController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * Test Result Routes
 */
router.post('/submit', protect, submitTest);
router.get('/user', protect, getUserResults);
router.get('/all', protect, authorize('admin'), getAllResults);
router.get('/:id', protect, getResultById);
router.delete('/:id', protect, authorize('admin'), deleteResult);

export default router;
