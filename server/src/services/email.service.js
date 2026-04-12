/**
 * Email Service
 * Handles all email sending functionality using Nodemailer
 * Sender: medsmart04@gmail.com
 */

const transporter = require('../config/mail');
const env = require('../config/env');

// ============================================================================
// BASE STYLE BLOCK (shared across all templates)
// ============================================================================
const baseStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
        font-family: 'Inter', Arial, sans-serif;
        background: #f0f4f8;
        line-height: 1.6;
        color: #2d3748;
    }
    .email-wrapper {
        background: #f0f4f8;
        padding: 32px 16px;
    }
    .container {
        max-width: 620px;
        margin: 0 auto;
        background: #ffffff;
        border-radius: 20px;
        overflow: hidden;
        box-shadow: 0 20px 60px rgba(0,0,0,0.12);
    }
    .header {
        padding: 40px 40px 32px;
        text-align: center;
        position: relative;
    }
    .header-logo {
        font-size: 14px;
        font-weight: 700;
        letter-spacing: 3px;
        text-transform: uppercase;
        opacity: 0.85;
        margin-bottom: 20px;
        display: block;
    }
    .header h1 {
        font-size: 28px;
        font-weight: 700;
        color: #fff;
        margin: 0;
        letter-spacing: -0.5px;
    }
    .header-icon {
        font-size: 48px;
        display: block;
        margin-bottom: 12px;
    }
    .content {
        padding: 36px 40px;
        background: #ffffff;
    }
    .greeting {
        font-size: 22px;
        font-weight: 700;
        color: #1a202c;
        margin-bottom: 8px;
    }
    .subtext {
        font-size: 15px;
        color: #718096;
        margin-bottom: 28px;
    }
    .card {
        border-radius: 14px;
        padding: 24px;
        margin: 20px 0;
        border: 1px solid rgba(0,0,0,0.06);
    }
    .card-title {
        font-size: 18px;
        font-weight: 700;
        margin-bottom: 16px;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .info-row {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 9px 0;
        border-bottom: 1px solid rgba(0,0,0,0.05);
        font-size: 14px;
    }
    .info-row:last-child { border-bottom: none; }
    .info-label {
        font-weight: 600;
        color: #4a5568;
        min-width: 150px;
        flex-shrink: 0;
    }
    .info-value {
        color: #2d3748;
        flex: 1;
    }
    .badge {
        display: inline-block;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    .btn {
        display: inline-block;
        padding: 14px 32px;
        border-radius: 10px;
        text-decoration: none;
        font-size: 15px;
        font-weight: 600;
        margin-top: 24px;
        text-align: center;
        letter-spacing: 0.3px;
    }
    .footer {
        background: #f7fafc;
        padding: 28px 40px;
        text-align: center;
        border-top: 1px solid #e2e8f0;
    }
    .footer p {
        font-size: 12px;
        color: #a0aec0;
        margin: 4px 0;
    }
    .footer strong {
        color: #718096;
    }
    .divider {
        height: 1px;
        background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
        margin: 24px 0;
    }
`;

// ============================================================================
// GENERIC SEND FUNCTION
// ============================================================================
const sendEmail = async ({ to, subject, html, text }) => {
    try {
        const mailOptions = {
            from: env.EMAIL_FROM || '"MedSmart" <medsmart04@gmail.com>',
            to,
            subject,
            html,
            text: text || ''
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent to ${to}: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`❌ Email send failed to ${to}:`, error.message);
        return { success: false, error: error.message };
    }
};

// ============================================================================
// 1. MEDICATION REMINDER EMAIL (15 minutes before)
// ============================================================================
const sendMedicationReminder = async (email, name, medication) => {
    const mealLabel = medication.mealType === 'before_meal' ? 'Before Meal 🍽️'
        : medication.mealType === 'after_meal' ? 'After Meal 🍽️'
        : medication.mealType === 'with_meal' ? 'With Meal 🍽️'
        : medication.mealType === 'empty_stomach' ? 'Empty Stomach ⚡'
        : medication.mealType || 'As prescribed';

    const pillLabel = (medication.qtyPerDose || 1) === 1 ? 'tablet/capsule' : 'tablets/capsules';

    const subject = `💊 Medication Reminder: Take ${medication.name} in 15 minutes`;
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Medication Reminder - MedSmart</title>
    <style>
        ${baseStyles}
        .header { background: linear-gradient(135deg, #0f9b8e 0%, #00c6a7 60%, #38ef7d 100%); }
        .header-logo { color: rgba(255,255,255,0.8); }
        .card { background: #f0faf8; border-color: #b2f0e8; }
        .card-title { color: #0a6b5e; }
        .info-label { color: #2d8a7a; }
        .badge-green { background: #c6f6d5; color: #276749; }
        .badge-orange { background: #feebc8; color: #9c4221; }
        .btn { background: linear-gradient(135deg, #0f9b8e, #38ef7d); color: #fff; box-shadow: 0 8px 20px rgba(15,155,142,0.35); }
        .timer-box {
            background: linear-gradient(135deg, #0f9b8e, #00c6a7);
            border-radius: 14px;
            padding: 20px 24px;
            text-align: center;
            margin: 20px 0;
            color: white;
        }
        .timer-box .big-time {
            font-size: 42px;
            font-weight: 800;
            letter-spacing: -1px;
            display: block;
        }
        .timer-box .timer-label {
            font-size: 13px;
            opacity: 0.85;
            font-weight: 500;
            letter-spacing: 1px;
            text-transform: uppercase;
            margin-top: 4px;
        }
    </style>
</head>
<body>
<div class="email-wrapper">
    <div class="container">
        <div class="header">
            <span class="header-logo">MedSmart</span>
            <span class="header-icon">💊</span>
            <h1>Medication Reminder</h1>
        </div>
        <div class="content">
            <p class="greeting">Hello, ${name}! 👋</p>
            <p class="subtext">Time to prepare your medication. You need to take it in <strong>15 minutes</strong>.</p>

            <div class="timer-box">
                <span class="big-time">15 min</span>
                <span class="timer-label">Until Scheduled Dose · ${medication.scheduledTime}</span>
            </div>

            <div class="card">
                <div class="card-title">📋 Medication Details</div>
                <div class="info-row">
                    <span class="info-label">Medicine Name</span>
                    <span class="info-value"><strong>${medication.name}</strong></span>
                </div>
                <div class="info-row">
                    <span class="info-label">Scheduled Time</span>
                    <span class="info-value">⏰ ${medication.scheduledTime}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Quantity</span>
                    <span class="info-value">${medication.qtyPerDose} ${pillLabel}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Meal Instruction</span>
                    <span class="info-value">
                        <span class="badge badge-green">${mealLabel}</span>
                    </span>
                </div>
                <div class="info-row">
                    <span class="info-label">Stock Remaining</span>
                    <span class="info-value">
                        <span class="badge ${medication.remainingQty <= 10 ? 'badge-orange' : 'badge-green'}">${medication.remainingQty} units</span>
                    </span>
                </div>
                ${medication.remarks ? `
                <div class="info-row">
                    <span class="info-label">Remarks / Notes</span>
                    <span class="info-value">${medication.remarks}</span>
                </div>` : ''}
            </div>

            <div class="divider"></div>
            <p style="font-size:14px;color:#718096;">
                💡 <strong>Tip:</strong> Set a glass of water nearby and take your medication exactly at <strong>${medication.scheduledTime}</strong> for best results.
            </p>

            <center>
                <a href="${env.FRONTEND_URL}/dashboard" class="btn">✅ Mark as Taken</a>
            </center>
        </div>
        <div class="footer">
            <p>© 2026 <strong>MedSmart</strong>. All rights reserved.</p>
            <p>This is an automated reminder sent to <strong>${email}</strong>. Stay healthy! 💚</p>
            <p>Sent from medsmart04@gmail.com</p>
        </div>
    </div>
</div>
</body>
</html>`;

    return await sendEmail({ to: email, subject, html });
};

// ============================================================================
// 2. LOW STOCK REFILL ALERT (stock below 10 units)
// ============================================================================
const sendLowStockAlert = async (email, name, medication) => {
    const urgency = medication.remainingQty <= 3 ? 'Critical' : medication.remainingQty <= 6 ? 'Urgent' : 'Low';
    const urgencyColor = medication.remainingQty <= 3 ? '#fff5f5' : medication.remainingQty <= 6 ? '#fffbeb' : '#fff3cd';
    const urgencyBorder = medication.remainingQty <= 3 ? '#fc8181' : medication.remainingQty <= 6 ? '#f6ad55' : '#ffc107';
    const urgencyText = medication.remainingQty <= 3 ? '#c53030' : medication.remainingQty <= 6 ? '#9c4221' : '#856404';

    const subject = `⚠️ Stock Refill Alert: ${medication.name} is running low (${medication.remainingQty} units left)`;
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Low Stock Alert - MedSmart</title>
    <style>
        ${baseStyles}
        .header { background: linear-gradient(135deg, #f6520c 0%, #f7971e 100%); }
        .header-logo { color: rgba(255,255,255,0.85); }
        .btn { background: linear-gradient(135deg, #f6520c, #f7971e); color: #fff; box-shadow: 0 8px 20px rgba(246,82,12,0.35); }
        .urgency-banner {
            border-radius: 12px;
            padding: 18px 24px;
            margin: 16px 0;
            border-left: 5px solid ${urgencyBorder};
            background: ${urgencyColor};
        }
        .urgency-banner .urgency-level {
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: ${urgencyText};
        }
        .urgency-banner .urgency-msg {
            font-size: 16px;
            font-weight: 600;
            color: ${urgencyText};
            margin-top: 4px;
        }
        .stock-visual {
            background: #f7fafc;
            border-radius: 14px;
            padding: 22px 24px;
            margin: 16px 0;
            border: 1px solid #e2e8f0;
        }
        .stock-bar-track {
            background: #e2e8f0;
            border-radius: 8px;
            height: 14px;
            overflow: hidden;
            margin: 10px 0;
        }
        .stock-bar-fill {
            height: 14px;
            border-radius: 8px;
            background: linear-gradient(90deg, #fc8181, #f6ad55);
            width: ${Math.min(100, (medication.remainingQty / (medication.totalQty || 30)) * 100)}%;
        }
        .stock-card { background: #fff8f0; border-color: #fdd9b5; }
        .stock-card .card-title { color: #9c4221; }
        .info-label { color: #a37b5e; }
    </style>
</head>
<body>
<div class="email-wrapper">
    <div class="container">
        <div class="header">
            <span class="header-logo">MedSmart</span>
            <span class="header-icon">⚠️</span>
            <h1>Stock Refill Alert</h1>
        </div>
        <div class="content">
            <p class="greeting">Hello, ${name}! 👋</p>
            <p class="subtext">Your medication stock is running low. Please refill soon to avoid missing doses.</p>

            <div class="urgency-banner">
                <div class="urgency-level">⚠️ ${urgency} — Action Required</div>
                <div class="urgency-msg">${medication.name} has only <strong>${medication.remainingQty} units</strong> remaining.</div>
            </div>

            <div class="stock-visual">
                <p style="font-size:13px;font-weight:600;color:#718096;margin-bottom:6px;">STOCK LEVEL</p>
                <div class="stock-bar-track">
                    <div class="stock-bar-fill"></div>
                </div>
                <p style="font-size:13px;color:#a0aec0;margin-top:6px;">${medication.remainingQty} of ${medication.totalQty || 'N/A'} units remaining</p>
            </div>

            <div class="card stock-card">
                <div class="card-title">💊 Medication Information</div>
                <div class="info-row">
                    <span class="info-label">Medicine Name</span>
                    <span class="info-value"><strong>${medication.name}</strong></span>
                </div>
                <div class="info-row">
                    <span class="info-label">Remaining Stock</span>
                    <span class="info-value"><strong style="color: ${urgencyText};">${medication.remainingQty} units</strong></span>
                </div>
                <div class="info-row">
                    <span class="info-label">Tablets per Dose</span>
                    <span class="info-value">${medication.qtyPerDose || 1} tablet(s)</span>
                </div>
                ${medication.dosage ? `
                <div class="info-row">
                    <span class="info-label">Dosage</span>
                    <span class="info-value">${medication.dosage}</span>
                </div>` : ''}
                ${medication.scheduledTimes ? `
                <div class="info-row">
                    <span class="info-label">Schedule</span>
                    <span class="info-value">${Array.isArray(medication.scheduledTimes) ? medication.scheduledTimes.join(', ') : medication.scheduledTimes}</span>
                </div>` : ''}
                ${medication.endDate ? `
                <div class="info-row">
                    <span class="info-label">Course Ends</span>
                    <span class="info-value">${medication.endDate}</span>
                </div>` : ''}
            </div>

            <div class="divider"></div>
            <p style="font-size:14px;color:#718096;">
                🏥 <strong>What to do:</strong> Contact your doctor or pharmacy to refill <strong>${medication.name}</strong>. 
                Don't wait until you run out completely — always keep at least a week's supply.
            </p>

            <center>
                <a href="${env.FRONTEND_URL}/medications" class="btn">🏪 Manage Medications</a>
            </center>
        </div>
        <div class="footer">
            <p>© 2026 <strong>MedSmart</strong>. All rights reserved.</p>
            <p>This alert was sent to <strong>${email}</strong> because your stock fell below 10 units.</p>
            <p>Sent from medsmart04@gmail.com</p>
        </div>
    </div>
</div>
</body>
</html>`;

    return await sendEmail({ to: email, subject, html });
};

// ============================================================================
// 3. APPOINTMENT REMINDER EMAIL (10 hours before)
// ============================================================================
const sendAppointmentReminder = async (email, name, appointment) => {
    const appointmentDate = new Date(appointment.date).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Format time to 12-hour
    let displayTime = appointment.time;
    try {
        const [h, m] = appointment.time.split(':').map(Number);
        const suffix = h >= 12 ? 'PM' : 'AM';
        const hour12 = h % 12 || 12;
        displayTime = `${hour12}:${String(m).padStart(2, '0')} ${suffix}`;
    } catch (_) {}

    const typeLabel = appointment.type === 'video' ? '📹 Video Consultation' : '🏥 In-Person Visit';

    const subject = `📅 Appointment Reminder: Dr. ${appointment.doctorName} — Tomorrow in 10 Hours`;
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Appointment Reminder - MedSmart</title>
    <style>
        ${baseStyles}
        .header { background: linear-gradient(135deg, #7928ca 0%, #ff0080 100%); }
        .header-logo { color: rgba(255,255,255,0.85); }
        .btn { background: linear-gradient(135deg, #7928ca, #ff0080); color: #fff; box-shadow: 0 8px 20px rgba(121,40,202,0.38); }
        .apt-card { background: #fdf0ff; border-color: #e9b7f7; }
        .apt-card .card-title { color: #6b21a8; }
        .info-label { color: #9333ea; }
        .countdown-box {
            background: linear-gradient(135deg, #7928ca, #ff0080);
            border-radius: 14px;
            padding: 20px 24px;
            text-align: center;
            color: white;
            margin: 20px 0;
        }
        .countdown-box .big-num {
            font-size: 52px;
            font-weight: 800;
            letter-spacing: -2px;
            line-height: 1;
            display: block;
        }
        .countdown-box .count-unit {
            font-size: 16px;
            font-weight: 600;
            opacity: 0.85;
            display: block;
        }
        .countdown-box .count-detail {
            font-size: 13px;
            opacity: 0.7;
            margin-top: 6px;
            letter-spacing: 0.5px;
        }
        .checklist {
            background: #f7fafc;
            border-radius: 12px;
            padding: 18px 22px;
            margin: 18px 0;
            border: 1px solid #e2e8f0;
        }
        .checklist h4 {
            font-size: 14px;
            font-weight: 700;
            color: #4a5568;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .checklist ul {
            list-style: none;
            padding: 0;
        }
        .checklist ul li {
            font-size: 14px;
            color: #718096;
            padding: 5px 0;
        }
        .badge-purple { background: #e9d8fd; color: #553c9a; }
    </style>
</head>
<body>
<div class="email-wrapper">
    <div class="container">
        <div class="header">
            <span class="header-logo">MedSmart</span>
            <span class="header-icon">📅</span>
            <h1>Appointment Reminder</h1>
        </div>
        <div class="content">
            <p class="greeting">Hello, ${name}! 👋</p>
            <p class="subtext">Your appointment is coming up in <strong>10 hours</strong>. Here's everything you need to know.</p>

            <div class="countdown-box">
                <span class="big-num">10</span>
                <span class="count-unit">Hours Remaining</span>
                <span class="count-detail">${appointmentDate} · ${displayTime}</span>
            </div>

            <div class="card apt-card">
                <div class="card-title">👨‍⚕️ Appointment Details</div>

                <div class="info-row">
                    <span class="info-label">Doctor</span>
                    <span class="info-value"><strong>Dr. ${appointment.doctorName}</strong></span>
                </div>

                ${appointment.specialization ? `
                <div class="info-row">
                    <span class="info-label">Specialization</span>
                    <span class="info-value">${appointment.specialization}</span>
                </div>` : ''}

                <div class="info-row">
                    <span class="info-label">Date</span>
                    <span class="info-value">📅 ${appointmentDate}</span>
                </div>

                <div class="info-row">
                    <span class="info-label">Time</span>
                    <span class="info-value">⏰ <strong>${displayTime}</strong></span>
                </div>

                <div class="info-row">
                    <span class="info-label">Type</span>
                    <span class="info-value">
                        <span class="badge badge-purple">${typeLabel}</span>
                    </span>
                </div>

                ${appointment.place ? `
                <div class="info-row">
                    <span class="info-label">Location / Hospital</span>
                    <span class="info-value">📍 ${appointment.place}</span>
                </div>` : ''}

                ${appointment.address ? `
                <div class="info-row">
                    <span class="info-label">Address</span>
                    <span class="info-value">${appointment.address}</span>
                </div>` : ''}

                ${appointment.contact ? `
                <div class="info-row">
                    <span class="info-label">Contact</span>
                    <span class="info-value">📞 ${appointment.contact}</span>
                </div>` : ''}

                ${appointment.reason ? `
                <div class="info-row">
                    <span class="info-label">Reason / Purpose</span>
                    <span class="info-value">${appointment.reason}</span>
                </div>` : ''}

                ${appointment.remarks ? `
                <div class="info-row">
                    <span class="info-label">Remarks / Notes</span>
                    <span class="info-value">📝 ${appointment.remarks}</span>
                </div>` : ''}
            </div>

            <div class="checklist">
                <h4>✅ Pre-Appointment Checklist</h4>
                <ul>
                    <li>✔️ Carry your previous prescriptions and medical records</li>
                    <li>✔️ Bring your ID and health insurance card (if applicable)</li>
                    <li>✔️ Note down symptoms or questions to ask the doctor</li>
                    <li>✔️ Confirm the appointment location / hospital address</li>
                    <li>✔️ Plan to arrive 10–15 minutes early</li>
                    ${appointment.type === 'video' ? '<li>✔️ Test your video/audio setup before the call</li>' : ''}
                </ul>
            </div>

            <center>
                <a href="${env.FRONTEND_URL}/appointments" class="btn">📋 View Appointment</a>
            </center>
        </div>
        <div class="footer">
            <p>© 2026 <strong>MedSmart</strong>. All rights reserved.</p>
            <p>This reminder was sent to <strong>${email}</strong> as your appointment is within 10 hours.</p>
            <p>Sent from medsmart04@gmail.com</p>
        </div>
    </div>
</div>
</body>
</html>`;

    return await sendEmail({ to: email, subject, html });
};

// ============================================================================
// 4. WELCOME EMAIL
// ============================================================================
const sendWelcomeEmail = async (email, name) => {
    const subject = '🏥 Welcome to MedSmart!';
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to MedSmart</title>
    <style>
        ${baseStyles}
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .header-logo { color: rgba(255,255,255,0.85); }
        .btn { background: linear-gradient(135deg, #667eea, #764ba2); color: #fff; box-shadow: 0 8px 20px rgba(102,126,234,0.38); }
        .feature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 20px 0; }
        .feature-item {
            background: #f7f8ff;
            border-radius: 12px;
            padding: 16px;
            border: 1px solid #e0e5ff;
            text-align: center;
        }
        .feature-icon { font-size: 28px; display: block; margin-bottom: 6px; }
        .feature-label { font-size: 13px; font-weight: 600; color: #4a5568; }
    </style>
</head>
<body>
<div class="email-wrapper">
    <div class="container">
        <div class="header">
            <span class="header-logo">MedSmart</span>
            <span class="header-icon">🏥</span>
            <h1>Welcome to MedSmart!</h1>
        </div>
        <div class="content">
            <p class="greeting">Hello, ${name}! 🎉</p>
            <p class="subtext">Thank you for joining MedSmart — your personal healthcare companion. We're excited to help you stay on top of your health!</p>

            <div class="feature-grid">
                <div class="feature-item">
                    <span class="feature-icon">💊</span>
                    <span class="feature-label">Track Medications</span>
                </div>
                <div class="feature-item">
                    <span class="feature-icon">📅</span>
                    <span class="feature-label">Manage Appointments</span>
                </div>
                <div class="feature-item">
                    <span class="feature-icon">🔔</span>
                    <span class="feature-label">Smart Reminders</span>
                </div>
                <div class="feature-item">
                    <span class="feature-icon">📊</span>
                    <span class="feature-label">Health Insights</span>
                </div>
            </div>

            <center>
                <a href="${env.FRONTEND_URL}/dashboard" class="btn">🚀 Go to Dashboard</a>
            </center>
        </div>
        <div class="footer">
            <p>© 2026 <strong>MedSmart</strong>. All rights reserved.</p>
            <p>Sent from medsmart04@gmail.com</p>
        </div>
    </div>
</div>
</body>
</html>`;

    return await sendEmail({ to: email, subject, html });
};

// ============================================================================
// 5. MEDICATION TAKEN CONFIRMATION
// ============================================================================
const sendMedicationTakenConfirmation = async (email, name, medication, log) => {
    const status = log.delayMinutes === 0 ? 'On Time ✅'
        : log.delayMinutes > 0 ? `Late by ${log.delayMinutes} minutes ⏰`
        : `Early by ${Math.abs(log.delayMinutes)} minutes ⚡`;

    const subject = `✅ Medication Logged: ${medication.name}`;
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Medication Taken - MedSmart</title>
    <style>
        ${baseStyles}
        .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }
        .header-logo { color: rgba(255,255,255,0.85); }
        .btn { background: linear-gradient(135deg, #11998e, #38ef7d); color: #fff; box-shadow: 0 8px 20px rgba(17,153,142,0.35); }
        .success-card { background: #f0fff4; border-color: #c6f6d5; }
        .success-card .card-title { color: #276749; }
    </style>
</head>
<body>
<div class="email-wrapper">
    <div class="container">
        <div class="header">
            <span class="header-logo">MedSmart</span>
            <span class="header-icon">✅</span>
            <h1>Medication Logged!</h1>
        </div>
        <div class="content">
            <p class="greeting">Great job, ${name}! 🎉</p>
            <p class="subtext">You've successfully logged your medication. Keep it up!</p>

            <div class="card success-card">
                <div class="card-title">💊 ${medication.name}</div>
                <div class="info-row">
                    <span class="info-label">Taken At</span>
                    <span class="info-value">${new Date(log.takenTime).toLocaleTimeString('en-IN')}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Status</span>
                    <span class="info-value">${status}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Remaining Stock</span>
                    <span class="info-value">${medication.remainingQty} units</span>
                </div>
            </div>

            <center>
                <a href="${env.FRONTEND_URL}/dashboard" class="btn">📊 View Dashboard</a>
            </center>
        </div>
        <div class="footer">
            <p>© 2026 <strong>MedSmart</strong>. All rights reserved.</p>
            <p>Sent from medsmart04@gmail.com</p>
        </div>
    </div>
</div>
</body>
</html>`;

    return await sendEmail({ to: email, subject, html });
};

// ============================================================================
// 6. MISSED MEDICATION ALERT
// ============================================================================
const sendMissedMedicationAlert = async (email, name, medication) => {
    const subject = `⚠️ Missed Medication Alert: ${medication.name}`;
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Missed Medication - MedSmart</title>
    <style>
        ${baseStyles}
        .header { background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%); }
        .header-logo { color: rgba(255,255,255,0.85); }
        .btn { background: linear-gradient(135deg, #e53e3e, #c53030); color: #fff; box-shadow: 0 8px 20px rgba(229,62,62,0.35); }
        .alert-card { background: #fff5f5; border-color: #fed7d7; }
        .alert-card .card-title { color: #c53030; }
    </style>
</head>
<body>
<div class="email-wrapper">
    <div class="container">
        <div class="header">
            <span class="header-logo">MedSmart</span>
            <span class="header-icon">⚠️</span>
            <h1>Missed Dose Alert</h1>
        </div>
        <div class="content">
            <p class="greeting">Hello, ${name}!</p>
            <p class="subtext">Our records show that you did not log your recent medication dose. It is now 15 minutes past the scheduled time.</p>
            <div class="card alert-card">
                <div class="card-title">💊 ${medication.name}</div>
                <div class="info-row">
                    <span class="info-label">Scheduled Time</span>
                    <span class="info-value"><strong>${medication.scheduledTime}</strong></span>
                </div>
            </div>
            <center>
                <a href="${env.FRONTEND_URL}/dashboard" class="btn">Login & Mark as Taken</a>
            </center>
            <p style="text-align: center; margin-top: 15px; color: #718096; font-size: 13px;">If you already took it, please update the dashboard.</p>
        </div>
        <div class="footer">
            <p>© 2026 <strong>MedSmart</strong>. All rights reserved.</p>
            <p>Sent from medsmart04@gmail.com</p>
        </div>
    </div>
</div>
</body>
</html>`;
    return await sendEmail({ to: email, subject, html });
};

// ============================================================================
// 7. HELPER ASSIGNMENT EMAIL
// ============================================================================
const sendHelperAssignmentEmail = async (patientEmail, patientName, helperName, helperContact = 'Not provided') => {
    const subject = '👥 A Helper Has Been Assigned to Your Account';
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Helper Assigned - MedSmart</title>
    <style>
        ${baseStyles}
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .header-logo { color: rgba(255,255,255,0.85); }
        .btn { background: linear-gradient(135deg, #667eea, #764ba2); color: #fff; box-shadow: 0 8px 20px rgba(102,126,234,0.38); }
        .info-card { background: #f7f8ff; border-color: #e0e5ff; }
        .info-card .card-title { color: #4a5568; }
    </style>
</head>
<body>
<div class="email-wrapper">
    <div class="container">
        <div class="header">
            <span class="header-logo">MedSmart</span>
            <span class="header-icon">👥</span>
            <h1>Helper Assigned</h1>
        </div>
        <div class="content">
            <p class="greeting">Hello, ${patientName}! 👋</p>
            <p class="subtext">A healthcare helper has been assigned to support your health journey.</p>

            <div class="card info-card">
                <div class="card-title">🤝 Your Helper</div>
                <div class="info-row">
                    <span class="info-label">Helper Name</span>
                    <span class="info-value"><strong>${helperName}</strong></span>
                </div>
                <div class="info-row">
                    <span class="info-label">Contact</span>
                    <span class="info-value"><strong>${helperContact}</strong></span>
                </div>
                <div class="info-row">
                    <span class="info-label">Can View</span>
                    <span class="info-value">Your medications & appointments (read-only)</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Can Do</span>
                    <span class="info-value">Monitor your health & provide timely support</span>
                </div>
            </div>

            <center>
                <a href="${env.FRONTEND_URL}/dashboard" class="btn">🏠 Go to Dashboard</a>
            </center>
        </div>
        <div class="footer">
            <p>© 2026 <strong>MedSmart</strong>. All rights reserved.</p>
            <p>Sent from medsmart04@gmail.com</p>
        </div>
    </div>
</div>
</body>
</html>`;

    return await sendEmail({ to: patientEmail, subject, html });
};

// ============================================================================
// 8. HELPER ACTIVATION EMAIL
// ============================================================================
const sendHelperActivatedEmail = async (helperEmail, helperName) => {
    const subject = '🎉 Your MedSmart Helper Account is Active!';
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Account Activated - MedSmart</title>
    <style>
        ${baseStyles}
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
        .header-logo { color: rgba(255,255,255,0.85); }
        .btn { background: linear-gradient(135deg, #10b981, #059669); color: #fff; box-shadow: 0 8px 20px rgba(16,185,129,0.35); }
    </style>
</head>
<body>
<div class="email-wrapper">
    <div class="container">
        <div class="header">
            <span class="header-logo">MedSmart</span>
            <span class="header-icon">🎉</span>
            <h1>Account Activated!</h1>
        </div>
        <div class="content">
            <p class="greeting">Congratulations, ${helperName}! 👋</p>
            <p class="subtext">Your helper account has been approved by the admin. You can now log into your dashboard and start monitoring your assigned patients' health journeys.</p>
            <center>
                <a href="${env.FRONTEND_URL}/login" class="btn">Login to Dashboard</a>
            </center>
        </div>
        <div class="footer">
            <p>© 2026 <strong>MedSmart</strong>. All rights reserved.</p>
            <p>Sent from medsmart04@gmail.com</p>
        </div>
    </div>
</div>
</body>
</html>`;
    return await sendEmail({ to: helperEmail, subject, html });
};

// ============================================================================
// 9. HELPER DEACTIVATION EMAIL
// ============================================================================
const sendHelperDeactivatedEmail = async (helperEmail, helperName) => {
    const subject = '⚠️ Your MedSmart Helper Account has been Deactivated';
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Account Deactivated - MedSmart</title>
    <style>
        ${baseStyles}
        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
        .header-logo { color: rgba(255,255,255,0.85); }
    </style>
</head>
<body>
<div class="email-wrapper">
    <div class="container">
        <div class="header">
            <span class="header-logo">MedSmart</span>
            <span class="header-icon">⚠️</span>
            <h1>Account Deactivated</h1>
        </div>
        <div class="content">
            <p class="greeting">Hello, ${helperName}.</p>
            <p class="subtext">This is a notification to let you know that your helper account has been deactivated by the administrator. During this time, you will not have access to the dashboard.</p>
            <p style="color: #718096; font-size: 14px;">If you believe this is a mistake, please reach out to support.</p>
        </div>
        <div class="footer">
            <p>© 2026 <strong>MedSmart</strong>. All rights reserved.</p>
            <p>Sent from medsmart04@gmail.com</p>
        </div>
    </div>
</div>
</body>
</html>`;
    return await sendEmail({ to: helperEmail, subject, html });
};

// ============================================================================
// 10. NEW PATIENT ASSIGNED TO HELPER
// ============================================================================
const sendNewPatientAssignedEmailToHelper = async (helperEmail, helperName, patientName) => {
    const subject = '👥 New Patient Assigned to You';
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>New Patient Assigned - MedSmart</title>
    <style>
        ${baseStyles}
        .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); }
        .header-logo { color: rgba(255,255,255,0.85); }
        .btn { background: linear-gradient(135deg, #3b82f6, #2563eb); color: #fff; box-shadow: 0 8px 20px rgba(59,130,246,0.35); }
    </style>
</head>
<body>
<div class="email-wrapper">
    <div class="container">
        <div class="header">
            <span class="header-logo">MedSmart</span>
            <span class="header-icon">👥</span>
            <h1>New Patient Assigned</h1>
        </div>
        <div class="content">
            <p class="greeting">Hello, ${helperName}! 👋</p>
            <p class="subtext">A new patient, <strong>${patientName}</strong>, has been assigned under your care.</p>
            <p style="color: #4a5568; font-size: 15px; margin-bottom: 24px;">Please login to your dashboard to review their schedules, medications, and medical history.</p>
            <center>
                <a href="${env.FRONTEND_URL}/helper/dashboard" class="btn">View Patients List</a>
            </center>
        </div>
        <div class="footer">
            <p>© 2026 <strong>MedSmart</strong>. All rights reserved.</p>
            <p>Sent from medsmart04@gmail.com</p>
        </div>
    </div>
</div>
</body>
</html>`;
    return await sendEmail({ to: helperEmail, subject, html });
};

// ============================================================================
// 10.b. PATIENT REMOVED FROM HELPER
// ============================================================================
const sendPatientUnassignedEmailToHelper = async (helperEmail, helperName, patientName) => {
    const subject = '⚠️ Patient Assignment Update';
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Patient Unassigned - MedSmart</title>
    <style>
        ${baseStyles}
        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
        .header-logo { color: rgba(255,255,255,0.85); }
    </style>
</head>
<body>
<div class="email-wrapper">
    <div class="container">
        <div class="header">
            <span class="header-logo">MedSmart</span>
            <span class="header-icon">⚠️</span>
            <h1>Assignment Update</h1>
        </div>
        <div class="content">
            <p class="greeting">Hello, ${helperName}.</p>
            <p class="subtext">This is a notification to inform you that <strong>${patientName}</strong> is no longer assigned to your care.</p>
            <p style="color: #4a5568; font-size: 15px; margin-bottom: 24px;">They have been removed from your dashboard, and you will no longer receive notifications or have access to their medical records.</p>
        </div>
        <div class="footer">
            <p>© 2026 <strong>MedSmart</strong>. All rights reserved.</p>
            <p>Sent from medsmart04@gmail.com</p>
        </div>
    </div>
</div>
</body>
</html>`;
    return await sendEmail({ to: helperEmail, subject, html });
};

// ============================================================================
// 12. WEEKLY HELPER FEEDBACK EMAIL (sent to patient every Saturday)
// ============================================================================
const sendWeeklyFeedbackEmail = async (patientEmail, patientName, helperName, feedbackUrl) => {
    const subject = `⭐ Rate Your Helper This Week - ${helperName}`;
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Rate Your Helper - MedSmart</title>
    <style>
        ${baseStyles}
        .header { background: linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%); }
        .header-logo { color: rgba(255,255,255,0.85); }
        .btn { background: linear-gradient(135deg, #0ea5e9, #6366f1); color: #fff; box-shadow: 0 8px 20px rgba(99,102,241,0.35); }
        .criteria-box { background: #f7f8ff; border: 1px solid #e0e5ff; border-radius: 12px; padding: 16px; margin: 12px 0; }
        .criteria-item { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #eee; font-size: 14px; color: #4a5568; }
        .criteria-item:last-child { border-bottom: none; }
    </style>
</head>
<body>
<div class="email-wrapper">
    <div class="container">
        <div class="header">
            <span class="header-logo">MedSmart</span>
            <span class="header-icon">⭐</span>
            <h1>Weekly Helper Feedback</h1>
        </div>
        <div class="content">
            <p class="greeting">Hello, ${patientName}! 👋</p>
            <p class="subtext">It's time for your <strong>weekly check-in</strong>! Please take a moment to rate your helper, <strong>${helperName}</strong>. Your feedback helps us ensure you receive the best care possible.</p>

            <div class="criteria-box">
                <div class="card-title" style="margin-bottom:10px;">📋 You'll be rating on:</div>
                <div class="criteria-item"><span>💼 Work Quality</span><span>How well tasks are done</span></div>
                <div class="criteria-item"><span>😊 Behavior</span><span>Attitude & friendliness</span></div>
                <div class="criteria-item"><span>⏰ Punctuality</span><span>On-time arrivals & responses</span></div>
                <div class="criteria-item"><span>💬 Communication</span><span>Clarity & responsiveness</span></div>
                <div class="criteria-item"><span>⭐ Overall</span><span>General satisfaction</span></div>
            </div>

            <p style="color: #4a5568; font-size: 14px; text-align: center; margin: 16px 0;">Takes less than <strong>1 minute</strong> to complete!</p>

            <center>
                <a href="${feedbackUrl}" class="btn" style="display:inline-block;padding:14px 36px;border-radius:12px;font-weight:700;text-decoration:none;font-size:16px;">⭐ Submit Feedback Now</a>
            </center>

            <p style="color: #a0aec0; font-size: 12px; text-align: center; margin-top: 20px;">This feedback link expires in 7 days. Your feedback is confidential.</p>
        </div>
        <div class="footer">
            <p>© 2026 <strong>MedSmart</strong>. All rights reserved.</p>
            <p>Sent from medsmart04@gmail.com</p>
        </div>
    </div>
</div>
</body>
</html>`;

    return await sendEmail({ to: patientEmail, subject, html });
};

// ============================================================================
// 11. HELPER REGISTRATION ALERT FOR ADMIN
// ============================================================================
const sendHelperRegistrationAlert = async (helperName, helperEmail) => {
    const adminEmail = 'medsmart04@gmail.com';
    const subject = '🔔 New Helper Registration Requires Activation';
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>New Helper Registration - MedSmart</title>
    <style>
        ${baseStyles}
        .header { background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%); }
        .header-logo { color: rgba(255,255,255,0.85); }
        .btn { background: linear-gradient(135deg, #1d4ed8, #1e40af); color: #fff; box-shadow: 0 8px 20px rgba(29,78,216,0.35); }
    </style>
</head>
<body>
<div class="email-wrapper">
    <div class="container">
        <div class="header">
            <span class="header-logo">MedSmart Admin</span>
            <span class="header-icon">🔔</span>
            <h1>New Helper Registered</h1>
        </div>
        <div class="content">
            <p class="greeting">Hello Admin,</p>
            <p class="subtext">A new helper has just registered and is awaiting activation.</p>
            
            <div class="card">
                <div class="card-title">👤 Helper Details</div>
                <div class="info-row">
                    <span class="info-label">Name</span>
                    <span class="info-value"><strong>${helperName}</strong></span>
                </div>
                <div class="info-row">
                    <span class="info-label">Email</span>
                    <span class="info-value">${helperEmail}</span>
                </div>
            </div>

            <p style="color: #4a5568; font-size: 15px; margin-bottom: 24px;">Please login to the Admin Dashboard to review and activate their account.</p>
            <center>
                <a href="${env.FRONTEND_URL}/admin/helpers" class="btn">Review Helper</a>
            </center>
        </div>
        <div class="footer">
            <p>© 2026 <strong>MedSmart</strong>. All rights reserved.</p>
            <p>Sent from medsmart04@gmail.com</p>
        </div>
    </div>
</div>
</body>
</html>`;
    return await sendEmail({ to: adminEmail, subject, html });
};

// ============================================================================
// EXPORTS
// ============================================================================
module.exports = {
    sendEmail,
    sendWelcomeEmail,
    sendMedicationReminder,
    sendAppointmentReminder,
    sendMedicationTakenConfirmation,
    sendLowStockAlert,
    sendHelperAssignmentEmail,
    sendMissedMedicationAlert,
    sendHelperActivatedEmail,
    sendHelperDeactivatedEmail,
    sendNewPatientAssignedEmailToHelper,
    sendHelperRegistrationAlert,
    sendPatientUnassignedEmailToHelper,
    sendWeeklyFeedbackEmail
};
