# 🗄️ **Database Documentation: Medication Management System**

This project uses a relational database design (MySQL) managed via Sequelize ORM. The schema is normalized to **3rd Normal Form (3NF)** to ensure data integrity, minimize redundancy, and allow for efficient updates.

---

## 🏗️ **1. Database Overview**

*   **Database Name:** `medicore_db` (or as configured in `.env`)
*   **Engine:** InnoDB (Supports Foreign Keys & Transactions)
*   **ORM:** Sequelize (Node.js)

---

## 📊 **2. Schema & Tables**

The system consists of **5 Core Tables**:

### **1. Users Table (`users`)**
*   **Purpose:** Stores all system users (Patients, Admins, Helpers).
*   **Key Design:** Uses a single table with a `role` discriminator (Single Table Inheritance strategy).
*   **Columns:**
    *   `user_id` (PK): Integer, Auto-increment.
    *   `full_name`: String.
    *   `email`: String, Unique, Indexed.
    *   `password_hash`: String (Bcrypt hash).
    *   `role`: ENUM ('patient', 'admin', 'helper').
    *   `created_at`, `updated_at`: Timestamps.

### **2. Medications Table (`medications`)**
*   **Purpose:** Defines the prescription/inventory for a patient.
*   **Relationships:** Belongs to one Patient.
*   **Columns:**
    *   `medication_id` (PK): Integer.
    *   `patient_id` (FK): Links to `users.user_id`. (Delete Cascade).
    *   `medicine_name`: String.
    *   `qty_per_dose`: Integer (Amount to take at once).
    *   `remaining_quantity`: Integer (Current Stock).
    *   `total_quantity`: Integer (Initial Stock).
    *   `scheduled_times`: JSON Array (e.g., `["08:00", "20:00"]`).
    *   `selected_days`: JSON Array (e.g., `["Mon", "Wed", "Fri"]`).
    *   `meal_type`: ENUM ('before_meal', 'after_meal').
    *   `is_active`: Boolean (True if stock > 0 and not expired).
    *   `start_date`, `end_date`: DateOnly.

### **3. Appointments Table (`appointments`)**
*   **Purpose:** Tracks doctor visits for patients.
*   **Relationships:** Belongs to one Patient.
*   **Columns:**
    *   `appointment_id` (PK): Integer.
    *   `patient_id` (FK): Links to `users.user_id`.
    *   `doctor_name`: String.
    *   `appointment_date`: DateOnly.
    *   `appointment_time`: Time.
    *   `status`: ENUM ('scheduled', 'completed', 'cancelled').
    *   `location`: String.

### **4. Medication Logs Table (`medication_logs`)**
*   **Purpose:** History of adherence. Records every single time a dose is taken.
*   **Relationships:** Links a Patient to a specific Medication.
*   **Columns:**
    *   `log_id` (PK): Integer.
    *   `medication_id` (FK): Links to `medications.medication_id`.
    *   `patient_id` (FK): Links to `users.user_id`.
    *   `taken_time`: DateTime (Actual time taken).
    *   `scheduled_time`: Time (Target time).
    *   `status`: ENUM ('on_time', 'late', 'missed').
    *   `notes`: Text (Optional).

### **5. Patient Helpers Table (`patient_helpers`)**
*   **Purpose:** Assignment mapping. Links a Helper to a Patient.
*   **Relationships:** Many-to-Many logic (Logically 1 Helper -> Many Patients).
*   **Columns:**
    *   `id` (PK): Integer.
    *   `patient_id` (FK): Unique (A patient has only 1 helper).
    *   `helper_id` (FK): Links to `users.user_id` (where role='helper').
    *   `assigned_date`: Date.

---

## 🔗 **3. Relationships (ER Diagram Logic)**

1.  **Users ↔ Medications:**
    *   Relationship: **One-to-Many**
    *   Logic: One Patient has Many Medications.

2.  **Users ↔ Appointments:**
    *   Relationship: **One-to-Many**
    *   Logic: One Patient has Many Appointments.

3.  **Medications ↔ Medication Logs:**
    *   Relationship: **One-to-Many**
    *   Logic: One Medication has Many Logs (history entries).

4.  **Users ↔ Users (via PatientHelpers):**
    *   Relationship: **One-to-Many** (Self-Referential via Association Table)
    *   Logic: One Helper manages Many Patients. One Patient has One Helper.

---

## 🛠️ **4. Key Features Supported by Schema**

*   **JSON Columns:** `scheduled_times` and `selected_days` allow flexibility without creating extra mapping tables for times/days, simplifying queries.
*   **Soft Deletion (Logic):** `is_active` in Medications acts as a logical archive. We rarely "DELETE" meds; we just mark them inactive when stock hits 0.
*   **Stock Tracking:** `remaining_quantity` is a hard value in the DB, updated transactionally via controller logic.

---

## 📝 **5. Example Data**

**User (Patient):**
`{ user_id: 1, name: "John Doe", role: "patient" }`

**Medication:**
`{ med_id: 101, patient_id: 1, name: "Aspirin", stock: 28, days: ["Mon", "Fri"] }`

**Log (Action):**
`{ log_id: 500, med_id: 101, status: "on_time", time: "2023-10-25 08:05:00" }`

This structure supports all current features including the Dashboard charts, Stock countdown, and Day-based filtering.
