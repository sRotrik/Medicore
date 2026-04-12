/**
 * Update Admin Password
 * Hashes the admin password properly with bcrypt
 */

const bcrypt = require('bcryptjs');
const { sequelize } = require('./src/config/database');

async function updateAdminPassword() {
    try {
        console.log('Updating admin password...');

        // Hash the password
        const password = 'Admin@123';
        const salt = await bcrypt.genSalt(12);
        const password_hash = await bcrypt.hash(password, salt);

        console.log('Password hash generated:', password_hash.substring(0, 20) + '...');

        // Update admin password
        const [results] = await sequelize.query(
            'UPDATE users SET password_hash = ? WHERE email = ?',
            {
                replacements: [password_hash, 'admin@medicore.com']
            }
        );

        console.log('✅ Admin password updated successfully!');
        console.log('\nAdmin credentials:');
        console.log('Email: admin@medicore.com');
        console.log('Password: Admin@123');

        // Verify the update
        const [admin] = await sequelize.query(
            'SELECT email, role, LEFT(password_hash, 30) as hash_preview FROM users WHERE email = ?',
            {
                replacements: ['admin@medicore.com']
            }
        );

        console.log('\nVerification:', admin[0]);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

updateAdminPassword();
