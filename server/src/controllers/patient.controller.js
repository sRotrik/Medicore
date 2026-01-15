/**
 * Patient Controller
 * Business logic for patient-specific operations
 * Handles medications, appointments, and patient profile
 */

const { Patient, Medication, Appointment, Notification } = require('../models');

/**
 * Get Patient Profile
 * GET /api/patient/profile
 */
const getProfile = async (req, res) => {
    try {
        const patient = await Patient.findOne({ userId: req.user.userId })
            .populate('userId', '-passwordHash')
            .populate('helperId', 'fullName contactNumber verificationId');

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
        const { fullName, age, gender, contactNumber, whatsappEnabled } = req.body;

        const patient = await Patient.findOne({ userId: req.user.userId });

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient profile not found'
            });
        }

        // Update fields
        if (fullName) patient.fullName = fullName;
        if (age) patient.age = age;
        if (gender) patient.gender = gender;
        if (contactNumber) patient.contactNumber = contactNumber;
        if (whatsappEnabled !== undefined) patient.whatsappEnabled = whatsappEnabled;

        await patient.save();

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
        const patient = await Patient.findOne({ userId: req.user.userId });

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient profile not found'
            });
        }

        const medications = await Medication.find({ patientId: patient._id })
            .sort({ scheduledTime: 1 });

        res.status(200).json({
            success: true,
            count: medications.length,
            data: medications
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
        const patient = await Patient.findOne({ userId: req.user.userId });

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient profile not found'
            });
        }

        const medications = await Medication.getActiveForPatient(patient._id);

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
        const patient = await Patient.findOne({ userId: req.user.userId });

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient profile not found'
            });
        }

        const medication = await Medication.findOne({
            _id: req.params.id,
            patientId: patient._id
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
        const patient = await Patient.findOne({ userId: req.user.userId });

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient profile not found'
            });
        }

        const {
            name,
            qtyPerDose,
            totalQty,
            scheduledTime,
            mealType,
            startDate,
            endDate,
            remarks
        } = req.body;

        // Validate required fields
        if (!name || !qtyPerDose || !totalQty || !scheduledTime || !mealType || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields: name, qtyPerDose, totalQty, scheduledTime, mealType, startDate, endDate'
            });
        }

        // Create medication
        const medication = await Medication.create({
            patientId: patient._id,
            name,
            qtyPerDose,
            totalQty,
            remainingQty: totalQty,
            scheduledTime,
            mealType,
            startDate,
            endDate,
            remarks: remarks || ''
        });

        res.status(201).json({
            success: true,
            message: 'Medication added successfully',
            data: medication
        });
    } catch (error) {
        console.error('Add medication error:', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: messages
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error adding medication',
            error: error.message
        });
    }
};

/**
 * Mark Medication as Taken
 * POST /api/patient/medications/:id/take
 */
const takeMedication = async (req, res) => {
    try {
        const patient = await Patient.findOne({ userId: req.user.userId });

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient profile not found'
            });
        }

        const medication = await Medication.findOne({
            _id: req.params.id,
            patientId: patient._id
        });

        if (!medication) {
            return res.status(404).json({
                success: false,
                message: 'Medication not found'
            });
        }

        // Check if medication is active
        if (!medication.isActive) {
            return res.status(400).json({
                success: false,
                message: 'This medication is no longer active'
            });
        }

        // Check if remaining quantity is available
        if (medication.remainingQty < medication.qtyPerDose) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient remaining quantity. Please refill your medication.',
                remainingQty: medication.remainingQty,
                qtyPerDose: medication.qtyPerDose
            });
        }

        // Check if already taken today
        if (medication.isTakenToday()) {
            return res.status(400).json({
                success: false,
                message: 'You have already taken this medication today',
                takenLog: medication.getTodayLog()
            });
        }

        // Mark as taken
        const takenTime = req.body.takenTime ? new Date(req.body.takenTime) : new Date();
        const result = await medication.markAsTaken(takenTime);

        res.status(200).json({
            success: true,
            message: 'Medication marked as taken',
            data: {
                medication: {
                    id: medication._id,
                    name: medication.name,
                    remainingQty: result.remainingQty,
                    isActive: medication.isActive
                },
                log: {
                    takenTime: result.takenTime,
                    delayMinutes: result.delayMinutes,
                    status: result.delayMinutes === 0 ? 'On Time' : result.delayMinutes > 0 ? 'Late' : 'Early'
                }
            }
        });
    } catch (error) {
        console.error('Take medication error:', error);
        res.status(500).json({
            success: false,
            message: 'Error marking medication as taken',
            error: error.message
        });
    }
};

