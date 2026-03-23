---
description: Verify removal of hardcoded data in Helper and Patient dashboards
---

# Verification Steps

1. **Helper Dashboard**
   - Login as a Helper.
   - Verify that the profile information (Name, Age, Verified status) matches the database values.
   - Verify that "Assigned Patients" count matches the actual number of patients assigned in `patient_helpers` table.
   - Verify that "Tasks Completed" and other stats reflect real data (or 0 if no data).

2. **Helper Patient List**
   - Navigate to "My Patients".
   - Verify the list shows only patients assigned to the current helper.
   - Verify names and details match the database.

3. **Helper Patient Details**
   - Click on a patient.
   - Verify that the "Medications" tab shows the patient's actual medications (fetched from API).
   - Verify that the "Appointments" tab shows the patient's actual appointments.

4. **Patient Dashboard** (HealthContext)
   - Login as a Patient.
   - Verify that the Dashboard shows the patient's name.
   - Verify that "Medicines Today" or similar stats reflect the patient's actual medication schedule.
   
5. **Admin Dashboard**
   - Login as Admin.
   - Verify that "Total Users", "Total Helpers", etc., match the database counts.

# Code Changes Reference
- `src/components/HelperDashboard.jsx`: Replaced mock `helperData` with API call.
- `src/components/HelperPatientList.jsx`: Replaced mock `patients` array with API call.
- `src/components/HelperPatientDetail.jsx`: Replaced mock `patientData` with API calls.
- `src/context/HealthContext.jsx`: Added `fetchData` on mount.
- `server/src/controllers/helper.controller.js`: Implemented Sequelize-based endpoints.
