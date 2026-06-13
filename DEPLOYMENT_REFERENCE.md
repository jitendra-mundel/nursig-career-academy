# 🔐 DEPLOYMENT CREDENTIALS & URLS REFERENCE

## Important: इस file को अपने पास safely रखो!

---

## 📍 YOUR DEPLOYMENT URLS

### Frontend URL
```
https://your-site.netlify.app
```
(Netlify से मिलेगा deploy के बाद)

### Backend API URL  
```
https://thenocet-notes-backend.onrender.com
```
(Render से मिलेगा deploy के बाद)

### Full API Base URL
```
https://thenocet-notes-backend.onrender.com/api
```
(Frontend में यह use होगा)

---

## 🔑 GITHUB CREDENTIALS

| Item | Value |
|------|-------|
| Username | `YOUR_GITHUB_USERNAME` |
| Repository | `thenocet-notes` |
| Repository URL | `https://github.com/YOUR_USERNAME/thenocet-notes` |

---

## 🗄️ MONGODB CREDENTIALS

| Item | Value |
|------|-------|
| Cluster Name | `ac-2nvccp2-shard-00-00.vjswl02.mongodb.net` |
| Database Name | `thenocet` |
| Username | `your_mongodb_username` |
| Password | `your_mongodb_password` |
| Connection String | `mongodb+srv://user:pass@cluster.mongodb.net/thenocet?retryWrites=true&w=majority` |

**⚠️ यह safe रखो, किसी को share मत करो!**

---

## 📧 EMAIL CONFIGURATION

| Item | Value |
|------|-------|
| Email Address | `your-email@gmail.com` |
| App Password | `xxxx xxxx xxxx xxxx` (16 characters) |

**Note:** App Password generated from Gmail Security Settings

---

## 🔐 SECURITY KEYS

| Item | Value |
|------|-------|
| JWT_SECRET | `your_secret_key_at_least_32_chars` |
| CORS_ORIGIN | `https://your-site.netlify.app` |

---

## 📱 ACCOUNT LOGIN DETAILS

### GitHub
- Username: `YOUR_USERNAME`
- Password: *stored in password manager*
- 2FA: *if enabled*

### MongoDB Atlas
- Username: `mongodb_user`
- Password: *stored in password manager*

### Render
- Login: `GitHub OAuth`
- Account Email: `your-email@gmail.com`

### Netlify
- Login: `GitHub OAuth`
- Account Email: `your-email@gmail.com`

---

## 🌐 SERVICE DASHBOARDS

| Service | URL | Purpose |
|---------|-----|---------|
| GitHub | https://github.com | Code repository |
| MongoDB Atlas | https://cloud.mongodb.com | Database |
| Render | https://render.com/dashboard | Backend hosting |
| Netlify | https://app.netlify.com | Frontend hosting |

---

## 📝 ENVIRONMENT VARIABLES REFERENCE

### Backend (.env) - Render
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/thenocet
CORS_ORIGIN=https://your-site.netlify.app
JWT_SECRET=your_secret_key
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=app_password
API_URL=https://thenocet-notes-backend.onrender.com
```

### Frontend (.env.production) - Netlify
```env
VITE_API_BASE_URL=https://thenocet-notes-backend.onrender.com/api
```

---

## ✅ DEPLOYMENT CHECKLIST SUMMARY

### Pre-Deployment
- [ ] All code pushed to GitHub
- [ ] MongoDB Atlas configured
- [ ] Emails working locally
- [ ] Backend tests passed locally
- [ ] Frontend builds without errors

### Backend Deployment
- [ ] Render account created
- [ ] Service created with correct settings
- [ ] All environment variables added
- [ ] Deploy completed successfully
- [ ] /api/health endpoint working

### Frontend Deployment
- [ ] Netlify account created
- [ ] Site created with correct settings
- [ ] VITE_API_BASE_URL configured
- [ ] Deploy completed successfully
- [ ] Frontend loads without errors

### Post-Deployment
- [ ] Updated CORS_ORIGIN on Render
- [ ] Backend redeployed
- [ ] Tested login/register flow
- [ ] Tested email sending
- [ ] Tested API calls

---

## 🆘 QUICK TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| API 404 errors | Check VITE_API_BASE_URL matches backend URL |
| CORS errors | Check CORS_ORIGIN in backend .env |
| Email not sending | Verify Email_PASSWORD is app password, not regular password |
| Blank page | Check browser console, verify API URL |
| Backend not starting | Check MongoDB connection, environment variables |

---

## 📞 IMPORTANT LINKS

- **GitHub:** https://github.com
- **MongoDB Atlas:** https://www.mongodb.com/cloud/atlas
- **Render Docs:** https://render.com/docs
- **Netlify Docs:** https://docs.netlify.com
- **Gmail App Password:** https://support.google.com/accounts/answer/185833

---

## 🎯 FIRST STEPS AFTER DEPLOYMENT

1. **Test Login**
   - Go to: `https://your-site.netlify.app`
   - Register with email
   - Check email for OTP
   - Login with credentials

2. **Test API Calls**
   - Open DevTools (F12)
   - Go to Network tab
   - Try to upload a note
   - Check if requests go to Render

3. **Monitor Logs**
   - Render: Check service logs
   - Netlify: Check deploy logs
   - Browser: Check console

4. **Share with Others**
   - URL: `https://your-site.netlify.app`
   - Test registration link

---

## ⚠️ SECURITY REMINDERS

- [ ] Never commit `.env` file to GitHub
- [ ] Never share MongoDB credentials
- [ ] Use strong JWT_SECRET
- [ ] Enable 2FA on all accounts
- [ ] Keep backups of credentials
- [ ] Use password manager for storage

---

## 📊 MONITORING AFTER DEPLOYMENT

### Check Dashboard Regularly
- **Render:** Monitor app health, check logs
- **Netlify:** Monitor build status, check analytics
- **MongoDB Atlas:** Monitor database usage

### Error Monitoring
- Check Render logs: https://render.com/dashboard
- Check Netlify logs: https://app.netlify.com
- Check browser console: F12 → Console tab

---

**Last Updated:** 2026-06-13
**Status:** ✅ Ready to Deploy
