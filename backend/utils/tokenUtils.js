import jwt from 'jsonwebtoken';

/**
 * Generate JWT Token
 * Creates a token for authenticated user
 */
export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE,
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
