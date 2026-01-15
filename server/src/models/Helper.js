/**
 * Helper Model
 * Stores helper-specific information
 */

const mongoose = require('mongoose');

const helperSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User reference is required'],
        unique: true
    },
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    age: {
        type: Number,
        required: [true, 'Age is required'],
        min: [18, 'Age must be at least 18'],
        max: [120, 'Age cannot exceed 120']
    },
    gender: {
        type: String,
        enum: {
            values: ['Male', 'Female', 'Other'],
            message: 'Gender must be Male, Female, or Other'
        },
        required: [true, 'Gender is required']
    },
    contactNumber: {
        type: String,
        required: [true, 'Contact number is required'],
        match: [/^\d{10}$/, 'Please provide a valid 10-digit phone number']
    },
    verificationId: {
        type: String,
        required: [true, 'Verification ID is required'],
        unique: true,
        trim: true,
        uppercase: true
    },
    profileImage: {
        type: String, // File path or URL
        default: null
    },
    status: {
        type: String,
        enum: {
            values: ['active', 'inactive'],
            message: 'Status must be active or inactive'
        },
        default: 'active'
    },
    assignedPatients: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient'
    }],
    joinedAt: {
        type: Date,
        default: Date.now
    },
    // Performance stats
    stats: {
        tasksCompleted: {
            type: Number,
            default: 0,
            min: 0
        },
        avgResponseTime: {
            type: String,
            default: 'N/A'
        },
        performanceScore: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        daysActive: {
            type: Number,
            default: 0,
            min: 0
        }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for performance
helperSchema.index({ userId: 1 });
helperSchema.index({ verificationId: 1 });
helperSchema.index({ status: 1 });
helperSchema.index({ fullName: 'text' }); // Text search on name
helperSchema.index({ createdAt: -1 });

// Virtual for user details
helperSchema.virtual('user', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true
});

// Virtual for assigned patient count
helperSchema.virtual('patientCount').get(function () {
    return this.assignedPatients ? this.assignedPatients.length : 0;
});

// Method to assign patient
helperSchema.methods.assignPatient = async function (patientId) {
    if (!this.assignedPatients.includes(patientId)) {
        this.assignedPatients.push(patientId);
        await this.save();

        // Update patient's helperId
        await mongoose.model('Patient').findByIdAndUpdate(
            patientId,
            { helperId: this._id }
        );
    }
};

// Method to unassign patient
helperSchema.methods.unassignPatient = async function (patientId) {
    this.assignedPatients = this.assignedPatients.filter(
        id => id.toString() !== patientId.toString()
    );
    await this.save();

    // Remove patient's helperId
    await mongoose.model('Patient').findByIdAndUpdate(
        patientId,
        { helperId: null }
    );
};

// Method to calculate days active
helperSchema.methods.calculateDaysActive = function () {
    const now = new Date();
    const joined = new Date(this.joinedAt);
    const diffTime = Math.abs(now - joined);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    this.stats.daysActive = diffDays;
    return diffDays;
};

// Pre-save hook to update days active
helperSchema.pre('save', function (next) {
    if (this.isNew || this.isModified('joinedAt')) {
        this.calculateDaysActive();
    }
    next();
});

const Helper = mongoose.model('Helper', helperSchema);

module.exports = Helper;
