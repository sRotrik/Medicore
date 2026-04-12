require('dotenv').config();
const { sequelize } = require('./src/config/database');
const { User } = require('./src/models');

(async () => {
    try {
        await sequelize.authenticate();
        const helpers = await User.findAll({
            where: { role: 'helper' },
            attributes: ['user_id', 'email', 'full_name', 'is_active']
        });

        console.log(`\nFound ${helpers.length} helpers:\n`);
        helpers.forEach(h => {
            console.log(`  Email: ${h.email}`);
            console.log(`  Name: ${h.full_name}`);
            console.log(`  ID: ${h.user_id}`);
            console.log(`  Active: ${h.is_active}`);
            console.log('');
        });

        await sequelize.close();
    } catch (error) {
        console.error('Error:', error.message);
    }
})();
