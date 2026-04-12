/**
 * Helper Routes
 * All helper-specific endpoints (Read-Only access to assigned patients)
 */

const express = require('express');
const router = express.Router();
const helperController = require('../controllers/helper.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { requireHelper } = require('../middlewares/role.middleware');

// All routes require authentication and helper role
router.use(verifyToken, requireHelper);

// ==================== PROFILE ROUTES ====================

/**
 * @route   GET /api/helper/profile
 * @desc    Get helper profile
 * @access  Private (Helper only)
 */
router.get('/profile', helperController.getProfile);

/**
 * @route   PUT /api/helper/profile
 * @desc    Update helper profile
 * @access  Private (Helper only)
 */
router.put('/profile', helperController.updateProfile);

/**
 * @route   GET /api/helper/dashboard-stats
 * @desc    Get helper dashboard statistics
 * @access  Private (Helper only)
 */
router.get('/dashboard-stats', helperController.getDashboardStats);

// ==================== ASSIGNED PATIENTS ROUTES ====================

/**
 * @route   GET /api/helper/patients
 * @desc    Get all assigned patients with stats
 * @access  Private (Helper only)
 */
router.get('/patients', helperController.getAssignedPatients);

/**
 * @route   GET /api/helper/patients/:id
 * @desc    Get single patient details
 * @access  Private (Helper only)
 */
router.get('/patients/:id', helperController.getPatientDetails);

// ==================== PATIENT MEDICATIONS (READ-ONLY) ====================

/**
 * @route   GET /api/helper/patients/:id/medications
 * @desc    Get patient's all medications (read-only)
 * @access  Private (Helper only)
 */
router.get('/patients/:id/medications', helperController.getPatientMedications);

/**
 * @route   POST /api/helper/patients/:id/medications
 * @desc    Add medication for a patient
 * @access  Private (Helper only)
 */
router.post('/patients/:id/medications', helperController.addPatientMedication);

/**
 * @route   GET /api/helper/patients/:id/medications/active
 * @desc    Get patient's active medications (read-only)
 * @access  Private (Helper only)
 */
router.get('/patients/:id/medications/active', helperController.getPatientActiveMedications);

/**
 * @route   GET /api/helper/patients/:patientId/medications/:medicationId
 * @desc    Get single patient medication (read-only)
 * @access  Private (Helper only)
 */
router.get('/patients/:patientId/medications/:medicationId', helperController.getPatientMedication);

// ==================== PATIENT APPOINTMENTS (READ-ONLY) ====================

/**
 * @route   GET /api/helper/patients/:id/appointments
 * @desc    Get patient's all appointments
 * @access  Private (Helper only)
 */
router.get('/patients/:id/appointments', helperController.getPatientAppointments);

/**
 * @route   POST /api/helper/patients/:id/appointments
 * @desc    Add appointment for a patient
 * @access  Private (Helper only)
 */
router.post('/patients/:id/appointments', helperController.addPatientAppointment);

/**
 * @route   GET /api/helper/patients/:id/appointments/upcoming
 * @desc    Get patient's upcoming appointments (read-only)
 * @access  Private (Helper only)
 */
router.get('/patients/:id/appointments/upcoming', helperController.getPatientUpcomingAppointments);

/**
 * @route   GET /api/helper/patients/:patientId/appointments/:appointmentId
 * @desc    Get single patient appointment (read-only)
 * @access  Private (Helper only)
 */
router.get('/patients/:patientId/appointments/:appointmentId', helperController.getPatientAppointment);

// ==================== PATIENT STATS (READ-ONLY) ====================

/**
 * @route   GET /api/helper/patients/:id/stats
 * @desc    Get patient's statistics (read-only)
 * @access  Private (Helper only)
 */
router.get('/patients/:id/stats', helperController.getPatientStats);

// ==================== PATIENT PRESCRIPTIONS (READ-ONLY) ====================

/**
 * @route   GET /api/helper/patients/:id/prescriptions
 * @desc    Get patient's all prescriptions
 * @access  Private (Helper only)
 */
router.get('/patients/:id/prescriptions', helperController.getPatientPrescriptions);

/**
 * @route   GET /api/helper/patients/:id/achievements
 * @desc    Get patient's achievements + stats (NO raw credibility score)
 * @access  Private (Helper only)
 */
router.get('/patients/:id/achievements', helperController.getPatientAchievements);

module.exports = router;
