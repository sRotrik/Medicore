/**
 * File Upload Middleware
 * Handles file uploads using Multer
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const env = require('../config/env');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename: timestamp-randomstring-originalname
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const nameWithoutExt = path.basename(file.originalname, ext);
        cb(null, `${nameWithoutExt}-${uniqueSuffix}${ext}`);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    // Check file type
    const allowedTypes = env.ALLOWED_FILE_TYPES || [
        'image/jpeg',
        'image/png',
        'image/jpg',
        'application/pdf'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`), false);
    }
};

// Create multer instance
const upload = multer({
    storage: storage,
    limits: {
        fileSize: env.MAX_FILE_SIZE || 5 * 1024 * 1024 // 5MB default
    },
    fileFilter: fileFilter
});

/**
 * Upload single prescription file
 */
const uploadPrescription = upload.single('prescription');

/**
 * Upload single profile image
 */
const uploadProfileImage = upload.single('profileImage');

/**
 * Upload multiple files (max 5)
 */
const uploadMultiple = upload.array('files', 5);

/**
 * Handle upload errors
 */
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // Multer-specific errors
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: `File too large. Maximum size is ${env.MAX_FILE_SIZE / 1024 / 1024}MB`
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Too many files. Maximum is 5 files'
            });
        }
        return res.status(400).json({
            success: false,
            message: err.message
        });
    } else if (err) {
        // Other errors
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
    next();
};

/**
 * Delete file
 */
const deleteFile = (filename) => {
    try {
        const filePath = path.join(uploadDir, filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`✅ Deleted file: ${filename}`);
            return true;
        }
        return false;
    } catch (error) {
        console.error(`❌ Error deleting file ${filename}:`, error);
        return false;
    }
};

/**
 * Get file URL
 */
const getFileUrl = (req, filename) => {
    if (!filename) return null;
    const protocol = req.protocol;
    const host = req.get('host');
    return `${protocol}://${host}/uploads/${filename}`;
};

module.exports = {
    uploadPrescription,
    uploadProfileImage,
    uploadMultiple,
    handleUploadError,
    deleteFile,
    getFileUrl
};
