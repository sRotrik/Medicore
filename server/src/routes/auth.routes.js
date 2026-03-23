/**
 * Authentication Routes
 * Handles all authentication-related endpoints
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new patient
 * @access  Public
 */
router.post('/register', authController.register);

/**
 * @route   POST /api/auth/register/helper
 * @desc    Register a new helper (pending admin approval)
 * @access  Public
 */
router.post('/register/helper', authController.registerHelper);

/**
 * @route   POST /api/auth/login
 * @desc    Login user (patient, helper, or admin)
 * @access  Public
 * @body    { email, password, role }
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
router.post('/refresh', authController.refreshAccessToken);

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private (requires authentication)
 * @body    { currentPassword, newPassword }
 */
router.post('/change-password', verifyToken, authController.changePassword);

module.exports = router;
