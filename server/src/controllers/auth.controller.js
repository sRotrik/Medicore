/**
 * Authentication Controller
 * Handles user signup, login, logout, and token management
 */

const jwt = require('jsonwebtoken');
const { User, Patient, Helper } = require('../models');
const env = require('../config/env');

/**
 * Generate JWT Token
 * @param {string} userId - User ID
 * @param {string} role - User role
 * @returns {string} JWT token
 */
const generateToken = (userId, role) => {
    return jwt.sign(
        { userId, role },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRE }
    );
};

/**
 * Generate Refresh Token
 * @param {string} userId - User ID
 * @returns {string} Refresh token
 */
const generateRefreshToken = (userId) => {
    return jwt.sign(
        { userId },
        env.JWT_REFRESH_SECRET,
        { expiresIn: env.JWT_REFRESH_EXPIRE }
    );
};

/**
 * Patient Signup
 * POST /api/auth/signup/patient
 */
const signupPatient = async (req, res) => {
    try {
        const {
            email,
            password,
            fullName,
            age,
            gender,
            contactNumber,
            whatsappEnabled,
            prescriptionFile
        } = req.body;

        // Validate required fields
        if (!email || !password || !fullName || !age || !gender || !contactNumber) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields: email, password, fullName, age, gender, contactNumber'
            });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered. Please login instead.'
            });
        }

        // Create user
        const user = await User.create({
            role: 'patient',
            email,
            passwordHash: password // Will be hashed by pre-save hook
        });

        // Create patient profile
        const patient = await Patient.create({
            userId: user._id,
            fullName,
            age,
            gender,
            contactNumber,
            whatsappEnabled: whatsappEnabled || false,
            prescriptionFile: prescriptionFile || null
        });

        // Generate tokens
        const token = generateToken(user._id, user.role);
        const refreshToken = generateRefreshToken(user._id);

        // Update last login
        await user.updateLastLogin();

        res.status(201).json({
            success: true,
            message: 'Patient account created successfully',
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    role: user.role
                },
                patient: {
                    id: patient._id,
                    fullName: patient.fullName,
                    age: patient.age,
                    gender: patient.gender,
                    contactNumber: patient.contactNumber
                },
                token,
                refreshToken
            }
        });
    } catch (error) {
        console.error('Patient signup error:', error);

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: messages
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error creating patient account',
            error: error.message
        });
    }
};

/**
 * Helper Signup
 * POST /api/auth/signup/helper
 */
const signupHelper = async (req, res) => {
    try {
        const {
            fullName,
            age,
            gender,
            contactNumber,
            verificationId,
            profileImage
        } = req.body;

        // Validate required fields
        if (!fullName || !age || !gender || !contactNumber || !verificationId) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields: fullName, age, gender, contactNumber, verificationId'
            });
        }

        // Check if verification ID already exists
        const existingHelper = await Helper.findOne({ verificationId });
        if (existingHelper) {
            return res.status(400).json({
                success: false,
                message: 'Verification ID already registered.'
            });
        }

        // Create user (no email/password for helpers)
        const user = await User.create({
            role: 'helper'
        });

        // Create helper profile
        const helper = await Helper.create({
            userId: user._id,
            fullName,
            age,
            gender,
            contactNumber,
            verificationId: verificationId.toUpperCase(),
            profileImage: profileImage || null,
            status: 'inactive' // Requires admin activation
        });

        // Generate tokens
        const token = generateToken(user._id, user.role);
        const refreshToken = generateRefreshToken(user._id);

        // Update last login
        await user.updateLastLogin();

        res.status(201).json({
            success: true,
            message: 'Helper account created successfully. Awaiting admin activation.',
            data: {
                user: {
                    id: user._id,
                    role: user.role
                },
                helper: {
                    id: helper._id,
                    fullName: helper.fullName,
                    age: helper.age,
                    gender: helper.gender,
                    contactNumber: helper.contactNumber,
                    verificationId: helper.verificationId,
                    status: helper.status
                },
                token,
                refreshToken
            }
        });
    } catch (error) {
        console.error('Helper signup error:', error);

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: messages
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error creating helper account',
            error: error.message
        });
    }
};

