import express from 'express';
import { register, login, getMe, sendOtp, registerWithOtp, testEmail } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

/**
 * Authentication Routes
 */
router.post('/register', register);
router.post('/send-otp', sendOtp);
router.post('/test-email', testEmail);
router.post('/register/verify', registerWithOtp);
router.post('/login', login);
router.get('/me', protect, getMe);

export default router;
