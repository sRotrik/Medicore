/**
 * Script to activate all helper accounts
 * Run this to enable automatic patient assignment
 */

const { sequelize } = require('./src/config/database');
const { User } = require('./src/models');

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected\n');

        // Find all inactive helpers
        const inactiveHelpers = await User.findAll({
            where: { role: 'helper', is_active: false }
        });

        console.log(`Found ${inactiveHelpers.length} inactive helper(s)\n`);

        if (inactiveHelpers.length === 0) {
            console.log('No inactive helpers to activate.');
            process.exit(0);
        }

        // Activate all helpers
        for (const helper of inactiveHelpers) {
            await helper.update({ is_active: true });
            console.log(`✓ Activated: ${helper.full_name} (${helper.email})`);
        }

        console.log(`\n✅ Successfully activated ${inactiveHelpers.length} helper(s)!`);
        console.log('\nPatients will now be automatically assigned to helpers during registration.');

        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
})();
