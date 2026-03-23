/**
 * Admin Controller
 * Handles admin-specific operations like helper approval, user management, stats
 */

const { User, Medication, Appointment, MedicationLog, PatientHelper } = require('../models');
const { Op } = require('sequelize');

/**
 * Get System Statistics
 * GET /api/admin/stats
 */
const getSystemStats = async (req, res) => {
    try {
        // Count users by role
        const totalHelpers = await User.count({ where: { role: 'helper' } });
        const activeHelpers = await User.count({ where: { role: 'helper', is_active: true } });
        const inactiveHelpers = totalHelpers - activeHelpers;
        const totalPatients = await User.count({ where: { role: 'patient' } });

        // Count medications and appointments
        const totalMedications = await Medication.count();
        const totalAppointments = await Appointment.count();

        // Calculate compliance rate (simplified)
        const avgComplianceRate = 0; // Will calculate from medication logs

        res.status(200).json({
            success: true,
            stats: {
                totalHelpers,
                activeHelpers,
                inactiveHelpers,
                totalPatients,
                totalMedications,
                totalAppointments,
                avgComplianceRate,
                criticalAlerts: 0
            },
            recentActivity: []
        });

    } catch (error) {
        console.error('Get system stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching system statistics',
            error: error.message
        });
    }
};

/**
 * Get All Helpers
 * GET /api/admin/helpers
 */
const getAllHelpers = async (req, res) => {
    try {
        const helpers = await User.findAll({
            where: { role: 'helper' },
            attributes: { exclude: ['password_hash'] },
            order: [['created_at', 'DESC']]
        });

        res.status(200).json({
            success: true,
            helpers: helpers.map(helper => ({
                id: helper.user_id,
                user_id: helper.user_id,
                fullName: helper.full_name,
                email: helper.email,
                age: helper.age,
                gender: helper.gender,
                contactNumber: helper.mobile,
                mobile: helper.mobile,
                whatsapp: helper.whatsapp,
                verificationId: helper.verification_id || 'N/A',
                joinedDate: helper.created_at,
                status: helper.is_active ? 'active' : 'inactive',
                verified: helper.is_active,
                is_active: helper.is_active,
                stats: {
                    assignedPatients: 0,
                    tasksCompleted: 0,
                    avgResponseTime: 'N/A',
                    performanceScore: 0,
                    trend: 'neutral'
                }
            }))
        });

    } catch (error) {
        console.error('Get helpers error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching helpers',
            error: error.message
        });
    }
};

/**
 * Approve Helper
 * POST /api/admin/helpers/:id/approve
 */
const approveHelper = async (req, res) => {
    try {
        const { id } = req.params;

        // Find helper
        const helper = await User.findOne({
            where: {
                user_id: id,
                role: 'helper'
            }
        });

        if (!helper) {
            return res.status(404).json({
                success: false,
                message: 'Helper not found'
            });
        }

        // Check if already active
        if (helper.is_active) {
            return res.status(400).json({
                success: false,
                message: 'Helper is already approved and active'
            });
        }

        // Approve helper (set is_active to true)
        await helper.update({ is_active: true });

        // TODO: Send email/SMS notification to helper

        res.status(200).json({
            success: true,
            message: `Helper ${helper.full_name} has been approved successfully`,
            helper: {
                user_id: helper.user_id,
                email: helper.email,
                full_name: helper.full_name,
                is_active: helper.is_active
            }
        });

    } catch (error) {
        console.error('Approve helper error:', error);
        res.status(500).json({
            success: false,
            message: 'Error approving helper',
            error: error.message
        });
    }
};

/**
 * Reject/Deactivate Helper
 * POST /api/admin/helpers/:id/reject
 */
const rejectHelper = async (req, res) => {
    try {
        const { id } = req.params;

        // Find helper
        const helper = await User.findOne({
            where: {
                user_id: id,
                role: 'helper'
            }
        });

        if (!helper) {
            return res.status(404).json({
                success: false,
                message: 'Helper not found'
            });
        }

        // Deactivate helper
        await helper.update({ is_active: false });

        res.status(200).json({
            success: true,
            message: `Helper ${helper.full_name} has been deactivated`,
            helper: {
                user_id: helper.user_id,
                email: helper.email,
                full_name: helper.full_name,
                is_active: helper.is_active
            }
        });

    } catch (error) {
        console.error('Reject helper error:', error);
        res.status(500).json({
            success: false,
            message: 'Error rejecting helper',
            error: error.message
        });
    }
};

/**
 * Get All Users
 * GET /api/admin/users
 */
/**
 * Get Helper Details
 * GET /api/admin/helpers/:id
 */
