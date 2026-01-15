/**
 * Express Application Setup
 * Main application configuration and middleware
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const env = require('./config/env');

// Import routes
const authRoutes = require('./routes/auth.routes');
const patientRoutes = require('./routes/patient.routes');
const helperRoutes = require('./routes/helper.routes');

// Create Express app
const app = express();

// ==================== SECURITY MIDDLEWARE ====================

// Helmet - Security headers
app.use(helmet());

// CORS - Cross-Origin Resource Sharing
app.use(cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// ==================== BODY PARSING MIDDLEWARE ====================

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ==================== LOGGING MIDDLEWARE ====================

// Morgan - HTTP request logger
if (env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// ==================== COMPRESSION MIDDLEWARE ====================

// Compress responses
app.use(compression());

// ==================== STATIC FILES ====================

// Serve uploaded files
app.use('/uploads', express.static(env.UPLOAD_PATH));

// ==================== HEALTH CHECK ====================

/**
 * Health Check Endpoint
 * GET /health
 */
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'MediCore API is running',
        timestamp: new Date().toISOString(),
        environment: env.NODE_ENV,
        uptime: process.uptime()
    });
});

/**
 * Root Endpoint
 * GET /
 */
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to MediCore API',
        version: '1.0.0',
        documentation: '/api/docs',
        endpoints: {
            auth: '/api/auth',
            patient: '/api/patient',
            helper: '/api/helper'
        }
    });
});

// ==================== API ROUTES ====================

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/helper', helperRoutes);

// ==================== 404 HANDLER ====================

/**
 * Handle 404 - Route not found
 */
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl,
        method: req.method
    });
});

// ==================== ERROR HANDLER ====================

/**
 * Global Error Handler
 */
app.use((err, req, res, next) => {
    console.error('Error:', err);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: messages
        });
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return res.status(400).json({
            success: false,
            message: `${field} already exists`,
            field
        });
    }

    // Mongoose cast error
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: 'Invalid ID format',
            field: err.path
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expired'
        });
    }

    // Default error
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        ...(env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

module.exports = app;
