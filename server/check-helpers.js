const { sequelize } = require('./src/config/database');
const { User } = require('./src/models');

(async () => {
    try {
        await sequelize.authenticate();

        const helpers = await User.findAll({
            where: { role: 'helper' },
            attributes: ['user_id', 'full_name', 'email', 'is_active']
        });

        console.log(`\n=== TOTAL HELPERS: ${helpers.length} ===\n`);

        if (helpers.length === 0) {
            console.log('❌ NO HELPERS FOUND IN DATABASE!');
            console.log('\nTo enable automatic patient assignment, you need to:');
            console.log('1. Register at least one helper account');
            console.log('2. Activate the helper (either via admin panel or database)');
        } else {
            helpers.forEach(h => {
                const status = h.is_active ? '✓ ACTIVE' : '✗ INACTIVE';
                console.log(`${status} - ${h.full_name} (${h.email})`);
            });
        }

        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
})();
