# 🏗️ **MediCore Healthcare Platform: Detailed Architecture Document**

This document provides a highly comprehensive technical architecture and blueprint of the **MediCore Healthcare Platform** (Medication & Appointment Management System). It covers everything from high-level system design and technology stack to granular database relationships, scheduler tasks, state management, and file structure.

---

## 🚀 **1. Technology Stack**

### **Frontend (Client)**
*   **Core Library**: React 19
*   **Build Tool**: Vite
*   **Styling**: Tailwind CSS v4 + Vanilla CSS (`App.css`, `index.css`)
*   **Routing**: React Router DOM v7
*   **State Management**: React Context API (`HealthContext.jsx`) + `useReducer` (`healthReducer.js`)
*   **Animations**: Framer Motion
*   **Icons**: Lucide React
*   **Charting**: Recharts (for Dashboard & Admin Analytics)

### **Backend (Server)**
*   **Runtime Environment**: Node.js (v18+)
*   **Web Framework**: Express.js 4.18
*   **Database Engine**: MySQL 8.x
*   **Object-Relational Mapping (ORM)**: Sequelize v6
*   **Authentication**: JSON Web Tokens (JWT) + bcryptjs
*   **Background Jobs/Scheduling**: node-cron (Scheduler & Email Alerts)
*   **Email Service**: Nodemailer (SMTP/Gmail integration)
*   **File Uploads**: Multer
*   **Security & Middleware**: Helmet, CORS, Morgan, Compression

---

## 📂 **2. Complete Directory & File Structure**

The project is structured into two main sub-projects: Frontend (at the root `src`) and Backend (`server`).

### **Root (Frontend) Directory** (`f:\SROTRIK\med`)
```
├── package.json                   # Frontend dependencies (React, Vite, Tailwind, Recharts)
├── vite.config.js                 # Vite build & plugin configuration
├── eslint.config.js               # ESLint configuration
├── src/                           # Frontend Source Code
│   ├── main.jsx                   # React Application Entry point
│   ├── App.jsx                    # Root Component & Route Definitions
│   ├── index.css / App.css        # Global CSS & Tailwind Directives
│   ├── context/                   # Global State Management
│   │   ├── HealthContext.jsx      # Provider component for API fetching & global state
│   │   └── healthReducer.js       # Complex state transitions/logic
│   ├── components/                # React UI Components
│   │   ├── Dashboard.jsx          # Patient Dashboard overview
│   │   ├── AddMedication.jsx      # Form to add new medicines
│   │   ├── EditMedication.jsx     # Form to edit medication details
│   │   ├── AppointmentList.jsx    # Upcoming and past appointments view
│   │   ├── Stats.jsx              # Charting and statistics for the patient
│   │   ├── Helper*.jsx            # Components related to Helper's view
│   │   ├── Admin*.jsx             # Components related to Admin Portal
│   │   └── Medication.jsx, etc.
│   ├── Login.jsx                  # Main Login View
│   ├── Signup.jsx                 # Patient Signup View
│   ├── HelperSignup.jsx           # Helper Signup View
│   └── assets/                    # Static assets (images, icons)
```

