/**
 * Add selected_days column to medications table
 */

require('dotenv').config();
const { sequelize } = require('../src/config/database');

async function addColumn() {
    try {
        console.log('\n🔄 Connecting to database...\n');

        await sequelize.authenticate();
        console.log('✅ Connected to MySQL database\n');

        console.log('📝 Adding selected_days column to medications table...\n');

        await sequelize.query(`
            ALTER TABLE medications 
            ADD COLUMN selected_days JSON DEFAULT NULL 
            COMMENT 'Array of days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]' 
            AFTER scheduled_times
        `);

        console.log('✅ Column added successfully!\n');
        console.log('💡 You can now add medications with day selection\n');

    } catch (error) {
        if (error.message.includes('Duplicate column name')) {
            console.log('ℹ️  Column already exists, no action needed\n');
        } else {
            console.error('❌ Error:', error.message);
        }
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

addColumn();
