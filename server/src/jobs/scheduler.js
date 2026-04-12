/**
 * Notification Scheduler
 * ─────────────────────────────────────────────
 *  Job 1 – Medication Reminder      : Every minute → send email 15 min before scheduled dose
 *  Job 2 – Low Stock Alert          : Every 6 hours → email if remaining_quantity < 10
 *  Job 3 – Appointment Reminder     : Every 30 min  → email 10 hours before appointment
 *  Job 4 – Auto-mark Missed         : Every hour    → mark past scheduled appts as missed
 * ─────────────────────────────────────────────
 */

const cron = require('node-cron');
const { Medication, Appointment, User, MedicationLog, PatientHelper } = require('../models');
const { Op } = require('sequelize');
const emailService = require('../services/email.service');
const feedbackService = require('../services/feedback.service');
const env = require('../config/env');

// ── Weekly Feedback Job ───────────────────────────────────────────────────────
const sendWeeklyFeedbackEmails = async () => {
    try {
        console.log('[Scheduler] ⭐ Sending weekly helper feedback emails...');

        // Find all active patient-helper assignments
        const assignments = await PatientHelper.findAll({
            where: { is_active: true },
            include: [
                { model: User, as: 'patient', attributes: ['user_id', 'full_name', 'email'] },
                { model: User, as: 'helper',  attributes: ['user_id', 'full_name'] }
            ]
        });

        let sent = 0;
        for (const assignment of assignments) {
            try {
                const patient = assignment.patient;
                const helper  = assignment.helper;
                if (!patient || !helper) continue;

                // Create a unique token for this patient-helper pair
                const token = feedbackService.createFeedbackRequest(
                    patient.user_id,
                    helper.user_id,
                    patient.email,
                    patient.full_name,
                    helper.full_name
                );

                const feedbackUrl = `${env.FRONTEND_URL}/feedback/${token}`;

                await emailService.sendWeeklyFeedbackEmail(
                    patient.email,
                    patient.full_name,
                    helper.full_name,
                    feedbackUrl
                );
                sent++;
                console.log(`  ✅ Sent feedback email to ${patient.full_name} about ${helper.full_name}`);
            } catch (err) {
                console.error(`  ⚠️ Failed to send to ${assignment.patient?.email}:`, err.message);
            }
        }
        console.log(`[Scheduler] ⭐ Feedback emails done. Sent: ${sent}/${assignments.length}`);
    } catch (err) {
        console.error('[Scheduler] ❌ Weekly feedback job error:', err.message);
    }
};


// ────────────────────────────────────────────────────────────────────────────
// HELPER UTILITIES
// ────────────────────────────────────────────────────────────────────────────

/**
 * Returns today's date as "YYYY-MM-DD" in LOCAL time (IST-aware)
 */
const localDateStr = (date = new Date()) => {
    const offset = date.getTimezoneOffset();
    const local  = new Date(date.getTime() - offset * 60000);
    return local.toISOString().split('T')[0];
};

/**
 * Returns "HH:MM" string for a given Date object (local time)
 */
