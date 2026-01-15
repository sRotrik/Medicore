/**
 * User Model - Base Authentication Model
 * Handles authentication for all user types (Patient, Helper, Admin)
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['patient', 'helper', 'admin'],
        required: [true, 'User role is required']
    },
    email: {
        type: String,
        lowercase: true,
        trim: true,
        sparse: true, // Allows null for helpers
        unique: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
        required: function () {
            // Email required for patient and admin, optional for helper
            return this.role === 'patient' || this.role === 'admin';
        }
    },
    passwordHash: {
        type: String,
        required: function () {
            // Password required for patient and admin, not for helper
            return this.role === 'patient' || this.role === 'admin';
        },
        select: false // Don't return password in queries by default
    },
    lastLogin: {
        type: Date,
        default: null
    }
}, {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
    // Only hash if password is modified
    if (!this.isModified('passwordHash')) {
        return next();
    }

    if (this.passwordHash) {
        const salt = await bcrypt.genSalt(12);
        this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    }

    next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.passwordHash) {
        return false;
    }
    return await bcrypt.compare(candidatePassword, this.passwordHash);
};

// Method to update last login
userSchema.methods.updateLastLogin = async function () {
    this.lastLogin = new Date();
    await this.save();
};

// Remove sensitive data from JSON response
userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.passwordHash;
    delete obj.__v;
    return obj;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
