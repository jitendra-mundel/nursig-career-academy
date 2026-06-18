import User from '../models/User.js';
import { sendTokenResponse } from '../utils/tokenUtils.js';
import Otp from '../models/Otp.js';
import { sendOtpEmail } from '../utils/email.js';

/**
 * Register User
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, enrollmentNumber } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // If an enrollmentNumber provided, create user directly (legacy)
    if (enrollmentNumber) {
      const user = await User.create({ name, email, password, enrollmentNumber, role: 'user' });
      sendTokenResponse(user, 201, res);
      return;
    }

    // Otherwise instruct client to use OTP flow (we don't create user without OTP by default)
    return res.status(400).json({ success: false, message: 'Use OTP flow: request /auth/send-otp and then verify via /auth/register/verify' });
  } catch (error) {
    next(error);
  }
};

/**
 * Send OTP to email for registration verification
 * POST /api/auth/send-otp
 */
export const sendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    // throttle: remove existing otps for this email
    await Otp.deleteMany({ email });

    const code = String(Math.floor(10000 + Math.random() * 90000)); // 5 digits
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await Otp.create({ email, code, expiresAt });

    // send email (or log)
    await sendOtpEmail(email, code);

    res.status(200).json({ success: true, message: 'OTP sent' });
  } catch (error) {
    if (error.code === 'SMTP_NOT_CONFIGURED' || error.code === 'SENDGRID_CONFIG_MISSING' || error.statusCode === 503) {
      return res.status(503).json({
        success: false,
        message: error.message || 'Email OTP is not configured yet. Set SENDGRID_API_KEY and SENDGRID_FROM or SMTP settings.',
      });
    }
    next(error);
  }
};

/**
 * Verify OTP and create account
 * POST /api/auth/register/verify
 */
export const registerWithOtp = async (req, res, next) => {
  try {
    const { name, email, password, otp } = req.body;
    if (!name || !email || !password || !otp) return res.status(400).json({ success: false, message: 'Missing fields' });

    const record = await Otp.findOne({ email, code: otp });
    if (!record) return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    if (record.expiresAt < new Date()) return res.status(400).json({ success: false, message: 'OTP expired' });

    // Check existing user
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ success: false, message: 'User with this email already exists' });

    // Generate enrollmentNumber: ENR + (1000 + (count+1))
    const count = await User.countDocuments();
    const number = 1000 + count + 1;
    const enrollmentNumber = `ENR${number}`;

    const user = await User.create({ name, email, password, enrollmentNumber, role: 'user' });

    // remove used OTP
    await Otp.deleteMany({ email });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

/**
 * Login User
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find user and check password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'User account is inactive',
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Current User Profile
 * GET /api/auth/me
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export default { register, login, getMe };
