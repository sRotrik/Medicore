require('dotenv').config();
const { sequelize } = require('./src/config/database');

async function diagnosePatientIssue() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to database\n');

        // Check the actual table structure
        console.log('📋 Checking users table structure...\n');
        const [columns] = await sequelize.query(`
            DESCRIBE users;
        `);

        console.log('Table columns:');
        columns.forEach(col => {
            if (col.Field.includes('id') || col.Field === 'role') {
                console.log(`  - ${col.Field} (${col.Type}) ${col.Key === 'PRI' ? '← PRIMARY KEY' : ''}`);
            }
        });

        // Check actual patient data
        console.log('\n📊 Checking patient records...\n');
        const [patients] = await sequelize.query(`
            SELECT user_id, email, full_name, role 
            FROM users 
            WHERE role = 'patient'
            LIMIT 5;
        `);

        console.log('Patients in database:');
        patients.forEach(p => {
            console.log(`  ID: ${p.user_id} | Name: ${p.full_name} | Email: ${p.email}`);
        });

        // Test the exact query the API uses
        if (patients.length > 0) {
            const testId = patients[0].user_id;
            console.log(`\n🔍 Testing API query for patient ID: ${testId}\n`);

            const [result] = await sequelize.query(`
                SELECT user_id, email, full_name, role 
                FROM users 
                WHERE user_id = ? AND role = 'patient';
            `, {
                replacements: [testId]
            });

            if (result.length > 0) {
                console.log('✅ Query successful!');
                console.log('   Result:', result[0]);
            } else {
                console.log('❌ Query returned no results');
            }

            // Test with string vs number
            console.log(`\n🔍 Testing with string ID: "${testId}"\n`);
            const [result2] = await sequelize.query(`
                SELECT user_id, email, full_name, role 
                FROM users 
                WHERE user_id = ? AND role = 'patient';
            `, {
                replacements: [String(testId)]
            });

            if (result2.length > 0) {
                console.log('✅ String query successful!');
            } else {
                console.log('❌ String query failed');
            }
        }

        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

diagnosePatientIssue();
