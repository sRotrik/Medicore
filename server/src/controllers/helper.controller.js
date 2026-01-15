/**
 * Helper Controller
 * Business logic for helper-specific operations
 * Read-only access to assigned patients' data
 */

const { Helper, Patient, Medication, Appointment } = require('../models');

/**
 * Get Helper Profile
 * GET /api/helper/profile
 */
const getProfile = async (req, res) => {
    try {
        const helper = await Helper.findOne({ userId: req.user.userId })
            .populate('userId', '-passwordHash')
            .populate('assignedPatients', 'fullName age gender contactNumber');

        if (!helper) {
            return res.status(404).json({
                success: false,
                message: 'Helper profile not found'
            });
        }

        res.status(200).json({
            success: true,
            data: helper
        });
    } catch (error) {
        console.error('Get helper profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching helper profile',
            error: error.message
        });
    }
};

/**
 * Update Helper Profile
 * PUT /api/helper/profile
 */
const updateProfile = async (req, res) => {
    try {
        const { fullName, age, gender, contactNumber } = req.body;

        const helper = await Helper.findOne({ userId: req.user.userId });

        if (!helper) {
            return res.status(404).json({
                success: false,
                message: 'Helper profile not found'
            });
        }

        // Update fields
        if (fullName) helper.fullName = fullName;
        if (age) helper.age = age;
        if (gender) helper.gender = gender;
        if (contactNumber) helper.contactNumber = contactNumber;

        await helper.save();

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: helper
        });
    } catch (error) {
        console.error('Update helper profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile',
            error: error.message
        });
    }
};

// ==================== ASSIGNED PATIENTS ====================

/**
 * Get All Assigned Patients
 * GET /api/helper/patients
 */
const getAssignedPatients = async (req, res) => {
    try {
        const helper = await Helper.findOne({ userId: req.user.userId })
            .populate('assignedPatients');

        if (!helper) {
            return res.status(404).json({
                success: false,
                message: 'Helper profile not found'
            });
        }

        // Get detailed patient info with stats
        const patientsWithStats = await Promise.all(
            helper.assignedPatients.map(async (patient) => {
                // Get today's medications
                const now = new Date();
                const medications = await Medication.find({
                    patientId: patient._id,
                    isActive: true,
                    startDate: { $lte: now },
                    endDate: { $gte: now }
                });

                const medicationsToday = medications.length;
                const medicationsTaken = medications.filter(med => med.isTakenToday()).length;

                // Get upcoming appointments
                const upcomingAppointments = await Appointment.countDocuments({
                    patientId: patient._id,
                    date: { $gte: now },
                    status: 'scheduled'
                });

                // Calculate compliance rate
                const complianceRate = medicationsToday > 0
                    ? Math.round((medicationsTaken / medicationsToday) * 100)
                    : 0;

                return {
                    id: patient._id,
                    fullName: patient.fullName,
                    age: patient.age,
                    gender: patient.gender,
                    contactNumber: patient.contactNumber,
                    stats: {
                        medicationsToday,
                        medicationsTaken,
                        upcomingAppointments,
                        complianceRate
                    }
                };
            })
        );

        res.status(200).json({
            success: true,
            count: patientsWithStats.length,
            data: patientsWithStats
        });
    } catch (error) {
        console.error('Get assigned patients error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching assigned patients',
            error: error.message
        });
    }
};

/**
 * Get Single Patient Details
 * GET /api/helper/patients/:id
 */
const getPatientDetails = async (req, res) => {
    try {
        const helper = await Helper.findOne({ userId: req.user.userId });

        if (!helper) {
            return res.status(404).json({
                success: false,
                message: 'Helper profile not found'
            });
        }

        const patient = await Patient.findById(req.params.id);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found'
            });
        }

        // Verify patient is assigned to this helper
        if (patient.helperId?.toString() !== helper._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. This patient is not assigned to you.'
            });
        }

        res.status(200).json({
            success: true,
            data: patient
        });
    } catch (error) {
        console.error('Get patient details error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching patient details',
            error: error.message
        });
    }
};

// ==================== PATIENT MEDICATIONS (READ-ONLY) ====================