/**
 * Update Medication
 * PUT /api/patient/medications/:id
 */
const updateMedication = async (req, res) => {
    try {
        const patient = await Patient.findOne({ userId: req.user.userId });

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient profile not found'
            });
        }

        const medication = await Medication.findOne({
            _id: req.params.id,
            patientId: patient._id
        });

        if (!medication) {
            return res.status(404).json({
                success: false,
                message: 'Medication not found'
            });
        }

        const {
            name,
            qtyPerDose,
            totalQty,
            scheduledTime,
            mealType,
            startDate,
            endDate,
            remarks
        } = req.body;

        // Update fields
        if (name) medication.name = name;
        if (qtyPerDose) medication.qtyPerDose = qtyPerDose;
        if (totalQty) medication.totalQty = totalQty;
        if (scheduledTime) medication.scheduledTime = scheduledTime;
        if (mealType) medication.mealType = mealType;
        if (startDate) medication.startDate = startDate;
        if (endDate) medication.endDate = endDate;
        if (remarks !== undefined) medication.remarks = remarks;

        await medication.save();

        res.status(200).json({
            success: true,
            message: 'Medication updated successfully',
            data: medication
        });
    } catch (error) {
        console.error('Update medication error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating medication',
            error: error.message
        });
    }
};

/**
 * Delete Medication
 * DELETE /api/patient/medications/:id
 */
const deleteMedication = async (req, res) => {
    try {
        const patient = await Patient.findOne({ userId: req.user.userId });

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient profile not found'
            });
        }

        const medication = await Medication.findOne({
            _id: req.params.id,
            patientId: patient._id
        });

        if (!medication) {
            return res.status(404).json({
                success: false,
                message: 'Medication not found'
            });
        }

        await medication.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Medication deleted successfully'
        });
    } catch (error) {
        console.error('Delete medication error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting medication',
            error: error.message
        });
    }
};

// ==================== APPOINTMENT OPERATIONS ====================

/**
 * Get All Appointments
 * GET /api/patient/appointments
 */
const getAppointments = async (req, res) => {
    try {
        const patient = await Patient.findOne({ userId: req.user.userId });

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient profile not found'
            });
        }

        const appointments = await Appointment.find({ patientId: patient._id })
            .sort({ date: 1, time: 1 });

        res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments
        });
    } catch (error) {
        console.error('Get appointments error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching appointments',
            error: error.message
        });
    }
};

/**
 * Get Upcoming Appointments
 * GET /api/patient/appointments/upcoming
 */
const getUpcomingAppointments = async (req, res) => {
    try {
        const patient = await Patient.findOne({ userId: req.user.userId });

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient profile not found'
            });
        }

        const appointments = await Appointment.getUpcomingForPatient(patient._id);

        res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments
        });
    } catch (error) {
        console.error('Get upcoming appointments error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching upcoming appointments',
            error: error.message
        });
    }
};

/**
 * Get Past Appointments
 * GET /api/patient/appointments/past
 */
const getPastAppointments = async (req, res) => {
    try {
        const patient = await Patient.findOne({ userId: req.user.userId });

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient profile not found'
            });
        }

        const appointments = await Appointment.getPastForPatient(patient._id);

        res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments
        });
    } catch (error) {
        console.error('Get past appointments error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching past appointments',
            error: error.message
        });
    }
};

/**
 * Get Single Appointment
 * GET /api/patient/appointments/:id
 */
const getAppointment = async (req, res) => {
    try {
        const patient = await Patient.findOne({ userId: req.user.userId });

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient profile not found'
            });
        }

        const appointment = await Appointment.findOne({
            _id: req.params.id,
            patientId: patient._id
        });

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        res.status(200).json({
            success: true,
            data: appointment
        });
    } catch (error) {
        console.error('Get appointment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching appointment',
            error: error.message
        });
    }
};

