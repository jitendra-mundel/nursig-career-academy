# TheNoecet Notes - Quick Start Guide

## 🚀 5-Minute Quick Start

### Prerequisites
- Node.js installed
- MongoDB Atlas account created

### Step 1: Setup Backend (2 minutes)

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file and add your MongoDB URI
# Copy from MongoDB Atlas and add JWT secret
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/thenocet-notes?retryWrites=true&w=majority
JWT_SECRET=your_secret_key_123
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Start backend server
npm run dev
```

**Expected Output:**
```
✅ MongoDB Connected: cluster.mongodb.net
🚀 Server running on http://localhost:5000
```

### Step 2: Setup Frontend (2 minutes)

```bash
# Open new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Create .env file
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=TheNoecet Notes

# Start frontend server
npm run dev
```

**Expected Output:**
```
VITE v4.4.0  ready in XXX ms
➜  Local:   http://localhost:5173/
```

### Step 3: Access Application (1 minute)

1. Open browser: `http://localhost:5173`
2. Register new account or login
3. Start using the application!

---

## 📋 Default Test Accounts

Create these accounts to test all features:

### User Account
- Email: `user@example.com`
- Password: `password123`
- Role: User

### Admin Account
- Email: `admin@example.com`
- Password: `admin123`
- Role: Admin

---

## 🔧 Installation Commands Summary

```bash
# Backend
cd backend && npm install && npm run dev

# Frontend (in new terminal)
cd frontend && npm install && npm run dev
```

---

## ✅ Verification Checklist

- [ ] MongoDB connected successfully
- [ ] Backend server running on port 5000
- [ ] Frontend application loaded on port 5173
- [ ] Can register new user
- [ ] Can login with credentials
- [ ] Can navigate to user dashboard
- [ ] Can upload notes (as admin)
- [ ] Can create tests (as admin)

---

## 🎯 Key File Locations

### Important Backend Files
- Server: `backend/server.js`
- Database: `backend/config/database.js`
- Models: `backend/models/`
- Routes: `backend/routes/`
- Controllers: `backend/controllers/`

### Important Frontend Files
- App: `frontend/src/App.jsx`
- Context: `frontend/src/context/AuthContext.jsx`
- Pages: `frontend/src/pages/`
- Components: `frontend/src/components/`
- API: `frontend/src/api/`

---

## 🐛 Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| MongoDB connection error | Check MONGODB_URI in .env |
| Port already in use | Kill process or change PORT in .env |
| CORS error | Verify CORS_ORIGIN matches frontend URL |
| Dependencies not found | Run `npm install` in respective folder |
| Token error | Clear localStorage in browser DevTools |

---

## 📱 API Quick Reference

```bash
# Register
POST http://localhost:5000/api/auth/register

# Login
POST http://localhost:5000/api/auth/login

# Get Notes
GET http://localhost:5000/api/notes

# Get Tests
GET http://localhost:5000/api/tests

# Health Check
GET http://localhost:5000/api/health
```

---

## 🎨 Customization Tips

### Change Primary Color
Edit: `frontend/src/App.jsx`
```javascript
palette: {
  primary: { main: '#YOUR_COLOR' }
}
```

### Change API Base URL
Edit: `frontend/.env`
```
VITE_API_BASE_URL=your_api_url
```

### Add More Categories
Edit: `backend/models/Notes.js`
Add to enum array: `['Mathematics', 'Physics', 'YourCategory']`

---

## 📞 Support & Resources

- Full documentation: See README.md
- Backend setup: See README.md (Backend Setup section)
- Frontend setup: See README.md (Frontend Setup section)
- API docs: See README.md (API Documentation section)

---

## 🎉 Success!

Your application is now running! 

**Next Steps:**
1. Create an admin account
2. Upload some notes
3. Create a test with questions
4. Register as a user
5. Take the test
6. Check results

Enjoy using TheNoecet Notes! 📚✨
