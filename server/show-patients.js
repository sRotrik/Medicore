const { User } = require('./src/models');
const { sequelize } = require('./src/config/database');

async function showPatients() {
    try {
        await sequelize.authenticate();
        console.log('--- database connected ---');

        const patients = await User.findAll({
            where: { role: 'patient' },
            attributes: ['user_id', 'full_name', 'email', 'mobile', 'age', 'gender', 'created_at']
        });

        console.log(`FOUND ${patients.length} PATIENTS IN DATABASE:`);
        console.log('================================================');
        patients.forEach((p, i) => {
            console.log(`[${i+1}] ID: ${p.user_id} | Name: ${p.full_name}`);
            console.log(`    Email: ${p.email}`);
            console.log(`    Mobile: ${p.mobile}`);
            console.log(`    Age/Gender: ${p.age} / ${p.gender}`);
            console.log(`    Joined: ${p.created_at}`);
            console.log('------------------------------------------------');
        });
        
    } catch (err) {
        console.error('Error fetching patients:', err);
    } finally {
        await sequelize.close();
    }
}

showPatients();