/**
 * Login
 * POST /api/auth/login
 */
const login = async (req, res) => {
    try {
        const { email, password, verificationId, role } = req.body;

        // Validate role
        if (!role || !['patient', 'helper', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Please specify a valid role: patient, helper, or admin'
            });
        }

        let user;
        let profile;

        // Patient/Admin login (email + password)
        if (role === 'patient' || role === 'admin') {
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide email and password'
                });
            }

            // Find user by email and role
            user = await User.findOne({ email, role }).select('+passwordHash');

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }

            // Verify password
            const isPasswordValid = await user.comparePassword(password);

            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }

            // Get patient profile if patient
            if (role === 'patient') {
                profile = await Patient.findOne({ userId: user._id });
            }
        }

        // Helper login (verification ID only)
        if (role === 'helper') {
            if (!verificationId) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide verification ID'
                });
            }

            // Find helper by verification ID
            profile = await Helper.findOne({
                verificationId: verificationId.toUpperCase()
            });

            if (!profile) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid verification ID'
                });
            }

            // Get user
            user = await User.findById(profile.userId);

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User account not found'
                });
            }

            // Check if helper is active
            if (profile.status !== 'active') {
                return res.status(403).json({
                    success: false,
                    message: 'Your account is inactive. Please contact an administrator.'
                });
            }
        }

        // Generate tokens
        const token = generateToken(user._id, user.role);
        const refreshToken = generateRefreshToken(user._id);

        // Update last login
        await user.updateLastLogin();

        // Prepare response data
        const responseData = {
            user: {
                id: user._id,
                role: user.role,
                email: user.email,
                lastLogin: user.lastLogin
            },
            token,
            refreshToken
        };

        // Add profile data
        if (profile) {
            responseData.profile = {
                id: profile._id,
                fullName: profile.fullName,
                age: profile.age,
                gender: profile.gender,
                contactNumber: profile.contactNumber
            };

            // Add role-specific fields
            if (role === 'helper') {
                responseData.profile.verificationId = profile.verificationId;
                responseData.profile.status = profile.status;
                responseData.profile.assignedPatients = profile.assignedPatients;
            }
        }

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: responseData
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error during login',
            error: error.message
        });
    }
};

/**
 * Get Current User
 * GET /api/auth/me
 */
const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get profile based on role
        let profile;
        if (user.role === 'patient') {
            profile = await Patient.findOne({ userId: user._id });
        } else if (user.role === 'helper') {
            profile = await Helper.findOne({ userId: user._id })
                .populate('assignedPatients', 'fullName age gender contactNumber');
        }

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    role: user.role,
                    email: user.email,
                    lastLogin: user.lastLogin,
                    createdAt: user.createdAt
                },
                profile
            }
        });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user data',
            error: error.message
        });
    }
};

/**
 * Logout
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
    try {
        // In a production app, you would:
        // 1. Add token to blacklist/revocation list
        // 2. Clear any server-side sessions
        // 3. Log the logout event

        res.status(200).json({
            success: true,
            message: 'Logout successful'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Error during logout',
            error: error.message
        });
    }
};

/**
 * Refresh Token
 * POST /api/auth/refresh
 */
const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token is required'
            });
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);

        // Get user
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token'
            });
        }

        // Generate new tokens
        const newToken = generateToken(user._id, user.role);
        const newRefreshToken = generateRefreshToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Token refreshed successfully',
            data: {
                token: newToken,
                refreshToken: newRefreshToken
            }
        });
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired refresh token'
            });
        }

        console.error('Refresh token error:', error);
        res.status(500).json({
            success: false,
            message: 'Error refreshing token',
            error: error.message
        });
    }
};

module.exports = {
    signupPatient,
    signupHelper,
    login,
    getCurrentUser,
    logout,
    refreshToken
};
