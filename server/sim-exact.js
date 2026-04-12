const { sequelize } = require('./src/config/database');
const { User, PatientHelper } = require('./src/models');

async function simulateExact() {
    try {
        await sequelize.authenticate();
        
        // Exactly as the controller does it
        const id = "11";   // String from URL params
        const helperId = 13; // Integer (after parseInt on frontend)
        const adminId = 12;

        console.log("=== EXACT SIMULATION (patient=11, helper=13) ===\n");

        // 1. Check patient
        const patient = await User.findOne({ where: { user_id: id, role: 'patient' } });
        console.log("Patient:", patient ? patient.full_name : "NOT FOUND");
        if (!patient) return;

        // 2. Check helper
        const helper = await User.findOne({ where: { user_id: helperId, role: 'helper', is_active: true } });
        console.log("Helper:", helper ? helper.full_name : "NOT FOUND or INACTIVE");
        if (!helper) return;

        // 3. currentAssignment (wrapped in try/catch)
        let currentAssignment = null;
        try {
            currentAssignment = await PatientHelper.findOne({
                where: { patient_id: id, is_active: true },
                include: [{ model: User, as: 'helper' }]
            });
            console.log("currentAssignment:", currentAssignment ? currentAssignment.relationship_id : "none");
        } catch (assocErr) {
            console.warn("currentAssignment error:", assocErr.message);
        }

        // 4. Deactivate all
        await PatientHelper.update({ is_active: false }, { where: { patient_id: id } });
        console.log("Deactivated all assignments");

        // 5. findOrCreate
        const patientIdInt = parseInt(id, 10);
        const helperIdInt = parseInt(helperId, 10);
        console.log(`findOrCreate: patient=${patientIdInt}, helper=${helperIdInt}`);

        const [assignment, created] = await PatientHelper.findOrCreate({
            where: { patient_id: patientIdInt, helper_id: helperIdInt },
            defaults: {
                patient_id: patientIdInt,
                helper_id: helperIdInt,
                is_active: true,
                assigned_by: adminId
            }
        });

        if (!created) {
            console.log("Found existing, updating...");
            await assignment.update({ is_active: true, assigned_by: adminId });
        } else {
            console.log("Created new assignment");
        }

        console.log("\n✅ SUCCESS! Final assignment:", assignment.toJSON());

    } catch (err) {
        console.error("\n❌ ERROR:", err.message);
        console.error("Type:", err.constructor.name);
        console.error("Full:", err);
    } finally {
        await sequelize.close();
    }
}

simulateExact();
