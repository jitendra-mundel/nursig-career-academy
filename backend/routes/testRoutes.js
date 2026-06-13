import express from 'express';
import { createTest, getAllTests, getTestById, updateTest, deleteTest, publishTest } from '../controllers/testController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * Optional authentication middleware
 */
const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    protect(req, res, next);
  } else {
    next();
  }
};

/**
 * Test Routes
 */
router.get('/', optionalAuth, getAllTests);
router.get('/:id', getTestById);
router.post('/', protect, authorize('admin'), createTest);
router.put('/:id', protect, authorize('admin'), updateTest);
router.delete('/:id', protect, authorize('admin'), deleteTest);
router.put('/:id/publish', protect, authorize('admin'), publishTest);

export default router;
