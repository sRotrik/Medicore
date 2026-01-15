/**
 * Email Configuration
 * Nodemailer setup for sending emails
 */

const nodemailer = require('nodemailer');
const env = require('./env');

// Create reusable transporter
const transporter = nodemailer.createTransporter({
    service: env.EMAIL_SERVICE,
    host: env.EMAIL_HOST,
    port: env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASSWORD,
    },
});

// Verify connection (optional - comment out if email not configured)
// transporter.verify((error, success) => {
//     if (error) {
//         console.error('❌ Email configuration error:', error);
//     } else {
//         console.log('✅ Email server is ready to send messages');
//     }
// });

module.exports = transporter;
