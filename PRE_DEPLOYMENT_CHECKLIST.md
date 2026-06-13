# ✅ PRE-DEPLOYMENT CHECKLIST

यह file use करके check करो कि सब कुछ deployment के लिए ready है।

---

## 📋 BACKEND REQUIREMENTS

### Files Check
- [ ] `backend/package.json` exists
- [ ] `backend/server.js` exists
- [ ] `backend/config/database.js` exists
- [ ] `backend/.env` file exists with values
- [ ] `backend/models/` folder has all models

### package.json Check
- [ ] `"start": "node server.js"` script exists
- [ ] All dependencies installed (`npm install` done)
- [ ] No errors in `package-lock.json`

### Environment Variables (.env)
```
❌ Missing? ✅ Present?

[ ] PORT = 5000
[ ] MONGODB_URI = mongodb+srv://...
[ ] JWT_SECRET = (set)
[ ] EMAIL_USER = your_email@gmail.com
[ ] EMAIL_PASSWORD = app_password
[ ] NODE_ENV = production
```

### MongoDB Atlas
- [ ] Database created and accessible
- [ ] User created with read/write permissions
- [ ] IP Whitelist updated (add 0.0.0.0/0 for cloud)
- [ ] Connection string copied correctly

### API Endpoints
Test locally (port 5000):
- [ ] `GET http://localhost:5000/api/health` → 200 OK
- [ ] `GET http://localhost:5000/api/tests` → 200 OK
- [ ] Login endpoint working
- [ ] Register endpoint working

### Code Quality
- [ ] No console.log statements left in production code
- [ ] Error handling implemented
- [ ] CORS configured correctly
- [ ] Rate limiting enabled

---

## 📋 FRONTEND REQUIREMENTS

### Files Check
- [ ] `frontend/package.json` exists
- [ ] `frontend/vite.config.js` exists
- [ ] `frontend/src/App.jsx` exists
- [ ] `frontend/.env` file has API URL

### package.json Check
- [ ] `"build": "vite build"` script exists
- [ ] All dependencies installed (`npm install` done)
- [ ] No errors in build

### Build Check
```bash
# Test build locally
cd frontend
npm run build
```
- [ ] Build completes without errors
- [ ] `dist/` folder created
- [ ] `dist/index.html` exists
- [ ] No build warnings

### Environment Variables
```
[ ] VITE_API_BASE_URL = http://localhost:5000/api (local)
[ ] VITE_API_BASE_URL = https://your-backend-url.onrender.com/api (production)
```

### API Configuration
- [ ] `src/api/apiClient.js` uses environment variables
- [ ] All API endpoints updated
- [ ] Error handling in place
- [ ] No hardcoded localhost URLs

### Testing
- [ ] App runs locally: `npm run dev`
- [ ] Login page loads
- [ ] Register page loads
- [ ] Navigation working
- [ ] API calls working locally

---

## 📋 GITHUB REQUIREMENTS

### Repository Setup
- [ ] GitHub account created
- [ ] New repository created (`thenocet-notes`)
- [ ] Repository is PUBLIC

### Code Pushed
- [ ] All files committed: `git add .`
- [ ] Initial commit made: `git commit -m "Initial commit"`
- [ ] Remote added: `git remote add origin ...`
- [ ] Code pushed: `git push -u origin main`
- [ ] Check GitHub - all files visible

### .gitignore Check
```
[ ] node_modules/ is in .gitignore (not uploaded)
[ ] .env is in .gitignore (not uploaded - use .env.example)
[ ] dist/ is in .gitignore
```

---

## 📋 SERVICES SETUP

### MongoDB Atlas
- [ ] Account created: mongodb.com/cloud/atlas
- [ ] Cluster created
- [ ] Database user created
- [ ] IP whitelist updated
- [ ] Connection string ready

### Render Account
- [ ] Account created: render.com
- [ ] Logged in with GitHub
- [ ] Can see GitHub repositories

### Netlify Account
- [ ] Account created: netlify.com
- [ ] Logged in with GitHub
- [ ] Can see GitHub repositories

---

## 📋 BEFORE HITTING "DEPLOY"

### Backend (Render) - Final Check
- [ ] Root Directory set to `backend` ✅
- [ ] Build Command: `npm install` ✅
- [ ] Start Command: `node server.js` ✅
- [ ] All environment variables added ✅
- [ ] CORS_ORIGIN set (can update later) ✅
- [ ] PORT set to 5000 ✅

### Frontend (Netlify) - Final Check
- [ ] Base Directory set to `frontend` ✅
- [ ] Build Command: `npm run build` ✅
- [ ] Publish Directory: `frontend/dist` ✅
- [ ] Environment variables added ✅
- [ ] VITE_API_BASE_URL matches backend URL ✅

---

## 📋 AFTER DEPLOYMENT

### Backend Verification
- [ ] Access: `https://your-backend.onrender.com/api/health`
- [ ] Shows: `{"success": true, "message": "Server is running"}`
- [ ] Check logs in Render for errors
- [ ] Test API endpoints manually

### Frontend Verification
- [ ] Access: `https://your-app.netlify.app`
- [ ] App loads without errors
- [ ] Check browser console (F12)
- [ ] No CORS errors
- [ ] API calls going to backend

### Connection Verification
- [ ] Try to Register - OTP should send
- [ ] Try to Login - should work
- [ ] Try to upload a note - should work
- [ ] Try to create a test - should work

---

## 🆘 TROUBLESHOOTING COMMANDS

### Test Backend Locally
```bash
cd backend
npm install
node server.js
```
Check: `http://localhost:5000/api/health`

### Test Frontend Locally
```bash
cd frontend
npm install
npm run dev
```
Check: `http://localhost:5173`

### Check Git Status
```bash
git status
```
Should show: "nothing to commit, working tree clean"

### Rebuild Frontend
```bash
cd frontend
rm -rf dist node_modules
npm install
npm run build
```

---

## ✅ FINAL GO/NO-GO

| Check | Status | Notes |
|-------|--------|-------|
| Backend ready | ✅/❌ | |
| Frontend ready | ✅/❌ | |
| GitHub pushed | ✅/❌ | |
| Accounts ready | ✅/❌ | |
| All tests pass | ✅/❌ | |

**GO FOR DEPLOYMENT? → ✅ YES / ❌ NO**

---

## 📞 Help?

If stuck at any step:
1. Check error messages carefully
2. Google the error message
3. Check official documentation
4. Re-read the deployment guide

Good luck! 🚀
