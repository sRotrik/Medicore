const { sequelize } = require('./src/config/database');
const { User, PatientHelper } = require('./src/models');

(async () => {
    try {
        await sequelize.authenticate();

        // Get all patients
        const patients = await User.findAll({
            where: { role: 'patient' },
            attributes: ['user_id', 'full_name', 'email', 'created_at'],
            order: [['created_at', 'DESC']],
            limit: 10
        });

        console.log(`\n=== RECENT PATIENTS (Last 10) ===\n`);

        for (const patient of patients) {
            // Check if assigned to helper
            const assignment = await PatientHelper.findOne({
                where: { patient_id: patient.user_id },
                include: [{
                    model: User,
                    as: 'helper',
                    attributes: ['full_name', 'email']
                }]
            });

            const assignmentStatus = assignment
                ? `✓ Assigned to: ${assignment.helper.full_name}`
                : '✗ NOT ASSIGNED';

            console.log(`Patient: ${patient.full_name}`);
            console.log(`  Email: ${patient.email}`);
            console.log(`  Registered: ${patient.created_at}`);
            console.log(`  Status: ${assignmentStatus}\n`);
        }

        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        console.error(error);
        process.exit(1);
    }
})();
