/**
 * Email Configuration — Nodemailer + Gmail SMTP
 * Sender: medsmart04@gmail.com
 *
 * ⚠️  IMPORTANT — Gmail App Password Required
 * ─────────────────────────────────────────────
 * Since May 2022, Gmail blocks regular passwords for SMTP.
 * You MUST use a 16-character Google App Password.
 *
 * How to generate one:
 *  1. Log into https://myaccount.google.com
 *  2. Security → 2-Step Verification (enable if not done)
 *  3. Security → App Passwords
 *  4. Select App: "Mail", Device: "Other (MedSmart)" → Generate
 *  5. Copy the 16-char password (e.g. "abcd efgh ijkl mnop")
 *  6. Remove spaces → paste in .env as EMAIL_PASSWORD
 * ─────────────────────────────────────────────
 */

const nodemailer = require('nodemailer');
const env        = require('./env');

// Check if credentials look configured (not placeholder values)
const isConfigured =
    env.EMAIL_USER &&
    env.EMAIL_PASSWORD &&
    env.EMAIL_USER !== 'your-email@gmail.com' &&
    env.EMAIL_PASSWORD !== 'your-app-specific-password';

let transporter;

if (isConfigured) {
    // ── Real Gmail SMTP transporter ──────────────────────────────────────
    transporter = nodemailer.createTransport({
        host:   'smtp.gmail.com',
        port:   587,
        secure: false,          // STARTTLS on port 587
        auth: {
            user: env.EMAIL_USER,
            pass: env.EMAIL_PASSWORD  // Must be 16-char App Password
        },
        tls: {
            rejectUnauthorized: false // Accept self-signed in dev
        },
        // Connection pooling for bulk emails
        pool: true,
        maxConnections: 3,
        maxMessages: 100
    });

    // Verify connection asynchronously
    transporter.verify()
        .then(() => console.log('✅ Email server is ready to send messages!'))
        .catch(error => {
            console.error('❌ Email configuration error:', error.message);
            console.error('   Hint: Are you using a Gmail App Password? Regular passwords will not work.');
        });

} else {
    // ── Mock transporter for development (if no .env creds) ──────────────
    console.warn('⚠️  Email not fully configured in .env — using mock transporter');
    transporter = {
        sendMail: async (opts) => {
            console.log('📧 [MOCK EMAIL] To:', opts.to);
            console.log('            Subject:', opts.subject);
            return { messageId: 'mock-id-' + Date.now() };
        }
    };
}

module.exports = transporter;