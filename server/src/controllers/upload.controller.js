/**
 * File Upload Controller
 * Handles file upload operations for prescriptions and profile images
 */

const { Patient, Helper } = require('../models');
const { deleteFile, getFileUrl } = require('../middlewares/upload.middleware');

/**
 * Upload Prescription
 * POST /api/patient/upload/prescription
 */
const uploadPrescription = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        // Get patient
        const patient = await Patient.findOne({ userId: req.user.userId });

        if (!patient) {
            // Delete uploaded file if patient not found
            deleteFile(req.file.filename);
            return res.status(404).json({
                success: false,
                message: 'Patient profile not found'
            });
        }

        // Delete old prescription file if exists
        if (patient.prescriptionFile) {
            deleteFile(patient.prescriptionFile);
        }

        // Update patient with new prescription file
        patient.prescriptionFile = req.file.filename;
        await patient.save();

        // Get file URL
        const fileUrl = getFileUrl(req, req.file.filename);

        res.status(200).json({
            success: true,
            message: 'Prescription uploaded successfully',
            data: {
                filename: req.file.filename,
                originalName: req.file.originalname,
                size: req.file.size,
                mimetype: req.file.mimetype,
                url: fileUrl
            }
        });
    } catch (error) {
        // Delete uploaded file on error
        if (req.file) {
            deleteFile(req.file.filename);
        }
        console.error('Upload prescription error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading prescription',
            error: error.message
        });
    }
};

/**
 * Get Prescription
 * GET /api/patient/prescription
 */
const getPrescription = async (req, res) => {
    try {
        const patient = await Patient.findOne({ userId: req.user.userId });

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient profile not found'
            });
        }

        if (!patient.prescriptionFile) {
            return res.status(404).json({
                success: false,
                message: 'No prescription file found'
            });
        }

        const fileUrl = getFileUrl(req, patient.prescriptionFile);

        res.status(200).json({
            success: true,
            data: {
                filename: patient.prescriptionFile,
                url: fileUrl
            }
        });
    } catch (error) {
        console.error('Get prescription error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching prescription',
            error: error.message
        });
    }
};

/**
 * Delete Prescription
 * DELETE /api/patient/prescription
 */
const deletePrescription = async (req, res) => {
    try {
        const patient = await Patient.findOne({ userId: req.user.userId });

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient profile not found'
            });
        }

        if (!patient.prescriptionFile) {
            return res.status(404).json({
                success: false,
                message: 'No prescription file found'
            });
        }

        // Delete file
        deleteFile(patient.prescriptionFile);

        // Update patient
        patient.prescriptionFile = null;
        await patient.save();

        res.status(200).json({
            success: true,
            message: 'Prescription deleted successfully'
        });
    } catch (error) {
        console.error('Delete prescription error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting prescription',
            error: error.message
        });
    }
};

/**
 * Upload Helper Profile Image
 * POST /api/helper/upload/profile-image
 */
const uploadHelperProfileImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        // Get helper
        const helper = await Helper.findOne({ userId: req.user.userId });

        if (!helper) {
            // Delete uploaded file if helper not found
            deleteFile(req.file.filename);
            return res.status(404).json({
                success: false,
                message: 'Helper profile not found'
            });
        }

        // Delete old profile image if exists
        if (helper.profileImage) {
            deleteFile(helper.profileImage);
        }

        // Update helper with new profile image
        helper.profileImage = req.file.filename;
        await helper.save();

        // Get file URL
        const fileUrl = getFileUrl(req, req.file.filename);

        res.status(200).json({
            success: true,
            message: 'Profile image uploaded successfully',
            data: {
                filename: req.file.filename,
                originalName: req.file.originalname,
                size: req.file.size,
                mimetype: req.file.mimetype,
                url: fileUrl
            }
        });
    } catch (error) {
        // Delete uploaded file on error
        if (req.file) {
            deleteFile(req.file.filename);
        }
        console.error('Upload profile image error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading profile image',
            error: error.message
        });
    }
};

/**
 * Get Helper Profile Image
 * GET /api/helper/profile-image
 */
const getHelperProfileImage = async (req, res) => {
    try {
        const helper = await Helper.findOne({ userId: req.user.userId });

        if (!helper) {
            return res.status(404).json({
                success: false,
                message: 'Helper profile not found'
            });
        }

        if (!helper.profileImage) {
            return res.status(404).json({
                success: false,
                message: 'No profile image found'
            });
        }

        const fileUrl = getFileUrl(req, helper.profileImage);

        res.status(200).json({
            success: true,
            data: {
                filename: helper.profileImage,
                url: fileUrl
            }
        });
    } catch (error) {
        console.error('Get profile image error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching profile image',
            error: error.message
        });
    }
};

/**
 * Delete Helper Profile Image
 * DELETE /api/helper/profile-image
 */
const deleteHelperProfileImage = async (req, res) => {
    try {
        const helper = await Helper.findOne({ userId: req.user.userId });

        if (!helper) {
            return res.status(404).json({
                success: false,
                message: 'Helper profile not found'
            });
        }

        if (!helper.profileImage) {
            return res.status(404).json({
                success: false,
                message: 'No profile image found'
            });
        }

        // Delete file
        deleteFile(helper.profileImage);

        // Update helper
        helper.profileImage = null;
        await helper.save();

        res.status(200).json({
            success: true,
            message: 'Profile image deleted successfully'
        });
    } catch (error) {
        console.error('Delete profile image error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting profile image',
            error: error.message
        });
    }
};

module.exports = {
    uploadPrescription,
    getPrescription,
    deletePrescription,
    uploadHelperProfileImage,
    getHelperProfileImage,
    deleteHelperProfileImage
};
