/**
 * Helper Controller (Sequelize)
 * Business logic for helper-specific operations
 */

const { User, PatientHelper, Medication, Appointment, MedicationLog } = require('../models');
const { Op } = require('sequelize');

/**
 * Get Helper Profile
 * GET /api/helper/profile
 */
const getProfile = async (req, res) => {
    try {
        const helper = await User.findOne({
            where: { user_id: req.user.user_id, role: 'helper' },
            attributes: { exclude: ['password_hash'] }
        });

        if (!helper) {
            return res.status(404).json({
                success: false,
                message: 'Helper profile not found'
            });
        }

        // Get assigned patient count
        const assignedPatients = await PatientHelper.count({
            where: { helper_id: helper.user_id, is_active: true }
        });

        // Return profile with stats
        res.status(200).json({
            success: true,
            data: {
                ...helper.toJSON(),
                assignedPatients
            }
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
        const { full_name, age, gender, mobile, whatsapp, specialization, experience_years } = req.body;

        const helper = await User.findOne({
            where: { user_id: req.user.user_id, role: 'helper' }
        });

        if (!helper) {
            return res.status(404).json({
                success: false,
                message: 'Helper profile not found'
            });
        }

        // Update fields
        await helper.update({
            full_name: full_name || helper.full_name,
            age: age || helper.age,
            gender: gender || helper.gender,
            mobile: mobile || helper.mobile,
            whatsapp: whatsapp || helper.whatsapp,
            // Add other fields if schema supports them, ignoring specialization/experience for now as they might not be on User table
        });

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                user_id: helper.user_id,
                full_name: helper.full_name,
                email: helper.email,
                age: helper.age,
                gender: helper.gender,
                mobile: helper.mobile,
                whatsapp: helper.whatsapp
            }
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

/**
 * Get Helper Dashboard Stats
 * GET /api/helper/dashboard-stats
 */
const getDashboardStats = async (req, res) => {
    try {
        const helperId = req.user.user_id;

        // 1. Assigned Patients
        const assignedPatients = await PatientHelper.count({
            where: { helper_id: helperId, is_active: true }
        });

        // 2. Tasks Completed (Mock logic for now as 'Task' model might not exist or be defined differently)
        // We could count 'completed' medication logs for assigned patients maybe?
        // For now, returning 0 or calculating from logs if feasible.

        // Get all patient IDs assigned to this helper
        const relationships = await PatientHelper.findAll({
            where: { helper_id: helperId, is_active: true },
            attributes: ['patient_id']
        });
        const patientIds = relationships.map(r => r.patient_id);

        let tasksCompleted = 0;

        if (patientIds.length > 0) {
            // Count medications taken today by these patients
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            tasksCompleted = await MedicationLog.count({
                where: {
                    patient_id: { [Op.in]: patientIds },
                    taken_time: {
                        [Op.gte]: today,
                        [Op.lt]: tomorrow
                    }
                }
            });
        }

        res.status(200).json({
            success: true,
            stats: {
                assignedPatients,
                tasksCompleted,
                daysActive: 1, // Calculate from created_at
                responseTime: '< 5 min' // Placeholder
            }
        });

    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching stats',
            error: error.message
        });
    }
};

/**
 * Get Assigned Patients
 * GET /api/helper/patients
 */
const getAssignedPatients = async (req, res) => {
    try {
        const relationships = await PatientHelper.findAll({
            where: { helper_id: req.user.user_id, is_active: true },
            include: [{
                model: User,
                as: 'patient',
                attributes: ['user_id', 'full_name', 'email', 'age', 'gender', 'mobile', 'whatsapp']
            }]
        });

        const patients = relationships.map(r => r.patient);

        // Enhance with stats for each patient
        const patientsWithStats = await Promise.all(patients.map(async (patient) => {
            // Get today's medication count
            const medCount = await Medication.count({
                where: { patient_id: patient.user_id, is_active: true }
            });

            // Get upcoming appointment count
            const today = new Date().toISOString().split('T')[0];
            const aptCount = await Appointment.count({
                where: {
                    patient_id: patient.user_id,
                    appointment_date: { [Op.gte]: today },
                    status: 'scheduled'
                }
            });

            return {
                ...patient.toJSON(),
                stats: {
                    medicationsToday: medCount,
                    upcomingAppointments: aptCount,
                    complianceRate: 0 // TODO: implement compliance calculation
                }
            };
        }));

        res.status(200).json({
            success: true,
            data: patientsWithStats,
            count: patientsWithStats.length
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

// ... (Rest of the read-only endpoints for patient details would follow similar pattern using Sequelize)

// Helper to check access
const checkAccess = async (helperId, patientId) => {
    const relationship = await PatientHelper.findOne({
        where: { helper_id: helperId, patient_id: patientId, is_active: true }
    });
    return !!relationship;
};

/**
 * Get Patient Details
 * GET /api/helper/patients/:id
 */
const getPatientDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const helperId = req.user.user_id;

        // Check access
        const hasAccess = await checkAccess(helperId, id);
        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You are not assigned to this patient.'
            });
        }

        const patient = await User.findByPk(id, {
            attributes: { exclude: ['password_hash'] }
        });

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found'
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

/**
 * Get Patient Medications
 * GET /api/helper/patients/:id/medications
 */
const getPatientMedications = async (req, res) => {
    try {
        const { id } = req.params;

        if (!await checkAccess(req.user.user_id, id)) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const medications = await Medication.findAll({
            where: { patient_id: id, is_active: true },
            order: [['created_at', 'DESC']]
        });

        res.status(200).json({
            success: true,
            data: medications
        });
    } catch (error) {
        console.error('Get patient medications error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching medications',
            error: error.message
        });
    }
};

/**
 * Get Patient Appointments
 * GET /api/helper/patients/:id/appointments
 */
const getPatientAppointments = async (req, res) => {
    try {
        const { id } = req.params;

        if (!await checkAccess(req.user.user_id, id)) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const appointments = await Appointment.findAll({
            where: { patient_id: id },
            order: [['appointment_date', 'ASC'], ['appointment_time', 'ASC']]
        });

        const formattedAppointments = appointments.map(apt => ({
            _id: apt.appointment_id,
            doctor_name: apt.doctor_name,
            specialization: apt.specialization,
            date: apt.appointment_date,
            time: apt.appointment_time,
            location: apt.hospital_name || apt.address,
            status: apt.status,
            notes: apt.remarks || apt.reason
        }));

        res.status(200).json({
            success: true,
            data: formattedAppointments
        });
    } catch (error) {
        console.error('Get patient appointments error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching appointments',
            error: error.message
        });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    getDashboardStats,
    getAssignedPatients,
    getPatientDetails,
    getPatientMedications,
    getPatientAppointments,
    // Placeholders for others if needed
    getPatientActiveMedications: async (req, res) => res.status(501).json({ message: 'Not implemented yet' }),
    getPatientMedication: async (req, res) => res.status(501).json({ message: 'Not implemented yet' }),
    getPatientUpcomingAppointments: async (req, res) => res.status(501).json({ message: 'Not implemented yet' }),
    getPatientAppointment: async (req, res) => res.status(501).json({ message: 'Not implemented yet' }),
    getPatientStats: async (req, res) => res.status(501).json({ message: 'Not implemented yet' }),
};
