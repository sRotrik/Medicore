const { sequelize } = require('./src/config/database');
const { User } = require('./src/models');
const bcrypt = require('bcryptjs');

(async () => {
    try {
        await sequelize.authenticate();
        console.log('\n=== CREATING NEW ADMIN ACCOUNT ===\n');

        // Check if admin already exists
        const existingAdmin = await User.findOne({
            where: { role: 'admin' }
        });

        if (existingAdmin) {
            console.log('⚠️  Admin account already exists:');
            console.log(`   Email: ${existingAdmin.email}`);
            console.log(`   Name: ${existingAdmin.full_name}\n`);
            await sequelize.close();
            process.exit(0);
        }

        // Create new admin account
        const adminData = {
            email: 'admin@medicore.com',
            password_hash: 'Admin@123', // Will be hashed by model hook
            role: 'admin',
            full_name: 'System Administrator',
            age: 30,
            gender: 'other',
            mobile: '9999999999',
            whatsapp: '9999999999',
            is_active: true
        };

        const admin = await User.create(adminData);

        console.log('✅ Admin account created successfully!\n');
        console.log('═══════════════════════════════════════');
        console.log('ADMIN LOGIN CREDENTIALS:');
        console.log('═══════════════════════════════════════');
        console.log(`Email:    ${adminData.email}`);
        console.log(`Password: ${adminData.password_hash}`);
        console.log('═══════════════════════════════════════\n');
        console.log('⚠️  IMPORTANT: Please change this password after first login!\n');

        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin account:', error.message);
        console.error(error);
        process.exit(1);
    }
})();
