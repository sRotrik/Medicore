const { sequelize } = require('./src/config/database');
const { PatientHelper } = require('./src/models');

async function testHelper() {
    try {
        await sequelize.authenticate();
        const helpers = await PatientHelper.findAll();
        console.log("PatientHelpers mapping in DB:");
        console.log(JSON.stringify(helpers, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await sequelize.close();
    }
}
testHelper();
