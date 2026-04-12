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
        const { full_name, age, gender, mobile, whatsapp } = req.body;

        const patient = await User.findByPk(req.user.user_id);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found'
            });
        }

        await patient.update({
            full_name: full_name || patient.full_name,
            age: age || patient.age,
            gender: gender || patient.gender,
            mobile: mobile || patient.mobile,
            whatsapp: whatsapp || patient.whatsapp
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
        const medications = await Medication.findAll({
            where: { patient_id: req.user.user_id },
            order: [['created_at', 'DESC']]
        });

        // Map to match frontend expectations if necessary
        // Frontend expects: _id (or id), name, dosage, etc.
        // Sequelize returns object with fields.
        // Let's return raw data and handle mapping in Frontend if needed, 
        // OR map it here. Frontend Context expects: _id, name, frequency (time?), dosage, stock.
        const mappedMeds = medications.map(m => ({
            _id: m.medication_id,
            name: m.medicine_name,
            dosage: m.qty_per_dose,
            stock: m.remaining_quantity,
            frequency: m.scheduled_times ? m.scheduled_times[0] : '', // Use first time as 'frequency' for now
            time: m.scheduled_times ? m.scheduled_times[0] : '', // Explicit time field
            expiryDate: m.end_date,
            manufacturingDate: m.start_date, // Mapping start_date to mfg date for consistency
            mealTiming: m.meal_type === 'before_meal' ? 'Before Meal' : 'After Meal',
            isActive: m.is_active
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
            time, // "HH:MM"
            mealTiming, // "before" or "after"
            manufacturingDate, // Using as start_date
            expiryDate, // end_date
            quantityPerIntake,
            remainingQuantity,
            selectedDays // Array of days
        } = req.body;

        // Basic validation
        if (!medicineName || !time || !expiryDate || !quantityPerIntake || !remainingQuantity) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Map mealTiming
        let dbMealType = 'after_meal';
        if (mealTiming === 'before' || mealTiming === 'before_meal') dbMealType = 'before_meal';

        const medication = await Medication.create({
            patient_id: req.user.user_id,
            medicine_name: medicineName,
            dosage: `${quantityPerIntake} pill(s)`, // Storing generic string
            qty_per_dose: parseInt(quantityPerIntake),
            total_quantity: parseInt(remainingQuantity),
            remaining_quantity: parseInt(remainingQuantity),
            meal_type: dbMealType,
            scheduled_times: [time], // Store as array
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

        // Create Log
        await MedicationLog.create({
            medication_id: id,
            patient_id: req.user.user_id,
            scheduled_time: medication.scheduled_times[0] || '00:00:00',
            taken_time: new Date(),
            status: 'on_time',
            notes: 'Taken via dashboard'
        });

        // Reduce Quantity
        await medication.reduceQuantity();

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
        if (time) medication.scheduled_times = [time];
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
    cancelAppointment
};
