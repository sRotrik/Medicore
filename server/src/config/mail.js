/**
 * Email Configuration
 * Nodemailer setup for sending emails
 */

const nodemailer = require('nodemailer');
const env = require('./env');

// Check if email is properly configured
const isEmailConfigured = env.EMAIL_USER &&
    env.EMAIL_PASSWORD &&
    env.EMAIL_USER !== 'your-email@gmail.com' &&
    env.EMAIL_PASSWORD !== 'your-app-specific-password';

let transporter;

if (isEmailConfigured) {
    // Create real transporter if email is configured
    transporter = nodemailer.createTransporter({
        service: env.EMAIL_SERVICE,
        host: env.EMAIL_HOST,
        port: env.EMAIL_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: env.EMAIL_USER,
            pass: env.EMAIL_PASSWORD,
        },
    });

    // Verify connection
    transporter.verify((error, success) => {
        if (error) {
            console.error('❌ Email configuration error:', error);
        } else {
            console.log('✅ Email server is ready to send messages');
        }
    });
} else {
    // Create mock transporter for development
    console.warn('⚠️  Email not configured - using mock transporter (emails will not be sent)');
    transporter = {
        sendMail: async (mailOptions) => {
            console.log('📧 [MOCK EMAIL] Would send email to:', mailOptions.to);
            console.log('   Subject:', mailOptions.subject);
            return { messageId: 'mock-' + Date.now() };
        }
    };
}

module.exports = transporter;
