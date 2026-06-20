import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import fs from 'fs';
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

const logEnvConfig = () => {
  console.log('🔧 Backend env config:', {
    SMTP_HOST: !!process.env.SMTP_HOST,
    SMTP_PORT: !!process.env.SMTP_PORT,
    SMTP_USER: !!process.env.SMTP_USER,
    SMTP_PASS: !!process.env.SMTP_PASS,
    EMAIL_FROM: !!process.env.EMAIL_FROM,
    API_URL: process.env.API_URL || null,
    CORS_ORIGIN: process.env.CORS_ORIGIN || null,
  });
};

logEnvConfig();

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, 'uploads');

const contentTypeByExtension = {
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.doc': 'application/msword',
  '.ppt': 'application/vnd.ms-powerpoint',
};

const getContentType = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  return contentTypeByExtension[ext] || 'application/octet-stream';
};

const importLocalUploadsToGridFS = async () => {
  if (process.env.IMPORT_UPLOADS_TO_GRIDFS === 'false') return;
  if (!mongoose.connection || !mongoose.connection.db) return;

  try {
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
    const filesColl = mongoose.connection.db.collection('uploads.files');
    const filenames = await fs.promises.readdir(uploadsDir);

    for (const filename of filenames) {
      const absolutePath = path.join(uploadsDir, filename);
      const stat = await fs.promises.stat(absolutePath);
      if (!stat.isFile()) continue;

      const fileDoc = await filesColl.findOne({ filename });
      if (fileDoc) continue;

      const readStream = fs.createReadStream(absolutePath);
      const uploadStream = bucket.openUploadStream(filename, {
        contentType: getContentType(filename),
      });

      await new Promise((resolve, reject) => {
        readStream
          .pipe(uploadStream)
          .on('error', reject)
          .on('finish', resolve);
      });

      console.log(`✅ Imported local upload to GridFS: ${filename}`);
    }
  } catch (error) {
    console.error('❌ Failed to import local uploads into GridFS:', error.message);
  }
};

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Route to serve uploaded files. We first check for a local disk file
// (backwards-compatible) and if not present stream from MongoDB GridFS.
app.get('/uploads/:filename', async (req, res, next) => {
  try {
    const { filename } = req.params;
    const absolutePath = path.join(uploadsDir, filename);

    // If a local file exists (legacy), serve it directly
    if (fs.existsSync(absolutePath)) {
      return res.sendFile(absolutePath);
    }

    // If no DB connection yet, return 404 so static handler or client can handle
    if (!mongoose.connection || !mongoose.connection.db) {
      return res.status(404).end();
    }

    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
    const filesColl = mongoose.connection.db.collection('uploads.files');
    const fileDoc = await filesColl.findOne({ filename });

    if (!fileDoc) return res.status(404).end();

    if (fileDoc.contentType) res.setHeader('Content-Type', fileDoc.contentType);
    if (fileDoc.length) res.setHeader('Content-Length', fileDoc.length);

    const downloadStream = bucket.openDownloadStreamByName(filename);
    downloadStream.on('error', (err) => next(err));
    downloadStream.pipe(res);
  } catch (err) {
    next(err);
  }
});

// Serve uploaded files from absolute backend uploads path (fallback/static)
app.use('/uploads', express.static(uploadsDir));

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
    await importLocalUploadsToGridFS();

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
