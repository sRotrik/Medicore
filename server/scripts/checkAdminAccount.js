/**
 * Check Admin Account
 */

require('dotenv').config();
const { sequelize } = require('../src/config/database');
const bcrypt = require('bcryptjs');

async function checkAdmin() {
    try {
        await sequelize.authenticate();
        console.log('\n✅ Connected to database\n');

        // Check if admin exists
        const [admins] = await sequelize.query(`
            SELECT user_id, email, password_hash, role, full_name, is_active 
            FROM users 
            WHERE email = 'admin@medicore.com'
        `);

        if (admins.length === 0) {
            console.log('❌ Admin account does not exist!\n');
            console.log('Creating admin account...\n');

            // Create admin account
            const hashedPassword = await bcrypt.hash('Admin@123', 12);

            await sequelize.query(`
                INSERT INTO users (
                    email, 
                    password_hash, 
                    role, 
                    full_name, 
                    mobile, 
                    is_active, 
                    is_verified
                ) VALUES (
                    'admin@medicore.com',
                    :password_hash,
                    'admin',
                    'System Administrator',
                    '9999999999',
                    TRUE,
                    TRUE
                )
            `, {
                replacements: { password_hash: hashedPassword }
            });

            console.log('✅ Admin account created!\n');
        } else {
            console.log('✅ Admin account exists:\n');
            console.table(admins);

            // Test password
            const admin = admins[0];
            const passwordMatch = await bcrypt.compare('Admin@123', admin.password_hash);

            console.log('\n🔐 Password Test:');
            console.log(`   Password "Admin@123" matches: ${passwordMatch ? '✅ YES' : '❌ NO'}\n`);

            if (!passwordMatch) {
                console.log('⚠️  Password hash is incorrect. Resetting password...\n');
                const newHash = await bcrypt.hash('Admin@123', 12);

                await sequelize.query(`
                    UPDATE users 
                    SET password_hash = :password_hash 
                    WHERE email = 'admin@medicore.com'
                `, {
                    replacements: { password_hash: newHash }
                });

                console.log('✅ Password reset successfully!\n');
            }
        }

        console.log('📋 Login Credentials:');
        console.log('   Email: admin@medicore.com');
        console.log('   Password: Admin@123\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

checkAdmin();
