# 🚀 Complete Deployment Guide - TheNoecet Notes

## Architecture:
```
Frontend (React) → Netlify → https://your-app.netlify.app
Backend (Node.js) → Render → https://your-api.onrender.com
Database → MongoDB Atlas (Already configured ✅)
```

---

## 📋 Pre-Deployment Checklist

- [ ] Git repository created on GitHub
- [ ] Code pushed to GitHub
- [ ] Environment variables ready
- [ ] Backend `.env` file configured
- [ ] MongoDB Atlas connection working
- [ ] Frontend API endpoints updated

---

## PART 1: GITHUB SETUP (Required for both deployments)

### Step 1: Create GitHub Repository

1. Go to **github.com** and login
2. Click **"New repository"** button
3. Name: `thenocet-notes` (or your preferred name)
4. Description: `TheNoecet Notes - Study Platform`
5. Choose **Public** (so Netlify/Render can access it)
6. Click **"Create repository"**

### Step 2: Push Code to GitHub

In your project folder (`project1`), run these commands:

```bash
# Initialize git
git init

# Add all files
git add .

# First commit
git commit -m "Initial commit: TheNoecet Notes app"

# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/thenocet-notes.git

# Push to GitHub (main branch)
git branch -M main
git push -u origin main
```

**Replace `YOUR_USERNAME` with your actual GitHub username**

---

## PART 2: BACKEND DEPLOYMENT (Render)

### Step 1: Prepare Backend for Production

#### 1a. Update `backend/package.json` Scripts

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "kill-port 5000 && nodemon server.js"
  }
}
```

#### 1b. Create `backend/.env.example` (For reference)

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
CORS_ORIGIN=https://your-frontend-domain.netlify.app
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

#### 1c. Make sure backend folder has all required files:
- ✅ `package.json`
- ✅ `server.js`
- ✅ `config/`, `controllers/`, `models/`, `routes/`, etc.
- ✅ `.env` (with real values)

### Step 2: Deploy Backend to Render

1. Go to **render.com**
2. Click **"Sign up"** → Use GitHub login
3. Once logged in, click **"New +"** → **"Web Service"**
4. Select **"Deploy an existing repository"**
5. Connect your GitHub account and select your repository
6. Fill in the form:
   - **Name:** `thenocet-notes-api` (or similar)
   - **Environment:** `Node`
   - **Region:** `Oregon` (closest to India is Singapore, but Oregon is also fine)
   - **Branch:** `main`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Plan:** Select `Free` tier

7. Scroll down to **"Environment Variables"** section
8. Add these environment variables (click **"Add Environment Variable"**):
   - Key: `PORT` → Value: `5000`
   - Key: `MONGODB_URI` → Value: `mongodb+srv://your_username:your_password@cluster.mongodb.net/thenocet?retryWrites=true&w=majority`
   - Key: `CORS_ORIGIN` → Value: `https://your-app.netlify.app` (update later when you deploy frontend)
   - Key: `JWT_SECRET` → Value: `your-super-secret-key-here`
   - Key: `EMAIL_USER` → Value: `your-email@gmail.com`
   - Key: `EMAIL_PASSWORD` → Value: `your-app-password`

9. Click **"Create Web Service"**
10. Wait for deployment (takes 2-5 minutes)
11. Once done, you'll get a URL like: `https://thenocet-notes-api.onrender.com`

### Step 3: Test Backend API

Open this URL in browser:
```
https://your-backend-url.onrender.com/api/health
```

You should see:
```json
{ "success": true, "message": "Server is running" }
```

**Save this URL** - you'll need it for the frontend!

---

## PART 3: FRONTEND DEPLOYMENT (Netlify)

### Step 1: Update Frontend Configuration

#### 1a. Update API Base URL in `frontend/src/api/apiClient.js`

```javascript
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://your-backend-url.onrender.com/api',
  withCredentials: true,
});

export default apiClient;
```

#### 1b. Create `frontend/.env.production` file

```env
VITE_API_URL=https://your-backend-url.onrender.com/api
```

*Replace with your actual Render backend URL*

#### 1c. Update `frontend/vite.config.js`

