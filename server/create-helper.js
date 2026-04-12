const { sequelize } = require('./src/config/database');
const { User } = require('./src/models');

(async () => {
    try {
        await sequelize.authenticate();
        console.log('\n=== CREATING HELPER ACCOUNT ===\n');

        const helperData = {
            email: 'helper@medicore.com',
            password_hash: 'Helper@123',  // Will be hashed by model hook
            role: 'helper',
            full_name: 'Default Helper',
            age: 25,
            gender: 'other',
            mobile: '9888888888',
            whatsapp: '9888888888',
            is_active: true
        };

        // Check if already exists
        const existing = await User.findOne({ where: { email: helperData.email } });
        if (existing) {
            console.log('Helper already exists with email:', existing.email);
            console.log('Role:', existing.role, '| Active:', existing.is_active);
            await sequelize.close();
            process.exit(0);
        }

        const helper = await User.create(helperData);

        console.log('Helper account created successfully!\n');
        console.log('===========================================');
        console.log('HELPER LOGIN CREDENTIALS:');
        console.log('===========================================');
        console.log('Email:    ' + helperData.email);
        console.log('Password: Helper@123');
        console.log('===========================================\n');

        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('Error creating helper:', error.message);
        process.exit(1);
    }
})();
