/**
 * Authentication Controller (MySQL/Sequelize)
 * Handles user signup, login, logout, and token management
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, RefreshToken, PatientHelper } = require('../models');
const env = require('../config/env');

/**
 * Generate JWT Access Token
 * @param {number} userId - User ID
 * @param {string} role - User role
 * @returns {string} JWT token
 */
const generateToken = (userId, role) => {
    return jwt.sign(
        { user_id: userId, role },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRE || '24h' }
    );
};

/**
 * Generate Refresh Token
 * @param {number} userId - User ID
 * @param {string} role - User role
 * @returns {Promise<string>} Refresh token
 */
const generateRefreshToken = async (userId, role) => {
    const token = jwt.sign(
        { user_id: userId, role, type: 'refresh' },
        env.JWT_REFRESH_SECRET || env.JWT_SECRET,
        { expiresIn: env.JWT_REFRESH_EXPIRE || '30d' }
    );

    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await RefreshToken.create({
        user_id: userId,
        token: token,
        expires_at: expiresAt
    });

    return token;
};

/**
 * Assign patient to next available helper (Round Robin / Least Load)
 */
const assignToNextHelper = async (patientId) => {
    try {
        // Find all active helpers
        const helpers = await User.findAll({
            where: { role: 'helper', is_active: true },
            order: [['user_id', 'ASC']] // Ensure deterministic order for stable round-robin
        });

        if (helpers.length === 0) return;

        // Find helper with minimum load
        let selectedHelper = null;
        let minPatients = Infinity;

        // Note: For larger scale, this should be optimized with a single GROUP BY query
        for (const helper of helpers) {
            const count = await PatientHelper.count({
                where: { helper_id: helper.user_id, is_active: true }
            });

            if (count < minPatients) {
                minPatients = count;
                selectedHelper = helper;
            }
        }

        if (selectedHelper) {
            await PatientHelper.create({
                patient_id: patientId,
                helper_id: selectedHelper.user_id,
                is_active: true,
                assigned_by: null // Indicates system assignment
            });
            console.log(`Auto-assigned Patient ${patientId} to Helper ${selectedHelper.user_id} (Load: ${minPatients})`);
        }
    } catch (error) {
        console.error('Auto-assignment error:', error);
        // Don't generate error for user, just log it
    }
};

/**
 * Patient Registration
 * POST /api/auth/register
 */
const register = async (req, res) => {
    try {
        const {
            email,
            password,
            full_name,
            age,
            gender,
            mobile,
            whatsapp
        } = req.body;

        // Validate required fields
        if (!email || !password || !full_name || !age || !gender || !mobile) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields: email, password, full_name, age, gender, mobile'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        // Validate password strength
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long'
            });
        }

        // Validate mobile number
        const mobileRegex = /^[0-9]{10}$/;
        if (!mobileRegex.test(mobile)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid 10-digit mobile number'
            });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered. Please login instead.'
            });
        }

        // Create user
        const user = await User.create({
            email: email.toLowerCase(),
            password_hash: password, // Model hook handles hashing
            role: 'patient',
            full_name: full_name,
            age: parseInt(age),
            gender: gender,
            mobile: mobile,
            whatsapp: whatsapp || mobile,
            is_active: true
        });

        // Auto-assign to helper
        await assignToNextHelper(user.user_id);

        // Generate tokens
        const accessToken = generateToken(user.user_id, user.role);
        const refreshToken = await generateRefreshToken(user.user_id, user.role);

        // Remove password from response
        const userResponse = {
            user_id: user.user_id,
            email: user.email,
            role: user.role,
            full_name: user.full_name,
            age: user.age,
            gender: user.gender,
            mobile: user.mobile
        };

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            user: userResponse,
            accessToken,
            refreshToken
        });

    } catch (error) {
        console.error('Registration error:', error);

        // Handle Sequelize validation errors
        if (error.name === 'SequelizeValidationError') {
            const messages = error.errors.map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: messages
            });
        }

        // Handle unique constraint errors
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error creating account',
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
        const { email, password, role } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Validate role if provided
        if (role && !['patient', 'helper', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role specified'
            });
        }

        // Find user by email
        const whereClause = { email: email.toLowerCase() };
        if (role) {
            whereClause.role = role;
        }

        const user = await User.findOne({ where: whereClause });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if user is active
        if (!user.is_active) {
            return res.status(403).json({
                success: false,
                message: 'Your account is inactive or pending admin approval.'
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Update last login
        await user.update({ last_login: new Date() });

        // Generate tokens
        const accessToken = generateToken(user.user_id, user.role);
        const refreshToken = await generateRefreshToken(user.user_id, user.role);

        // Prepare response
        const userResponse = {
            user_id: user.user_id,
            email: user.email,
            role: user.role,
            full_name: user.full_name,
            age: user.age,
            gender: user.gender,
            mobile: user.mobile,
            last_login: user.last_login
        };

        res.status(200).json({
            success: true,
            message: 'Login successful',
            user: userResponse,
            accessToken,
            refreshToken
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
        const userId = req.user.user_id;

        const user = await User.findByPk(userId, {
            attributes: { exclude: ['password_hash'] }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            user: {
                user_id: user.user_id,
                email: user.email,
                role: user.role,
                full_name: user.full_name,
                age: user.age,
                gender: user.gender,
                mobile: user.mobile,
                whatsapp: user.whatsapp,
                is_active: user.is_active,
                last_login: user.last_login,
                created_at: user.created_at
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
        const { refreshToken } = req.body;

        if (refreshToken) {
            // Revoke refresh token
            await RefreshToken.destroy({
                where: { token: refreshToken }
            });
        }

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
 * Refresh Access Token
 * POST /api/auth/refresh
 */
const refreshAccessToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token is required'
            });
        }

        // Verify refresh token
        let decoded;
        try {
            decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET || env.JWT_SECRET);
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired refresh token'
            });
        }

        // Check if token exists in database
        const tokenRecord = await RefreshToken.findOne({
            where: { token: refreshToken }
        });

        if (!tokenRecord) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token not found'
            });
        }

        // Check if token is expired
        if (new Date() > tokenRecord.expires_at) {
            await tokenRecord.destroy();
            return res.status(401).json({
                success: false,
                message: 'Refresh token has expired'
            });
        }

        // Get user
        const user = await User.findByPk(decoded.user_id);

        if (!user || !user.is_active) {
            return res.status(401).json({
                success: false,
                message: 'User not found or inactive'
            });
        }

        // Generate new access token
        const newAccessToken = generateToken(user.user_id, user.role);

        res.status(200).json({
            success: true,
            message: 'Token refreshed successfully',
            accessToken: newAccessToken
        });

    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({
            success: false,
            message: 'Error refreshing token',
            error: error.message
        });
    }
};

