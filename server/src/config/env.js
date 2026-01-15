/**
 * Environment Configuration
 * Centralized environment variable management
 */

require('dotenv').config();

module.exports = {
    // Server
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || 'development',

    // Database
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/medicore',

    // JWT
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    JWT_REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE || '30d',

    // Email
    EMAIL_SERVICE: process.env.EMAIL_SERVICE || 'gmail',
    EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
    EMAIL_PORT: process.env.EMAIL_PORT || 587,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
    EMAIL_FROM: process.env.EMAIL_FROM || 'MediCore <noreply@medicore.com>',

    // File Upload
    MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 5242880, // 5MB
    UPLOAD_PATH: process.env.UPLOAD_PATH || './uploads',
    ALLOWED_FILE_TYPES: process.env.ALLOWED_FILE_TYPES?.split(',') || [
        'image/jpeg',
        'image/png',
        'image/jpg',
        'application/pdf'
    ],

    // Frontend
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',

    // Security
    BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS) || 12,
    RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
    RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,

    // Notifications
    MEDICATION_REMINDER_MINUTES: parseInt(process.env.MEDICATION_REMINDER_MINUTES) || 30,
    APPOINTMENT_REMINDER_HOURS: parseInt(process.env.APPOINTMENT_REMINDER_HOURS) || 24,

    // Logging
    LOG_LEVEL: process.env.LOG_LEVEL || 'info'
};
