/**
 * Patient Controller (Sequelize)
 * Business logic for patient-specific operations
 */

const { User, Medication, Appointment, MedicationLog } = require('../models');
const { Op } = require('sequelize');

/**
 * Get Patient Profile
 * GET /api/patient/profile
 */
const getProfile = async (req, res) => {
    try {
        const patient = await User.findOne({
            where: { user_id: req.user.user_id, role: 'patient' },
            attributes: { exclude: ['password_hash'] }
        });

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient profile not found'
            });
        }

        res.status(200).json({
            success: true,
            data: patient
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching profile',
            error: error.message
        });
    }
};

/**
 * Update Patient Profile
 * PUT /api/patient/profile
 */
const updateProfile = async (req, res) => {
    try {
        const { email, mobile } = req.body;

        const patient = await User.findByPk(req.user.user_id);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found'
            });
        }

        if (email && email !== patient.email) {
            const existingEmail = await User.findOne({ where: { email } });
            if (existingEmail) {
                return res.status(400).json({ success: false, message: 'Email is already in use by another account.' });
            }
        }

        await patient.update({
            email: email || patient.email,
            mobile: mobile || patient.mobile
        });

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: patient
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile',
            error: error.message
        });
    }
};

// ==================== MEDICATION OPERATIONS ====================

/**
 * Get All Medications
 * GET /api/patient/medications
 */
const getMedications = async (req, res) => {
    try {
        const { MedicationLog } = require('../models');
        
        // Fetch start of today to only return today's taken logs
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const medications = await Medication.findAll({
            where: { patient_id: req.user.user_id },
            include: [{
                model: MedicationLog,
                as: 'logs',
                where: {
                    taken_time: {
                        [require('sequelize').Op.gte]: startOfToday
                    }
                },
                required: false // LEFT OUTER JOIN so we still list medicines even if not taken
            }],
            order: [['created_at', 'DESC']]
        });

        const mappedMeds = medications.map(m => ({
            _id: m.medication_id,
            name: m.medicine_name,
            dosage: m.qty_per_dose,
            stock: m.remaining_quantity,
            scheduledTimes: m.scheduled_times, // explicit array
            frequency: m.scheduled_times ? m.scheduled_times[0] : '', // fallback
            time: m.scheduled_times ? m.scheduled_times[0] : '', // fallback
            expiryDate: m.end_date,
            manufacturingDate: m.start_date, // Mapping start_date to mfg date for consistency
            mealTiming: m.meal_type === 'before_meal' ? 'Before Meal' : 'After Meal',
            isActive: m.is_active,
            takenLogs: m.logs ? m.logs.map(l => ({
                id: l.log_id,
                takenTime: l.taken_time,
                status: l.status,
                scheduledTime: l.scheduled_time && l.scheduled_time.length > 5 ? l.scheduled_time.substring(0, 5) : l.scheduled_time
            })) : []
        }));

        res.status(200).json({
            success: true,
            count: mappedMeds.length,
            data: mappedMeds
        });
    } catch (error) {
        console.error('Get medications error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching medications',
            error: error.message
        });
    }
};

/**
 * Get Active Medications
 * GET /api/patient/medications/active
 */
const getActiveMedications = async (req, res) => {
    try {
        const medications = await Medication.findAll({
            where: {
                patient_id: req.user.user_id,
                is_active: true
            },
            order: [['created_at', 'DESC']]
        });

        res.status(200).json({
            success: true,
            count: medications.length,
            data: medications
        });
    } catch (error) {
        console.error('Get active medications error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching active medications',
            error: error.message
        });
    }
};

/**
 * Get Single Medication
 * GET /api/patient/medications/:id
 */
const getMedication = async (req, res) => {
    try {
        const medication = await Medication.findOne({
            where: {
                medication_id: req.params.id,
                patient_id: req.user.user_id
            }
        });

        if (!medication) {
            return res.status(404).json({
                success: false,
                message: 'Medication not found'
            });
        }

        res.status(200).json({
            success: true,
            data: medication
        });
    } catch (error) {
        console.error('Get medication error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching medication',
            error: error.message
        });
    }
};

/**
 * Add Medication
 * POST /api/patient/medications
 */
