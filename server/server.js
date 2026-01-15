/**
 * MediCore Backend Server
 * Main entry point for the application
 */

require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');
const env = require('./src/config/env');

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('💥 UNCAUGHT EXCEPTION! Shutting down...');
    console.error(err.name, err.message);
    console.error(err.stack);
    process.exit(1);
});

// Connect to database
connectDB();

// Start server
const PORT = env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log('\n' + '='.repeat(50));
    console.log('🏥 MediCore Backend Server');
    console.log('='.repeat(50));
    console.log(`📡 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${env.NODE_ENV}`);
    console.log(`🔗 API URL: http://localhost:${PORT}`);
    console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
    console.log(`🌐 Frontend URL: ${env.FRONTEND_URL}`);
    console.log('='.repeat(50) + '\n');
    console.log('📚 Available Endpoints:');
    console.log('   Authentication: /api/auth');
    console.log('   Patient Portal: /api/patient');
    console.log('   Helper Portal:  /api/helper');
    console.log('\n' + '='.repeat(50));
    console.log('✅ Server is ready to accept connections');
    console.log('='.repeat(50) + '\n');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('💥 UNHANDLED REJECTION! Shutting down...');
    console.error(err.name, err.message);
    console.error(err.stack);
    server.close(() => {
        process.exit(1);
    });
});

// Handle SIGTERM
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM RECEIVED. Shutting down gracefully...');
    server.close(() => {
        console.log('💥 Process terminated!');
    });
});

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', () => {
    console.log('\n👋 SIGINT RECEIVED. Shutting down gracefully...');
    server.close(() => {
        console.log('💥 Process terminated!');
        process.exit(0);
    });
});
