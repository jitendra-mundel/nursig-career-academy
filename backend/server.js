import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import connectDB from './config/database.js';
import errorHandler from './middleware/errorHandler.js';

// Import Routes
import authRoutes from './routes/authRoutes.js';
import notesRoutes from './routes/notesRoutes.js';
import testRoutes from './routes/testRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import resultRoutes from './routes/resultRoutes.js';
import userRoutes from './routes/userRoutes.js';

// Load environment variables
dotenv.config();

// Initialize Express App
const app = express();
app.set('trust proxy', 1);

/**
 * Rate Limiting - Prevent abuse for 3000+ users
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // 300 requests per 15 min
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // 10 login attempts
  skipSuccessfulRequests: true,
  message: 'Too many login attempts',
});

/**
 * Middleware Setup
 */
app.use(compression()); // Enable gzip compression
app.use(limiter); // Apply general rate limiting

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

/**
 * API Routes
 */
app.use('/api/auth', authLimiter, authRoutes); // Stricter limit for auth
app.use('/api/notes', notesRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/users', userRoutes);

/**
 * Health Check Endpoint
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

/**
 * 404 Handler
 */
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

/**
 * Error Handling Middleware
 */
app.use(errorHandler);

/**
 * Start Server
 */
const PORT = process.env.PORT || 5000;
let server;

const startServer = async () => {
  try {
    await connectDB();

    server = app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });

    server.on('error', (error) => {
      console.error('❌ Server listen failed', error.message);
      process.exit(1);
    });
  } catch (error) {
    console.error('❌ Server startup failed');
    process.exit(1);
  }
};

const shutdown = (signal) => {
  if (!server) {
    process.exit(0);
    return;
  }

  server.close(() => {
    console.log(`🛑 Server closed on ${signal}`);
    process.exit(0);
  });
};

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));
process.once('SIGUSR2', () => shutdown('SIGUSR2'));

startServer();

export default app;