/**
 * Add Appointment
 * POST /api/patient/appointments
 */
const addAppointment = async (req, res) => {
    try {
        const patient = await Patient.findOne({ userId: req.user.userId });

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient profile not found'
            });
        }

        const {
            doctorName,
            contact,
            date,
            time,
            place,
            remarks
        } = req.body;

        // Validate required fields
        if (!doctorName || !contact || !date || !time || !place) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields: doctorName, contact, date, time, place'
            });
        }

        // Create appointment
        const appointment = await Appointment.create({
            patientId: patient._id,
            doctorName,
            contact,
            date,
            time,
            place,
            remarks: remarks || ''
        });

        res.status(201).json({
            success: true,
            message: 'Appointment added successfully',
            data: appointment
        });
    } catch (error) {
        console.error('Add appointment error:', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: messages
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error adding appointment',
            error: error.message
        });
    }
};

/**
 * Update Appointment
 * PUT /api/patient/appointments/:id
 */
const updateAppointment = async (req, res) => {
    try {
        const patient = await Patient.findOne({ userId: req.user.userId });

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient profile not found'
            });
        }

        const appointment = await Appointment.findOne({
            _id: req.params.id,
            patientId: patient._id
        });

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        const {
            doctorName,
            contact,
            date,
            time,
            place,
            remarks,
            status
        } = req.body;

        // Update fields
        if (doctorName) appointment.doctorName = doctorName;
        if (contact) appointment.contact = contact;
        if (date) appointment.date = date;
        if (time) appointment.time = time;
        if (place) appointment.place = place;
        if (remarks !== undefined) appointment.remarks = remarks;
        if (status) appointment.status = status;

        await appointment.save();

        res.status(200).json({
            success: true,
            message: 'Appointment updated successfully',
            data: appointment
        });
    } catch (error) {
        console.error('Update appointment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating appointment',
            error: error.message
        });
    }
};

/**
 * Mark Appointment as Attended
 * POST /api/patient/appointments/:id/attend
 */
const markAppointmentAttended = async (req, res) => {
    try {
        const patient = await Patient.findOne({ userId: req.user.userId });

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient profile not found'
            });
        }

        const appointment = await Appointment.findOne({
            _id: req.params.id,
            patientId: patient._id
        });

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        await appointment.markAsAttended();

        res.status(200).json({
            success: true,
            message: 'Appointment marked as attended',
            data: appointment
        });
    } catch (error) {
        console.error('Mark attended error:', error);
        res.status(500).json({
            success: false,
            message: 'Error marking appointment as attended',
            error: error.message
        });
    }
};

/**
 * Cancel Appointment
 * POST /api/patient/appointments/:id/cancel
 */
const cancelAppointment = async (req, res) => {
    try {
        const patient = await Patient.findOne({ userId: req.user.userId });

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient profile not found'
            });
        }

        const appointment = await Appointment.findOne({
            _id: req.params.id,
            patientId: patient._id
        });

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        await appointment.cancel();

        res.status(200).json({
            success: true,
            message: 'Appointment cancelled successfully',
            data: appointment
        });
    } catch (error) {
        console.error('Cancel appointment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error cancelling appointment',
            error: error.message
        });
    }
};

/**
 * Delete Appointment
 * DELETE /api/patient/appointments/:id
 */
const deleteAppointment = async (req, res) => {
    try {
        const patient = await Patient.findOne({ userId: req.user.userId });

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient profile not found'
            });
        }

        const appointment = await Appointment.findOne({
            _id: req.params.id,
            patientId: patient._id
        });

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        await appointment.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Appointment deleted successfully'
        });
    } catch (error) {
        console.error('Delete appointment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting appointment',
            error: error.message
        });
    }
};

module.exports = {
    // Profile
    getProfile,
    updateProfile,

    // Medications
    getMedications,
    getActiveMedications,
    getMedication,
    addMedication,
    takeMedication,
    updateMedication,
    deleteMedication,

    // Appointments
    getAppointments,
    getUpcomingAppointments,
    getPastAppointments,
    getAppointment,
    addAppointment,
    updateAppointment,
    markAppointmentAttended,
    cancelAppointment,
    deleteAppointment
};
