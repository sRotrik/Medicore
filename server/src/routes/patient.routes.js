/**
 * Patient Routes
 * All patient-specific endpoints
 */

const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { requirePatient } = require('../middlewares/role.middleware');

// All routes require authentication and patient role
router.use(verifyToken, requirePatient);

// ==================== PROFILE ROUTES ====================

/**
 * @route   GET /api/patient/profile
 * @desc    Get patient profile
 * @access  Private (Patient only)
 */
router.get('/profile', patientController.getProfile);

/**
 * @route   PUT /api/patient/profile
 * @desc    Update patient profile
 * @access  Private (Patient only)
 */
router.put('/profile', patientController.updateProfile);

// ==================== MEDICATION ROUTES ====================

/**
 * @route   GET /api/patient/medications
 * @desc    Get all medications
 * @access  Private (Patient only)
 */
router.get('/medications', patientController.getMedications);

/**
 * @route   GET /api/patient/medications/active
 * @desc    Get active medications
 * @access  Private (Patient only)
 */
router.get('/medications/active', patientController.getActiveMedications);

/**
 * @route   POST /api/patient/medications
 * @desc    Add new medication
 * @access  Private (Patient only)
 */
router.post('/medications', patientController.addMedication);

/**
 * @route   GET /api/patient/medications/:id
 * @desc    Get single medication
 * @access  Private (Patient only)
 */
router.get('/medications/:id', patientController.getMedication);

/**
 * @route   PUT /api/patient/medications/:id
 * @desc    Update medication
 * @access  Private (Patient only)
 */
router.put('/medications/:id', patientController.updateMedication);

/**
 * @route   DELETE /api/patient/medications/:id
 * @desc    Delete medication
 * @access  Private (Patient only)
 */
router.delete('/medications/:id', patientController.deleteMedication);

/**
 * @route   POST /api/patient/medications/:id/take
 * @desc    Mark medication as taken
 * @access  Private (Patient only)
 */
router.post('/medications/:id/take', patientController.takeMedication);

// ==================== APPOINTMENT ROUTES ====================

/**
 * @route   GET /api/patient/appointments
 * @desc    Get all appointments
 * @access  Private (Patient only)
 */
router.get('/appointments', patientController.getAppointments);

/**
 * @route   GET /api/patient/appointments/upcoming
 * @desc    Get upcoming appointments
 * @access  Private (Patient only)
 */
router.get('/appointments/upcoming', patientController.getUpcomingAppointments);

/**
 * @route   GET /api/patient/appointments/past
 * @desc    Get past appointments
 * @access  Private (Patient only)
 */
router.get('/appointments/past', patientController.getPastAppointments);

/**
 * @route   POST /api/patient/appointments
 * @desc    Add new appointment
 * @access  Private (Patient only)
 */
router.post('/appointments', patientController.addAppointment);

/**
 * @route   GET /api/patient/appointments/:id
 * @desc    Get single appointment
 * @access  Private (Patient only)
 */
router.get('/appointments/:id', patientController.getAppointment);

/**
 * @route   PUT /api/patient/appointments/:id
 * @desc    Update appointment
 * @access  Private (Patient only)
 */
router.put('/appointments/:id', patientController.updateAppointment);

/**
 * @route   DELETE /api/patient/appointments/:id
 * @desc    Delete appointment
 * @access  Private (Patient only)
 */
router.delete('/appointments/:id', patientController.deleteAppointment);

/**
 * @route   POST /api/patient/appointments/:id/attend
 * @desc    Mark appointment as attended
 * @access  Private (Patient only)
 */
router.post('/appointments/:id/attend', patientController.markAppointmentAttended);

/**
 * @route   POST /api/patient/appointments/:id/cancel
 * @desc    Cancel appointment
 * @access  Private (Patient only)
 */
router.post('/appointments/:id/cancel', patientController.cancelAppointment);

module.exports = router;
