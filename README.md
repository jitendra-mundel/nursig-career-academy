# TheNoecet Notes - Full Stack Application

A comprehensive full-stack web application for managing educational notes, creating and taking online tests, and tracking student performance.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Running the Application](#running-the-application)
- [Features Guide](#features-guide)

---

## ✨ Features

### User Features
- **User Authentication**: Secure login and registration with JWT
- **Search Notes**: Filter and search through uploaded notes
- **View PDF Notes**: Download and view educational PDFs
- **Browse Tests**: View available online tests
- **Take Tests**: Complete online tests with real-time tracking
- **View Results**: Check test scores and performance metrics
- **Responsive Dashboard**: Clean, modern UI with Material Design

### Admin Features
- **User Management**: View all users and manage their status
- **Note Management**: Upload, edit, and delete PDF notes
- **Test Creation**: Create and publish online tests
- **Question Management**: Add, edit, delete multiple-choice and short-answer questions
- **Results Tracking**: View all student test results
- **Analytics Dashboard**: View platform statistics

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with Hooks
- **UI Library**: Material-UI (MUI)
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Build Tool**: Vite
- **Animations**: GSAP (for simple animations)
- **State Management**: React Context API

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **File Upload**: Multer
- **Validation**: express-validator

---

## 📁 Project Structure

```
TheNoecet-Notes/
│
├── frontend/                          # React Frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── api/
│   │   │   ├── apiClient.js          # Axios instance with interceptors
│   │   │   └── endpoints.js          # API endpoint functions
│   │   ├── assets/                   # Images, icons, etc.
│   │   ├── components/               # Reusable components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── NoteCard.jsx
│   │   │   └── TestCard.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Authentication context
│   │   ├── pages/                    # Page components
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── UserDashboard.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── NotesPage.jsx
│   │   │   ├── TestsPage.jsx
│   │   │   ├── ResultsPage.jsx
│   │   │   └── AdminUploadNotesPage.jsx
│   │   ├── routes/
│   │   │   └── PrivateRoute.jsx      # Protected routes
│   │   ├── styles/
│   │   ├── App.jsx                   # Main app component
│   │   ├── main.jsx                  # Entry point
│   │   └── index.css                 # Global styles
│   ├── package.json
│   ├── vite.config.js
│   ├── .env.example
│   └── .gitignore
│
├── backend/                           # Express Backend
│   ├── config/
│   │   └── database.js               # MongoDB connection
│   ├── controllers/                  # Request handlers
│   │   ├── authController.js
│   │   ├── notesController.js
│   │   ├── testController.js
│   │   ├── questionController.js
│   │   ├── resultController.js
│   │   └── userController.js
│   ├── middleware/                   # Custom middleware
│   │   ├── auth.js                   # JWT verification
│   │   ├── errorHandler.js           # Error handling
│   │   └── upload.js                 # Multer configuration
│   ├── models/                       # MongoDB schemas
│   │   ├── User.js
│   │   ├── Notes.js
│   │   ├── Test.js
│   │   ├── Question.js
│   │   ├── TestResult.js
│   │   └── index.js
│   ├── routes/                       # API routes
│   │   ├── authRoutes.js
│   │   ├── notesRoutes.js
│   │   ├── testRoutes.js
│   │   ├── questionRoutes.js
│   │   ├── resultRoutes.js
│   │   └── userRoutes.js
│   ├── services/                     # Business logic
│   ├── utils/                        # Utility functions
│   │   └── tokenUtils.js
│   ├── uploads/                      # PDF storage
│   ├── server.js                     # Main server file
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
│
└── README.md                          # Documentation
```

---

## 📋 Prerequisites

Ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** (v7 or higher) - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)
- **MongoDB Atlas Account** - [Sign up here](https://www.mongodb.com/cloud/atlas)

### Verify Installation
```bash
node --version    # Should show v16+
npm --version     # Should show v7+
git --version     # Should show git version
```

---

## 🚀 Installation & Setup

### Step 1: Clone or Download the Project

```bash
cd your-desired-directory
# If cloning from git:
git clone <repository-url>
cd TheNoecet-Notes
```

### Step 2: Backend Setup

#### 2.1 Install Dependencies
```bash
cd backend
npm install
```

#### 2.2 Configure Environment Variables
Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/thenocet-notes?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

#### 2.3 Start Backend Server
```bash
# Development (with nodemon)
npm run dev

# Production
npm start
```

Server runs on: `http://localhost:5000`

---

### Step 3: Frontend Setup

#### 3.1 Install Dependencies
```bash
cd frontend
npm install
```

#### 3.2 Configure Environment Variables
Create a `.env` file in the frontend directory:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Backend API URL
VITE_API_BASE_URL=http://localhost:5000/api

# App Configuration
VITE_APP_NAME=TheNoecet Notes
```

#### 3.3 Start Frontend Server
```bash
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## 🔐 MongoDB Atlas Setup

### Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or log in
3. Create a new project

### Step 2: Create a Cluster
1. Click "Create" to create a new cluster
2. Select Free tier for development
3. Choose a cloud provider and region
4. Click "Create Cluster"

### Step 3: Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` and `<username>` with your database credentials

### Step 4: Add to .env
Paste the connection string in your backend `.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/thenocet-notes?retryWrites=true&w=majority
```

---

## 🔑 Environment Variables Reference

### Backend (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET` | Secret key for JWT | `your_secret_key_here` |
| `JWT_EXPIRE` | Token expiration time | `7d` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` or `production` |
| `CORS_ORIGIN` | Frontend URL for CORS | `http://localhost:5173` |

### Frontend (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:5000/api` |
| `VITE_APP_NAME` | Application name | `TheNoecet Notes` |

---

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "enrollmentNumber": "ENG001"
}

Response:
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### Login User
```
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "token": "jwt_token_here",
  "user": { ... }
}
```

#### Get Current User
```
GET /auth/me
Headers: Authorization: Bearer jwt_token_here

Response:
{
  "success": true,
  "user": { ... }
}
```

---

### Notes Endpoints

#### Get All Notes
```
GET /notes?category=Mathematics&search=calculus

Response:
{
  "success": true,
  "count": 5,
  "notes": [
    {
      "_id": "note_id",
      "title": "Calculus Basics",
      "category": "Mathematics",
      "subject": "Calculus",
      "fileUrl": "/uploads/filename.pdf",
      "uploadedBy": { "name": "Admin", "email": "admin@example.com" },
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### Upload Note (Admin Only)
```
POST /notes
Headers: Authorization: Bearer jwt_token_here
Content-Type: multipart/form-data

{
  "file": <pdf_file>,
  "title": "Advanced Mathematics",
  "description": "Complete guide to advanced math",
  "category": "Mathematics",
  "subject": "Advanced Math"
}

Response:
{
  "success": true,
  "message": "Note uploaded successfully",
  "note": { ... }
}
```

#### Delete Note (Admin Only)
```
DELETE /notes/:id
Headers: Authorization: Bearer jwt_token_here

Response:
{
  "success": true,
  "message": "Note deleted successfully"
}
```

---

### Test Endpoints

#### Get All Tests
```
GET /tests?subject=Mathematics

Response:
{
  "success": true,
  "count": 3,
  "tests": [
    {
      "_id": "test_id",
      "title": "Math Quiz 1",
      "subject": "Mathematics",
      "totalQuestions": 10,
      "totalMarks": 100,
      "duration": 30,
      "passingMarks": 40,
      "isPublished": true,
      "createdBy": { "name": "Admin", "email": "admin@example.com" }
    }
  ]
}
```

#### Create Test (Admin Only)
```
POST /tests
Headers: Authorization: Bearer jwt_token_here
Content-Type: application/json

{
  "title": "Physics Midterm",
  "description": "Physics assessment",
  "subject": "Physics",
  "totalQuestions": 20,
  "totalMarks": 100,
  "duration": 60,
  "passingMarks": 50
}

Response:
{
  "success": true,
  "message": "Test created successfully",
  "test": { ... }
}
```

---

### Question Endpoints

#### Create Question (Admin Only)
```
POST /questions
Headers: Authorization: Bearer jwt_token_here
Content-Type: application/json

{
  "testId": "test_id",
  "questionText": "What is 2 + 2?",
  "questionType": "mcq",
  "options": ["3", "4", "5", "6"],
  "correctAnswer": "4",
  "marks": 1,
  "difficulty": "easy",
  "explanation": "2 + 2 equals 4"
}

Response:
{
  "success": true,
  "message": "Question created successfully",
  "question": { ... }
}
```

#### Get Questions by Test
```
GET /questions/test/:testId

Response:
{
  "success": true,
  "count": 10,
  "questions": [ ... ]
}
```

---

### Result Endpoints

#### Submit Test
```
POST /results/submit
Headers: Authorization: Bearer jwt_token_here
Content-Type: application/json

{
  "testId": "test_id",
  "answers": {
    "question_id_1": "4",
    "question_id_2": "option_b",
    ...
  },
  "timeSpent": 1800
}

Response:
{
  "success": true,
  "message": "Test submitted successfully",
  "result": {
    "_id": "result_id",
    "marksObtained": 85,
    "totalMarks": 100,
    "percentage": 85,
    "isPassed": true
  }
}
```

#### Get User Results
```
GET /results/user
Headers: Authorization: Bearer jwt_token_here

Response:
{
  "success": true,
  "count": 5,
  "results": [ ... ]
}
```

---

### User Endpoints (Admin Only)

#### Get All Users
```
GET /users
Headers: Authorization: Bearer jwt_token_here

Response:
{
  "success": true,
  "count": 50,
  "users": [ ... ]
}
```

#### Get User by ID
```
GET /users/:id
Headers: Authorization: Bearer jwt_token_here

Response:
{
  "success": true,
  "user": { ... }
}
```

#### Deactivate User
```
PUT /users/:id/deactivate
Headers: Authorization: Bearer jwt_token_here

Response:
{
  "success": true,
  "message": "User deactivated successfully",
  "user": { ... }
}
```

---

## 🗄️ Database Schema

### User Schema
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (enum: ['user', 'admin']),
  enrollmentNumber: String,
  profileImage: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Notes Schema
```javascript
{
  title: String,
  description: String,
  category: String,
  subject: String,
  fileUrl: String,
  fileName: String,
  uploadedBy: ObjectId (ref: User),
  downloads: Number,
  isPublished: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Test Schema
```javascript
{
  title: String,
  description: String,
  subject: String,
  totalQuestions: Number,
  totalMarks: Number,
  duration: Number (minutes),
  passingMarks: Number,
  instructions: String,
  createdBy: ObjectId (ref: User),
  isPublished: Boolean,
  startDate: Date,
  endDate: Date,
  allowedAttempts: Number
}
```

### Question Schema
```javascript
{
  testId: ObjectId (ref: Test),
  questionText: String,
  questionType: String (enum: ['mcq', 'short_answer']),
  options: [String],
  correctAnswer: String,
  marks: Number,
  explanation: String,
  difficulty: String (enum: ['easy', 'medium', 'hard']),
  createdBy: ObjectId (ref: User)
}
```

### TestResult Schema
```javascript
{
  userId: ObjectId (ref: User),
  testId: ObjectId (ref: Test),
  answers: Map<String, String>,
  marksObtained: Number,
  totalMarks: Number,
  percentage: Number,
  isPassed: Boolean,
  attemptNumber: Number,
  timeSpent: Number (seconds),
  submittedAt: Date
}
```

---

## 🎯 Running the Application

### Start Both Servers

#### Terminal 1: Backend
```bash
cd backend
npm run dev
# Output: 🚀 Server running on http://localhost:5000
```

#### Terminal 2: Frontend
```bash
cd frontend
npm run dev
# Output: VITE v... ready in... ms
```

### Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- Health Check: http://localhost:5000/api/health

---

## 📋 Features Guide

### For Users

#### 1. Registration & Login
- Click "Register" to create a new account
- Fill in name, email, password, and enrollment number
- Login with registered credentials

#### 2. Viewing Notes
- Navigate to "My Notes" from sidebar
- Search for specific notes
- Filter by category
- Download PDF files

#### 3. Taking Tests
- Go to "Available Tests"
- Click on a test to view details
- Click "Start Test" to begin
- Answer all questions within time limit
- Submit test to get instant results

#### 4. Checking Results
- Navigate to "My Results"
- View test scores and percentages
- Track pass/fail status
- See test submission dates

### For Admins

#### 1. Upload Notes
- Navigate to "Upload Notes"
- Fill in title, category, subject, description
- Select PDF file
- Click "Upload Note"

#### 2. Create Tests
- Click "Manage Tests"
- Create new test with questions
- Set marking scheme and passing criteria
- Publish test when ready

#### 3. Manage Users
- Go to "Manage Users"
- View all registered users
- Deactivate inactive users
- View user profiles

#### 4. View Results
- Navigate to "View Results"
- See all student test results
- Filter by user or test
- Analyze performance data

---

## 🐛 Troubleshooting

### Issue: Cannot connect to MongoDB
**Solution**:
- Verify connection string in .env
- Check MongoDB Atlas IP whitelist
- Ensure database credentials are correct

### Issue: CORS Error
**Solution**:
- Verify `CORS_ORIGIN` in backend .env matches frontend URL
- Check that backend server is running

### Issue: Authentication not working
**Solution**:
- Clear browser localStorage and cookies
- Verify JWT_SECRET in .env
- Check that token is being sent with Authorization header

### Issue: File upload failing
**Solution**:
- Ensure `uploads/` directory exists
- Check file size limit (50MB)
- Verify only PDF files are being uploaded

---

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Material-UI Documentation](https://mui.com/)
- [JWT Documentation](https://jwt.io/)

---

## 📝 License

This project is open source and available under the MIT License.

---

## 🤝 Support

For issues and questions, please create an issue in the repository or contact the development team.

---

## 🎉 Congratulations!

Your TheNoecet Notes application is now set up and ready to use! Start by:
1. Creating an admin account
2. Uploading notes
3. Creating tests
4. Inviting users

Happy learning! 📚✨
