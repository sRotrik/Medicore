const { sequelize } = require('./src/config/database');
const { User } = require('./src/models');
const bcrypt = require('bcryptjs');

(async () => {
    try {
        await sequelize.authenticate();
        console.log('\n=== CREATING REQUESTED ADMIN ACCOUNT ===\n');

        const email = 'medsmart04@gmail.com';
        const passwordPlain = 'Admin@1234';

        // Check if user already exists
        const existingUser = await User.findOne({
            where: { email: email }
        });

        if (existingUser) {
            console.log(`⚠️  User with email ${email} already exists. Updating to admin and setting new password...`);
            existingUser.role = 'admin';
            existingUser.password_hash = passwordPlain; // hook will rehash because value changed
            existingUser.full_name = 'MedSmart Admin';
            await existingUser.save();
            console.log('✅ Admin account updated successfully!\n');
        } else {
            console.log(`Creating new Admin user...`);
            await User.create({
                email: email,
                password_hash: passwordPlain, // Hashed by hook
                role: 'admin',
                full_name: 'MedSmart Admin',
                age: 35,
                gender: 'other',
                mobile: '1234567890',
                whatsapp: '1234567890',
                is_active: true
            });
            console.log('✅ Admin account created successfully!\n');
        }

        console.log('═══════════════════════════════════════');
        console.log('ADMIN LOGIN CREDENTIALS:');
        console.log('═══════════════════════════════════════');
        console.log(`Username: ${email}`);
        console.log(`Password: ${passwordPlain}`);
        console.log('═══════════════════════════════════════\n');

        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating/updating admin account:', error.message);
        console.error(error);
        process.exit(1);
    }
})();
