/**
 * RefreshToken Model (Sequelize)
 * Stores JWT refresh tokens for authentication
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const jwt = require('jsonwebtoken');
const env = require('../config/env');

const RefreshToken = sequelize.define('refresh_tokens', {
    token_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'user_id'
        },
        onDelete: 'CASCADE'
    },
    token: {
        type: DataTypes.STRING(500),
        allowNull: false,
        unique: true
    },
    expires_at: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    tableName: 'refresh_tokens',
    indexes: [
        { fields: ['user_id'] },
        { fields: ['token'], unique: true },
        { fields: ['expires_at'] }
    ]
});

/**
 * Instance Methods
 */

// Check if token is expired
RefreshToken.prototype.isExpired = function () {
    return new Date() > this.expires_at;
};

// Verify token
RefreshToken.prototype.verify = function () {
    try {
        const decoded = jwt.verify(this.token, env.JWT_REFRESH_SECRET);
        return !this.isExpired() && decoded;
    } catch (error) {
        return false;
    }
};

/**
 * Static Methods
 */

// Generate refresh token
RefreshToken.generateToken = function (userId, role) {
    const expiresIn = env.JWT_REFRESH_EXPIRE || '30d';

    const token = jwt.sign(
        { user_id: userId, role: role, type: 'refresh' },
        env.JWT_REFRESH_SECRET,
        { expiresIn }
    );

    return token;
};

// Create refresh token
RefreshToken.createToken = async function (userId, role) {
    const token = this.generateToken(userId, role);

    // Calculate expiry date (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    return await this.create({
        user_id: userId,
        token: token,
        expires_at: expiresAt
    });
};

// Find token by value
RefreshToken.findByToken = async function (token) {
    return await this.findOne({ where: { token } });
};

// Verify and get user
RefreshToken.verifyToken = async function (token) {
    try {
        const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);

        const tokenRecord = await this.findOne({
            where: { token, user_id: decoded.user_id }
        });

        if (!tokenRecord || tokenRecord.isExpired()) {
            return null;
        }

        return decoded;
    } catch (error) {
        return null;
    }
};

// Revoke token
RefreshToken.revokeToken = async function (token) {
    const tokenRecord = await this.findOne({ where: { token } });

    if (tokenRecord) {
        await tokenRecord.destroy();
        return true;
    }

    return false;
};

// Revoke all tokens for a user
RefreshToken.revokeUserTokens = async function (userId) {
    const count = await this.destroy({
        where: { user_id: userId }
    });

    return count;
};

// Clean up expired tokens (cron job helper)
RefreshToken.cleanupExpired = async function () {
    const count = await this.destroy({
        where: {
            expires_at: { [sequelize.Sequelize.Op.lt]: new Date() }
        }
    });

    console.log(`🧹 Cleaned up ${count} expired refresh tokens`);
    return count;
};

// Get active tokens for a user
RefreshToken.getUserTokens = async function (userId) {
    return await this.findAll({
        where: {
            user_id: userId,
            expires_at: { [sequelize.Sequelize.Op.gt]: new Date() }
        },
        order: [['created_at', 'DESC']]
    });
};

// Get token statistics
RefreshToken.getStats = async function () {
    const [results] = await sequelize.query(`
        SELECT 
            COUNT(*) as total_tokens,
            SUM(CASE WHEN expires_at > NOW() THEN 1 ELSE 0 END) as active_tokens,
            SUM(CASE WHEN expires_at <= NOW() THEN 1 ELSE 0 END) as expired_tokens,
            COUNT(DISTINCT user_id) as users_with_tokens
        FROM refresh_tokens
    `);

    return results[0] || {};
};

module.exports = RefreshToken;
