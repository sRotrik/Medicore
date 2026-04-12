// Quick check - simulate what happens when admin picks helper 10 for patient 11
const { sequelize } = require('./src/config/database');
const { User, PatientHelper } = require('./src/models');

async function simulateReassign() {
    try {
        await sequelize.authenticate();

        const patientId = 11;
        const helperId = 10;
        const adminId = 12;

        console.log("Simulating reassign: patient 11 -> helper 10\n");

        // Deactivate all
        await PatientHelper.update({ is_active: false }, { where: { patient_id: patientId } });
        console.log("Step 1: deactivated all existing assignments");

        // Check existing
        const existing = await PatientHelper.findOne({ where: { patient_id: patientId, helper_id: helperId } });
        console.log("Step 2: existing record?", existing ? "YES - id:" + existing.relationship_id : "NO");

        if (existing) {
            await existing.update({ is_active: true, assigned_by: adminId });
            console.log("Step 3: reactivated existing record. is_active:", existing.is_active);
        } else {
            await PatientHelper.create({ patient_id: patientId, helper_id: helperId, is_active: true, assigned_by: adminId });
            console.log("Step 3: created new record");
        }

        // Verify
        const check = await PatientHelper.findOne({ where: { patient_id: patientId, is_active: true } });
        console.log("\nFINAL CHECK - active assignment:", check ? check.helper_id : "NONE - PROBLEM!");

    } catch (e) {
        console.error("❌ ERROR:", e.message);
        console.error(e.stack);
    } finally {
        await sequelize.close();
    }
}
simulateReassign();
