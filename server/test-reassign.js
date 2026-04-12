const { sequelize } = require('./src/config/database');
const { PatientHelper } = require('./src/models');

async function testReassign() {
    try {
        await sequelize.authenticate();
        // ID 11, Helper 10
        const id = 11;
        const helperId = 10;
        
        console.log("1. Deactivating all...");
        await PatientHelper.update(
            { is_active: false },
            { where: { patient_id: id } }
        );

        console.log("2. Checking existing assignment...");
        const existingAssignment = await PatientHelper.findOne({
            where: { patient_id: id, helper_id: helperId }
        });

        if (existingAssignment) {
            console.log("Found existing:", existingAssignment.toJSON());
            console.log("Updating is_active to true...");
            await existingAssignment.update({ 
                is_active: true, 
                assigned_by: 12 
            });
            console.log("Done updating. Result:", existingAssignment.toJSON());
        } else {
            console.log("Not found, creating...");
            await PatientHelper.create({
                patient_id: id,
                helper_id: helperId,
                is_active: true,
                assigned_by: 12
            });
        }
    } catch (e) {
        console.error(e);
    } finally {
        await sequelize.close();
    }
}
testReassign();