const toHHMM = (date) =>
    `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

// ────────────────────────────────────────────────────────────────────────────
// JOB 1 – MEDICATION REMINDERS (15 minutes before each scheduled dose)
// ────────────────────────────────────────────────────────────────────────────
const checkMedicationReminders = async () => {
    try {
        const now              = new Date();
        const reminderMinutes  = env.MEDICATION_REMINDER_MINUTES || 15;
        const targetTime       = new Date(now.getTime() + reminderMinutes * 60000);

        // This is the exact scheduled time we want to match (e.g. "08:30")
        const targetTimeStr = toHHMM(targetTime);
        const todayDateStr  = localDateStr(now);

        console.log(`[Scheduler] Medication check → looking for dose at ${targetTimeStr} (${reminderMinutes} min from now)`);

        // Find active medications scheduled for today
        const medications = await Medication.findAll({
            where: {
                is_active:  true,
                start_date: { [Op.lte]: todayDateStr },
                end_date:   { [Op.gte]: todayDateStr }
            },
            include: [{
                model:      User,
                as:         'patient',
                attributes: ['user_id', 'email', 'full_name']
            }]
        });

        let remindedCount = 0;

        for (const medication of medications) {
            const times = medication.scheduled_times || [];
            if (!times.includes(targetTimeStr)) continue;

            // ── Check today's day (selected_days filter) ──────────────────
            const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const todayDay = dayMap[now.getDay()];
            const selectedDays = medication.selected_days || ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
            if (!selectedDays.includes(todayDay)) {
                console.log(`[Scheduler] Skipping ${medication.medicine_name} — not scheduled on ${todayDay}`);
                continue;
            }

            // ── Check if already reminded in the past 20 min ──────────────
            const twentyMinAgo = new Date(now.getTime() - 20 * 60000);
            const recentLog = await MedicationLog.count({
                where: {
                    medication_id:  medication.medication_id,
                    patient_id:     medication.patient_id,
                    scheduled_time: targetTimeStr,
                    taken_time: {
                        [Op.gte]: new Date(todayDateStr + 'T00:00:00.000Z')
                    }
                }
            });

            if (recentLog > 0) {
                console.log(`[Scheduler] Skip reminder: ${medication.medicine_name} already taken today at ${targetTimeStr}`);
                continue;
            }

            const user = medication.patient;
            if (!user || !user.email) continue;

            // ── Friendly meal label ────────────────────────────────────────
            const mealTypeMap = {
                before_meal:    'Before Meal',
                after_meal:     'After Meal',
                with_meal:      'With Meal',
                empty_stomach:  'Empty Stomach'
            };

            const emailPayload = {
                name:          medication.medicine_name,
                qtyPerDose:    medication.qty_per_dose,
                scheduledTime: targetTimeStr,
                mealType:      mealTypeMap[medication.meal_type] || medication.meal_type,
                remainingQty:  medication.remaining_quantity,
                remarks:       medication.remarks
            };

            console.log(`[Scheduler] Sending medication reminder → ${user.email} | ${medication.medicine_name} @ ${targetTimeStr}`);
            await emailService.sendMedicationReminder(user.email, user.full_name, emailPayload);
            remindedCount++;
        }

        console.log(`[Scheduler] ✅ Medication reminders done. Sent: ${remindedCount}`);
    } catch (error) {
        console.error('[Scheduler] ❌ Medication reminder error:', error.message);
    }
};


// ────────────────────────────────────────────────────────────────────────────
// JOB 5 – MISSED MEDICATION ALERTS (sent 15 mins after expected time)
// ────────────────────────────────────────────────────────────────────────────
const checkMissedMedicationReminders = async () => {
    try {
        const now             = new Date();
        const missedMinutes   = 15; // 15 minutes past the dose
        const targetTime      = new Date(now.getTime() - missedMinutes * 60000);
        
        const targetTimeStr   = toHHMM(targetTime);
        const todayDateStr    = localDateStr(now);

        console.log(`[Scheduler] checking if doses at ${targetTimeStr} were missed (${missedMinutes} min ago)`);

        const medications = await Medication.findAll({
            where: {
                is_active: true,
                start_date: { [Op.lte]: todayDateStr },
                end_date: { [Op.gte]: todayDateStr }
            },
            include: [{
                model: User,
                as: 'patient',
                attributes: ['user_id', 'email', 'full_name']
            }]
        });

        let missedCount = 0;

        for (const medication of medications) {
            const times = medication.scheduled_times || [];
            if (!times.includes(targetTimeStr)) continue;

            const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const todayDay = dayMap[now.getDay()];
            const selectedDays = medication.selected_days || ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
            if (!selectedDays.includes(todayDay)) continue;

            // Check if patient actually logged this specific schedule today
            const logEntry = await MedicationLog.count({
                where: {
                    medication_id: medication.medication_id,
                    patient_id: medication.patient_id,
                    scheduled_time: targetTimeStr,
                    taken_time: {
                        [Op.gte]: new Date(todayDateStr + 'T00:00:00.000Z') // started today
                    }
                }
            });

            // If there's no log, they MISSED it! Send the alert email.
            if (logEntry === 0) {
                const user = medication.patient;
                if (!user || !user.email) continue;

                console.log(`[Scheduler] ⚠️ Missed dose found! Emailing ${user.email} | ${medication.medicine_name}`);
                await emailService.sendMissedMedicationAlert(user.email, user.full_name, {
                    name: medication.medicine_name,
                    scheduledTime: targetTimeStr
                });
                missedCount++;
            }
        }
        if (missedCount > 0) console.log(`[Scheduler] ✅ Sent ${missedCount} missed medication alerts.`);
    } catch (error) {
        console.error('[Scheduler] ❌ Missed medication check error:', error.message);
    }
};

// ────────────────────────────────────────────────────────────────────────────
// JOB 2 – LOW STOCK ALERTS (remaining_quantity < 10)
// ────────────────────────────────────────────────────────────────────────────
const checkLowStockMedications = async () => {
    try {
        console.log('[Scheduler] 🔔 Checking low stock medications...');

        const threshold    = env.LOW_STOCK_THRESHOLD || 10;
        const todayDateStr = localDateStr();

        const medications = await Medication.findAll({
            where: {
                is_active:          true,
                start_date:         { [Op.lte]: todayDateStr },
                end_date:           { [Op.gte]: todayDateStr },
                remaining_quantity: { [Op.lt]: threshold, [Op.gt]: 0 }
            },
            include: [{
                model:      User,
                as:         'patient',
                attributes: ['user_id', 'email', 'full_name']
            }]
        });

        let alertCount = 0;

        for (const medication of medications) {
            const user = medication.patient;
            if (!user || !user.email) continue;

            const emailPayload = {
                name:           medication.medicine_name,
                qtyPerDose:     medication.qty_per_dose,
                remainingQty:   medication.remaining_quantity,
                totalQty:       medication.total_quantity,
                dosage:         medication.dosage,
                scheduledTimes: medication.scheduled_times,
                endDate:        medication.end_date
            };

            console.log(`[Scheduler] Low stock alert → ${user.email} | ${medication.medicine_name} (${medication.remaining_quantity} left)`);
            await emailService.sendLowStockAlert(user.email, user.full_name, emailPayload);
            alertCount++;
        }

        console.log(`[Scheduler] ✅ Low stock check done. Alerts sent: ${alertCount}`);
    } catch (error) {
        console.error('[Scheduler] ❌ Low stock check error:', error.message);
    }
};

// ────────────────────────────────────────────────────────────────────────────
// JOB 6 – OUT OF STOCK ALERTS (remaining_quantity === 0)
// ────────────────────────────────────────────────────────────────────────────
const checkOutOfStockMedications = async () => {
    try {
        console.log('[Scheduler] 🔴 Checking OUT OF STOCK medications...');

        const todayDateStr = localDateStr();

        const medications = await Medication.findAll({
            where: {
                is_active:          true,
                start_date:         { [Op.lte]: todayDateStr },
                end_date:           { [Op.gte]: todayDateStr },
                remaining_quantity: 0
            },
            include: [{
                model:      User,
                as:         'patient',
                attributes: ['user_id', 'email', 'full_name']
            }]
        });

        let alertCount = 0;

        for (const medication of medications) {
            const user = medication.patient;
            if (!user || !user.email) continue;

            const emailPayload = {
                name:           medication.medicine_name,
                qtyPerDose:     medication.qty_per_dose,
                remainingQty:   0,
                totalQty:       medication.total_quantity,
                dosage:         medication.dosage,
                scheduledTimes: medication.scheduled_times,
                endDate:        medication.end_date
            };

            await emailService.sendLowStockAlert(user.email, user.full_name, emailPayload);
            alertCount++;
        }

        console.log(`[Scheduler] ✅ Out of stock check done. Alerts sent: ${alertCount}`);
    } catch (error) {
        console.error('[Scheduler] ❌ Out of stock check error:', error.message);
    }
};

// ────────────────────────────────────────────────────────────────────────────
// JOB 3 – APPOINTMENT REMINDERS (10 hours before appointment time)
// ────────────────────────────────────────────────────────────────────────────
const checkAppointmentReminders = async () => {
    try {
        console.log('[Scheduler] 🔔 Checking appointment reminders...');

        const now          = new Date();
        const reminderHrs  = env.APPOINTMENT_REMINDER_HOURS || 10;

        // Window: appointments whose datetime lands within [now+9.5h, now+10.5h]
        const windowStart  = new Date(now.getTime() + (reminderHrs - 0.5) * 3600000);
        const windowEnd    = new Date(now.getTime() + (reminderHrs + 0.5) * 3600000);

        const wStartDate   = localDateStr(windowStart);
        const wEndDate     = localDateStr(windowEnd);

        const appointments = await Appointment.findAll({
            where: {
                status:           'scheduled',
                reminder_sent:    false,
                appointment_date: { [Op.between]: [wStartDate, wEndDate] }
            },
            include: [{
                model:      User,
                as:         'patient',
                attributes: ['user_id', 'email', 'full_name']
            }]
        });

        let reminderCount = 0;

        for (const appointment of appointments) {
            // Verify the actual datetime is in our 10-hour window
            const aptDateTime = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
            if (aptDateTime < windowStart || aptDateTime > windowEnd) continue;

            const user = appointment.patient;
            if (!user || !user.email) continue;

            const aptData = {
                doctorName:      appointment.doctor_name,
                specialization:  appointment.specialization,
                date:            appointment.appointment_date,
                time:            appointment.appointment_time,
                type:            appointment.type || 'in-person',
                // Location: prefer hospital_name, fallback to address
                place:           appointment.hospital_name || appointment.address || 'See appointment details',
                address:         appointment.address,
                contact:         appointment.contact_number,
                reason:          appointment.reason,
                remarks:         appointment.remarks
            };

            console.log(`[Scheduler] Appointment reminder → ${user.email} | Dr. ${appointment.doctor_name} @ ${appointment.appointment_date} ${appointment.appointment_time}`);
            await emailService.sendAppointmentReminder(user.email, user.full_name, aptData);

            // Mark reminder as sent to avoid duplicate emails
            await appointment.update({ reminder_sent: true });
            reminderCount++;
        }

        console.log(`[Scheduler] ✅ Appointment reminders done. Sent: ${reminderCount}`);
    } catch (error) {
        console.error('[Scheduler] ❌ Appointment reminder error:', error.message);
    }
};

// ────────────────────────────────────────────────────────────────────────────
// JOB 4 – AUTO-MARK MISSED APPOINTMENTS
// ────────────────────────────────────────────────────────────────────────────
const autoMarkMissedAppointments = async () => {
    try {
        console.log('[Scheduler] 🔔 Checking for missed appointments...');

        const todayDateStr  = localDateStr();
        const now           = new Date();
        const currentTime   = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:00`;

        const [affectedRows] = await Appointment.update(
            { status: 'missed' },
            {
                where: {
                    status: 'scheduled',
                    [Op.or]: [
                        // Appointment date is before today
                        { appointment_date: { [Op.lt]: todayDateStr } },
                        // Appointment date is today but time has passed
                        {
                            appointment_date: todayDateStr,
                            appointment_time: { [Op.lt]: currentTime }
                        }
                    ]
                }
            }
        );

        console.log(`[Scheduler] ✅ Missed appointments checked. Marked: ${affectedRows}`);
    } catch (error) {
        console.error('[Scheduler] ❌ Missed appointments error:', error.message);
    }
};