/**
 * Get Patient Medications
 * GET /api/helper/patients/:id/medications
 */
const getPatientMedications = async (req, res) => {
    try {
        const helper = await Helper.findOne({ userId: req.user.userId });

        if (!helper) {
            return res.status(404).json({
                success: false,
                message: 'Helper profile not found'
            });
        }

        const patient = await Patient.findById(req.params.id);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found'
            });
        }

        // Verify patient is assigned to this helper
        if (patient.helperId?.toString() !== helper._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. This patient is not assigned to you.'
            });
        }

        const medications = await Medication.find({ patientId: patient._id })
            .sort({ scheduledTime: 1 });

        res.status(200).json({
            success: true,
            count: medications.length,
            data: medications,
            note: 'Read-only access. Helpers cannot modify medication data.'
        });
    } catch (error) {
        console.error('Get patient medications error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching patient medications',
            error: error.message
        });
    }
};

/**
 * Get Patient Active Medications
 * GET /api/helper/patients/:id/medications/active
 */
const getPatientActiveMedications = async (req, res) => {
    try {
        const helper = await Helper.findOne({ userId: req.user.userId });

        if (!helper) {
            return res.status(404).json({
                success: false,
                message: 'Helper profile not found'
            });
        }

        const patient = await Patient.findById(req.params.id);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found'
            });
        }

        // Verify patient is assigned to this helper
        if (patient.helperId?.toString() !== helper._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. This patient is not assigned to you.'
            });
        }

        const medications = await Medication.getActiveForPatient(patient._id);

        res.status(200).json({
            success: true,
            count: medications.length,
            data: medications,
            note: 'Read-only access. Helpers cannot modify medication data.'
        });
    } catch (error) {
        console.error('Get patient active medications error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching patient active medications',
            error: error.message
        });
    }
};

/**
 * Get Single Patient Medication
 * GET /api/helper/patients/:patientId/medications/:medicationId
 */
const getPatientMedication = async (req, res) => {
    try {
        const helper = await Helper.findOne({ userId: req.user.userId });

        if (!helper) {
            return res.status(404).json({
                success: false,
                message: 'Helper profile not found'
            });
        }

        const patient = await Patient.findById(req.params.patientId);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found'
            });
        }

        // Verify patient is assigned to this helper
        if (patient.helperId?.toString() !== helper._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. This patient is not assigned to you.'
            });
        }

        const medication = await Medication.findOne({
            _id: req.params.medicationId,
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
            data: medication,
            note: 'Read-only access. Helpers cannot modify medication data.'
        });
    } catch (error) {
        console.error('Get patient medication error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching patient medication',
            error: error.message
        });
    }
};

// ==================== PATIENT APPOINTMENTS (READ-ONLY) ====================

/**
 * Get Patient Appointments
 * GET /api/helper/patients/:id/appointments
 */
const getPatientAppointments = async (req, res) => {
    try {
        const helper = await Helper.findOne({ userId: req.user.userId });

        if (!helper) {
            return res.status(404).json({
                success: false,
                message: 'Helper profile not found'
            });
        }

        const patient = await Patient.findById(req.params.id);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found'
            });
        }

        // Verify patient is assigned to this helper
        if (patient.helperId?.toString() !== helper._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. This patient is not assigned to you.'
            });
        }

        const appointments = await Appointment.find({ patientId: patient._id })
            .sort({ date: 1, time: 1 });

        res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments,
            note: 'Read-only access. Helpers cannot modify appointment data.'
        });
    } catch (error) {
        console.error('Get patient appointments error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching patient appointments',
            error: error.message
        });
    }
};

/**
 * Get Patient Upcoming Appointments
 * GET /api/helper/patients/:id/appointments/upcoming
 */
