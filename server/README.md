# 🏥 MediCore Backend API

Production-ready Node.js + Express backend for the MediCore healthcare platform.

---

## 🚀 Quick Start

### **1. Install Dependencies**

```bash
cd server
npm install
```

### **2. Set Up MongoDB**

**Option A: Local MongoDB**
```bash
# Install MongoDB locally
# Windows: Download from https://www.mongodb.com/try/download/community
# Mac: brew install mongodb-community
# Linux: sudo apt-get install mongodb

# Start MongoDB
mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

### **3. Configure Environment**

The `.env` file is already created. Update these values:

```env
# Database - Update if using MongoDB Atlas
MONGODB_URI=mongodb://localhost:27017/medicore

# Email - Update with your Gmail credentials
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password

# JWT Secrets - Change in production!
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key
```

**To get Gmail App Password:**
1. Go to Google Account settings
2. Security → 2-Step Verification
3. App passwords → Generate
4. Copy password to `.env`

### **4. Start Server**

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server will run on: **http://localhost:5000**

---

## ✅ Verify Installation

### **Test Health Check:**

```bash
curl http://localhost:5000/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "MediCore API is running",
  "timestamp": "2026-01-15T21:20:26.000Z",
  "environment": "development",
  "uptime": 123.45
}
```

---

## 📡 API Endpoints

### **Base URL:** `http://localhost:5000`

### **Authentication**
```
POST   /api/auth/signup/patient    - Register patient
POST   /api/auth/signup/helper     - Register helper
POST   /api/auth/login             - Login
GET    /api/auth/me                - Get current user
POST   /api/auth/logout            - Logout
POST   /api/auth/refresh           - Refresh token
```

### **Patient Portal**
```
GET    /api/patient/profile
PUT    /api/patient/profile
GET    /api/patient/medications
POST   /api/patient/medications
POST   /api/patient/medications/:id/take
GET    /api/patient/appointments
POST   /api/patient/appointments
... (20 total endpoints)
```

### **Helper Portal**
```
GET    /api/helper/profile
GET    /api/helper/patients
GET    /api/helper/patients/:id/medications
GET    /api/helper/patients/:id/appointments
GET    /api/helper/patients/:id/stats
... (11 total endpoints)
```

---

## 🧪 Testing the API

### **1. Register a Patient**

```bash
curl -X POST http://localhost:5000/api/auth/signup/patient \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@test.com",
    "password": "password123",
    "fullName": "John Doe",
    "age": 35,
    "gender": "Male",
    "contactNumber": "9876543210"
  }'
```

**Save the token from response!**

### **2. Add a Medication**

```bash
curl -X POST http://localhost:5000/api/patient/medications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Aspirin",
    "qtyPerDose": 1,
    "totalQty": 30,
    "scheduledTime": "08:00",
    "mealType": "After Meal",
    "startDate": "2026-01-15",
    "endDate": "2026-02-15"
  }'
```

### **3. Mark as Taken**

```bash
curl -X POST http://localhost:5000/api/patient/medications/MEDICATION_ID/take \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📁 Project Structure

```
server/
├── src/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   ├── env.js             # Environment config
│   │   └── mail.js            # Email config
│   │
│   ├── models/
│   │   ├── User.js            # Base user model
│   │   ├── Patient.js         # Patient model
│   │   ├── Helper.js          # Helper model
│   │   ├── Medication.js      # Medication model
│   │   ├── Appointment.js     # Appointment model
│   │   ├── Notification.js    # Notification model
│   │   └── index.js           # Model exports
│   │
│   ├── controllers/
│   │   ├── auth.controller.js      # Authentication logic
│   │   ├── patient.controller.js   # Patient operations
│   │   └── helper.controller.js    # Helper operations
│   │
│   ├── routes/
│   │   ├── auth.routes.js     # Auth endpoints
│   │   ├── patient.routes.js  # Patient endpoints
│   │   └── helper.routes.js   # Helper endpoints
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.js # JWT verification
│   │   └── role.middleware.js # Role-based access
│   │
│   └── app.js                 # Express app setup
│
├── uploads/                   # Uploaded files
├── server.js                  # Server entry point
├── package.json              # Dependencies
├── .env                      # Environment variables
└── .gitignore               # Git ignore rules
```

---

## 🔐 Security Features

- ✅ Password hashing with bcrypt (12 rounds)
- ✅ JWT authentication with expiration
- ✅ Role-based access control
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ Input validation
- ✅ Error sanitization

---

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `MONGODB_URI` | MongoDB connection | mongodb://localhost:27017/medicore |
| `JWT_SECRET` | JWT secret key | (required) |
| `JWT_EXPIRE` | Token expiry | 24h |
| `EMAIL_USER` | Email username | (required) |
| `EMAIL_PASSWORD` | Email password | (required) |
| `FRONTEND_URL` | Frontend URL | http://localhost:5173 |

---

## 📊 Database Models

### **User** (Base authentication)
- role, email, passwordHash, lastLogin

### **Patient** (Extends User)
- fullName, age, gender, contactNumber, helperId

### **Helper** (Extends User)
- fullName, age, gender, verificationId, assignedPatients

### **Medication**
- patientId, name, qtyPerDose, scheduledTime, takenLogs

### **Appointment**
- patientId, doctorName, date, time, place, status

### **Notification**
- userId, type, message, read, emailSent

---

## 🐛 Troubleshooting

### **MongoDB Connection Error**

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:** Make sure MongoDB is running
```bash
mongod
```

### **JWT Secret Error**

```
Error: JWT_SECRET is required
```

**Solution:** Set JWT_SECRET in `.env` file

### **CORS Error**

```
Access to fetch blocked by CORS policy
```

**Solution:** Update `FRONTEND_URL` in `.env` to match your frontend URL

---

## 📚 Documentation

- **Authentication:** `AUTHENTICATION_DOCUMENTATION.md`
- **Business Logic:** `BUSINESS_LOGIC_DOCUMENTATION.md`
- **Database Schema:** `DATABASE_SCHEMA_DOCUMENTATION.md`

---

## 🚀 Deployment

### **Production Checklist:**

1. ✅ Change JWT secrets
2. ✅ Use MongoDB Atlas (cloud)
3. ✅ Set NODE_ENV=production
4. ✅ Use environment variables
5. ✅ Enable HTTPS
6. ✅ Set up monitoring
7. ✅ Configure backups

### **Deploy to Heroku:**

```bash
# Install Heroku CLI
# Login
heroku login

# Create app
heroku create medicore-api

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-mongodb-atlas-uri
heroku config:set JWT_SECRET=your-secret

# Deploy
git push heroku main
```

---

## 📝 License

MIT

---

## 🤝 Support

For issues or questions:
- 📧 Email: support@medicore.com
- 📚 Documentation: `/docs`

---

**Status:** ✅ Production-ready backend API

**Last Updated:** 2026-01-15