const addMedication = async (req, res) => {
    try {
        console.log('Adding medication payload:', req.body);
        const {
            medicineName,
            time, // "HH:MM" fallback
            scheduledTimes, // Optional: array of times "HH:MM"
            mealTiming, // "before" or "after"
            manufacturingDate, // Using as start_date
            expiryDate, // end_date
            quantityPerIntake,
            remainingQuantity,
            selectedDays // Array of days
        } = req.body;

        // Basic validation
        if (!medicineName || (!time && !scheduledTimes) || !expiryDate || !quantityPerIntake || !remainingQuantity) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Map mealTiming
        let dbMealType = 'after_meal';
        if (mealTiming === 'before' || mealTiming === 'before_meal') dbMealType = 'before_meal';

        const timesToSave = scheduledTimes && scheduledTimes.length > 0 ? scheduledTimes : [time];

        const medication = await Medication.create({
            patient_id: req.user.user_id,
            medicine_name: medicineName,
            dosage: `${quantityPerIntake} pill(s)`, // Storing generic string
            qty_per_dose: parseInt(quantityPerIntake),
            total_quantity: parseInt(remainingQuantity),
            remaining_quantity: parseInt(remainingQuantity),
            meal_type: dbMealType,
            scheduled_times: timesToSave, // Store complete array

            selected_days: selectedDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], // Store selected days
            start_date: manufacturingDate || new Date(),
            end_date: expiryDate,
            is_active: true
        });

        // Return mapped object
        const mappedMed = {
            _id: medication.medication_id,
            name: medication.medicine_name,
            dosage: medication.qty_per_dose,
            stock: medication.remaining_quantity,
            frequency: medication.scheduled_times[0],
            time: medication.scheduled_times[0],
            expiryDate: medication.end_date,
            manufacturingDate: medication.start_date,
            mealTiming: medication.meal_type === 'before_meal' ? 'Before Meal' : 'After Meal',
            isActive: medication.is_active,
            selectedDays: medication.selected_days // Include selected days
        };

        res.status(201).json({
            success: true,
            message: 'Medication added successfully',
            data: mappedMed
        });
    } catch (error) {
        console.error('Add medication error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding medication',
            error: error.message
        });
    }
};

/**
 * Take Medication
 * POST /api/patient/medications/:id/take
 */
const takeMedication = async (req, res) => {
    try {
        const { id } = req.params;
        const medication = await Medication.findOne({
            where: { medication_id: id, patient_id: req.user.user_id }
        });

        if (!medication) {
            return res.status(404).json({ success: false, message: 'Medication not found' });
        }

        if (medication.remaining_quantity < medication.qty_per_dose) {
            return res.status(400).json({ success: false, message: 'Insufficient quantity (Empty Stock)' });
        }

        const { taken_time, scheduled_time } = req.body;
        const actualScheduledTime = scheduled_time || medication.scheduled_times[0] || '00:00:00';
        const actualTakenTime = taken_time ? new Date(taken_time) : new Date();

        // Create Log using static method to calculate status (on_time, late, early) properly
        const log = await MedicationLog.createLog(
            id,
            req.user.user_id,
            actualScheduledTime,
            actualTakenTime,
            'Taken via dashboard'
        );

        // Reduce Quantity
        await medication.reduceQuantity();

        // Send Email Notification
        try {
            const { User } = require('../models');
            const emailService = require('../services/email.service');
            const patient = await User.findByPk(req.user.user_id);
            if (patient && patient.email) {
                // Map fields to what email service expects
                const mappedMedication = {
                    name: medication.medicine_name,
                    remainingQty: medication.remaining_quantity
                };
                const mappedLog = {
                    takenTime: log.taken_time,
                    delayMinutes: log.delay_minutes || 0
                };
                await emailService.sendMedicationTakenConfirmation(
                    patient.email, 
                    patient.full_name, 
                    mappedMedication, 
                    mappedLog
                );
            }
        } catch (emailErr) {
            console.error('Error sending taken email notification:', emailErr);
        }

        res.status(200).json({
            success: true,
            message: 'Medication marked as taken',
            data: {
                remainingQty: medication.remaining_quantity
            }
        });
    } catch (error) {
        console.error('Take medication error:', error);
        res.status(500).json({ success: false, message: 'Error taking medication', error: error.message });
    }
};

