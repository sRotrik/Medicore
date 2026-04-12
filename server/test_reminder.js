require('dotenv').config();
const { Medication, User } = require('./src/models');
const { checkMedicationReminders } = require('./src/jobs/scheduler');

(async () => {
    try {
        console.log('--- Setting up test data ---');
        // Find a patient
        const patientUsers = await User.findAll({ where: { role: 'patient' } });
        if(patientUsers.length === 0) {
            console.log('No patients found'); return process.exit(0);
        }
        const user = patientUsers[0];
        console.log('Using patient:', user.email);

        const now = new Date();
        const reminderTime = new Date(now.getTime() + 30 * 60000); // 30 mins from now
        const reminderTimeStr = `${String(reminderTime.getHours()).padStart(2, '0')}:${String(reminderTime.getMinutes()).padStart(2, '0')}`;
        
        const offset = now.getTimezoneOffset();
        const localNow = new Date(now.getTime() - (offset*60*1000));
        const todayDateStr = localNow.toISOString().split('T')[0];

        // Create a test medication scheduled for 30 mins from now
        const med = await Medication.create({
            patient_id: user.user_id,
            medicine_name: 'Test Reminder Pill',
            qty_per_dose: 1,
            frequency: '1',
            meal_type: 'before_meal',
            start_date: todayDateStr,
            end_date: todayDateStr,
            scheduled_times: [reminderTimeStr],
            remaining_quantity: 10,
            total_quantity: 10,
            is_active: true
        });
        console.log('Created test med:', med.medicine_name, 'scheduled at', reminderTimeStr);

        console.log('\n--- Running scheduler ---');
        await checkMedicationReminders();

        console.log('\n--- Cleanup ---');
        await med.destroy();
        console.log('Cleanup done.');
        process.exit(0);
    } catch (e) {
        console.error(e.message);
        process.exit(1);
    }
})();
