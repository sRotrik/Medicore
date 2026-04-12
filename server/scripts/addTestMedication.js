/**
 * Add Test Medication Data
 * Run this script to add sample medications to the database
 */

require('dotenv').config();
const { sequelize } = require('../src/config/database');

async function addTestMedications() {
    try {
        console.log('\n🔄 Connecting to database...\n');

        // Test connection
        await sequelize.authenticate();
        console.log('✅ Connected to MySQL database\n');

        // Get the logged-in patient ID
        const [patients] = await sequelize.query(`
            SELECT user_id, email, full_name FROM users WHERE role = 'patient' LIMIT 1
        `);

        if (patients.length === 0) {
            console.log('❌ No patient found in database');
            console.log('💡 Please create a patient account first');
            process.exit(1);
        }

        const patientId = patients[0].user_id;
        console.log(`📋 Adding medications for patient: ${patients[0].full_name} (${patients[0].email})\n`);

        // Sample medications
        const medications = [
            {
                patient_id: patientId,
                medicine_name: 'Paracetamol',
                dosage: '500mg',
                qty_per_dose: 2,
                total_quantity: 50,
                remaining_quantity: 50,
                meal_type: 'after_meal',
                scheduled_times: JSON.stringify(['08:00', '20:00']),
                start_date: '2026-01-01',
                end_date: '2026-12-31',
                is_active: true
            },
            {
                patient_id: patientId,
                medicine_name: 'Vitamin D3',
                dosage: '1000 IU',
                qty_per_dose: 1,
                total_quantity: 30,
                remaining_quantity: 30,
                meal_type: 'after_meal',
                scheduled_times: JSON.stringify(['09:00']),
                start_date: '2026-01-01',
                end_date: '2026-06-30',
                is_active: true
            },
            {
                patient_id: patientId,
                medicine_name: 'Aspirin',
                dosage: '75mg',
                qty_per_dose: 1,
                total_quantity: 40,
                remaining_quantity: 40,
                meal_type: 'after_meal',
                scheduled_times: JSON.stringify(['20:00']),
                start_date: '2026-01-01',
                end_date: '2026-09-30',
                is_active: true
            }
        ];

        // Insert medications
        for (const med of medications) {
            await sequelize.query(`
                INSERT INTO medications 
                (patient_id, medicine_name, dosage, qty_per_dose, total_quantity, remaining_quantity, 
                 meal_type, scheduled_times, start_date, end_date, is_active, created_at, updated_at)
                VALUES 
                (:patient_id, :medicine_name, :dosage, :qty_per_dose, :total_quantity, :remaining_quantity,
                 :meal_type, :scheduled_times, :start_date, :end_date, :is_active, NOW(), NOW())
            `, {
                replacements: med
            });
            console.log(`✅ Added: ${med.medicine_name}`);
        }

        console.log('\n🎉 Successfully added test medications!\n');
        console.log('📊 Summary:');
        console.log(`   Patient: ${patients[0].full_name}`);
        console.log(`   Medications added: ${medications.length}`);
        console.log('\n💡 Refresh your browser to see the medications\n');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error('\n💡 Make sure:');
        console.error('   1. MySQL is running');
        console.error('   2. Database exists');
        console.error('   3. You have a patient account\n');
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

addTestMedications();