const updateMedication = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            medicineName,
            time,
            mealTiming,
            manufacturingDate,
            expiryDate,
            quantityPerIntake,
            remainingQuantity
        } = req.body;

        const medication = await Medication.findOne({
            where: { medication_id: id, patient_id: req.user.user_id }
        });

        if (!medication) {
            return res.status(404).json({ success: false, message: 'Medication not found' });
        }

        // Update fields
        if (medicineName) medication.medicine_name = medicineName;
        if (quantityPerIntake) medication.qty_per_dose = parseInt(quantityPerIntake);
        if (time) {
            medication.scheduled_times = Array.isArray(time) ? time : [time];
        }
        if (req.body.scheduledTimes) {
            medication.scheduled_times = Array.isArray(req.body.scheduledTimes) ? req.body.scheduledTimes : [req.body.scheduledTimes];
        }
        if (manufacturingDate) medication.start_date = manufacturingDate;
        if (expiryDate) medication.end_date = expiryDate;
        if (remainingQuantity) medication.remaining_quantity = parseInt(remainingQuantity);

        if (mealTiming) {
            const mt = (mealTiming === 'before' || mealTiming === 'before_meal') ? 'before_meal' : 'after_meal';
            medication.meal_type = mt;
        }

        await medication.save();

        res.status(200).json({
            success: true,
            message: 'Medication updated',
            data: {
                // Map back to frontend expected structure (optional but good for consistency)
                name: medication.medicine_name,
                time: medication.scheduled_times[0],
                mealTiming: medication.meal_type === 'before_meal' ? 'Before Meal' : 'After Meal',
                manufacturingDate: medication.start_date,
                expiryDate: medication.end_date,
                qtyPerDose: medication.qty_per_dose,
                remainingQty: medication.remaining_quantity,
                id: medication.medication_id
            }
        });
    } catch (err) {
        console.error('Update med error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

const deleteMedication = async (req, res) => {
    try {
        const deleted = await Medication.destroy({
            where: { medication_id: req.params.id, patient_id: req.user.user_id }
        });
        if (!deleted) return res.status(404).json({ message: 'Medication not found' });
        res.status(200).json({ success: true, message: 'Medication deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// ==================== APPOINTMENT OPERATIONS ====================

const getAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.findAll({
            where: { patient_id: req.user.user_id },
            order: [['appointment_date', 'ASC'], ['appointment_time', 'ASC']]
        });

        // Map keys for frontend
        const mapped = appointments.map(a => ({
            _id: a.appointment_id,
            doctor_name: a.doctor_name,
            specialization: a.specialization,
            date: a.appointment_date,
            time: a.appointment_time,
            location: a.hospital_name || a.address,
            status: a.status,
            notes: a.remarks || a.reason
        }));

        res.status(200).json({ success: true, data: mapped });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};

const getUpcomingAppointments = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const appointments = await Appointment.findAll({
            where: {
                patient_id: req.user.user_id,
                appointment_date: { [Op.gte]: today },
                status: 'scheduled'
            },
            order: [['appointment_date', 'ASC'], ['appointment_time', 'ASC']]
        });
        res.status(200).json({ success: true, count: appointments.length, data: appointments });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

const getPastAppointments = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const appointments = await Appointment.findAll({
            where: {
                patient_id: req.user.user_id,
                appointment_date: { [Op.lt]: today }
            },
            order: [['appointment_date', 'DESC'], ['appointment_time', 'DESC']]
        });
        res.status(200).json({ success: true, count: appointments.length, data: appointments });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

const getAppointment = async (req, res) => {
    // Placeholder
    res.status(501).json({ message: 'Not implemented yet' });
};

const addAppointment = async (req, res) => {
    try {
        const { doctorName, specialization, date, time, place, notes } = req.body;

        const appointment = await Appointment.create({
            patient_id: req.user.user_id,
            doctor_name: doctorName,
            specialization: specialization || null,
            appointment_date: date,
            appointment_time: time,
            hospital_name: place,
            address: place,
            reason: notes,
            status: 'scheduled'
        });

        res.status(201).json({ success: true, data: appointment });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};

const updateAppointment = async (req, res) => { res.status(501).json({ message: 'Not implemented' }); };
const deleteAppointment = async (req, res) => {
    try {
        await Appointment.destroy({ where: { appointment_id: req.params.id, patient_id: req.user.user_id } });
        res.status(200).json({ success: true });
    } catch (err) { res.status(500).json({ message: err.message }); }
};
const markAppointmentAttended = async (req, res) => { res.status(501).json({ message: 'Not implemented' }); };
const cancelAppointment = async (req, res) => { res.status(501).json({ message: 'Not implemented' }); };

const fs = require('fs');
const path = require('path');
const prescriptionsPath = path.join(__dirname, '../../prescriptions.json');

const getPrescriptions = async (req, res) => {
    try {
        let prescriptions = [];
        if (fs.existsSync(prescriptionsPath)) {
            prescriptions = JSON.parse(fs.readFileSync(prescriptionsPath, 'utf8'));
        }
        
        const myPrescriptions = prescriptions.filter(p => String(p.patient_id) === String(req.user.user_id));
        myPrescriptions.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        res.status(200).json({ success: true, data: myPrescriptions });
    } catch (err) {
        console.error('getPrescriptions error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch prescriptions' });
    }
};

const addPrescription = async (req, res) => {
    try {
        const { title, doctor_name, date, notes, image_url } = req.body;
        
        if (!title || !doctor_name || !date) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        
        let prescriptions = [];
        if (fs.existsSync(prescriptionsPath)) {
            prescriptions = JSON.parse(fs.readFileSync(prescriptionsPath, 'utf8'));
        }
        
        const newPrescription = {
            id: Date.now(),
            patient_id: req.user.user_id,
            title,
            doctor_name,
            date,
            notes: notes || null,
            image_url: image_url || null,
            created_at: new Date().toISOString()
        };
        
        prescriptions.unshift(newPrescription);
        fs.writeFileSync(prescriptionsPath, JSON.stringify(prescriptions, null, 2));
        
        res.status(201).json({
            success: true,
            message: 'Prescription added successfully',
            data: newPrescription
        });
    } catch (err) {
        console.error('addPrescription error:', err);
        res.status(500).json({ success: false, message: 'Failed to add prescription' });
    }
};
const getAssignedHelper = async (req, res) => {
    try {
        const { PatientHelper } = require('../models');
        const relationships = await PatientHelper.getPatientHelpers(req.user.user_id, true);
        
        if (relationships && relationships.length > 0) {
            const helper = relationships[0].helper; // Get the first active helper
            res.status(200).json({
                success: true,
                helper: {
                    id: helper.user_id,
                    name: helper.full_name,
                    email: helper.email,
                    mobile: helper.mobile || null
                }
            });
        } else {
            res.status(200).json({ success: true, helper: null });
        }
    } catch (err) {
        console.error('getAssignedHelper error:', err);
        res.status(500).json({ success: false, message: 'Could not fetch helper' });
    }
};

const contactHelper = async (req, res) => {
    try {
        const { PatientHelper, User } = require('../models');
        const { message } = req.body;
        
        const relationships = await PatientHelper.getPatientHelpers(req.user.user_id, true);
        if (!relationships || relationships.length === 0) {
            return res.status(404).json({ success: false, message: 'No helper assigned' });
        }
        
        const helper = relationships[0].helper;
        const patient = await User.findByPk(req.user.user_id);
        
        const emailService = require('../services/email.service');
        const subject = `Message from Patient: ${patient.full_name}`;
        const formattedMessage = message ? message.replace(/\n/g, '<br/>') : 'No additional message provided.';
        const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
            <h2>📞 Contact Request</h2>
            <p><strong>${patient.full_name}</strong> is trying to reach you regarding their care schedule.</p>
            <div style="background: #f4f6f8; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <h3>Patient Details:</h3>
                <p><strong>Name:</strong> ${patient.full_name}</p>
                <p><strong>Contact No:</strong> ${patient.mobile || 'Not available'}</p>
                <p><strong>Email:</strong> ${patient.email || 'Not available'}</p>
            </div>
            <p><strong>Message:</strong> ${formattedMessage}</p>
            <hr />
            <p style="color: #666; font-size: 14px;">Please login to your <strong>MedSmart Dashboard</strong> to review their current status.</p>
        </div>`;
        
        await emailService.sendEmail({ to: helper.email, subject, html });
        res.status(200).json({ success: true, message: 'Helper notified' });
        
    } catch (err) {
        console.error('contactHelper error:', err);
        res.status(500).json({ success: false, message: 'Could not contact helper' });
    }
};
const getMyScore = async (req, res) => { res.status(501).json({ message: 'Not implemented' }); };

module.exports = {
    getProfile,
    updateProfile,
    getMedications,
    getActiveMedications,
    addMedication,
    getMedication,
    updateMedication,
    deleteMedication,
    takeMedication,
    getAppointments,
    getUpcomingAppointments,
    getPastAppointments,
    getAppointment,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    markAppointmentAttended,
    cancelAppointment,
    getPrescriptions,
    addPrescription,
    getAssignedHelper,
    contactHelper,
    getMyScore
};
