import jwt from 'jsonwebtoken';

/**
 * Generate JWT Token
 * Creates a token for authenticated user
 */
export const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'dev_jwt_secret_fallback';
  const expiresIn = process.env.JWT_EXPIRE || '7d';

  if (!process.env.JWT_SECRET) {
    // warn in logs when running without a configured secret (development only)
    // In production you should set JWT_SECRET to a secure value.
    // eslint-disable-next-line no-console
    console.warn('Warning: JWT_SECRET is not set. Using insecure fallback secret. Set JWT_SECRET in env for production.');
  }

  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    secret,
    {
      expiresIn,
    }
  );
};

/**
 * Send Token Response
 * Returns token with status 200 or 201
 */
export const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user);

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

export default { generateToken, sendTokenResponse };
