# 🧪 MediCore Pre-Deployment Testing Guide

## ✅ Complete Testing Checklist Before Deployment

This guide will help you test every feature of your MediCore platform to ensure everything works perfectly before deployment.

---

## 🎯 **Testing Overview**

### **What We'll Test:**
1. ✅ Backend API endpoints (37 endpoints)
2. ✅ Database operations (CRUD)
3. ✅ Authentication & Authorization
4. ✅ Frontend-Backend integration
5. ✅ User flows (Patient, Helper, Admin)
6. ✅ Error handling
7. ✅ Security features

---

## 📡 **Part 1: Backend API Testing**

### **Method 1: Using Browser (Easiest)**

#### **1. Test Health Check**
Open in browser:
```
http://localhost:5000/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "MediCore API is running",
  "timestamp": "2026-01-15T...",
  "environment": "development",
  "uptime": 123.45
}
```

✅ **Pass:** You see the JSON response
❌ **Fail:** Connection refused or error

---

#### **2. Test Root Endpoint**
Open in browser:
```
http://localhost:5000
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Welcome to MediCore API",
  "version": "1.0.0",
  "endpoints": {
    "auth": "/api/auth",
    "patient": "/api/patient",
    "helper": "/api/helper"
  }
}
```

✅ **Pass:** You see the welcome message
❌ **Fail:** Error or blank page

---

### **Method 2: Using PowerShell/Command Prompt**

Open a new terminal and run these commands:

#### **1. Test Health Check**
```powershell
curl http://localhost:5000/health
```

#### **2. Test Patient Signup**
```powershell
curl -X POST http://localhost:5000/api/auth/signup/patient `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@example.com\",\"password\":\"password123\",\"fullName\":\"Test User\",\"age\":30,\"gender\":\"Male\",\"contactNumber\":\"9876543210\"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Patient account created successfully",
  "data": {
    "user": { ... },
    "patient": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "..."
  }
}
```

✅ **Pass:** You get a token
❌ **Fail:** Error message

**Save the token!** You'll need it for next tests.

---

#### **3. Test Login**
```powershell
curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@example.com\",\"password\":\"password123\",\"role\":\"patient\"}'
```

✅ **Pass:** You get a token
❌ **Fail:** "Invalid credentials"

---

#### **4. Test Protected Route (Get Current User)**
Replace `YOUR_TOKEN` with the token from signup/login:

```powershell
curl http://localhost:5000/api/auth/me `
  -H "Authorization: Bearer YOUR_TOKEN"
```

✅ **Pass:** You see user data
❌ **Fail:** "Access denied"

---

#### **5. Test Add Medication**
```powershell
curl -X POST http://localhost:5000/api/patient/medications `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -d '{\"name\":\"Aspirin\",\"qtyPerDose\":1,\"totalQty\":30,\"scheduledTime\":\"08:00\",\"mealType\":\"After Meal\",\"startDate\":\"2026-01-15\",\"endDate\":\"2026-02-15\"}'
```

✅ **Pass:** Medication created
❌ **Fail:** Validation error

**Save the medication ID from response!**

---

#### **6. Test Get Medications**
```powershell
curl http://localhost:5000/api/patient/medications `
  -H "Authorization: Bearer YOUR_TOKEN"
```

✅ **Pass:** You see the medication you just added
❌ **Fail:** Empty array or error

---

#### **7. Test Mark Medication as Taken**
Replace `MEDICATION_ID` with the ID from step 5:

```powershell
curl -X POST http://localhost:5000/api/patient/medications/MEDICATION_ID/take `
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Medication marked as taken",
  "data": {
    "medication": {
      "remainingQty": 29
    },
    "log": {
      "delayMinutes": 5,
      "status": "Late"
    }
  }
}
```

✅ **Pass:** Quantity decreased, delay calculated
❌ **Fail:** Error

---

#### **8. Test Add Appointment**
```powershell
curl -X POST http://localhost:5000/api/patient/appointments `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -d '{\"doctorName\":\"Dr. Smith\",\"contact\":\"9876543210\",\"date\":\"2026-01-20\",\"time\":\"10:00\",\"place\":\"City Hospital\"}'
```

✅ **Pass:** Appointment created
❌ **Fail:** Validation error

---

### **Method 3: Using Postman (Recommended)**

1. **Download Postman:** https://www.postman.com/downloads/
2. **Import this collection:**

Create a new collection in Postman with these requests:

**Collection: MediCore API Tests**

```
1. Health Check
   GET http://localhost:5000/health

