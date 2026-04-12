/**
 * Test endpoint to verify patient detail API
 * Add this temporarily to test the endpoint directly
 */

const express = require('express');
const router = express.Router();
const { User, Medication, Appointment } = require('../models');

// Test endpoint - GET /api/test/patient/:id
router.get('/patient/:id', async (req, res) => {
    try {
        const { id } = req.params;

        console.log('\n🧪 TEST ENDPOINT CALLED');
        console.log('Patient ID:', id);
        console.log('ID Type:', typeof id);

        // Try to find patient
        const patient = await User.findOne({
            where: { user_id: id, role: 'patient' },
            attributes: { exclude: ['password_hash'] }
        });

        if (!patient) {
            // Check if user exists at all
            const anyUser = await User.findOne({ where: { user_id: id } });

            return res.json({
                success: false,
                message: 'Patient not found',
                debug: {
                    requestedId: id,
                    idType: typeof id,
                    userExists: !!anyUser,
                    userRole: anyUser?.role || 'N/A'
                }
            });
        }

        // Get counts
        const medCount = await Medication.count({ where: { patient_id: id } });
        const aptCount = await Appointment.count({ where: { patient_id: id } });

        res.json({
            success: true,
            patient: {
                id: patient.user_id,
                fullName: patient.full_name,
                email: patient.email,
                age: patient.age,
                gender: patient.gender,
                mobile: patient.mobile,
                stats: {
                    totalMedications: medCount,
                    totalAppointments: aptCount
                }
            }
        });

    } catch (error) {
        console.error('Test endpoint error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            stack: error.stack
        });
    }
});

module.exports = router;
