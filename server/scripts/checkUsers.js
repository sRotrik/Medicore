/**
 * Check Users in Database
 */

require('dotenv').config();
const { sequelize } = require('../src/config/database');

async function checkUsers() {
    try {
        await sequelize.authenticate();
        console.log('\n✅ Connected to database\n');

        const [users] = await sequelize.query(`
            SELECT user_id, email, role, full_name, is_active 
            FROM users 
            ORDER BY role, created_at
        `);

        console.log('📋 Users in database:\n');
        console.table(users);

        console.log('\n💡 Login Credentials:');
        users.forEach(user => {
            console.log(`\n${user.role.toUpperCase()}:`);
            console.log(`  Email: ${user.email}`);
            console.log(`  Password: (check schema.sql for default passwords)`);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

checkUsers();