const getHelperDetails = async (req, res) => {
    try {
        const { id } = req.params;

        // Find helper
        const helper = await User.findOne({
            where: {
                user_id: id,
                role: 'helper'
            },
            attributes: { exclude: ['password_hash'] }
        });

        if (!helper) {
            return res.status(404).json({
                success: false,
                message: 'Helper not found'
            });
        }

        // Get assigned patients
        const relations = await PatientHelper.findAll({
            where: { helper_id: id },
            include: [{
                model: User,
                as: 'patient',
                attributes: ['user_id', 'full_name', 'age', 'gender', 'mobile', 'email']
            }]
        });

        const assignedPatients = relations.map(r => ({
            id: r.patient.user_id,
            name: r.patient.full_name,
            age: r.patient.age,
            gender: r.patient.gender,
            phone: r.patient.mobile,
            email: r.patient.email,
            profileImage: null, // Placeholder
            // Stats placeholders (would require complex aggregation)
            complianceRate: 0,
            medicationsToday: 0,
            medicationsTaken: 0,
            upcomingAppointments: 0
        }));

        res.status(200).json({
            success: true,
            helper: {
                id: helper.user_id,
                fullName: helper.full_name,
                email: helper.email,
                age: helper.age,
                gender: helper.gender,
                contactNumber: helper.mobile,
                verificationId: helper.verification_id || 'N/A',
                joinedDate: helper.created_at,
                status: helper.is_active ? 'active' : 'inactive',
                verified: helper.is_active,
                stats: {
                    assignedPatients: assignedPatients.length,
                    tasksCompleted: 0,
                    avgResponseTime: 'N/A',
                    performanceScore: 0,
                    daysActive: Math.floor((new Date() - new Date(helper.created_at)) / (1000 * 60 * 60 * 24))
                }
            },
            assignedPatients
        });

    } catch (error) {
        console.error('Get helper details error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching helper details',
            error: error.message
        });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password_hash'] },
            order: [['created_at', 'DESC']]
        });

        res.status(200).json({
            success: true,
            users
        });

    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
};

/**
 * Delete Helper Account
 * DELETE /api/admin/helpers/:id
 */
const deleteHelper = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the helper
        const helper = await User.findOne({
            where: {
                user_id: id,
                role: 'helper'
            }
        });

        if (!helper) {
            return res.status(404).json({
                success: false,
                message: 'Helper not found'
            });
        }

        const helperName = helper.full_name;
        const helperEmail = helper.email;

        // Delete related records first (due to foreign key constraints)

        // 1. Delete patient-helper assignments
        const assignmentCount = await PatientHelper.destroy({
            where: { helper_id: id }
        });

        // 2. Delete refresh tokens
        const { RefreshToken } = require('../models');
        const tokenCount = await RefreshToken.destroy({
            where: { user_id: id }
        });

        // 3. Delete the helper account
        await helper.destroy();

        res.status(200).json({
            success: true,
            message: `Helper account "${helperName}" has been permanently deleted`,
            details: {
                helperName,
                helperEmail,
                assignmentsRemoved: assignmentCount,
                tokensRemoved: tokenCount
            }
        });

    } catch (error) {
        console.error('Delete helper error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting helper account',
            error: error.message
        });
    }
};

/**
 * Get All Patients
 * GET /api/admin/patients
 */
const getAllPatients = async (req, res) => {
    try {
        const patients = await User.findAll({
            where: { role: 'patient' },
            attributes: { exclude: ['password_hash'] },
            order: [['created_at', 'DESC']]
        });

        // Get stats for each patient
        const patientsWithStats = await Promise.all(patients.map(async (patient) => {
            // Count medications
            const medicationCount = await Medication.count({
                where: { patient_id: patient.user_id }
            });

            // Count appointments
            const appointmentCount = await Appointment.count({
                where: { patient_id: patient.user_id }
            });

            // Get assigned helper
            const assignment = await PatientHelper.findOne({
                where: { patient_id: patient.user_id, is_active: true },
                include: [{
                    model: User,
                    as: 'helper',
                    attributes: ['user_id', 'full_name', 'email']
                }]
            });

            // Calculate compliance (simplified - based on medication logs)
            const totalMedications = medicationCount;
            const takenLogs = await MedicationLog.count({
                where: { patient_id: patient.user_id }
            });
            const complianceRate = totalMedications > 0
                ? Math.round((takenLogs / (totalMedications * 30)) * 100) // Assuming 30 days
                : 0;

            return {
                id: patient.user_id,
                user_id: patient.user_id,
                fullName: patient.full_name,
                email: patient.email,
                age: patient.age,
                gender: patient.gender,
                mobile: patient.mobile,
                whatsapp: patient.whatsapp,
                joinedDate: patient.created_at,
                isActive: patient.is_active,
                stats: {
                    totalMedications: medicationCount,
                    totalAppointments: appointmentCount,
                    complianceRate: complianceRate,
                    status: complianceRate >= 80 ? 'Excellent' : complianceRate >= 60 ? 'Good' : 'Needs Attention'
                },
                assignedHelper: assignment ? {
                    id: assignment.helper.user_id,
                    name: assignment.helper.full_name,
                    email: assignment.helper.email
                } : null
            };
        }));

        res.status(200).json({
            success: true,
            patients: patientsWithStats
        });

    } catch (error) {
        console.error('Get patients error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching patients',
            error: error.message
        });
    }
};

