import express from 'express';
import { getAllUsers, getUserById, updateUser, deactivateUser, deleteUser } from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

/**
 * User Routes (Admin Only)
 */
router.get('/', protect, authorize('admin'), getAllUsers);
router.get('/:id', protect, getUserById);
router.put('/:id', protect, upload.single('profileImage'), updateUser);
router.put('/:id/deactivate', protect, authorize('admin'), deactivateUser);
router.delete('/:id', protect, deleteUser);

// Delete current authenticated user
router.delete('/me', protect, async (req, res, next) => {
	try {
		// Delegate to controller logic by calling deleteUser with req.user.id
		req.params.id = req.user.id;
		return deleteUser(req, res, next);
	} catch (error) {
		next(error);
	}
});

export default router;
