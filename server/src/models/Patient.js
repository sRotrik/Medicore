/**
 * Patient Model
 * Stores patient-specific information
 */

const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
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
    whatsappEnabled: {
        type: Boolean,
        default: false
    },
    prescriptionFile: {
        type: String, // File path or URL
        default: null
    },
    helperId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Helper',
        default: null
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for performance
patientSchema.index({ userId: 1 });
patientSchema.index({ helperId: 1 });
patientSchema.index({ fullName: 'text' }); // Text search on name
patientSchema.index({ createdAt: -1 });

// Virtual for medications
patientSchema.virtual('medications', {
    ref: 'Medication',
    localField: '_id',
    foreignField: 'patientId'
});

// Virtual for appointments
patientSchema.virtual('appointments', {
    ref: 'Appointment',
    localField: '_id',
    foreignField: 'patientId'
});

// Virtual for user details
patientSchema.virtual('user', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true
});

// Pre-remove hook to clean up related data
patientSchema.pre('remove', async function (next) {
    // Remove all medications
    await mongoose.model('Medication').deleteMany({ patientId: this._id });

    // Remove all appointments
    await mongoose.model('Appointment').deleteMany({ patientId: this._id });

    // Remove all notifications
    await mongoose.model('Notification').deleteMany({ userId: this.userId });

    next();
});

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;
