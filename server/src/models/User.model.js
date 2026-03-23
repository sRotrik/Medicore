/**
 * User Model (Sequelize)
 * Represents all users: Patients, Helpers, and Admins
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('users', {
    user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('patient', 'helper', 'admin'),
        allowNull: false,
        defaultValue: 'patient'
    },

    // Common profile fields
    full_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    mobile: {
        type: DataTypes.STRING(15),
        allowNull: false
    },
    whatsapp: {
        type: DataTypes.STRING(15),
        allowNull: true
    },

    // Patient-specific fields
    age: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 1,
            max: 150
        }
    },
    gender: {
        type: DataTypes.ENUM('male', 'female', 'other'),
        allowNull: true
    },
    prescription_url: {
        type: DataTypes.STRING(500),
        allowNull: true
    },

    // Helper-specific fields
    specialization: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    experience_years: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 0
        }
    },

    // Account status
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },

    // Timestamps
    last_login: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    tableName: 'users',
    indexes: [
        { fields: ['email'] },
        { fields: ['role'] },
        { fields: ['is_active'] },
        { fields: ['created_at'] }
    ]
});

/**
 * Instance Methods
 */

// Compare password
User.prototype.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password_hash);
};

// Get public profile (exclude sensitive data)
User.prototype.getPublicProfile = function () {
    const { password_hash, ...publicData } = this.toJSON();
    return publicData;
};

// Update last login
User.prototype.updateLastLogin = async function () {
    this.last_login = new Date();
    await this.save();
};

/**
 * Static Methods
 */

// Hash password before creating user
User.beforeCreate(async (user) => {
    if (user.password_hash) {
        const salt = await bcrypt.genSalt(12);
        user.password_hash = await bcrypt.hash(user.password_hash, salt);
    }
});

// Hash password before updating if changed
User.beforeUpdate(async (user) => {
    if (user.changed('password_hash')) {
        const salt = await bcrypt.genSalt(12);
        user.password_hash = await bcrypt.hash(user.password_hash, salt);
    }
});

// Find user by email
User.findByEmail = async function (email) {
    return await this.findOne({ where: { email } });
};

// Find active users by role
User.findByRole = async function (role, activeOnly = true) {
    const where = { role };
    if (activeOnly) {
        where.is_active = true;
    }
    return await this.findAll({ where });
};

// Create patient
User.createPatient = async function (patientData) {
    return await this.create({
        ...patientData,
        role: 'patient'
    });
};

// Create helper
User.createHelper = async function (helperData) {
    return await this.create({
        ...helperData,
        role: 'helper'
    });
};

// Create admin
User.createAdmin = async function (adminData) {
    return await this.create({
        ...adminData,
        role: 'admin'
    });
};

// Get user statistics
User.getStatistics = async function () {
    const [results] = await sequelize.query(`
        SELECT 
            role,
            COUNT(*) as count,
            SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_count,
            SUM(CASE WHEN is_verified = 1 THEN 1 ELSE 0 END) as verified_count
        FROM users
        GROUP BY role
    `);
    return results;
};

module.exports = User;
