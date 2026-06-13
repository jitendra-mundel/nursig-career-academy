# TheNoecet Notes - Installation Troubleshooting Guide

## 🔍 Pre-Installation Checklist

### 1. System Requirements
```bash
# Check Node.js version (need v16+)
node --version
# Expected: v16.x.x or higher

# Check npm version (need v7+)
npm --version
# Expected: 7.x.x or higher

# Check Git installation
git --version
# Expected: git version 2.x.x
```

### 2. MongoDB Atlas Setup
- [ ] Account created on MongoDB Atlas
- [ ] Project created
- [ ] Cluster created (Free tier OK)
- [ ] Database user created with username and password
- [ ] IP address whitelisted (or 0.0.0.0/0 for testing)
- [ ] Connection string obtained

---

## ⚙️ Backend Installation Issues

### Issue 1: npm install fails with module not found

**Error Message:**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Use legacy dependency resolution
npm install --legacy-peer-deps

# Or upgrade npm
npm install -g npm@latest
npm install
```

---

### Issue 2: MongoDB Connection Error

**Error Message:**
```
❌ MongoDB Connection Error: connect ECONNREFUSED
```

**Causes & Solutions:**

**Cause 1: Invalid Connection String**
- Check MONGODB_URI format in .env
- Should be: `mongodb+srv://username:password@cluster.mongodb.net/database`
- Verify username and password are URL encoded (if containing special chars)

**Cause 2: IP Not Whitelisted**
1. Go to MongoDB Atlas Dashboard
2. Network Access → IP Whitelist
3. Click "Add IP Address"
4. Select "Allow Access from Anywhere" (0.0.0.0/0) for development
5. Wait 1-2 minutes for changes to apply

**Cause 3: Database Doesn't Exist**
- MongoDB creates database automatically on first write
- No need to create manually

**Test Connection:**
```bash
# Create test file: test-db.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
};

testConnection();

# Run with: node test-db.js
```

---

### Issue 3: Port Already in Use

**Error Message:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:**

**Option 1: Kill Process Using Port**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

**Option 2: Use Different Port**
```bash
# Edit backend/.env
PORT=5001

# Start server
npm run dev
```

---

### Issue 4: nodemon not found

**Error Message:**
```
'nodemon' is not recognized as an internal or external command
```

**Solution:**
```bash
# Install nodemon globally
npm install -g nodemon

# Or install locally in backend
cd backend
npm install --save-dev nodemon

# Then run
npm run dev
```

---

### Issue 5: Permission Denied on uploads folder

**Error Message:**
```
Error: EACCES: permission denied, open './uploads/file.pdf'
```

**Solution:**
```bash
# Create uploads directory with proper permissions
mkdir uploads
chmod 755 uploads

# Or run with sudo (not recommended for production)
sudo npm run dev
```

---

## 🎨 Frontend Installation Issues

### Issue 1: npm install fails

**Error Message:**
```
npm ERR! code ERESOLVE unable to resolve dependency tree
```

**Solution:**
```bash
cd frontend
npm cache clean --force
npm install --legacy-peer-deps
```

---

### Issue 2: Vite dev server won't start

**Error Message:**
```
error when starting dev server:
Error: ENOENT: no such file or directory
```

**Solution:**
```bash
# Check if public directory exists
ls public/
# If not, create it
mkdir public

# Verify vite.config.js exists
ls vite.config.js

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Start dev server
npm run dev
```

---

### Issue 3: Port 5173 already in use

**Error Message:**
```
port 5173 is in use, try another one? [Y/n]
```

**Solution:**
```bash
# Edit frontend/vite.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,  // Change to different port
    open: true,
  },
})

# Restart
npm run dev
```

---

### Issue 4: .env file not being read

**Problem:** Variables like `import.meta.env.VITE_API_BASE_URL` return undefined

**Solution:**

**Step 1: Verify .env exists in frontend root**
```bash
ls -la frontend/.env
# Should show the file exists
```

**Step 2: Verify naming (must start with VITE_)**
```env
# ✅ Correct
VITE_API_BASE_URL=http://localhost:5000/api

# ❌ Wrong - won't be exposed
API_BASE_URL=http://localhost:5000/api
```

**Step 3: Restart dev server**
```bash
# Stop dev server (Ctrl+C)
# Start again
npm run dev
```

**Step 4: Verify in component**
```javascript
console.log(import.meta.env.VITE_API_BASE_URL);
```

