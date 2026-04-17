import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { HealthProvider } from './context/HealthContext'
import Login from './Login'
import Signup from './Signup'
import HelperSignup from './HelperSignup'
import PatientLayout from './components/PatientLayout'
import Dashboard from './components/Dashboard'
import Medication from './components/Medication'
import AddMedication from './components/AddMedication'
import EditMedication from './components/EditMedication'
import AppointmentList from './components/AppointmentList'
import AddAppointment from './components/AddAppointment'
import Prescription from './components/Prescription'
import Stats from './components/Stats'
import PatientProfile from './components/PatientProfile'
import HelperDashboard from './components/HelperDashboard'
import HelperProfile from './components/HelperProfile'
import HelperPatientList from './components/HelperPatientList'
import HelperPatientDetail from './components/HelperPatientDetail'
import HelperAddMedication from './components/HelperAddMedication'
import HelperAddAppointment from './components/HelperAddAppointment'
import AdminDashboard from './components/AdminDashboard'
import AdminHelperManagement from './components/AdminHelperManagement'
import AdminHelperDetail from './components/AdminHelperDetail'
import AdminSystemAnalytics from './components/AdminSystemAnalytics'
import AdminPatientManagement from './components/AdminPatientManagement'
import AdminPatientDetail from './components/AdminPatientDetail'
import FeedbackPage from './components/FeedbackPage'

function App() {
  return (
    <HealthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/helper/signup" element={<HelperSignup />} />

          {/* Patient Dashboard Routes */}
          <Route path="/patient" element={<PatientLayout />}>
            <Route index element={<Navigate to="/patient/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="medication" element={<Medication />} />
            <Route path="medication/add" element={<AddMedication />} />
            <Route path="medication/edit/:id" element={<EditMedication />} />
            <Route path="appointment" element={<AppointmentList />} />
            <Route path="appointment/add" element={<AddAppointment />} />
            <Route path="prescription" element={<Prescription />} />
            <Route path="stats" element={<Stats />} />
            <Route path="profile" element={<PatientProfile />} />
          </Route>

          {/* Helper Dashboard Routes */}
          <Route path="/helper/dashboard" element={<HelperDashboard />} />
          <Route path="/helper/profile" element={<HelperProfile />} />
          <Route path="/helper/patients" element={<HelperPatientList />} />
          <Route path="/helper/patient/:patientId" element={<HelperPatientDetail />} />
          <Route path="/helper/patient/:patientId/medication/add" element={<HelperAddMedication />} />
          <Route path="/helper/patient/:patientId/appointment/add" element={<HelperAddAppointment />} />

          {/* Admin Dashboard Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/helpers" element={<AdminHelperManagement />} />
          <Route path="/admin/helper/:helperId" element={<AdminHelperDetail />} />
          <Route path="/admin/analytics" element={<AdminSystemAnalytics />} />
          <Route path="/admin/patients" element={<AdminPatientManagement />} />
          <Route path="/admin/patient/:id" element={<AdminPatientDetail />} />

          {/* Public Feedback Route */}
          <Route path="/feedback/:token" element={<FeedbackPage />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </HealthProvider>
  )
}

export default App
