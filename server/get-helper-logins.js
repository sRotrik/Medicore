const { sequelize } = require('./src/config/database');
const { User } = require('./src/models');

(async () => {
    try {
        await sequelize.authenticate();

        const helpers = await User.findAll({
            where: { role: 'helper' },
            attributes: ['user_id', 'email', 'full_name', 'is_active', 'created_at'],
            order: [['created_at', 'DESC']]
        });

        console.log('\n╔════════════════════════════════════════════════════════════╗');
        console.log('║              HELPER ACCOUNTS LOGIN CREDENTIALS             ║');
        console.log('╚════════════════════════════════════════════════════════════╝\n');

        if (helpers.length === 0) {
            console.log('❌ NO HELPER ACCOUNTS FOUND\n');
        } else {
            console.log(`Total Helpers: ${helpers.length}\n`);

            helpers.forEach((helper, index) => {
                const status = helper.is_active ? '✓ ACTIVE' : '✗ INACTIVE';
                console.log(`${index + 1}. ${helper.full_name}`);
                console.log(`   Email: ${helper.email}`);
                console.log(`   Password: [Encrypted - Cannot retrieve original password]`);
                console.log(`   Status: ${status}`);
                console.log(`   User ID: ${helper.user_id}`);
                console.log(`   Created: ${helper.created_at}`);
                console.log('');
            });

            console.log('═══════════════════════════════════════════════════════════\n');
            console.log('NOTE: Passwords are hashed and cannot be retrieved.');
            console.log('If you need to login, you must know the password used during registration.');
            console.log('\nTo reset a password, you would need to implement a password reset feature.');
            console.log('\n═══════════════════════════════════════════════════════════\n');
        }

        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
})();
