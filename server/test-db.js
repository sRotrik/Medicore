// Quick test to see MongoDB connection error
require('dotenv').config();
const mongoose = require('mongoose');

console.log('Testing MongoDB connection...');
console.log('URI:', process.env.MONGODB_URI.replace(/:[^:@]+@/, ':****@')); // Hide password

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('✅ MongoDB Connected Successfully!');
        process.exit(0);
    })
    .catch((err) => {
        console.error('❌ MongoDB Connection Error:');
        console.error('Error Name:', err.name);
        console.error('Error Message:', err.message);
        console.error('\nFull Error:', err);
        process.exit(1);
    });
