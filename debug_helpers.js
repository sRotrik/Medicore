const { User } = require('../server/src/models');
const { sequelize } = require('../server/src/models');

async function listHelpers() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const helpers = await User.findAll({
            where: { role: 'helper' },
            attributes: ['user_id', 'full_name', 'email', 'role', 'is_active', 'password_hash']
        });

        console.log('\n--- HELPERS LIST ---');
        helpers.forEach(h => {
            console.log(`ID: ${h.user_id} | Name: ${h.full_name} | Email: ${h.email} | Role: ${h.role} | Active: ${h.is_active}`);
            // Verify password integrity? No, can't easily.
        });
        console.log('--------------------\n');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

listHelpers();
