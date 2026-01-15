/**
 * Authentication Middleware
 * Verifies JWT tokens and attaches user to request
 */

const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { User } = require('../models');

/**
 * Verify JWT Token
 * Extracts token from Authorization header and verifies it
 */
const verifyToken = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        // Extract token
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Invalid token format.'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, env.JWT_SECRET);

        // Get user from database
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. User not found.'
            });
        }

        // Attach user to request
        req.user = {
            userId: user._id,
            role: user.role,
            email: user.email
        };

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Invalid token.'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Token expired.'
            });
        }

        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during authentication.'
        });
    }
};

/**
 * Optional Authentication
 * Verifies token if present, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);

            if (token) {
                const decoded = jwt.verify(token, env.JWT_SECRET);
                const user = await User.findById(decoded.userId);

                if (user) {
                    req.user = {
                        userId: user._id,
                        role: user.role,
                        email: user.email
                    };
                }
            }
        }

        next();
    } catch (error) {
        // Continue without authentication
        next();
    }
};

module.exports = {
    verifyToken,
    optionalAuth
};
