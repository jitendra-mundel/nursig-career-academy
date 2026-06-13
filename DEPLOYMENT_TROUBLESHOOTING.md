# 🔧 DEPLOYMENT TROUBLESHOOTING GUIDE

## समस्याएं और Solution

---

## ❌ ERROR 1: "CORS ERROR" - API Blocked

### Error Message:
```
Access to XMLHttpRequest at 'https://backend-url/api/...' from origin 
'https://frontend-url.netlify.app' has been blocked by CORS policy
```

### 🔍 Reason:
Frontend और Backend different URLs पर हैं, CORS config गलत है।

### ✅ Solution:

1. **Render Dashboard खोलो:**
   - Service select करो
   - "Environment" tab जाओ
   - `CORS_ORIGIN` find करो

2. **Exact Frontend URL add करो:**
   ```
   CORS_ORIGIN = https://your-exact-site.netlify.app
   ```
   (trailing slash नहीं, exactly match करना है)

3. **Save करो** - Auto redeploy होगा
4. **Clear browser cache:** Ctrl+Shift+Delete
5. **Test करो**

---

## ❌ ERROR 2: "Cannot GET /api/health"

### Error Message:
```
Cannot GET /api/health
```

### 🔍 Reason:
Backend deploy नहीं हुआ या गलत command है।

### ✅ Solution:

1. **Render Dashboard खोलो**
2. **"Logs" tab जाओ**
3. **Errors देखो:**
   - MongoDB connection error?
   - Port already in use?
   - Module not found?

4. **Common fixes:**

   **If: "Cannot find module 'compression'"**
   ```
   npm install करो locally और फिर push करो
   ```

   **If: "Cannot connect to MongoDB"**
   ```
   MONGODB_URI check करो
   Username:password सही है?
   IP whitelist updated है?
   ```

   **If: "Port 5000 already in use"**
   ```
   Render में PORT=5000 set है
   Build command: npm install सही है
   Start command: node server.js सही है
   ```

5. **Manual redeploy:**
   - Render → Manual Redeploy करो
   - या GitHub में कोई change push करो

---

## ❌ ERROR 3: "Blank Page" या "Cannot find module"

### 🔍 Reason:
Frontend build fail हुई या API URL wrong है।

### ✅ Solution:

1. **Browser DevTools खोलो (F12)**
2. **Console tab देखो** - errors दिखेंगी
3. **Common errors:**

   **"VITE_API_BASE_URL is not defined"**
   - Netlify → Site settings → Build & Deploy → Environment
   - `VITE_API_BASE_URL` add करो:
   ```
   VITE_API_BASE_URL = https://your-backend.onrender.com/api
   ```
   - Redeploy करो

   **"Cannot find module './pages/...'"**
   - File path case-sensitive है (Linux पर)
   - Check करो: `LoginPage.jsx` vs `loginpage.jsx`
   - Case exactly match करना है

   **"npm: command not found"**
   - Node.js install नहीं है
   - Render में build command सही है?

4. **Netlify logs check करो:**
   - Netlify → Deploys
   - Latest deploy → Build logs
   - Errors देखो

---

## ❌ ERROR 4: "Email Not Sending"

### 🔍 Reason:
Email credentials wrong हैं।

### ✅ Solution:

1. **Gmail App Password use करो (नहीं regular password):**
   - Gmail account खोलो
   - Security settings: https://myaccount.google.com/security
   - "App passwords" find करो
   - Select app: Mail, Select device: Windows
   - Copy करो password (16 characters, spaces में)

2. **Render में update करो:**
   - `EMAIL_PASSWORD = xxxx xxxx xxxx xxxx` (वही 16 char password)
   - `EMAIL_USER = your-email@gmail.com`

3. **2FA enabled है?**
   - Yes → App password use करना है
   - No → Regular password use कर सकते हो

4. **Test करो:**
   - Frontend पर Register करो
   - Email check करो (spam folder भी देखो)

---

## ❌ ERROR 5: "Login/Register Not Working"

### 🔍 Reason:
Backend API calls fail हो रहे हैं।

### ✅ Solution:

1. **Network tab check करो:**
   - F12 → Network tab
   - Register/Login करो
   - API call देखो
   - Status code क्या है?

2. **If: 404 Not Found**
   ```
   API URL wrong है
   VITE_API_BASE_URL check करो
   ```

3. **If: 500 Internal Server Error**
   ```
   Render logs check करो
   Backend में error है
   ```

4. **If: No response / Timeout**
   ```
   Backend down है?
   Render service check करो
   /api/health call करो
   ```

5. **MongoDB connection failed?**
   ```
   Render में MONGODB_URI check करो
   IP whitelist: 0.0.0.0/0 add करो
   Credentials सही हैं?
   ```

---

## ❌ ERROR 6: "401 Unauthorized"

### 🔍 Reason:
Token expired या invalid है।

### ✅ Solution:

1. **Browser local storage clear करो:**
   - F12 → Storage → Local Storage
   - सब delete करो
   - Refresh करो

2. **फिर से Login करो**

