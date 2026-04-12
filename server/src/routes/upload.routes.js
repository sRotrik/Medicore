/**
 * Upload Routes
 * File upload endpoints for prescriptions and profile images
 */

const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { requirePatient, requireHelper } = require('../middlewares/role.middleware');
const {
    uploadPrescription,
    uploadProfileImage,
    handleUploadError
} = require('../middlewares/upload.middleware');

// ==================== PATIENT PRESCRIPTION ROUTES ====================

/**
 * Upload Prescription
 * POST /api/upload/prescription
 * Protected: Patient only
 */
router.post(
    '/prescription',
    verifyToken,
    requirePatient,
    uploadPrescription,
    handleUploadError,
    uploadController.uploadPrescription
);

/**
 * Get Prescription
 * GET /api/upload/prescription
 * Protected: Patient only
 */
router.get(
    '/prescription',
    verifyToken,
    requirePatient,
    uploadController.getPrescription
);

/**
 * Delete Prescription
 * DELETE /api/upload/prescription
 * Protected: Patient only
 */
router.delete(
    '/prescription',
    verifyToken,
    requirePatient,
    uploadController.deletePrescription
);

// ==================== HELPER PROFILE IMAGE ROUTES ====================

/**
 * Upload Profile Image
 * POST /api/upload/profile-image
 * Protected: Helper only
 */
router.post(
    '/profile-image',
    verifyToken,
    requireHelper,
    uploadProfileImage,
    handleUploadError,
    uploadController.uploadHelperProfileImage
);

/**
 * Get Profile Image
 * GET /api/upload/profile-image
 * Protected: Helper only
 */
router.get(
    '/profile-image',
    verifyToken,
    requireHelper,
    uploadController.getHelperProfileImage
);

/**
 * Delete Profile Image
 * DELETE /api/upload/profile-image
 * Protected: Helper only
 */
router.delete(
    '/profile-image',
    verifyToken,
    requireHelper,
    uploadController.deleteHelperProfileImage
);

module.exports = router;
