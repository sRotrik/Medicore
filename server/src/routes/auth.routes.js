/**
 * Authentication Routes
 * Handles all authentication-related endpoints
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

/**
 * @route   POST /api/auth/signup/patient
 * @desc    Register a new patient
 * @access  Public
 */
router.post('/signup/patient', authController.signupPatient);

/**
 * @route   POST /api/auth/signup/helper
 * @desc    Register a new helper
 * @access  Public
 */
router.post('/signup/helper', authController.signupHelper);

/**
 * @route   POST /api/auth/login
 * @desc    Login user (patient, helper, or admin)
 * @access  Public
 * @body    { email, password, role } for patient/admin
 *          { verificationId, role } for helper
 */
router.post('/login', authController.login);

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged-in user
 * @access  Private (requires authentication)
 */
router.get('/me', verifyToken, authController.getCurrentUser);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private (requires authentication)
 */
router.post('/logout', verifyToken, authController.logout);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public
 * @body    { refreshToken }
 */
router.post('/refresh', authController.refreshToken);

module.exports = router;