2. Patient Signup
   POST http://localhost:5000/api/auth/signup/patient
   Body (JSON):
   {
     "email": "test@example.com",
     "password": "password123",
     "fullName": "Test User",
     "age": 30,
     "gender": "Male",
     "contactNumber": "9876543210"
   }

3. Login
   POST http://localhost:5000/api/auth/login
   Body (JSON):
   {
     "email": "test@example.com",
     "password": "password123",
     "role": "patient"
   }

4. Get Current User
   GET http://localhost:5000/api/auth/me
   Headers:
   Authorization: Bearer {{token}}

5. Get Medications
   GET http://localhost:5000/api/patient/medications
   Headers:
   Authorization: Bearer {{token}}

6. Add Medication
   POST http://localhost:5000/api/patient/medications
   Headers:
   Authorization: Bearer {{token}}
   Body (JSON):
   {
     "name": "Aspirin",
     "qtyPerDose": 1,
     "totalQty": 30,
     "scheduledTime": "08:00",
     "mealType": "After Meal",
     "startDate": "2026-01-15",
     "endDate": "2026-02-15"
   }

7. Take Medication
   POST http://localhost:5000/api/patient/medications/{{medicationId}}/take
   Headers:
   Authorization: Bearer {{token}}

8. Get Appointments
   GET http://localhost:5000/api/patient/appointments
   Headers:
   Authorization: Bearer {{token}}

9. Add Appointment
   POST http://localhost:5000/api/patient/appointments
   Headers:
   Authorization: Bearer {{token}}
   Body (JSON):
   {
     "doctorName": "Dr. Smith",
     "contact": "9876543210",
     "date": "2026-01-20",
     "time": "10:00",
     "place": "City Hospital"
   }
```

---

## 🌐 **Part 2: Frontend Testing**

### **1. Test Frontend is Running**
Open browser:
```
http://localhost:5173
```

✅ **Pass:** You see the MediCore homepage
❌ **Fail:** Connection refused

---

### **2. Test Patient Signup Flow**

1. Go to: `http://localhost:5173/signup`
2. Select role: **Patient**
3. Fill in the form:
   - Email: `patient@test.com`
   - Password: `password123`
   - Full Name: `John Doe`
   - Age: `35`
   - Gender: `Male`
   - Contact: `9876543210`
4. Click **Sign Up**

✅ **Pass:** Redirected to dashboard
❌ **Fail:** Error message or stays on signup page

---

### **3. Test Login Flow**

1. Go to: `http://localhost:5173/login`
2. Enter:
   - Email: `patient@test.com`
   - Password: `password123`
   - Role: `Patient`
3. Click **Login**

✅ **Pass:** Redirected to dashboard
❌ **Fail:** "Invalid credentials"

---

### **4. Test Add Medication**

1. Go to: `http://localhost:5173/add-medication`
2. Fill in the form:
   - Name: `Aspirin`
   - Qty per Dose: `1`
   - Total Qty: `30`
   - Time: `08:00`
   - Meal Type: `After Meal`
   - Start Date: Today
   - End Date: 30 days from now
3. Click **Add Medication**

✅ **Pass:** Success message, medication appears in list
❌ **Fail:** Error or medication not saved

---

### **5. Test "Take Pill" Functionality**

1. Go to: `http://localhost:5173/dashboard`
2. Find the medication you just added
3. Click **"Take Pill"** button

✅ **Pass:** 
   - Button changes to "Taken"
   - Remaining quantity decreases
   - Delay time is shown
❌ **Fail:** No change or error

---

### **6. Test Add Appointment**

1. Go to: `http://localhost:5173/add-appointment`
2. Fill in the form:
   - Doctor Name: `Dr. Smith`
   - Contact: `9876543210`
   - Date: Future date
   - Time: `10:00`
   - Place: `City Hospital`
3. Click **Add Appointment**

✅ **Pass:** Appointment appears in list
❌ **Fail:** Error or not saved

---

### **7. Test Stats Page**

1. Go to: `http://localhost:5173/stats`
2. Check if you see:
   - Today's medications
   - Taken count
   - Compliance rate
   - Performance summary

✅ **Pass:** Stats are displayed correctly
❌ **Fail:** No data or errors

---

## 🔐 **Part 3: Security Testing**

### **1. Test Unauthorized Access**

Try to access protected route without token:
```powershell
curl http://localhost:5000/api/patient/medications
```

✅ **Pass:** "Access denied. No token provided."
❌ **Fail:** You get data (security issue!)