### **Backend Directory** (`f:\SROTRIK\med\server`)
```
├── server.js                      # Main Server entry point (starts HTTP server, runs cron jobs)
├── package.json                   # Backend dependencies
├── .env                           # Environment configuration (DB, JWT Secrets, SMTP)
├── database/                      # SQL Schema definitions & scripts
└── src/
    ├── app.js                     # Express Application Setup (Middlewares, Route Mounting)
    ├── config/                    # Configuration Modules
    │   ├── database.js            # Sequelize Connection & Pool Setup
    │   ├── db.js                  # (Legacy MongoDB config, if applicable)
    │   ├── env.js                 # Centralized Env Variable exports
    │   └── mail.js                # Nodemailer connection config
    ├── models/                    # Sequelize Data Models
    │   ├── User.model.js          # Accounts (Admin, Patient, Helper)
    │   ├── Medication.model.js    # Medicines & Stock limits
    │   ├── Appointment.model.js   # Booked appointments
    │   ├── MedicationLog.model.js # History of consumed medicines
    │   ├── PatientHelper.model.js # Connects Patients to Helpers
    │   ├── Notification.model.js  # Notifications and alerts
    │   ├── RefreshToken.model.js  # JWT refresh-token storage 
    │   └── index.js               # Table Associations/Relationships config
    ├── controllers/               # Business Logic Handling
    │   ├── auth.controller.js     
    │   ├── patient.controller.js  
    │   ├── admin.controller.js    
    │   ├── helper.controller.js   
    │   └── upload.controller.js   
    ├── routes/                    # API Route Definitions (Express Routers)
    │   ├── auth.routes.js         
    │   ├── patient.routes.js      
    │   ├── admin.routes.js        
    │   ├── helper.routes.js       
    │   ├── test.routes.js         
    │   └── upload.routes.js       
    ├── middlewares/               # HTTP Request Interceptors
    │   ├── auth.middleware.js     # Validates JWT Access Tokens
    │   ├── role.middleware.js     # Checks (Admin/Helper/Patient) capabilities
    │   └── upload.middleware.js   # Multer file handlers
    ├── services/                  # Exernal Service Integrations
    │   └── email.service.js       # SMTP sending logic & email templates
    └── jobs/                      # Cron Job Definitions
        └── scheduler.js           # Automated Tasks (Reminders, Alerts)
```

---

## 🧠 **3. Core System Architecture**

The application leverages a decoupled Client-Server architecture utilizing a RESTful JSON API.

### **A. Component Communication (Frontend)**
1.  **State Management pattern (`HealthContext.jsx`)**: 
    - The platform uses the React Context API coupled with a `useReducer` to maintain a single source of truth for the active user session.
    - Upon successful login, the Context fetches critical operational data (Profile info, Medications list, Appointments list, Stock tracking).
    - When granular UI components (e.g., `UpcomingMeds`) trigger state alterations (like "Mark as Taken"), the Context hits the backend REST API. Upon success, the Context automatically pulls the latest payload, avoiding unsynchronized local state.

2.  **Authentication Guarding**:
    - `react-router-dom` intercepts paths to prevent unauthorized access.
    - `PatientLayout`, `AdminDashboard`, and `HelperDashboard` wrap around component sub-trees to enforce UI protection.

### **B. Backend Pattern (MVC/Service Layer)**
1.  **Transport & Security**: Incoming HTTP requests hit `app.js` which has global middlewares applied: `Helmet` (Headers validation), `Cors` (Origin restrictions), and `express.json` with payload limits (preventing massive body attacks).
2.  **Routing & Middleware**: Request moves to `/api/[resource]`. Middlewares like `verifyToken` inspect the `Authorization: Bearer <token>` header, decoding user IDs and injecting them into `req.user`.
3.  **Controllers**: Performs input sanitization, interfaces with Sequelize models, and returns standardized JSON outputs: `{ success: true, data: {...} }`.
4.  **Error Handling**: Global error boundary catches all throw exceptions, handling DB Duplicate Keys, ValidationErrors, and missing tokens gracefully preventing Express engine crashes.

---

## 🗄️ **4. Database Schema & Associations (MySQL)**

The database is built on a heavily normalized Relational structure mapping. All models automatically inject `created_at` and `updated_at` properties via Sequelize.

1.  **`users` Table**: Master table for all personnel. Contains `role` (`'patient'`, `'admin'`, `'helper'`), authentication hashes, and profile attributes.
2.  **`medications` Table**: Belongs to `Patient(User)`. 
    - Tracks details like `medicine_name`, `qty_per_dose`, `meal_type` (before_meal, after_meal), `selected_days` (JSON array logic).
    - **Stock Logic**: Holds `total_quantity` and `remaining_quantity`. 
3.  **`appointments` Table**: Belongs to `Patient`. Holds status (`'scheduled'`, `'completed'`, `'missed'`). 
4.  **`medication_logs` Table**: Tracks exactly when a medication was taken. Belongs to both `User` and `Medication`.
5.  **`patient_helpers` (Many-to-Many Mappings)**: Connects a Patient ID to a Helper ID, optionally tracking the `assigned_by` Admin ID.
6.  **`notifications` Table**: System log notifications belonging to a specific `user_id`.
7.  **`refresh_tokens` Table**: Security table maintaining long-lived token validities for silent application access.

