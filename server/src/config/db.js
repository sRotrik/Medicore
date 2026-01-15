/**
 * Database Configuration
 * Handles MongoDB connection with Mongoose
 */

const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error(`❌ MongoDB connection error: ${err}`);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️  MongoDB disconnected');
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('🔌 MongoDB connection closed through app termination');
            process.exit(0);
        });

    } catch (error) {
        console.error('\n' + '='.repeat(50));
        console.error('❌ MongoDB Connection Failed!');
        console.error('='.repeat(50));
        console.error('Error:', error.message);

        if (error.message.includes('authentication') || error.message.includes('auth')) {
            console.error('\n💡 Authentication Error - Please check:');
            console.error('   1. Username and password are correct in .env');
            console.error('   2. Database user exists in MongoDB Atlas');
            console.error('   3. User has "Read and write" permissions');
            console.error('   4. Password doesn\'t contain special characters');
        }

        if (error.message.includes('ENOTFOUND') || error.message.includes('network')) {
            console.error('\n💡 Network Error - Please check:');
            console.error('   1. Internet connection is working');
            console.error('   2. IP address is whitelisted (0.0.0.0/0)');
            console.error('   3. Cluster is running in MongoDB Atlas');
        }

        console.error('\n' + '='.repeat(50) + '\n');
        process.exit(1);
    }
};

module.exports = connectDB;