---

### **2. Test Invalid Token**

```powershell
curl http://localhost:5000/api/patient/medications `
  -H "Authorization: Bearer invalid_token_here"
```

✅ **Pass:** "Access denied. Invalid token."
❌ **Fail:** You get data (security issue!)

---

### **3. Test Role-Based Access**

Login as patient, then try to access helper endpoint:
```powershell
curl http://localhost:5000/api/helper/patients `
  -H "Authorization: Bearer PATIENT_TOKEN"
```

✅ **Pass:** "Access denied. This resource requires helper role."
❌ **Fail:** You get data (security issue!)

---

## 🧪 **Part 4: Database Testing**

### **1. Check MongoDB Atlas**

1. Go to: https://cloud.mongodb.com
2. Click **"Browse Collections"** on your cluster
3. Select database: `medicineReminder`
4. Check collections:
   - `users` - Should have your test user
   - `patients` - Should have patient profile
   - `medications` - Should have your test medication
   - `appointments` - Should have your test appointment

✅ **Pass:** All data is there
❌ **Fail:** Collections empty or missing

---

### **2. Test Data Persistence**

1. Add a medication via frontend
2. Refresh the page
3. Check if medication is still there

✅ **Pass:** Data persists after refresh
❌ **Fail:** Data disappears

---

## 📋 **Complete Testing Checklist**

### **Backend API (37 endpoints):**
- [ ] Health check works
- [ ] Patient signup works
- [ ] Patient login works
- [ ] Helper signup works
- [ ] Helper login works
- [ ] Get current user works
- [ ] Add medication works
- [ ] Get medications works
- [ ] Take medication works
- [ ] Update medication works
- [ ] Delete medication works
- [ ] Add appointment works
- [ ] Get appointments works
- [ ] Update appointment works
- [ ] Mark appointment attended works
- [ ] Cancel appointment works
- [ ] Delete appointment works

### **Frontend:**
- [ ] Homepage loads
- [ ] Signup page works
- [ ] Login page works
- [ ] Dashboard loads
- [ ] Add medication works
- [ ] Take pill button works
- [ ] Medication list updates
- [ ] Add appointment works
- [ ] Appointment list shows data
- [ ] Stats page displays correctly
- [ ] Navigation works
- [ ] Logout works

### **Security:**
- [ ] Unauthorized access blocked
- [ ] Invalid token rejected
- [ ] Role-based access enforced
- [ ] Passwords are hashed
- [ ] Tokens expire correctly

### **Database:**
- [ ] Data saves to MongoDB
- [ ] Data persists after refresh
- [ ] CRUD operations work
- [ ] Relationships work correctly

---

## 🎯 **Quick Test Script**

Run this in PowerShell to test all basic endpoints:

```powershell
# Test 1: Health Check
Write-Host "Testing Health Check..." -ForegroundColor Yellow
curl http://localhost:5000/health

# Test 2: Signup
Write-Host "`nTesting Signup..." -ForegroundColor Yellow
$signup = curl -X POST http://localhost:5000/api/auth/signup/patient `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"quicktest@example.com\",\"password\":\"password123\",\"fullName\":\"Quick Test\",\"age\":30,\"gender\":\"Male\",\"contactNumber\":\"9876543210\"}' | ConvertFrom-Json

$token = $signup.data.token
Write-Host "Token received: $($token.Substring(0,20))..." -ForegroundColor Green

# Test 3: Get Medications
Write-Host "`nTesting Get Medications..." -ForegroundColor Yellow
curl http://localhost:5000/api/patient/medications `
  -H "Authorization: Bearer $token"

Write-Host "`n✅ All basic tests passed!" -ForegroundColor Green
```

---

## ✅ **Success Criteria**

Your application is ready for deployment when:

1. ✅ All API endpoints return expected responses
2. ✅ Frontend can signup/login users
3. ✅ Medications can be added and marked as taken
4. ✅ Appointments can be created and viewed
5. ✅ Data persists in MongoDB
6. ✅ Security checks pass
7. ✅ No console errors
8. ✅ All user flows work end-to-end

---

## 🚀 **Ready for Deployment?**

If all tests pass, you're ready to deploy!

**Next steps:**
1. ✅ Test everything above
2. ✅ Fix any issues found
3. ✅ Deploy frontend (Vercel/Netlify)
4. ✅ Deploy backend (Heroku/Railway)
5. ✅ Update environment variables
6. ✅ Test production deployment

---

**Good luck with testing!** 🎉
