/**
 * Email Service
 * Handles all email sending functionality using Nodemailer
 */

const transporter = require('../config/mail');
const env = require('../config/env');

/**
 * Send Email
 * Generic email sending function
 */
const sendEmail = async ({ to, subject, html, text }) => {
    try {
        const mailOptions = {
            from: env.EMAIL_FROM,
            to,
            subject,
            html,
            text: text || '' // Plain text fallback
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent to ${to}: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`❌ Email send failed to ${to}:`, error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Send Welcome Email
 * Sent when a new patient signs up
 */
const sendWelcomeEmail = async (email, name) => {
    const subject = '🏥 Welcome to MediCore!';
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🏥 Welcome to MediCore!</h1>
                </div>
                <div class="content">
                    <h2>Hello ${name}! 👋</h2>
                    <p>Thank you for joining MediCore - your personal healthcare companion!</p>
                    
                    <p><strong>What you can do with MediCore:</strong></p>
                    <ul>
                        <li>📊 Track your medications and never miss a dose</li>
                        <li>📅 Schedule and manage appointments</li>
                        <li>📈 View your health statistics and compliance</li>
                        <li>🔔 Get timely reminders for medications and appointments</li>
                    </ul>
                    
                    <p>We're here to help you stay on top of your health!</p>
                    
                    <a href="${env.FRONTEND_URL}/dashboard" class="button">Go to Dashboard</a>
                    
                    <p>If you have any questions, feel free to reach out to our support team.</p>
                </div>
                <div class="footer">
                    <p>© 2026 MediCore. All rights reserved.</p>
                    <p>You're receiving this email because you signed up for MediCore.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return await sendEmail({ to: email, subject, html });
};

/**
 * Send Medication Reminder
 * Sent before medication scheduled time
 */
const sendMedicationReminder = async (email, name, medication) => {
    const subject = `💊 Reminder: Time to take ${medication.name}`;
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .med-card { background: white; padding: 20px; border-left: 4px solid #11998e; margin: 20px 0; border-radius: 5px; }
                .button { display: inline-block; background: #11998e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>💊 Medication Reminder</h1>
                </div>
                <div class="content">
                    <h2>Hello ${name}! 👋</h2>
                    <p>This is a friendly reminder to take your medication.</p>
                    
                    <div class="med-card">
                        <h3>📋 ${medication.name}</h3>
                        <p><strong>Dosage:</strong> ${medication.qtyPerDose} ${medication.qtyPerDose === 1 ? 'tablet' : 'tablets'}</p>
                        <p><strong>Scheduled Time:</strong> ${medication.scheduledTime}</p>
                        <p><strong>Meal Type:</strong> ${medication.mealType}</p>
                        <p><strong>Remaining Quantity:</strong> ${medication.remainingQty}</p>
                        ${medication.remarks ? `<p><strong>Note:</strong> ${medication.remarks}</p>` : ''}
                    </div>
                    
                    <p>⏰ <strong>Scheduled for:</strong> ${medication.scheduledTime}</p>
                    <p>Don't forget to mark it as taken in the app!</p>
                    
                    <a href="${env.FRONTEND_URL}/dashboard" class="button">Mark as Taken</a>
                </div>
                <div class="footer">
                    <p>© 2026 MediCore. All rights reserved.</p>
                    <p>This is an automated reminder. Stay healthy! 💚</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return await sendEmail({ to: email, subject, html });
};

/**
 * Send Appointment Reminder
 * Sent before appointment time
 */
const sendAppointmentReminder = async (email, name, appointment) => {
    const appointmentDate = new Date(appointment.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const subject = `📅 Reminder: Appointment with ${appointment.doctorName}`;
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .apt-card { background: white; padding: 20px; border-left: 4px solid #f5576c; margin: 20px 0; border-radius: 5px; }
                .button { display: inline-block; background: #f5576c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📅 Appointment Reminder</h1>
                </div>
                <div class="content">
                    <h2>Hello ${name}! 👋</h2>
                    <p>This is a reminder about your upcoming appointment.</p>
                    
                    <div class="apt-card">
                        <h3>👨‍⚕️ ${appointment.doctorName}</h3>
                        <p><strong>📅 Date:</strong> ${appointmentDate}</p>
                        <p><strong>⏰ Time:</strong> ${appointment.time}</p>
                        <p><strong>📍 Location:</strong> ${appointment.place}</p>
                        <p><strong>📞 Contact:</strong> ${appointment.contact}</p>
                        ${appointment.remarks ? `<p><strong>Note:</strong> ${appointment.remarks}</p>` : ''}
                    </div>
                    
                    <p>⏰ <strong>Don't forget!</strong> Your appointment is scheduled for ${appointmentDate} at ${appointment.time}.</p>
                    <p>Please arrive 10-15 minutes early.</p>
                    
                    <a href="${env.FRONTEND_URL}/appointments" class="button">View Appointments</a>
                </div>
                <div class="footer">
                    <p>© 2026 MediCore. All rights reserved.</p>
                    <p>This is an automated reminder. Take care! 💚</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return await sendEmail({ to: email, subject, html });
};

/**
 * Send Medication Taken Confirmation
 * Sent when patient marks medication as taken
 */
const sendMedicationTakenConfirmation = async (email, name, medication, log) => {
    const status = log.delayMinutes === 0 ? 'On Time ✅' :
        log.delayMinutes > 0 ? `Late by ${log.delayMinutes} minutes ⏰` :
            `Early by ${Math.abs(log.delayMinutes)} minutes ⚡`;

    const subject = `✅ Medication Taken: ${medication.name}`;
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .success-card { background: white; padding: 20px; border-left: 4px solid #38ef7d; margin: 20px 0; border-radius: 5px; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>✅ Medication Taken!</h1>
                </div>
                <div class="content">
                    <h2>Great job, ${name}! 🎉</h2>
                    <p>You've successfully logged your medication.</p>
                    
                    <div class="success-card">
                        <h3>💊 ${medication.name}</h3>
                        <p><strong>Taken at:</strong> ${new Date(log.takenTime).toLocaleTimeString()}</p>
                        <p><strong>Status:</strong> ${status}</p>
                        <p><strong>Remaining Quantity:</strong> ${medication.remainingQty}</p>
                    </div>
                    
                    <p>Keep up the great work! Consistency is key to better health. 💚</p>
                </div>
                <div class="footer">
                    <p>© 2026 MediCore. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return await sendEmail({ to: email, subject, html });
};

/**
 * Send Low Stock Alert
 * Sent when medication quantity is low
 */
const sendLowStockAlert = async (email, name, medication) => {
    const subject = `⚠️ Low Stock Alert: ${medication.name}`;
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .alert-card { background: #fff3cd; padding: 20px; border-left: 4px solid #ffc107; margin: 20px 0; border-radius: 5px; }
                .button { display: inline-block; background: #f5576c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>⚠️ Low Stock Alert</h1>
                </div>
                <div class="content">
                    <h2>Hello ${name}! 👋</h2>
                    <p>Your medication stock is running low.</p>
                    
                    <div class="alert-card">
                        <h3>💊 ${medication.name}</h3>
                        <p><strong>⚠️ Remaining Quantity:</strong> ${medication.remainingQty} ${medication.remainingQty === 1 ? 'dose' : 'doses'}</p>
                        <p><strong>Daily Dosage:</strong> ${medication.qtyPerDose}</p>
                    </div>
                    
                    <p>Please refill your medication soon to avoid running out!</p>
                    
                    <a href="${env.FRONTEND_URL}/medications" class="button">View Medications</a>
                </div>
                <div class="footer">
                    <p>© 2026 MediCore. All rights reserved.</p>
                    <p>This is an automated alert. Stay prepared! 💚</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return await sendEmail({ to: email, subject, html });
};

/**
 * Send Helper Assignment Notification
 * Sent when a helper is assigned to a patient
 */
const sendHelperAssignmentEmail = async (patientEmail, patientName, helperName) => {
    const subject = '👥 Helper Assigned to Your Account';
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .info-card { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 5px; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>👥 Helper Assigned</h1>
                </div>
                <div class="content">
                    <h2>Hello ${patientName}! 👋</h2>
                    <p>A healthcare helper has been assigned to your account.</p>
                    
                    <div class="info-card">
                        <h3>Your Helper: ${helperName}</h3>
                        <p>Your helper can now:</p>
                        <ul>
                            <li>View your medications (read-only)</li>
                            <li>View your appointments (read-only)</li>
                            <li>Monitor your health statistics</li>
                            <li>Provide support and reminders</li>
                        </ul>
                    </div>
                    
                    <p>Your helper is here to support you on your health journey! 💚</p>
                </div>
                <div class="footer">
                    <p>© 2026 MediCore. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return await sendEmail({ to: patientEmail, subject, html });
};

module.exports = {
    sendEmail,
    sendWelcomeEmail,
    sendMedicationReminder,
    sendAppointmentReminder,
    sendMedicationTakenConfirmation,
    sendLowStockAlert,
    sendHelperAssignmentEmail
};
