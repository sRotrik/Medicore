# 🏗️ **Project Architecture: Medication Management System**

This document outlines the complete technical architecture and file structure of the Medication Management System. This is a full-stack web application built using the PERN-style stack (PostgreSQL replaced with **MySQL** via Sequelize).

---

## 🚀 **1. Tech Stack**

### **Frontend (Client)**
*   **Framework:** React 18 (Vite)
*   **Styling:** Tailwind CSS (v3/v4 compatible)
*   **Animations:** Framer Motion
*   **Icons:** Lucide React
*   **Routing:** React Router DOM v6
*   **State Management:** React Context API (`HealthContext`)

### **Backend (Server)**
*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Database:** MySQL
*   **ORM:** Sequelize
*   **Authentication:** JSON Web Tokens (JWT) + Bcrypt
*   **Scheduling:** Node-Cron (for automated tasks)
*   **Logging:** Morgan

---

## 📂 **2. Directory Structure**

### **Root Directory** (`e:\med`)
The root contains the Frontend application and the Server directory.

```
e:\med
├── index.html                  # Entry point for Vite/React
├── package.json                # Frontend dependencies
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind CSS settings
├── src/                        # Frontend Source Code
│   ├── main.jsx                # React Entry point
│   ├── App.jsx                 # Main Router & Layout
│   ├── Login.jsx               # Auth Login Page
│   ├── Signup.jsx              # Auth Signup Page
│   ├── index.css               # Global Styles & Tailwind Directives
│   ├── context/
│   │   └── HealthContext.jsx   # GLOBAL STATE: Manages Data Sync
│   └── components/             # Reusable UI Components
│       ├── Dashboard.jsx       # Patient Dashboard
│       ├── Stats.jsx           # Health Statistics
│       ├── Medication.jsx      # Medication List View
│       ├── AddMedication.jsx   # Form to Add Meds
│       ├── UpcomingMeds.jsx    # "Today's Schedule" Card
│       ├── AdminDashboard.jsx  # Admin Portal
│       └── ... (other components)
└── server/                     # Backend Application Root
```

### **Backend Directory** (`e:\med\server`)
The backend is structured using the **MVC (Model-View-Controller)** pattern.

```
e:\med\server
├── server.js                   # Server Entry Point (starts listening)
├── package.json                # Backend dependencies
├── .env                        # Environment Variables (DB, JWT Secrets)
└── src/
    ├── app.js                  # Express App Config (Middleware, Routes)
    ├── config/
    │   └── database.js         # Sequelize Connection & Pool
    ├── models/                 # Database Schemas (Sequelize)
    │   ├── User.model.js       # Users (Patients, Admins, Helpers)
    │   ├── Medication.model.js # Meds Info & Stock
    │   ├── Appointment.model.js# Doctor Appointments
    │   ├── MedicationLog.model.js # Usage History
    │   ├── PatientHelper.model.js # Helper Assignments
    │   └── index.js            # Associations (One-to-Many, etc.)
    ├── controllers/            # Business Logic
    │   ├── auth.controller.js  # Login/Signup Logic
    │   ├── patient.controller.js # Patient Operations
    │   ├── admin.controller.js # Admin Operations
    │   └── helper.controller.js # Helper Operations
    ├── routes/                 # API Endpoints
    │   ├── auth.routes.js      # /api/auth
    │   ├── patient.routes.js   # /api/patient
    │   ├── admin.routes.js     # /api/admin
    │   └── helper.routes.js    # /api/helper
    └── middlewares/            # Request Interceptors
        ├── auth.middleware.js  # Verify JWT Token
        └── role.middleware.js  # Check User Role (Admin/Patient)
```

---

## 🧠 **3. Key Architecture Concepts**

### **A. Data Flow (Frontend)**
1.  **Context API (`HealthContext`)**:
    *   Acts as the **Single Source of Truth**.
    *   On load, fetches `Patient`, `Medications`, and `Appointments` from backend.
    *   **Direct Sync**: When an action happens (e.g., "Take Med"), the API is called, and *then* the data is refreshed immediately.

2.  **Components**:
    *   Components (like `Dashboard`) simply **consume** data from `useHealth()`.
    *   They typically do *not* hold local state for business data, ensuring consistency.

### **B. Backend Logic (MVC)**
1.  **User Request** → **Route** (`/api/patient/medications`)
2.  **Middleware** → Verifies Token & Role.
3.  **Controller** → Executes logic (e.g., "Find all active meds for user X").
4.  **Model** → Queries MySQL database.
5.  **Response** → Sends JSON back to Frontend.

### **C. Database Schema (Normalized)**
*   **Users Table**: Stores all users with a `role` column ('patient', 'admin', 'helper').
*   **Medications Table**: Linked to `patient_id`. Contains `remaining_quantity` and `is_active` flags.
*   **MedicationLogs Table**: Records every time a patient clicks "Mark as Taken".

---

## ✨ **4. Special Features Implementation**

### **Day-Based Filtering**
*   **Frontend**: `UpcomingMeds.jsx` filters the global medication list. It checks the current day (e.g., "Fri") against the `selectedDays` array of each medication.
*   **Backend**: The `Medications` table has a JSON column `selected_days` that stores `['Mon', 'Wed', 'Fri']`.

### **Stock Management**
*   **Logic**: Every time `takeMedication` endpoint is hit:
    1.  Backend creates a log entry.
    2.  Backend decrements `remaining_quantity`.
    3.  If quantity reaches 0, `is_active` is set to false.

---

## 🏁 **5. Server Management**

*   **Running the Project**:
    *   **Backend**: `cd server && npm run dev` (Runs on Port 5000)
    *   **Frontend**: `cd root && npm run dev` (Runs on Port 5173)

This architecture ensures scalability, clean separation of concerns, and ease of maintenance.
