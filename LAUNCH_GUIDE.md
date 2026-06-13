# 🚀 TheNoecet Notes - Complete Launch Guide

## Quick Start (Best Way)

### 1️⃣ Backend Setup (Mock Server - No MongoDB Required)

```powershell
# Navigate to backend
cd backend

# Kill any existing process on port 5000 (if needed)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Start mock server
node mockServer.js
```

**Expected Output:**
```
╔══════════════════════════════════════╗
║   🚀 Mock API Server Running        ║
╠══════════════════════════════════════╣
║ Server: http://localhost:5000       ║
║ Status: ✅ No MongoDB needed        ║
║ Mode: TESTING/DEVELOPMENT           ║
╚══════════════════════════════════════╝
```

---

### 2️⃣ Frontend Setup (New Terminal Window)

```powershell
# Navigate to frontend
cd frontend

# Start development server
npm run dev
```

**Expected Output:**
```
  VITE v4.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

---

### 3️⃣ Access Application

Open browser and go to: **http://localhost:5173**

---

## 📝 Test Registration

Use these credentials:

```
Full Name: Jitendra Mundel
Email: jitendramundel271@gmail.com
Enrollment Number: 1234
Password: Test@123
```

Or use ANY unique email - it will work! ✨

---

## 🔄 Alternative: Real MongoDB (Production Ready)

### Step 1: Fix MongoDB Connection

1. Go to **MongoDB Atlas Dashboard**: https://www.mongodb.com/cloud/atlas/
2. Select your **Project** → **Network Access**
3. Add your current IP address to whitelist (or use `0.0.0.0/0` for testing)
4. Wait 5-10 minutes for changes to take effect

### Step 2: Check Your IP

```powershell
# Get your public IP
(Invoke-WebRequest -Uri "https://api.ipify.org").Content
```

### Step 3: Start Real Backend

```powershell
cd backend
npm start
```

**Expected Output:**
```
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
🔐 Server listening on PORT 5000
```

---

## 📁 Project Structure

```
project1/
├── backend/
│   ├── mockServer.js          ✅ Mock API (No DB needed)
│   ├── server.js              🔗 Real server (MongoDB)
│   ├── .env                   🔑 Environment variables
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── middleware/
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── apiClient.js   🌐 HTTP client
│   │   │   └── endpoints.js   📡 API functions
│   │   ├── context/
│   │   │   └── AuthContext.jsx 🔐 Auth state
│   │   ├── pages/
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── TestsPage.jsx
│   │   │   ├── NotesPage.jsx
│   │   │   └── AdminDashboard.jsx
│   │   └── components/
│   ├── vite.config.js
│   ├── .env
│   └── package.json
│
└── docs/
    ├── README.md
    ├── QUICK_START.md
    ├── ARCHITECTURE.md
    └── TROUBLESHOOTING.md
```

---

## 🔧 Environment Variables

### Backend (.env)

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:5000
```

---

## 🎯 API Endpoints (Mock Server)

### Authentication
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires token)
- `POST /api/auth/logout` - Logout

### Tests
- `GET /api/tests` - List all tests
- `GET /api/tests/:id` - Get specific test

### Notes
- `GET /api/notes` - List all notes

### Users (Admin)
- `GET /api/users` - List all users (requires token)

### Health
- `GET /api/health` - Server status

---

## 🐛 Troubleshooting

### Issue: Port Already in Use

```powershell
# Find process
netstat -ano | findstr :5000

# Kill it
taskkill /PID <PID> /F

# Or use different port
$env:PORT=5001; node mockServer.js
```

### Issue: npm modules not found

```powershell
# Clean and reinstall
cd frontend
rm -r node_modules package-lock.json
npm install
npm run dev
```

### Issue: CORS Error

Make sure `.env` files have correct URLs:
- Backend: `CORS_ORIGIN=http://localhost:5173`
- Frontend: `VITE_API_BASE_URL=http://localhost:5000`

### Issue: MongoDB Connection Failed

1. Check IP whitelist in MongoDB Atlas
2. Check MONGODB_URI in backend `.env`
3. Verify network connectivity
4. Use mock server instead: `node mockServer.js`

---

## 📋 Complete Checklist

Before launching:

- [ ] Node.js v16+ installed
- [ ] npm v7+ installed
- [ ] Backend `.env` configured
- [ ] Frontend `.env` configured
- [ ] No process using port 5000
- [ ] No process using port 5173
- [ ] Terminal window 1: Backend ready
- [ ] Terminal window 2: Frontend ready
- [ ] Browser opened to localhost:5173

---

## 🚀 Production Deployment

### Backend (Heroku/Render)

```bash
# Create Procfile
echo "web: node server.js" > Procfile

# Deploy
git push heroku main
```

### Frontend (Vercel/Netlify)

```bash
# Build
npm run build

# Deploy dist/ folder
```

### Environment Variables (Production)

```env
# Backend
MONGODB_URI=<production_mongodb_uri>
JWT_SECRET=<strong_random_secret>
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://yourdomain.com

# Frontend
VITE_API_BASE_URL=https://api.yourdomain.com
```

---

## 📞 Support

If you face issues:

1. Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
2. Review [ARCHITECTURE.md](ARCHITECTURE.md)
3. Check terminal logs for exact error
4. Use mock server for quick testing

---

## 🎉 Success Indicators

✅ Backend started successfully
✅ Frontend dev server running
✅ No console errors
✅ Can access http://localhost:5173
✅ Registration form appears
✅ Can register new user
✅ JWT token received
✅ Logged in successfully

---

**That's it! You're ready to build! 🚀**
