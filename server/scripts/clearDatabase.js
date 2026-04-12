/**
 * Clear Database Script
 * Removes all test data from MongoDB
 */

require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

const clearDatabase = async () => {
    try {
        console.log('\n🗑️  Clearing database...\n');

        const collections = await mongoose.connection.db.collections();

        for (let collection of collections) {
            const count = await collection.countDocuments();
            await collection.deleteMany({});
            console.log(`✅ Cleared ${collection.collectionName}: ${count} documents deleted`);
        }

        console.log('\n✅ Database cleared successfully!\n');
    } catch (error) {
        console.error('❌ Error clearing database:', error);
    }
};

const main = async () => {
    await connectDB();

    rl.question('⚠️  Are you sure you want to clear ALL data? (yes/no): ', async (answer) => {
        if (answer.toLowerCase() === 'yes') {
            await clearDatabase();
        } else {
            console.log('❌ Operation cancelled');
        }

        await mongoose.connection.close();
        console.log('🔌 Disconnected from MongoDB');
        rl.close();
        process.exit(0);
    });
};

main();