---

### Issue 5: Cannot find module 'axios'

**Error Message:**
```
Module not found: Error: Can't resolve 'axios'
```

**Solution:**
```bash
cd frontend
npm install axios

# If still failing
rm -rf node_modules package-lock.json
npm install
npm install axios
npm run dev
```

---

## 🔗 Communication Issues

### Issue 1: Frontend cannot reach backend

**Error in Browser Console:**
```
Error: Network Error at AxiosError
```

**Causes & Solutions:**

**Cause 1: Backend not running**
- Verify backend is running on port 5000
- Check: `npm run dev` in backend folder

**Cause 2: Wrong API URL**
- Check frontend/.env
- Should be: `VITE_API_BASE_URL=http://localhost:5000/api`
- Restart frontend dev server after changing

**Cause 3: CORS Error**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
```bash
# Edit backend/.env
CORS_ORIGIN=http://localhost:5173

# Restart backend
npm run dev
```

**Cause 4: Firewall blocking connection**
- Check Windows Firewall/antivirus settings
- Allow Node.js to access the network

---

### Issue 2: API response is 404

**Error Message:**
```
404: Route not found
```

**Causes:**
1. Wrong endpoint URL (check typos)
2. Backend routes not properly imported
3. API prefix missing (should be `/api/endpoint`)

**Solution:**
```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Should return:
# {"success":true,"message":"Server is running"}
```

---

## 🔐 Authentication Issues

### Issue 1: Cannot login - always returns "Invalid credentials"

**Causes:**
1. User doesn't exist
2. Password is wrong
3. Password encoding issue

**Solution:**
```bash
# Test direct MongoDB
# Connect to your MongoDB cluster and verify user exists in 'users' collection

# Make sure to register first before trying to login
# Or create admin user in MongoDB directly:
db.users.insertOne({
  name: "Admin",
  email: "admin@example.com",
  password: "$2a$10...", // bcrypt hashed password
  role: "admin",
  isActive: true
})
```

---

### Issue 2: Token not persisting after refresh

**Symptom:** Get redirected to login after page refresh

**Solution:**
Check browser DevTools:
1. Open DevTools (F12)
2. Application tab
3. Local Storage
4. Should have `token` and `user` keys
5. If missing, login again

---

## 🛠️ Build & Production Issues

### Issue 1: Build fails with errors

```bash
# Development build to see errors
npm run build

# Check for TypeScript errors (if applicable)
npm run build -- --verbose

# Clear dist and rebuild
rm -rf dist
npm run build
```

---

### Issue 2: Production environment variables not working

**Solution:**
```bash
# Create .env.production in frontend
VITE_API_BASE_URL=https://your-production-api.com/api

# Or set environment variables before building
export VITE_API_BASE_URL=https://your-production-api.com/api
npm run build
```

---

## 📊 Debugging Commands

### Check all processes using ports
```bash
# Windows
netstat -ano | findstr "5000\|5173"

# macOS/Linux
lsof -i :5000,5173
```

### View npm logs
```bash
# Backend logs
npm run dev -- --log-level verbose

# Frontend logs (usually printed to console)
npm run dev
```

### Clear all caches
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

## ✅ Verification Steps

### Step 1: Verify Backend
```bash
cd backend

# Check .env exists
ls -la .env

# Check node_modules installed
ls node_modules | head

# Start server
npm run dev

# Expected: "✅ MongoDB Connected" and "🚀 Server running"
```

### Step 2: Verify Frontend
```bash
cd frontend

# Check .env exists
ls -la .env

# Check node_modules installed
ls node_modules | head

# Start dev server
npm run dev

# Expected: "Local: http://localhost:5173/"
```

### Step 3: Verify Connection
```bash
# In browser, check:
1. http://localhost:5173 loads
2. Backend API responds: http://localhost:5000/api/health
3. Network tab shows successful requests
```

---

## 🆘 Getting Help

1. **Check logs carefully** - Error messages usually indicate the problem
2. **Verify all .env files** - Most issues stem from missing/wrong configs
3. **Clear caches** - Delete node_modules and reinstall
4. **Restart everything** - Kill processes and start fresh
5. **Check documentation** - See README.md for detailed info

---

## 📝 Getting More Help

If issues persist:
1. Note the exact error message
2. Check which command was running
3. Share:
   - Node.js version
   - npm version
   - Operating System
   - Exact error message
   - Steps taken so far
