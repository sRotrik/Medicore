/**
 * Test Admin Login
 */

const bcrypt = require('bcryptjs');
const { sequelize } = require('./src/config/database');

async function testLogin() {
    try {
        console.log('Testing admin login...\n');

        // Get admin from database
        const [users] = await sequelize.query(
            'SELECT user_id, email, password_hash, role FROM users WHERE email = ?',
            { replacements: ['admin@medicore.com'] }
        );

        if (users.length === 0) {
            console.log('❌ Admin user not found!');
            process.exit(1);
        }

        const admin = users[0];
        console.log('✅ Admin user found:');
        console.log('   Email:', admin.email);
        console.log('   Role:', admin.role);
        console.log('   Password hash:', admin.password_hash.substring(0, 30) + '...');

        // Test password
        const testPassword = 'Admin@123';
        const isValid = await bcrypt.compare(testPassword, admin.password_hash);

        console.log('\n🔐 Password Test:');
        console.log('   Testing password:', testPassword);
        console.log('   Result:', isValid ? '✅ VALID' : '❌ INVALID');

        if (isValid) {
            console.log('\n✅ Admin login credentials are working!');
            console.log('\nYou can now login with:');
            console.log('   Email: admin@medicore.com');
            console.log('   Password: Admin@123');
        } else {
            console.log('\n❌ Password verification failed!');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

testLogin();