Make sure it includes:
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
```

### Step 2: Deploy Frontend to Netlify

1. Go to **netlify.com**
2. Click **"Sign up"** → Use GitHub login
3. Once logged in, click **"Add new site"** → **"Import an existing project"**
4. Choose **"GitHub"**
5. Select your repository: `thenocet-notes`
6. Netlify will auto-detect your settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/dist`
   - **Team:** Personal (default)

7. Before clicking "Deploy", set **Environment Variables**:
   - Click **"Show advanced"** or go to **Site settings** → **Build & Deploy**
   - Add environment variables:
     - Key: `VITE_API_URL` → Value: `https://your-backend-url.onrender.com/api`

8. Click **"Deploy site"**
9. Wait for build and deployment (takes 2-5 minutes)
10. You'll get a URL like: `https://your-app.netlify.app`

### Step 3: Test Frontend

1. Visit your frontend URL: `https://your-app.netlify.app`
2. Try to **Login** or **Register**
3. Check if API calls work

---

## PART 4: CONNECT FRONTEND & BACKEND

### Step 1: Update Backend CORS

Since you now have the frontend URL, update your backend `.env`:

```env
CORS_ORIGIN=https://your-frontend-domain.netlify.app
```

Then redeploy backend on Render (it auto-redeployes when you push to GitHub or update env vars)

### Step 2: Verify Connection

1. Open frontend app
2. Try **Register** → Should send email OTP
3. Try **Login** → Should authenticate successfully
4. Check browser DevTools → Network tab → See API calls going to Render

---

## PART 5: TROUBLESHOOTING

### Frontend shows blank page / errors

**Solution:**
1. Check DevTools Console (F12)
2. Check if `VITE_API_URL` is correct
3. Rebuild frontend: `npm run build`
4. Push to GitHub (Netlify auto-redeploys)

### Backend API 500 errors

**Solution:**
1. Check Render logs: Go to your service → "Logs"
2. Verify all environment variables are set
3. Check MongoDB connection in logs
4. Make sure `.env` file has correct values

### CORS errors

**Solution:**
```
In backend/server.js, make sure CORS is set correctly:

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
```

### Emails not sending

**Solution:**
1. Check Gmail app password (not regular password)
2. Enable "Less secure app access" or use App Password
3. Verify `EMAIL_USER` and `EMAIL_PASSWORD` in `.env`

---

## PART 6: IMPORTANT LINKS & CREDENTIALS

Keep these safe:

```
🔗 Frontend: https://your-app.netlify.app
🔗 Backend: https://your-api.onrender.com
🔗 Admin Email: your-email@gmail.com
🔗 MongoDB: ac-2nvccp2...mongodb.net
🔗 GitHub: https://github.com/YOUR_USERNAME/thenocet-notes
```

---

## PART 7: CUSTOM DOMAIN (Optional)

### Add Custom Domain to Netlify

1. Buy domain from: **namecheap.com** or **godaddy.com**
2. In Netlify → Site settings → Domain management
3. Add custom domain: `thenocet-notes.com`
4. Follow instructions to update DNS

### Add Custom Domain to Render

1. In Render service → Settings → Custom Domains
2. Add: `api.thenocet-notes.com`
3. Update DNS records (similar to Netlify)

---

## ✅ Final Checklist

- [ ] GitHub repository with all code
- [ ] Backend deployed on Render with all env vars
- [ ] Frontend deployed on Netlify with API URL
- [ ] CORS configured correctly
- [ ] Database connected (MongoDB Atlas)
- [ ] Login/Register/API calls working
- [ ] Emails sending successfully
- [ ] All error logs checked
- [ ] Production `.env` files secured

---

## 📞 Support Links

- **Render Docs:** https://render.com/docs
- **Netlify Docs:** https://docs.netlify.com/
- **MongoDB Atlas:** https://www.mongodb.com/cloud/atlas
- **GitHub:** https://github.com

---

## 🎉 Congratulations!

Your application is now live and accessible to everyone on the internet!

**Share your app URL with friends and users:**
```
https://your-app.netlify.app
```

