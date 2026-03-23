require('dotenv').config();
const { sequelize } = require('./src/config/database');
const fs = require('fs');

async function checkPatientData() {
    try {
        await sequelize.authenticate();
        let output = '✅ Database connected\n\n';

        // Get all patients with their data
        const [patients] = await sequelize.query(`
            SELECT 
                u.user_id,
                u.email,
                u.full_name,
                COUNT(DISTINCT m.medication_id) as med_count,
                COUNT(DISTINCT a.appointment_id) as apt_count
            FROM users u
            LEFT JOIN medications m ON u.user_id = m.patient_id
            LEFT JOIN appointments a ON u.user_id = a.patient_id
            WHERE u.role = 'patient'
            GROUP BY u.user_id, u.email, u.full_name
            LIMIT 10
        `);

        output += `📊 Found ${patients.length} patients:\n\n`;

        for (const patient of patients) {
            output += `\n👤 Patient: ${patient.full_name} (${patient.email})\n`;
            output += `   User ID: ${patient.user_id}\n`;
            output += `   💊 Medications: ${patient.med_count}\n`;
            output += `   📅 Appointments: ${patient.apt_count}\n`;
        }

        console.log(output);
        fs.writeFileSync('patient-data-report.txt', output);
        console.log('\n✅ Report saved to patient-data-report.txt');

        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkPatientData();
