/**
 * Notification Scheduler
 * Handles automated medication and appointment reminders using node-cron
 */

const cron = require('node-cron');
const { Medication, Appointment, Patient, User } = require('../models');
const emailService = require('../services/email.service');
const env = require('../config/env');

/**
 * Check and Send Medication Reminders
 * Runs every 15 minutes
 */
const checkMedicationReminders = async () => {
    try {
        console.log('🔔 Checking medication reminders...');

        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        // Calculate reminder time (30 minutes before scheduled time)
        const reminderMinutes = env.MEDICATION_REMINDER_MINUTES || 30;
        const reminderTime = new Date(now.getTime() + reminderMinutes * 60000);
        const reminderTimeStr = `${String(reminderTime.getHours()).padStart(2, '0')}:${String(reminderTime.getMinutes()).padStart(2, '0')}`;

        // Find active medications scheduled around reminder time
        const medications = await Medication.find({
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: now },
            scheduledTime: reminderTimeStr
        }).populate('patientId');

        console.log(`Found ${medications.length} medications to remind`);

        for (const medication of medications) {
            // Check if already taken today
            if (medication.isTakenToday()) {
                console.log(`Skipping ${medication.name} - already taken today`);
                continue;
            }

            // Get patient and user details
            const patient = medication.patientId;
            if (!patient) continue;

            const user = await User.findById(patient.userId);
            if (!user || !user.email) continue;

            // Send reminder email
            console.log(`Sending medication reminder to ${user.email} for ${medication.name}`);
            await emailService.sendMedicationReminder(
                user.email,
                patient.fullName,
                medication
            );
        }

        console.log('✅ Medication reminders checked');
    } catch (error) {
        console.error('❌ Error checking medication reminders:', error);
    }
};

/**
 * Check and Send Appointment Reminders
 * Runs every hour
 */
const checkAppointmentReminders = async () => {
    try {
        console.log('🔔 Checking appointment reminders...');

        const now = new Date();

        // Calculate reminder time (24 hours before appointment)
        const reminderHours = env.APPOINTMENT_REMINDER_HOURS || 24;
        const reminderTime = new Date(now.getTime() + reminderHours * 60 * 60000);

        // Find appointments scheduled around reminder time that haven't been reminded
        const appointments = await Appointment.find({
            status: 'scheduled',
            reminderSent: false,
            date: {
                $gte: now,
                $lte: reminderTime
            }
        }).populate('patientId');

        console.log(`Found ${appointments.length} appointments to remind`);

        for (const appointment of appointments) {
            // Get patient and user details
            const patient = appointment.patientId;
            if (!patient) continue;

            const user = await User.findById(patient.userId);
            if (!user || !user.email) continue;

            // Send reminder email
            console.log(`Sending appointment reminder to ${user.email} for ${appointment.doctorName}`);
            await emailService.sendAppointmentReminder(
                user.email,
                patient.fullName,
                appointment
            );

            // Mark reminder as sent
            appointment.reminderSent = true;
            appointment.reminderSentAt = new Date();
            await appointment.save();
        }

        console.log('✅ Appointment reminders checked');
    } catch (error) {
        console.error('❌ Error checking appointment reminders:', error);
    }
};

/**
 * Check Low Stock Medications
 * Runs daily at 9 AM
 */
const checkLowStockMedications = async () => {
    try {
        console.log('🔔 Checking low stock medications...');

        const now = new Date();

        // Find active medications with low stock (less than 5 doses)
        const medications = await Medication.find({
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: now },
            remainingQty: { $lte: 5, $gt: 0 }
        }).populate('patientId');

        console.log(`Found ${medications.length} low stock medications`);

        for (const medication of medications) {
            // Get patient and user details
            const patient = medication.patientId;
            if (!patient) continue;

            const user = await User.findById(patient.userId);
            if (!user || !user.email) continue;

            // Send low stock alert
            console.log(`Sending low stock alert to ${user.email} for ${medication.name}`);
            await emailService.sendLowStockAlert(
                user.email,
                patient.fullName,
                medication
            );
        }

        console.log('✅ Low stock medications checked');
    } catch (error) {
        console.error('❌ Error checking low stock medications:', error);
    }
};

/**
 * Auto-mark Missed Appointments
 * Runs every hour
 */
const autoMarkMissedAppointments = async () => {
    try {
        console.log('🔔 Checking for missed appointments...');

        const now = new Date();

        // Find appointments that are past and still scheduled
        const missedAppointments = await Appointment.find({
            status: 'scheduled',
            date: { $lt: now }
        });

        console.log(`Found ${missedAppointments.length} missed appointments`);

        for (const appointment of missedAppointments) {
            await appointment.markAsMissed();
            console.log(`Marked appointment ${appointment._id} as missed`);
        }

        console.log('✅ Missed appointments checked');
    } catch (error) {
        console.error('❌ Error checking missed appointments:', error);
    }
};

/**
 * Initialize All Cron Jobs
 */
const initializeScheduler = () => {
    console.log('\n' + '='.repeat(50));
    console.log('⏰ Initializing Notification Scheduler');
    console.log('='.repeat(50));

    // Medication reminders - Every 15 minutes
    cron.schedule('*/15 * * * *', () => {
        checkMedicationReminders();
    });
    console.log('✅ Medication reminders: Every 15 minutes');

    // Appointment reminders - Every hour
    cron.schedule('0 * * * *', () => {
        checkAppointmentReminders();
    });
    console.log('✅ Appointment reminders: Every hour');

    // Low stock check - Daily at 9 AM
    cron.schedule('0 9 * * *', () => {
        checkLowStockMedications();
    });
    console.log('✅ Low stock check: Daily at 9:00 AM');

    // Missed appointments - Every hour
    cron.schedule('0 * * * *', () => {
        autoMarkMissedAppointments();
    });
    console.log('✅ Missed appointments check: Every hour');

    console.log('='.repeat(50));
    console.log('✅ All schedulers initialized successfully');
    console.log('='.repeat(50) + '\n');

    // Run initial checks
    setTimeout(() => {
        console.log('🚀 Running initial checks...');
        checkMedicationReminders();
        checkAppointmentReminders();
        autoMarkMissedAppointments();
    }, 5000); // Wait 5 seconds after server start
};

module.exports = {
    initializeScheduler,
    checkMedicationReminders,
    checkAppointmentReminders,
    checkLowStockMedications,
    autoMarkMissedAppointments
};