/**
 * Get Patient Details
 * GET /api/admin/patients/:id
 */
const getPatientDetails = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('\n=== GET PATIENT DETAILS ===');
        console.log('Requested patient ID:', id);
        console.log('ID type:', typeof id);
        console.log('Querying for: user_id =', id, 'AND role = patient');

        const patient = await User.findOne({
            where: { user_id: id, role: 'patient' },
            attributes: { exclude: ['password_hash'] }
        });

        console.log('Query result:', patient ? '✅ FOUND' : '❌ NOT FOUND');
        if (patient) {
            console.log('Found patient:', patient.full_name, '(user_id:', patient.user_id, ')');
        } else {
            console.log('No patient found with user_id:', id);
            // Let's check if patient exists with different criteria
            const anyPatient = await User.findOne({ where: { user_id: id } });
            if (anyPatient) {
                console.log('⚠️ User exists but role is:', anyPatient.role);
            } else {
                console.log('⚠️ No user exists with user_id:', id);
            }
        }

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found'
            });
        }

        // Get medications
        const medications = await Medication.findAll({
            where: { patient_id: id },
            order: [['created_at', 'DESC']]
        });

        // Get appointments
        const appointments = await Appointment.findAll({
            where: { patient_id: id },
            order: [['appointment_date', 'DESC']]
        });

        // Get assigned helper
        const assignment = await PatientHelper.findOne({
            where: { patient_id: id, is_active: true },
            include: [{
                model: User,
                as: 'helper',
                attributes: ['user_id', 'full_name', 'email', 'mobile']
            }]
        });

        // Get medication logs for compliance
        const medicationLogs = await MedicationLog.findAll({
            where: { patient_id: id },
            order: [['taken_time', 'DESC']],
            limit: 30
        });

        const complianceRate = medications.length > 0
            ? Math.round((medicationLogs.length / (medications.length * 30)) * 100)
            : 0;

        res.status(200).json({
            success: true,
            patient: {
                id: patient.user_id,
                fullName: patient.full_name,
                email: patient.email,
                age: patient.age,
                gender: patient.gender,
                mobile: patient.mobile,
                whatsapp: patient.whatsapp,
                joinedDate: patient.created_at,
                isActive: patient.is_active,
                stats: {
                    totalMedications: medications.length,
                    totalAppointments: appointments.length,
                    complianceRate: complianceRate,
                    recentLogs: medicationLogs.length
                },
                assignedHelper: assignment ? {
                    id: assignment.helper.user_id,
                    name: assignment.helper.full_name,
                    email: assignment.helper.email,
                    mobile: assignment.helper.mobile,
                    assignedDate: assignment.created_at
                } : null,
                medications: medications.map(med => ({
                    id: med.medication_id,
                    name: med.medicine_name,
                    dosage: med.qty_per_dose,
                    frequency: med.scheduled_times,
                    mealType: med.meal_type,
                    startDate: med.start_date,
                    endDate: med.end_date
                })),
                appointments: appointments.map(apt => ({
                    id: apt.appointment_id,
                    date: apt.appointment_date,
                    time: apt.appointment_time,
                    doctor: apt.doctor_name,
                    location: apt.location,
                    notes: apt.notes
                }))
            }
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
 * Reassign Patient to Different Helper
 * POST /api/admin/patients/:id/reassign
 */
const reassignPatientHelper = async (req, res) => {
    try {
        const { id } = req.params;
        const { helperId } = req.body;

        if (!helperId) {
            return res.status(400).json({
                success: false,
                message: 'Helper ID is required'
            });
        }

        // Verify patient exists
        const patient = await User.findOne({
            where: { user_id: id, role: 'patient' }
        });

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found'
            });
        }

        // Verify helper exists and is active
        const helper = await User.findOne({
            where: { user_id: helperId, role: 'helper', is_active: true }
        });

        if (!helper) {
            return res.status(404).json({
                success: false,
                message: 'Helper not found or inactive'
            });
        }

        // Deactivate current assignment
        await PatientHelper.update(
            { is_active: false },
            { where: { patient_id: id, is_active: true } }
        );

        // Create new assignment
        await PatientHelper.create({
            patient_id: id,
            helper_id: helperId,
            is_active: true,
            assigned_by: req.user.user_id // Admin who made the change
        });

        res.status(200).json({
            success: true,
            message: `Patient ${patient.full_name} successfully reassigned to ${helper.full_name}`,
            assignment: {
                patientId: id,
                patientName: patient.full_name,
                helperId: helperId,
                helperName: helper.full_name
            }
        });

    } catch (error) {
        console.error('Reassign patient error:', error);
        res.status(500).json({
            success: false,
            message: 'Error reassigning patient',
            error: error.message
        });
    }
};




module.exports = {
    getSystemStats,
    getAllHelpers,
    approveHelper,
    rejectHelper,
    getHelperDetails,
    getAllUsers,
    deleteHelper,
    getAllPatients,
    getPatientDetails,
    reassignPatientHelper
};
