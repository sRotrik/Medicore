require('dotenv').config();
const { sequelize } = require('./src/config/database');
const { User, Medication, Appointment, MedicationLog, PatientHelper } = require('./src/models');

async function testPatientAPI() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected\n');

        // Simulate what the API returns
        const patients = await User.findAll({
            where: { role: 'patient' },
            attributes: { exclude: ['password_hash'] },
            order: [['created_at', 'DESC']]
        });

        console.log('📊 Testing Patient API Response Structure:\n');

        for (const patient of patients) {
            const medicationCount = await Medication.count({
                where: { patient_id: patient.user_id }
            });

            const appointmentCount = await Appointment.count({
                where: { patient_id: patient.user_id }
            });

            const assignment = await PatientHelper.findOne({
                where: { patient_id: patient.user_id, is_active: true },
                include: [{
                    model: User,
                    as: 'helper',
                    attributes: ['user_id', 'full_name', 'email']
                }]
            });

            const patientData = {
                id: patient.user_id,
                user_id: patient.user_id,
                fullName: patient.full_name,
                email: patient.email,
                age: patient.age,
                gender: patient.gender,
                mobile: patient.mobile,
                stats: {
                    totalMedications: medicationCount,
                    totalAppointments: appointmentCount,
                    complianceRate: 0,
                    status: 'Good'
                },
                assignedHelper: assignment ? {
                    id: assignment.helper.user_id,
                    name: assignment.helper.full_name,
                    email: assignment.helper.email
                } : null
            };

            console.log('Patient:', patientData.fullName);
            console.log('  - id:', patientData.id);
            console.log('  - user_id:', patientData.user_id);
            console.log('  - URL will be: /admin/patient/' + patientData.id);
            console.log('  - API will call: /api/admin/patients/' + patientData.id);
            console.log('');
        }

        // Now test if we can fetch patient by ID
        const testId = patients[0]?.user_id;
        if (testId) {
            console.log(`\n🔍 Testing fetch for patient ID: ${testId}\n`);

            const patient = await User.findOne({
                where: { user_id: testId, role: 'patient' },
                attributes: { exclude: ['password_hash'] }
            });

            if (patient) {
                console.log('✅ Patient found successfully!');
                console.log('   Name:', patient.full_name);
                console.log('   Email:', patient.email);
            } else {
                console.log('❌ Patient NOT found - this is the problem!');
            }
        }

        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

testPatientAPI();
