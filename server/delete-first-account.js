const { sequelize } = require('./src/config/database');
const { User, PatientHelper, RefreshToken, Medication, Appointment } = require('./src/models');

(async () => {
    try {
        await sequelize.authenticate();

        // Get all users ordered by creation date (oldest first)
        const users = await User.findAll({
            attributes: ['user_id', 'email', 'full_name', 'role', 'is_active', 'created_at'],
            order: [['created_at', 'ASC']]
        });

        console.log('\n=== ALL ACCOUNTS (Ordered by Creation Date) ===\n');

        if (users.length === 0) {
            console.log('No accounts found.');
            await sequelize.close();
            process.exit(0);
        }

        users.forEach((u, i) => {
            console.log(`${i + 1}. ${u.email}`);
            console.log(`   Name: ${u.full_name}`);
            console.log(`   Role: ${u.role.toUpperCase()}`);
            console.log(`   Active: ${u.is_active ? 'Yes' : 'No'}`);
            console.log(`   Created: ${u.created_at}`);
            console.log('');
        });

        // Get the first account (oldest)
        const firstAccount = users[0];

        console.log('=== DELETING FIRST ACCOUNT ===\n');
        console.log(`Email: ${firstAccount.email}`);
        console.log(`Name: ${firstAccount.full_name}`);
        console.log(`Role: ${firstAccount.role}\n`);

        // Delete related records based on role
        if (firstAccount.role === 'patient') {
            // Delete patient-related data
            const medCount = await Medication.destroy({
                where: { patient_id: firstAccount.user_id }
            });

            const apptCount = await Appointment.destroy({
                where: { patient_id: firstAccount.user_id }
            });

            const assignCount = await PatientHelper.destroy({
                where: { patient_id: firstAccount.user_id }
            });

            console.log(`  - Deleted ${medCount} medication(s)`);
            console.log(`  - Deleted ${apptCount} appointment(s)`);
            console.log(`  - Deleted ${assignCount} helper assignment(s)`);
        } else if (firstAccount.role === 'helper') {
            // Delete helper-related data
            const assignCount = await PatientHelper.destroy({
                where: { helper_id: firstAccount.user_id }
            });

            console.log(`  - Deleted ${assignCount} patient assignment(s)`);
        }

        // Delete refresh tokens
        const tokenCount = await RefreshToken.destroy({
            where: { user_id: firstAccount.user_id }
        });
        console.log(`  - Deleted ${tokenCount} refresh token(s)`);

        // Delete the user account
        await firstAccount.destroy();

        console.log(`\n✅ Successfully deleted account: ${firstAccount.email}`);
        console.log('This account will no longer appear in the system.\n');

        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
})();
