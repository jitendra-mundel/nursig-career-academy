/**
 * Mock API Server - For Testing Without MongoDB
 * Run: node mockServer.js
 * Server: http://localhost:5000
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'test_secret_key';

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mock Database (In-Memory)
let users = [
  {
    _id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    enrollmentNumber: 'ADMIN001',
    role: 'admin',
    isActive: true,
  },
];

let tests = [
  {
    _id: 't1',
    title: 'Math Basics',
    description: 'Basic math concepts',
    totalQuestions: 10,
    duration: 30,
    isPublished: true,
  },
  {
    _id: 't2',
    title: 'Science Quiz',
    description: 'General science knowledge',
    totalQuestions: 20,
    duration: 45,
    isPublished: true,
  },
];

let notes = [
  {
    _id: 'n1',
    title: 'Chapter 1 - Introduction',
    description: 'Basic concepts',
    uploadedBy: 'admin@example.com',
    uploadedAt: new Date(),
  },
];

// Utility: Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });
};

// Utility: Verify JWT Token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Middleware: Verify Auth
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }

  req.user = decoded;
  next();
};

// ============ AUTH ROUTES ============

// Register
app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, password, enrollmentNumber } = req.body;

    // Validation
    if (!name || !email || !password || !enrollmentNumber) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    // Check if email exists
    if (users.find((u) => u.email === email)) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Create new user
    const newUser = {
      _id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      enrollmentNumber,
      role: 'user',
      isActive: true,
    };

    users.push(newUser);

    const token = generateToken(newUser._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: newUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Login
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password required',
      });
    }

    const user = users.find((u) => u.email === email);

    if (!user) {
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

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get Current User
app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = users.find((u) => u._id === req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.status(200).json({
    success: true,
    user,
  });
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

// ============ TESTS ROUTES ============

app.get('/api/tests', (req, res) => {
  res.status(200).json({
    success: true,
    data: tests,
  });
});

app.get('/api/tests/:id', (req, res) => {
  const test = tests.find((t) => t._id === req.params.id);
  if (!test) {
    return res.status(404).json({ success: false, message: 'Test not found' });
  }
  res.status(200).json({
    success: true,
    data: test,
  });
});

// ============ NOTES ROUTES ============

app.get('/api/notes', (req, res) => {
  res.status(200).json({
    success: true,
    data: notes,
  });
});

// ============ USERS ROUTES ============

app.get('/api/users', authMiddleware, (req, res) => {
  res.status(200).json({
    success: true,
    data: users,
    count: users.length,
  });
});

// ============ HEALTH CHECK ============

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Mock Server is running',
    timestamp: new Date().toISOString(),
  });
});

// ============ ERROR HANDLING ============

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server error',
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════╗
║   🚀 Mock API Server Running        ║
╠══════════════════════════════════════╣
║ Server: http://localhost:${PORT}       ║
║ Status: ✅ No MongoDB needed        ║
║ Mode: TESTING/DEVELOPMENT           ║
╚══════════════════════════════════════╝
  `);
  console.log('\n📝 Test Accounts:');
  console.log('  Email: admin@example.com');
  console.log('  Password: any password works');
  console.log('\n📝 API Endpoints Available:');
  console.log('  POST   /api/auth/register');
  console.log('  POST   /api/auth/login');
  console.log('  POST   /api/auth/logout');
  console.log('  GET    /api/auth/me');
  console.log('  GET    /api/health');
  console.log('  GET    /api/tests');
  console.log('  GET    /api/notes');
  console.log('  GET    /api/users');
});
