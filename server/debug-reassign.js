const { sequelize } = require('./src/config/database');
const { User, PatientHelper } = require('./src/models');

async function testReassignApi() {
    try {
        await sequelize.authenticate();
        
        const patientId = 11;
        const helperId = 10; // Change this to your helper's ID
        const adminId = 12;

        console.log("=== TESTING REASSIGN LOGIC ===");

        // Step 1: Check patient
        const patient = await User.findOne({ where: { user_id: patientId, role: 'patient' } });
        console.log("Patient:", patient ? patient.full_name : "NOT FOUND");

        // Step 2: Check helper
        const helper = await User.findOne({ where: { user_id: helperId, role: 'helper', is_active: true } });
        console.log("Helper:", helper ? `${helper.full_name} (active: ${helper.is_active})` : "NOT FOUND or INACTIVE");
        
        if (!helper) {
            // List all helpers
            const allHelpers = await User.findAll({ where: { role: 'helper' }, attributes: ['user_id','full_name','is_active'] });
            console.log("\n--- All helpers in DB ---");
            allHelpers.forEach(h => console.log(`  ID: ${h.user_id} | ${h.full_name} | active: ${h.is_active}`));
        }

        // Step 3: Current assignments
        const all = await PatientHelper.findAll({ where: { patient_id: patientId } });
        console.log("\nAll assignments for patient:", JSON.stringify(all.map(a => ({ helper_id: a.helper_id, is_active: a.is_active })), null, 2));

    } catch (e) {
        console.error("Error:", e.message);
        console.error(e.stack);
    } finally {
        await sequelize.close();
    }
}
testReassignApi();
