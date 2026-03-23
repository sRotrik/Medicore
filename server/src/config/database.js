/**
 * MySQL Database Configuration
 * Sequelize ORM setup for MediCore Healthcare Platform
 * Localhost-based deployment
 */

const { Sequelize } = require('sequelize');
const env = require('./env');

// Create Sequelize instance
const sequelize = new Sequelize(
    env.DB_NAME || 'medicore_db',
    env.DB_USER || 'medicore_app',
    env.DB_PASSWORD || 'MediCore@2026',
    {
        host: env.DB_HOST || 'localhost',
        port: env.DB_PORT || 3306,
        dialect: 'mysql',

        // Connection pool configuration
        pool: {
            max: parseInt(env.DB_POOL_MAX) || 5,
            min: parseInt(env.DB_POOL_MIN) || 0,
            acquire: parseInt(env.DB_POOL_ACQUIRE) || 30000,
            idle: parseInt(env.DB_POOL_IDLE) || 10000
        },

        // Logging
        logging: env.NODE_ENV === 'development' ? console.log : false,

        // Timezone
        timezone: '+05:30', // IST

        // Define options
        define: {
            timestamps: true,
            underscored: true, // Use snake_case for auto-generated fields
            freezeTableName: true // Prevent pluralization of table names
        },

        // Retry configuration
        retry: {
            max: 3,
            match: [
                /ETIMEDOUT/,
                /EHOSTUNREACH/,
                /ECONNRESET/,
                /ECONNREFUSED/,
                /PROTOCOL_CONNECTION_LOST/
            ]
        }
    }
);

/**
 * Test Database Connection
 */
const connectDB = async () => {
    try {
        // Authenticate connection
        await sequelize.authenticate();

        console.log('\n' + '='.repeat(50));
        console.log('✅ MySQL Database Connected Successfully!');
        console.log('='.repeat(50));
        console.log(`📊 Database: ${env.DB_NAME || 'medicore_db'}`);
        console.log(`🖥️  Host: ${env.DB_HOST || 'localhost'}:${env.DB_PORT || 3306}`);
        console.log(`👤 User: ${env.DB_USER || 'medicore_app'}`);
        console.log(`🌍 Environment: ${env.NODE_ENV || 'development'}`);
        console.log('='.repeat(50) + '\n');

        // Sync models (disabled - tables already exist from schema.sql)
        // if (env.NODE_ENV === 'development') {
        //     await sequelize.sync({ alter: false });
        //     console.log('📋 Database models synchronized');
        // }


        return sequelize;

    } catch (error) {
        console.error('\n' + '='.repeat(50));
        console.error('❌ MySQL Connection Failed!');
        console.error('='.repeat(50));
        console.error('Error:', error.message);

        // Specific error handling
        if (error.original) {
            const errCode = error.original.code;

            if (errCode === 'ECONNREFUSED') {
                console.error('\n💡 Connection Refused - Please check:');
                console.error('   1. MySQL server is running');
                console.error('   2. Port 3306 is accessible');
                console.error('   3. No firewall blocking connection');
                console.error('\n   Start MySQL: net start MySQL80');
            }

            if (errCode === 'ER_ACCESS_DENIED_ERROR') {
                console.error('\n💡 Access Denied - Please check:');
                console.error('   1. Username and password are correct');
                console.error('   2. User has proper privileges');
                console.error('   3. Database exists');
                console.error('\n   Run: mysql -u root -p');
                console.error('   Then: source E:/med/server/database/schema.sql');
            }

            if (errCode === 'ER_BAD_DB_ERROR') {
                console.error('\n💡 Database Not Found - Please:');
                console.error('   1. Create database using schema.sql');
                console.error('   2. Run: mysql -u root -p < server/database/schema.sql');
            }
        }

        console.error('\n' + '='.repeat(50) + '\n');
        process.exit(1);
    }
};

/**
 * Close Database Connection
 */
const closeDB = async () => {
    try {
        await sequelize.close();
        console.log('🔌 MySQL connection closed gracefully');
    } catch (error) {
        console.error('❌ Error closing database:', error.message);
    }
};

/**
 * Execute Raw SQL Query
 */
const executeQuery = async (sql, replacements = {}) => {
    try {
        const [results, metadata] = await sequelize.query(sql, {
            replacements,
            type: Sequelize.QueryTypes.SELECT
        });
        return results;
    } catch (error) {
        console.error('❌ Query execution failed:', error.message);
        throw error;
    }
};

/**
 * Get Database Statistics
 */
const getDatabaseStats = async () => {
    try {
        const stats = await executeQuery(`
            SELECT 
                table_name,
                table_rows,
                ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
            FROM information_schema.TABLES
            WHERE table_schema = :dbName
            ORDER BY table_rows DESC
        `, { dbName: env.DB_NAME || 'medicore_db' });

        return stats;
    } catch (error) {
        console.error('❌ Failed to get database stats:', error.message);
        return [];
    }
};

// Graceful shutdown handlers
process.on('SIGINT', async () => {
    console.log('\n👋 SIGINT received - closing database connection...');
    await closeDB();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n👋 SIGTERM received - closing database connection...');
    await closeDB();
    process.exit(0);
});

module.exports = {
    sequelize,
    connectDB,
    closeDB,
    executeQuery,
    getDatabaseStats,
    Sequelize
};