3. **JWT_SECRET change हो गई?**
   ```
   पुराने tokens invalid हो जाएंगे
   सभी users को फिर से login करना होगा
   ```

---

## ❌ ERROR 7: "404 Not Found" on Frontend

### 🔍 Reason:
Frontend URL wrong है या site deploy नहीं हुई।

### ✅ Solution:

1. **Netlify status check करो:**
   - Netlify → Deploys
   - Latest status: "Published" है?
   - या "Failed"?

2. **If: Failed**
   - Deploy logs देखो
   - npm run build error क्या है?

3. **If: Published लेकिन still 404**
   - URL exactly check करो
   - Example: `https://your-exact-site.netlify.app`
   - Typo है?

4. **Clear cache और refresh:**
   - Ctrl+Shift+Delete
   - फिर visit करो

---

## ❌ ERROR 8: "Database Connection Failed"

### 🔍 Reason:
MongoDB Atlas credentials wrong या network access issue।

### ✅ Solution:

1. **MongoDB Atlas खोलो:**
   - https://cloud.mongodb.com

2. **Connection string check करो:**
   - Cluster → Connect
   - Copy connection string
   - Username:password सही है?

3. **IP Whitelist check करो:**
   - Security → Network Access
   - Render का IP add करो?
   - या simply `0.0.0.0/0` add करो (सभी IPs allow करेगा)

4. **Connection string update करो:**
   ```
   MONGODB_URI = mongodb+srv://username:password@cluster-name.mongodb.net/thenocet?retryWrites=true&w=majority
   ```
   - Password में special characters हो तो encode करो
   - Example: `@` → `%40`

5. **Render में redeploy करो**

---

## ❌ ERROR 9: "Build Failed" on Netlify

### Error Message:
```
Build failed with exit code 1
```

### 🔍 Reason:
npm build में error है।

### ✅ Solution:

1. **Netlify deploy logs देखो:**
   - Netlify → Deploys → Failed → Build log
   - Actual error find करो

2. **Locally build करके test करो:**
   ```bash
   cd frontend
   npm install
   npm run build
   ```
   - Error दिख जाएगी

3. **Common build errors:**

   **"Module not found"**
   ```bash
   npm install
   ```

   **"Syntax error"**
   ```
   Code में error है
   Fix करो, commit करो
   GitHub पर push करो
   Netlify auto-redeploys
   ```

   **"Out of memory"**
   ```
   Netlify में paid plan upgrade करो
   या code optimize करो
   ```

---

## ❌ ERROR 10: "Environment Variables Not Loaded"

### 🔍 Reason:
Environment variable syntax wrong है।

### ✅ Solution:

1. **Render environment variables format:**
   ```
   ✅ Correct:
   KEY=value

   ❌ Wrong:
   KEY = value (spaces)
   KEY="value" (quotes)
   KEY='value' (quotes)
   ```

2. **Frontend (Netlify) environment variables:**
   ```
   ✅ Correct:
   VITE_API_BASE_URL=https://backend-url.onrender.com/api

   ❌ Wrong:
   REACT_APP_API_URL=... (wrong prefix)
   ViteApiBaseUrl=... (wrong name)
   ```

3. **Special characters को encode करो:**
   ```
   @ → %40
   # → %23
   $ → %24
   ```

4. **After updating, redeploy करो**

---

## 🔍 DEBUG MODE

### Backend Debug करना:

1. **Render logs देखो (real-time):**
   ```
   Render → Service → Logs
   ```

2. **Local में start करो:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. **Check करो:**
   - MongoDB connect हो रहा?
   - Indexes create हो रहे?
   - Server port 5000 पर है?

### Frontend Debug करना:

1. **DevTools से debug करो:**
   - F12 → Console tab
   - F12 → Network tab
   - Errors दिख जाएंगी

2. **Local में start करो:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Check करो:**
   - API URL सही है?
   - API calls जा रहे हैं?
   - Response आ रहा है?

---

## 📞 HELP RESOURCES

- **Render Docs:** https://render.com/docs
- **Netlify Docs:** https://docs.netlify.com
- **MongoDB Docs:** https://docs.mongodb.com
- **Stack Overflow:** https://stackoverflow.com
- **Your GitHub Issues:** Search करो similar problems

---

## ✅ CHECKLIST WHEN TROUBLESHOOTING

1. [ ] Logs देख लिए (Render/Netlify दोनों के)
2. [ ] Browser cache clear किया
3. [ ] Environment variables सही हैं
4. [ ] API URL सही है
5. [ ] MongoDB connected है
6. [ ] GitHub में latest code है
7. [ ] Services redeploy किए
8. [ ] 5 minutes wait किए deployment के लिए
9. [ ] Incognito window में test किया
10. [ ] सब services status ok है

---

## 🆘 STILL STUCK?

1. **Error message screenshot लो**
2. **Step-by-step क्या किया, लिख लो**
3. **Logs paste करो**
4. **GitHub issue create करो या Stack Overflow पर पूछ लो**

**Remember:** Most deployment issues solve हो जाती हैं जब ठीक से logs देखो! 🔍