// ────────────────────────────────────────────────────────────────────────────
// INITIALIZE ALL CRON JOBS
// ────────────────────────────────────────────────────────────────────────────
const initializeScheduler = () => {
    const SEP = '═'.repeat(55);
    console.log(`\n${SEP}`);
    console.log('  ⏰  MedSmart Notification Scheduler Starting');
    console.log(SEP);

    // ── Job 1: Medication Reminders ─ Every minute ────────────────────────
    cron.schedule('* * * * *', checkMedicationReminders, { timezone: 'Asia/Kolkata' });
    console.log('  💊  Medication Reminders  →  Every minute (15 min beforehand)');

    // ── Job 5: Missed Medication Alerts ─ Every minute ────────────────────
    cron.schedule('* * * * *', checkMissedMedicationReminders, { timezone: 'Asia/Kolkata' });
    console.log('  ⚠️   Missed Dose Alerts   →  Every minute (triggers 15 min after missed dose)');

    // ── Job 2: Low Stock Alerts ─ Every 6 hours ───────────────────────────
    cron.schedule('0 */6 * * *', checkLowStockMedications, { timezone: 'Asia/Kolkata' });
    console.log('  ⚠️   Low Stock Alerts     →  Every 6 hours (threshold: <10 units)');

    // ── Job 6: Out of Stock Alerts ─ Every 20 minutes ──────────────────────
    cron.schedule('*/20 * * * *', checkOutOfStockMedications, { timezone: 'Asia/Kolkata' });
    console.log('  🔴  Out of Stock Alerts  →  Every 20 minutes (remaining: 0 units)');

    // ── Job 3: Appointment Reminders ─ Every 30 minutes ──────────────────
    cron.schedule('*/30 * * * *', checkAppointmentReminders, { timezone: 'Asia/Kolkata' });
    console.log('  📅  Appointment Reminders →  Every 30 min (sent 10 hours ahead)');

    // ── Job 4: Auto-mark Missed ─ Every hour ─────────────────────────────
    cron.schedule('0 * * * *', autoMarkMissedAppointments, { timezone: 'Asia/Kolkata' });
    console.log('  🕐  Missed-Appt Checker   →  Every hour');

    // ── Job 7: Weekly Helper Feedback ─ Every Saturday at 9 AM IST ───────
    cron.schedule('0 9 * * 6', sendWeeklyFeedbackEmails, { timezone: 'Asia/Kolkata' });
    console.log('  ⭐  Helper Feedback Emails →  Every Saturday at 9:00 AM');

    console.log(`${SEP}`);
    console.log('  ✅  All scheduler jobs activated!');
    console.log(`${SEP}\n`);

    // ── Bootstrap: run low-stock check immediately on startup ─────────────
    setTimeout(() => {
        console.log('[Scheduler] 🚀 Running startup checks...');
        checkLowStockMedications();
        checkAppointmentReminders();
    }, 8000); // 8-second delay so DB connections are ready
};

// ────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ────────────────────────────────────────────────────────────────────────────
module.exports = {
    initializeScheduler,
    checkMedicationReminders,
    checkMissedMedicationReminders,
    checkLowStockMedications,
    checkOutOfStockMedications,
    checkAppointmentReminders,
    autoMarkMissedAppointments,
    sendWeeklyFeedbackEmails
};