### **Key Entity Relationships**
- `User (1) ---> (M) Medications` (Cascade Delete)
- `User (1) ---> (M) Appointments` (Cascade Delete)
- `Medication (1) ---> (M) MedicationLogs` (Cascade Delete)
- `User (1) ---> (M) RefreshTokens`
- `PatientHelper` bridges two `User` entities (`patient_id` and `helper_id`).

---

## ⏱️ **5. Automated Schedulers & Background Jobs**

The background thread is maintained by `node-cron` executed natively within Node's event loop in `/src/jobs/scheduler.js`.

### **Job 1: Medication Reminders (Runs `* * * * *` - Every Minute)**
- Scans `Medications` table actively filtered by today's date and the `selected_days` JSON array.
- Evaluates if the current server time is exactly 15 minutes prior to the designated `scheduled_time`.
- Checks `MedicationLogs` to ensure the patient hasn't *already* taken the medication within the last 20 minutes to prevent duplicative spam.
- Triggers `email.service.js` to dispatch an HTML template reminding them to take their pill "Before Meal/After Meal".

### **Job 2: Low Stock Alerts (Runs `0 */6 * * *` - Every 6 Hours)**
- Scans the total system looking for active medications where `remaining_quantity` is between 1 and `env.LOW_STOCK_THRESHOLD` (Default: 10 units).
- Generates a warning email allowing the patient to order refills accurately.

### **Job 3: Appointment Reminders (Runs `*/30 * * * *` - Every 30 Mins)**
- Looks for `Appointments` scheduled precisely within the next 10 hours (`env.APPOINTMENT_REMINDER_HOURS`).
- Sets a flag `reminder_sent = true` in the DB sequentially dispatching the Clinic details and Doctor name.

### **Job 4: Auto-mark Missed Appointments (Runs `0 * * * *` - Every Hour)**
- Sweeps database for `Appointments` tagged as `'scheduled'` where the `appointment_date` / `appointment_time` timestamp exists chronologically in the past. 
- Updates the status to `'missed'` permanently.

---

## 🛠️ **6. Security & Flow Implementations**

### **A. Token Security**
- **Short-Lived Access Tokens**: Typical lifespan 1-7 days depending on configuration. Kept strictly in client's application state memory.
- **Refresh Tokens**: Long-lived (~30 days). Kept in HttpOnly cookies (if configured) or encrypted Storage, checked against `refresh_tokens` table. Allows silent refresh flows.

### **B. Granular Day-Based Filtering (Frontend vs Backend)**
- The Medication creation dictates what days a pill must be taken (e.g. `['Mon', 'Wed', 'Fri']`).
- **Frontend filtering**: `UpcomingMeds.jsx` filters the locally cached memory based on `new Date().getDay()`.
- **Backend enforcement**: The CRON scheduler validates `[Sun, Mon...]` inclusion against `medication.selected_days` before sending reminders.

### **C. Helper & Admin Permissions Segregation**
- A user bearing token `{ role: 'helper' }` has routes intercepted by `role.middleware` denying actions on `api/admin/*` routers but granting read-only access to `api/helper/*` patient records assigned to them via `patient_helpers` bridge data.
- Admins possess absolute capabilities over users, assignments, and statistical metric evaluations.

---

## 🏃 **7. Deployment & Execution Flow**

1.  **MySQL Server Initialization**: The raw sql script located in `server/database/schema.sql` initializes all tables.
2.  **Backend Runtime Layer**: 
    - Configuration loads `dotenv`.
    - Main express app initializes port binding (`5000`).
    - Sequelize performs standard dialect connection test.
    - Scheduler bootstraps automatically.
3.  **Frontend Runtime Layer**: 
    - Vite constructs the dependency graph.
    - React loads on port `5173`.
    - Local dev server proxies connections properly or relies on strict CORS rules to the API URL.