const getPatientUpcomingAppointments = async (req, res) => {
    try {
        const helper = await Helper.findOne({ userId: req.user.userId });

        if (!helper) {
            return res.status(404).json({
                success: false,
                message: 'Helper profile not found'
            });
        }

        const patient = await Patient.findById(req.params.id);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found'
            });
        }

        // Verify patient is assigned to this helper
        if (patient.helperId?.toString() !== helper._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. This patient is not assigned to you.'
            });
        }

        const appointments = await Appointment.getUpcomingForPatient(patient._id);

        res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments,
            note: 'Read-only access. Helpers cannot modify appointment data.'
        });
    } catch (error) {
        console.error('Get patient upcoming appointments error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching patient upcoming appointments',
            error: error.message
        });
    }
};

/**
 * Get Single Patient Appointment
 * GET /api/helper/patients/:patientId/appointments/:appointmentId
 */
const getPatientAppointment = async (req, res) => {
    try {
        const helper = await Helper.findOne({ userId: req.user.userId });

        if (!helper) {
            return res.status(404).json({
                success: false,
                message: 'Helper profile not found'
            });
        }

        const patient = await Patient.findById(req.params.patientId);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found'
            });
        }

        // Verify patient is assigned to this helper
        if (patient.helperId?.toString() !== helper._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. This patient is not assigned to you.'
            });
        }

        const appointment = await Appointment.findOne({
            _id: req.params.appointmentId,
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
            data: appointment,
            note: 'Read-only access. Helpers cannot modify appointment data.'
        });
    } catch (error) {
        console.error('Get patient appointment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching patient appointment',
            error: error.message
        });
    }
};

// ==================== PATIENT STATS (READ-ONLY) ====================

/**
 * Get Patient Stats
 * GET /api/helper/patients/:id/stats
 */
const getPatientStats = async (req, res) => {
    try {
        const helper = await Helper.findOne({ userId: req.user.userId });

        if (!helper) {
            return res.status(404).json({
                success: false,
                message: 'Helper profile not found'
            });
        }

        const patient = await Patient.findById(req.params.id);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found'
            });
        }

        // Verify patient is assigned to this helper
        if (patient.helperId?.toString() !== helper._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. This patient is not assigned to you.'
            });
        }

        const now = new Date();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get all active medications
        const medications = await Medication.find({
            patientId: patient._id,
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: now }
        });

        // Calculate today's stats
        let onTime = 0;
        let late = 0;
        let missed = 0;
        let upcoming = 0;
        let totalDelay = 0;
        let delayCount = 0;

        medications.forEach(med => {
            const todayLog = med.getTodayLog();
            const [schedHours, schedMinutes] = med.scheduledTime.split(':').map(Number);
            const scheduledTime = new Date(today);
            scheduledTime.setHours(schedHours, schedMinutes, 0, 0);

            if (todayLog) {
                if (todayLog.delayMinutes === 0) {
                    onTime++;
                } else if (todayLog.delayMinutes > 0) {
                    late++;
                    totalDelay += todayLog.delayMinutes;
                    delayCount++;
                }
            } else if (now > scheduledTime) {
                missed++;
            } else {
                upcoming++;
            }
        });

        const avgDelay = delayCount > 0 ? Math.round(totalDelay / delayCount) : 0;
        const complianceRate = medications.length > 0
            ? Math.round(((onTime + late) / medications.length) * 100)
            : 0;

        // Get appointments
        const upcomingAppointments = await Appointment.countDocuments({
            patientId: patient._id,
            date: { $gte: now },
            status: 'scheduled'
        });

        res.status(200).json({
            success: true,
            data: {
                medications: {
                    total: medications.length,
                    onTime,
                    late,
                    missed,
                    upcoming,
                    avgDelay,
                    complianceRate
                },
                appointments: {
                    upcoming: upcomingAppointments
                }
            }
        });
    } catch (error) {
        console.error('Get patient stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching patient stats',
            error: error.message
        });
    }
};

module.exports = {
    // Profile
    getProfile,
    updateProfile,

    // Assigned Patients
    getAssignedPatients,
    getPatientDetails,

    // Patient Medications (Read-Only)
    getPatientMedications,
    getPatientActiveMedications,
    getPatientMedication,

    // Patient Appointments (Read-Only)
    getPatientAppointments,
    getPatientUpcomingAppointments,
    getPatientAppointment,

    // Patient Stats (Read-Only)
    getPatientStats
};
