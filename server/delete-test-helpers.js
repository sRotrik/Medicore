const { sequelize } = require('./src/config/database');
const { User, PatientHelper, RefreshToken } = require('./src/models');

(async () => {
    try {
        await sequelize.authenticate();

        // Find all helpers with 'test' in their email
        const testHelpers = await User.findAll({
            where: {
                role: 'helper',
                email: {
                    [sequelize.Sequelize.Op.like]: '%test%'
                }
            }
        });

        console.log('\n=== TEST HELPER ACCOUNTS TO DELETE ===\n');

        if (testHelpers.length === 0) {
            console.log('No test helper accounts found.');
            await sequelize.close();
            process.exit(0);
        }

        console.log(`Found ${testHelpers.length} test helper(s):\n`);
        testHelpers.forEach((h, i) => {
            console.log(`${i + 1}. ${h.email} - ${h.full_name}`);
        });

        console.log('\n=== DELETING TEST HELPERS ===\n');

        for (const helper of testHelpers) {
            // Delete related records first (due to foreign key constraints)

            // 1. Delete patient-helper assignments
            const assignmentCount = await PatientHelper.destroy({
                where: { helper_id: helper.user_id }
            });

            // 2. Delete refresh tokens
            const tokenCount = await RefreshToken.destroy({
                where: { user_id: helper.user_id }
            });

            // 3. Delete the helper user
            await helper.destroy();

            console.log(`✓ Deleted: ${helper.email}`);
            console.log(`  - Removed ${assignmentCount} patient assignment(s)`);
            console.log(`  - Removed ${tokenCount} refresh token(s)`);
        }

        console.log(`\n✅ Successfully deleted ${testHelpers.length} test helper account(s)!`);
        console.log('\nThese accounts will no longer appear in the admin portal.\n');

        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
})();
