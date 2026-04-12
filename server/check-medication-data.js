require('dotenv').config();
const { sequelize } = require('./src/config/database');
const { User, Medication } = require('./src/models');

async function checkMedicationData() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected\n');

        // Find testpatient1
        const patient = await User.findOne({
            where: {
                email: 'testpatient1@medicore.com',
                role: 'patient'
            }
        });

        if (!patient) {
            console.log('❌ testpatient1 not found');
            await sequelize.close();
            return;
        }

        console.log(`Found patient: ${patient.full_name}`);
        console.log(`Patient ID: ${patient.user_id}\n`);

        // Get medications
        const medications = await Medication.findAll({
            where: { patient_id: patient.user_id },
            order: [['created_at', 'DESC']]
        });

        console.log(`📊 Total medications in database: ${medications.length}\n`);

        if (medications.length > 0) {
            console.log('Medications:\n');
            medications.forEach((med, idx) => {
                console.log(`${idx + 1}. ${med.medicine_name}`);
                console.log(`   ID: ${med.medication_id}`);
                console.log(`   Dosage: ${med.qty_per_dose}`);
                console.log(`   Times: ${JSON.stringify(med.scheduled_times)}`);
                console.log(`   Stock: ${med.remaining_quantity}`);
                console.log(`   Active: ${med.is_active}`);
                console.log(`   Start: ${med.start_date}`);
                console.log(`   End: ${med.end_date}`);
                console.log('');
            });

            // Now simulate what the API returns
            console.log('\n🔍 What the API should return:\n');
            const mappedMeds = medications.map(m => ({
                _id: m.medication_id,
                name: m.medicine_name,
                dosage: m.qty_per_dose,
                stock: m.remaining_quantity,
                frequency: m.scheduled_times ? m.scheduled_times[0] : '',
                time: m.scheduled_times ? m.scheduled_times[0] : '',
                expiryDate: m.end_date,
                manufacturingDate: m.start_date,
                mealTiming: m.meal_type === 'before_meal' ? 'Before Meal' : 'After Meal',
                isActive: m.is_active
            }));

            console.log(JSON.stringify(mappedMeds, null, 2));
        } else {
            console.log('⚠️  No medications found for this patient');
        }

        await sequelize.close();
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
    }
}

checkMedicationData();