/**
 * Change Password
 * POST /api/auth/change-password
 */
const changePassword = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { currentPassword, newPassword } = req.body;

        // Validate required fields
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide current password and new password'
            });
        }

        // Validate new password strength
        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 8 characters long'
            });
        }

        // Get user
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        await user.update({ password_hash: newPassword }); // Model hook handles hashing

        // Revoke all refresh tokens for security
        await RefreshToken.destroy({
            where: { user_id: userId }
        });

        res.status(200).json({
            success: true,
            message: 'Password changed successfully. Please login again.'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error changing password',
            error: error.message
        });
    }
};

/**
 * Helper Registration
 * POST /api/auth/register/helper
 */
const registerHelper = async (req, res) => {
    try {
        const {
            email,
            password,
            full_name,
            age,
            gender,
            mobile,
            whatsapp,
            verification_id
        } = req.body;

        // Validate required fields
        if (!email || !password || !full_name || !age || !gender || !mobile || !verification_id) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields: email, password, full_name, age, gender, mobile, verification_id'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        // Validate password strength
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long'
            });
        }

        // Validate mobile number
        const mobileRegex = /^[0-9]{10}$/;
        if (!mobileRegex.test(mobile)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid 10-digit mobile number'
            });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered. Please use a different email.'
            });
        }

        // Create helper account (INACTIVE by default - requires admin approval)
        const helper = await User.create({
            email: email.toLowerCase(),
            password_hash: password, // Model hook handles hashing
            role: 'helper',
            full_name: full_name,
            age: parseInt(age),
            gender: gender,
            mobile: mobile,
            whatsapp: whatsapp || mobile,
            is_active: false  // ← IMPORTANT: Inactive until admin approves
        });

        // Remove password from response
        const helperResponse = {
            user_id: helper.user_id,
            email: helper.email,
            role: helper.role,
            full_name: helper.full_name,
            age: helper.age,
            gender: helper.gender,
            mobile: helper.mobile,
            is_active: helper.is_active
        };

        res.status(201).json({
            success: true,
            message: 'Helper registration successful! Your account is pending admin approval. You will be notified once approved.',
            user: helperResponse
        });

    } catch (error) {
        console.error('Helper registration error:', error);

        // Handle Sequelize validation errors
        if (error.name === 'SequelizeValidationError') {
            const messages = error.errors.map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: messages
            });
        }

        // Handle unique constraint errors
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error creating helper account',
            error: error.message
        });
    }
};

module.exports = {
    register,
    registerHelper,
    login,
    getCurrentUser,
    logout,
    refreshAccessToken,
    changePassword
};
