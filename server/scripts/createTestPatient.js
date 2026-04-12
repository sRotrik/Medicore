/**
 * Create Test Patient Account
 */

require('dotenv').config();
const { sequelize } = require('../src/config/database');
const bcrypt = require('bcryptjs');

async function createTestPatient() {
    try {
        await sequelize.authenticate();
        console.log('\n✅ Connected to database\n');

        // Check if test patient exists
        const [patients] = await sequelize.query(`
            SELECT user_id, email, role, full_name 
            FROM users 
            WHERE email = 'patient@test.com'
        `);

        if (patients.length > 0) {
            console.log('ℹ️  Test patient already exists:\n');
            console.table(patients);
        } else {
            console.log('Creating test patient account...\n');

            const hashedPassword = await bcrypt.hash('Patient@123', 12);

            await sequelize.query(`
                INSERT INTO users (
                    email, 
                    password_hash, 
                    role, 
                    full_name, 
                    mobile,
                    age,
                    gender,
                    is_active, 
                    is_verified
                ) VALUES (
                    'patient@test.com',
                    :password_hash,
                    'patient',
                    'Test Patient',
                    '9876543210',
                    30,
                    'male',
                    TRUE,
                    TRUE
                )
            `, {
                replacements: { password_hash: hashedPassword }
            });

            console.log('✅ Test patient account created!\n');
        }

        console.log('📋 All Login Credentials:\n');
        console.log('ADMIN:');
        console.log('  Email: admin@medicore.com');
        console.log('  Password: Admin@123\n');
        console.log('PATIENT:');
        console.log('  Email: patient@test.com');
        console.log('  Password: Patient@123\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

createTestPatient();
