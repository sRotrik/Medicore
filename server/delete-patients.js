const { sequelize } = require('./src/config/database');
const { User, RefreshToken, PatientHelper, Medication, Appointment, MedicationLog, Notification, Prescription } = require('./src/models');
const fs = require('fs');
const path = require('path');

const safeDestroy = async (Model, whereClause) => {
    try {
        if (Model) await Model.destroy(whereClause);
    } catch (err) {
        // Suppress expected errors if table doesn't exist
    }
};

async function deletePatientsExcept11() {
    try {
        await sequelize.authenticate();
        console.log('--- database connected ---');

        const patientsToDelete = await User.findAll({
            where: { role: 'patient' }
        });

        for (const patient of patientsToDelete) {
            const id = patient.user_id;

            if (id === 11) {
                console.log(`Skipping SROTRIK PRADHAN (ID: 11)`);
                continue;
            }

            console.log(`Deleting patient ID: ${id} (${patient.full_name})...`);

            // 1. Delete refresh tokens
            await safeDestroy(RefreshToken, { where: { user_id: id } });

            // Notifications
            await safeDestroy(Notification, { where: { user_id: id } });

            // Prescriptions (Database table if any exist)
            await safeDestroy(Prescription, { where: { patient_id: id } });

            // 2. Delete patient helper assignments
            await safeDestroy(PatientHelper, { where: { patient_id: id } });
            await safeDestroy(PatientHelper, { where: { helper_id: id } }); 

            // 3. Delete medication logs
            await safeDestroy(MedicationLog, { where: { patient_id: id } });

            // 4. Delete medications
            await safeDestroy(Medication, { where: { patient_id: id } });

            // 5. Delete appointments
            await safeDestroy(Appointment, { where: { patient_id: id } });

            // Also system logs
            try {
                await sequelize.query(`DELETE FROM system_logs WHERE user_id = ?`, { replacements: [id] });
            } catch(e) {}

            // 6. Delete prescriptions from JSON
            try {
                const prescriptionsFilePath = path.join(__dirname, '../prescriptions.json');
                if (fs.existsSync(prescriptionsFilePath)) {
                    const data = JSON.parse(fs.readFileSync(prescriptionsFilePath));
                    const filteredData = data.filter(p => Number(p.patient_id) !== Number(id));
                    fs.writeFileSync(prescriptionsFilePath, JSON.stringify(filteredData, null, 2));
                }
            } catch (e) { }

            // 7. Delete the patient account
            await patient.destroy();
            console.log(`Successfully deleted ${patient.full_name}.`);
        }

        console.log('--- CLEANUP COMPLETE ---');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await sequelize.close();
    }
}

deletePatientsExcept11();
