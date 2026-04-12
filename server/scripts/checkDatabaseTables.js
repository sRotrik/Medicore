/**
 * Check Database Tables
 */

require('dotenv').config();
const { sequelize } = require('../src/config/database');

async function checkTables() {
    try {
        await sequelize.authenticate();
        console.log('\n✅ Connected to database\n');

        // Check if tables exist
        const [tables] = await sequelize.query(`
            SHOW TABLES
        `);

        console.log('📋 Tables in database:');
        console.table(tables);

        // Check medications table structure
        console.log('\n📊 Medications table structure:');
        const [medColumns] = await sequelize.query(`
            DESCRIBE medications
        `);
        console.table(medColumns);

        // Check appointments table structure
        console.log('\n📊 Appointments table structure:');
        const [aptColumns] = await sequelize.query(`
            DESCRIBE appointments
        `);
        console.table(aptColumns);

        // Check if selected_days column exists
        const hasSelectedDays = medColumns.some(col => col.Field === 'selected_days');
        console.log(`\n${hasSelectedDays ? '✅' : '❌'} selected_days column exists in medications table`);

    } catch (error) {
        console.error('❌ Error:', error.message);

        if (error.message.includes("doesn't exist")) {
            console.log('\n⚠️  Database tables are missing!');
            console.log('📝 You need to run the schema.sql file to create the tables.');
            console.log('\nSteps:');
            console.log('1. Open MySQL Workbench');
            console.log('2. Connect to localhost');
            console.log('3. Open File -> Open SQL Script');
            console.log('4. Select: e:\\med\\server\\database\\schema.sql');
            console.log('5. Click Execute (lightning bolt icon)');
        }
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

checkTables();
