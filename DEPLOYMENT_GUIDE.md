# 🚀 MediCore Free Deployment Guide

## 🎯 **Free Deployment Strategy**

### **Frontend:** Vercel (Free)
### **Backend:** Render or Railway (Free)
### **Database:** MongoDB Atlas (Already set up - Free)

---

## 📦 **Part 1: Prepare for Deployment**

### **Step 1: Create GitHub Repository**

1. **Go to:** https://github.com
2. **Create new repository:**
   - Name: `medicore-platform`
   - Visibility: Public (for free deployment)
   - Don't initialize with README

3. **Push your code to GitHub:**

```bash
# In your project root (e:\med)
cd e:\med

# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - MediCore platform"

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/medicore-platform.git

# Push
git branch -M main
git push -u origin main
```

---

## 🎨 **Part 2: Deploy Frontend to Vercel**

### **Step 1: Prepare Frontend**

1. **Update API URL for production**

Create `e:\med\.env.production`:

```env
VITE_API_URL=https://your-backend-url.onrender.com/api
```

We'll update this URL after deploying the backend.

2. **Ensure build works locally:**

```bash
cd e:\med
npm run build
```

✅ Should create a `dist` folder without errors.

---

### **Step 2: Deploy to Vercel**

1. **Go to:** https://vercel.com
2. **Sign up** with GitHub
3. **Click "Add New Project"**
4. **Import your repository:**
   - Select `medicore-platform`
   - Framework Preset: **Vite**
   - Root Directory: `./` (root)
   - Build Command: `npm run build`
   - Output Directory: `dist`

