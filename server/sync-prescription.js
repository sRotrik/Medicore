const { sequelize } = require('./src/config/database');
const { Prescription } = require('./src/models');

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Syncing Prescription model...');
        await Prescription.sync({ alter: true });
        console.log('Prescription table created/altered successfully!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
