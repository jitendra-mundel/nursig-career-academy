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

    // send email (tries SendGrid first if configured, falls back to SMTP)
    try {
      await sendOtpEmail(email, code);
      console.log(`✅ OTP ${code} sent to ${email}`);
      return res.status(200).json({ success: true, message: 'OTP sent' });
    } catch (err) {
      console.error('❌ Failed to send OTP email:', err && (err.code || err.message || err.toString()));
      // Respond with safe error info for debugging (do not expose secrets)
      if (err.code === 'SMTP_NOT_CONFIGURED' || err.code === 'SENDGRID_CONFIG_MISSING' || err.statusCode === 503) {
        return res.status(503).json({ success: false, message: err.message || 'Email OTP is not configured yet. Set SENDGRID_API_KEY and SENDGRID_FROM or SMTP settings.' });
      }

      // Other failures (network, auth) — return generic 502 with some detail
      return res.status(502).json({ success: false, message: 'Failed to send OTP email', detail: err && (err.code || err.message) });
    }
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
 * Test Email endpoint - POST /api/auth/test-email
 * Body: { to, subject, text }
 * This is for debugging email provider configuration only.
 */
export const testEmail = async (req, res, next) => {
  try {
    const { to, subject, text } = req.body;
    if (!to) return res.status(400).json({ success: false, message: 'Recipient `to` is required' });

    // Use the sendOtpEmail helper with a temporary code (re-uses SendGrid/SMTP logic)
    const fakeCode = '00000';
    const msgSubject = subject || 'Test email from backend';
    const msgText = text || `This is a test email. Code: ${fakeCode}`;

    // Try SendGrid path explicitly if configured
    const { sendOtpEmail: send } = await import('../utils/email.js');
    try {
      // sendOtpEmail expects (to, code) — we'll call and ignore the code in the template
      await send(to, fakeCode);
      return res.status(200).json({ success: true, message: 'Test email sent (OTP flow)' });
    } catch (err) {
      console.error('Test email failed:', err && (err.code || err.message));
      return res.status(502).json({ success: false, message: 'Test email send failed', detail: err && (err.code || err.message) });
    }
  } catch (err) {
    next(err);
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
