/**
 * Admin Routes
 * Handles all admin-related endpoints
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { requireAdmin } = require('../middlewares/role.middleware');

// All admin routes require authentication and admin role
router.use(verifyToken);
router.use(requireAdmin);

/**
 * @route   GET /api/admin/stats
 * @desc    Get system statistics
 * @access  Private (Admin only)
 */
router.get('/stats', adminController.getSystemStats);

/**
 * @route   GET /api/admin/helpers
 * @desc    Get all helpers
 * @access  Private (Admin only)
 */
router.get('/helpers', adminController.getAllHelpers);

/**
 * @route   GET /api/admin/helpers/:id
 * @desc    Get helper details
 * @access  Private (Admin only)
 */
router.get('/helpers/:id', adminController.getHelperDetails);

/**
 * @route   POST /api/admin/helpers/:id/approve
 * @desc    Approve a helper account
 * @access  Private (Admin only)
 */
router.post('/helpers/:id/approve', adminController.approveHelper);

/**
 * @route   POST /api/admin/helpers/:id/reject
 * @desc    Reject/Deactivate a helper account
 * @access  Private (Admin only)
 */
router.post('/helpers/:id/reject', adminController.rejectHelper);

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Private (Admin only)
 */
router.get('/users', adminController.getAllUsers);

/**
 * @route   DELETE /api/admin/helpers/:id
 * @desc    Delete a helper account permanently
 * @access  Private (Admin only)
 */
router.delete('/helpers/:id', adminController.deleteHelper);

/**
 * @route   GET /api/admin/patients
 * @desc    Get all patients with stats
 * @access  Private (Admin only)
 */
router.get('/patients', adminController.getAllPatients);

/**
 * @route   GET /api/admin/patients/:id
 * @desc    Get patient details
 * @access  Private (Admin only)
 */
router.get('/patients/:id', adminController.getPatientDetails);

/**
 * @route   POST /api/admin/patients/:id/reassign
 * @desc    Reassign patient to different helper
 * @access  Private (Admin only)
 */
router.post('/patients/:id/reassign', adminController.reassignPatientHelper);

module.exports = router;
