const { sequelize } = require('./src/config/database');
const { User, PatientHelper } = require('./src/models');

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected successfully\n');

        // Check for active helpers
        const helpers = await User.findAll({
            where: { role: 'helper', is_active: true },
            attributes: ['user_id', 'full_name', 'email']
        });

        console.log('=== ACTIVE HELPERS ===');
        console.log(`Total: ${helpers.length}`);
        helpers.forEach(h => {
            console.log(`  - ID: ${h.user_id}, Name: ${h.full_name}, Email: ${h.email}`);
        });

        // Check for patients
        const patients = await User.findAll({
            where: { role: 'patient' },
            attributes: ['user_id', 'full_name', 'email', 'is_active']
        });

        console.log('\n=== PATIENTS ===');
        console.log(`Total: ${patients.length}`);
        patients.forEach(p => {
            console.log(`  - ID: ${p.user_id}, Name: ${p.full_name}, Active: ${p.is_active}`);
        });

        // Check assignments
        const assignments = await PatientHelper.findAll({
            attributes: ['patient_id', 'helper_id', 'is_active', 'assigned_by']
        });

        console.log('\n=== PATIENT-HELPER ASSIGNMENTS ===');
        console.log(`Total: ${assignments.length}`);
        assignments.forEach(a => {
            console.log(`  - Patient ${a.patient_id} -> Helper ${a.helper_id} (Active: ${a.is_active}, Assigned by: ${a.assigned_by || 'SYSTEM'})`);
        });

        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
})();