5. **Environment Variables:**
   - Click "Environment Variables"
   - Add: `VITE_API_URL` = `https://your-backend-url.onrender.com/api`
   - (We'll update this after backend deployment)

6. **Click "Deploy"**

**Wait 2-3 minutes...**

✅ **Frontend deployed!** You'll get a URL like:
```
https://medicore-platform.vercel.app
```

---

## 🔧 **Part 3: Deploy Backend to Render (Recommended - Free)**

### **Step 1: Prepare Backend**

1. **Create separate GitHub repo for backend:**

```bash
cd e:\med\server

# Initialize git
git init

# Create .gitignore (already exists)
# Make sure .env is in .gitignore

# Add all files
git add .

# Commit
git commit -m "Backend - MediCore API"

# Create new repo on GitHub: medicore-backend
# Add remote
git remote add origin https://github.com/YOUR_USERNAME/medicore-backend.git

# Push
git push -u origin main
```

2. **Update package.json** (already correct):

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

---

### **Step 2: Deploy to Render**

1. **Go to:** https://render.com
2. **Sign up** with GitHub
3. **Click "New +" → "Web Service"**
4. **Connect your repository:**
   - Select `medicore-backend`
   - Click "Connect"

5. **Configure:**
   - **Name:** `medicore-backend`
   - **Region:** Choose closest to you
   - **Branch:** `main`
   - **Root Directory:** (leave blank)
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`

6. **Environment Variables** (Click "Advanced"):

Add these environment variables:

```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://srotrikpradhan_db_user:Med1234@medicineremindercluster.7ignwye.mongodb.net/medicineReminder?retryWrites=true&w=majority
JWT_SECRET=medicore-super-secret-jwt-key-change-in-production-min-32-characters
JWT_EXPIRE=24h
JWT_REFRESH_SECRET=medicore-refresh-token-secret-change-in-production
JWT_REFRESH_EXPIRE=30d
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=MediCore <noreply@medicore.com>
FRONTEND_URL=https://medicore-platform.vercel.app
BCRYPT_ROUNDS=12
```

**Important:** Change `FRONTEND_URL` to your actual Vercel URL!

7. **Click "Create Web Service"**

**Wait 5-10 minutes for deployment...**

✅ **Backend deployed!** You'll get a URL like:
```
https://medicore-backend.onrender.com
```

---

### **Step 3: Test Backend Deployment**

Open in browser:
```
https://medicore-backend.onrender.com/health
```

You should see:
```json
{
  "success": true,
  "message": "MediCore API is running"
}
```

---

## 🔗 **Part 4: Connect Frontend to Backend**

### **Update Vercel Environment Variable:**

1. Go to Vercel dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Update `VITE_API_URL`:
   ```
   https://medicore-backend.onrender.com/api
   ```
5. **Redeploy:**
   - Go to **Deployments**
   - Click "..." on latest deployment
   - Click "Redeploy"

---

## 🔄 **Alternative: Deploy Backend to Railway**

Railway is another great free option:

### **Step 1: Deploy to Railway**

1. **Go to:** https://railway.app
2. **Sign up** with GitHub
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Select:** `medicore-backend`

6. **Add Environment Variables:**
   - Click on your service
   - Go to **Variables** tab
   - Add all the environment variables (same as Render above)

7. **Deploy!**

Railway will give you a URL like:
```
https://medicore-backend.up.railway.app
```

---

## ✅ **Part 5: Verify Deployment**

### **Test Backend:**

1. **Health Check:**
   ```
   https://your-backend-url.onrender.com/health
   ```

2. **Test Signup:**
   ```bash
   curl -X POST https://your-backend-url.onrender.com/api/auth/signup/patient \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123","fullName":"Test User","age":30,"gender":"Male","contactNumber":"9876543210"}'
   ```

### **Test Frontend:**

1. Open your Vercel URL
2. Try to signup
3. Try to login
4. Add a medication
5. Check if it saves

---

## 🎯 **Deployment Checklist**

### **Before Deployment:**
- [ ] Code pushed to GitHub
- [ ] .env files not committed
- [ ] Build works locally
- [ ] All tests pass

### **Frontend (Vercel):**
- [ ] Repository connected
- [ ] Build command set
- [ ] Environment variables added
- [ ] Deployment successful
- [ ] Site loads correctly

### **Backend (Render/Railway):**
- [ ] Repository connected
- [ ] Start command set
- [ ] All environment variables added
- [ ] Deployment successful
- [ ] Health check passes
- [ ] MongoDB connects

### **Integration:**
- [ ] Frontend can call backend
- [ ] CORS configured correctly
- [ ] Signup works
- [ ] Login works
- [ ] Data persists

---

## 🔒 **Security Checklist**

Before going live:

- [ ] Change JWT_SECRET to a strong random string
- [ ] Change JWT_REFRESH_SECRET
- [ ] Update FRONTEND_URL to actual Vercel URL
- [ ] Set NODE_ENV=production
- [ ] Don't commit .env files
- [ ] Use strong MongoDB password
- [ ] Enable MongoDB IP whitelist (or use 0.0.0.0/0 for now)

---

## 🐛 **Common Issues & Solutions**

### **Issue 1: CORS Error**

**Error:** "Access blocked by CORS policy"

**Solution:**
1. Check `FRONTEND_URL` in backend .env
2. Make sure it matches your Vercel URL exactly
3. Redeploy backend

---

### **Issue 2: MongoDB Connection Failed**

**Error:** "Authentication failed"

**Solution:**
1. Check MongoDB Atlas → Network Access
2. Make sure `0.0.0.0/0` is whitelisted
3. Verify MONGODB_URI in environment variables
4. Check username and password

---

### **Issue 3: Build Failed on Vercel**

**Error:** Build command failed

**Solution:**
1. Check build logs
2. Make sure `npm run build` works locally
3. Check if all dependencies are in package.json
4. Try clearing Vercel cache and redeploying

---

### **Issue 4: Backend Sleeping (Render Free Tier)**

**Note:** Render free tier sleeps after 15 minutes of inactivity

**Solution:**
- First request after sleep takes 30-60 seconds
- Consider upgrading to paid tier for production
- Or use Railway (doesn't sleep)

---

## 💰 **Cost Breakdown**

| Service | Plan | Cost |
|---------|------|------|
| **Vercel** | Hobby | FREE ✅ |
| **Render** | Free | FREE ✅ |
| **Railway** | Free | FREE ✅ (500 hrs/month) |
| **MongoDB Atlas** | M0 | FREE ✅ |
| **Total** | | **$0/month** 🎉 |

---

## 🚀 **Quick Deployment Commands**

### **Deploy Frontend:**
```bash
# Push to GitHub
cd e:\med
git add .
git commit -m "Ready for deployment"
git push

# Vercel will auto-deploy on push
```

### **Deploy Backend:**
```bash
# Push to GitHub
cd e:\med\server
git add .
git commit -m "Ready for deployment"
git push

# Render/Railway will auto-deploy on push
```

---

## 📊 **Post-Deployment**

### **Your Live URLs:**

**Frontend:**
```
https://medicore-platform.vercel.app
```

**Backend:**
```
https://medicore-backend.onrender.com
```

**API Endpoints:**
```
https://medicore-backend.onrender.com/api/auth/signup/patient
https://medicore-backend.onrender.com/api/auth/login
https://medicore-backend.onrender.com/api/patient/medications
... (37 total endpoints)
```

---

## 🎉 **Congratulations!**

Your MediCore platform is now live and accessible worldwide! 🌍

**Share your app:**
- Frontend: `https://your-app.vercel.app`
- API: `https://your-backend.onrender.com`

**Next steps:**
1. ✅ Test all features on production
2. ✅ Share with users
3. ✅ Monitor for errors
4. ✅ Add custom domain (optional)
5. ✅ Set up analytics (optional)

---

**Need help?** Check the troubleshooting section or reach out! 🚀
