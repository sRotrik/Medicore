/**
 * Test Adding Appointment
 */

require('dotenv').config();
const { sequelize } = require('../src/config/database');

async function testAddAppointment() {
    try {
        await sequelize.authenticate();
        console.log('\n✅ Connected to database\n');

        // Get a patient
        const [patients] = await sequelize.query(`
            SELECT user_id, email, full_name FROM users WHERE role = 'patient' LIMIT 1
        `);

        if (patients.length === 0) {
            console.log('❌ No patient found in database');
            return;
        }

        const patient = patients[0];
        console.log('👤 Using patient:', patient.email);

        // Try to insert an appointment
        console.log('\n📅 Attempting to add appointment...\n');

        const [result] = await sequelize.query(`
            INSERT INTO appointments 
            (patient_id, doctor_name, specialization, appointment_date, appointment_time, 
             hospital_name, address, contact_number, reason, status, created_at, updated_at)
            VALUES 
            (:patient_id, :doctor_name, :specialization, :appointment_date, :appointment_time,
             :hospital_name, :address, :contact_number, :reason, :status, NOW(), NOW())
        `, {
            replacements: {
                patient_id: patient.user_id,
                doctor_name: 'Dr. Test Doctor',
                specialization: 'General Physician',
                appointment_date: '2026-02-15',
                appointment_time: '10:00:00',
                hospital_name: 'Test Hospital',
                address: 'Test Hospital, Room 101',
                contact_number: '9876543210',
                reason: 'Regular Checkup',
                status: 'scheduled'
            }
        });

        console.log('✅ Appointment added successfully!');
        console.log('   Appointment ID:', result);

        // Verify it was added
        const [appointments] = await sequelize.query(`
            SELECT * FROM appointments WHERE patient_id = :patient_id
        `, {
            replacements: { patient_id: patient.user_id }
        });

        console.log('\n📋 Appointments for', patient.email + ':');
        console.table(appointments);

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Full error:', error);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

testAddAppointment();
