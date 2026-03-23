/**
 * MySQL Database Connection Test
 * Tests the connection to MySQL database using Sequelize
 */

const { connectDB, getDatabaseStats, sequelize } = require('../src/config/database');

async function testConnection() {
    console.log('\n' + '='.repeat(60));
    console.log('🧪 TESTING MYSQL DATABASE CONNECTION');
    console.log('='.repeat(60) + '\n');

    try {
        // Test connection
        await connectDB();

        // Test query
        console.log('📊 Running test queries...\n');

        // Count users
        const [userCount] = await sequelize.query('SELECT COUNT(*) as count FROM users');
        console.log(`✅ Users table: ${userCount[0].count} records`);

        // Check admin account
        const [adminUser] = await sequelize.query(
            "SELECT email, role, full_name FROM users WHERE role = 'admin' LIMIT 1"
        );

        if (adminUser.length > 0) {
            console.log(`✅ Admin account found:`);
            console.log(`   Email: ${adminUser[0].email}`);
            console.log(`   Name: ${adminUser[0].full_name}`);
        } else {
            console.log(`⚠️  No admin account found`);
        }

        // Get database statistics
        console.log('\n📈 Database Statistics:\n');
        const stats = await getDatabaseStats();

        if (stats.length > 0) {
            console.table(stats.map(s => ({
                Table: s.table_name,
                Rows: s.table_rows || 0,
                'Size (MB)': s.size_mb || 0
            })));
        }

        // Test model loading
        console.log('\n🔧 Testing Sequelize Models...\n');
        const models = require('../src/models');

        console.log('✅ Models loaded successfully:');
        Object.keys(models).forEach(modelName => {
            console.log(`   - ${modelName}`);
        });

        console.log('\n' + '='.repeat(60));
        console.log('✅ ALL TESTS PASSED!');
        console.log('='.repeat(60) + '\n');

        console.log('🎉 Your MySQL database is ready to use!\n');
        console.log('Next steps:');
        console.log('1. Start backend: cd server && npm run dev');
        console.log('2. Start frontend: cd .. && npm run dev');
        console.log('3. Access app: http://localhost:5173\n');

    } catch (error) {
        console.error('\n' + '='.repeat(60));
        console.error('❌ TEST FAILED!');
        console.error('='.repeat(60));
        console.error('\nError:', error.message);
        console.error('\nStack:', error.stack);

        console.error('\n💡 Troubleshooting:');
        console.error('1. Ensure MySQL server is running: net start MySQL80');
        console.error('2. Verify database exists: mysql -u root -p');
        console.error('3. Run schema: source E:/med/server/database/schema.sql');
        console.error('4. Check credentials in server/.env\n');

        process.exit(1);
    } finally {
        // Close connection
        await sequelize.close();
        console.log('🔌 Database connection closed\n');
    }
}

// Run test
testConnection();
