/**
 * Appointment Model
 * Stores patient appointment information
 */

const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: [true, 'Patient reference is required']
    },
    doctorName: {
        type: String,
        required: [true, 'Doctor name is required'],
        trim: true,
        minlength: [2, 'Doctor name must be at least 2 characters'],
        maxlength: [100, 'Doctor name cannot exceed 100 characters']
    },
    contact: {
        type: String,
        required: [true, 'Contact number is required'],
        match: [/^\d{10}$/, 'Please provide a valid 10-digit phone number']
    },
    date: {
        type: Date,
        required: [true, 'Appointment date is required'],
        validate: {
            validator: function (value) {
                // Allow past dates for historical records
                return value instanceof Date && !isNaN(value);
            },
            message: 'Please provide a valid date'
        }
    },
    time: {
        type: String,
        required: [true, 'Appointment time is required'],
        match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:MM format (24-hour)']
    },
    place: {
        type: String,
        required: [true, 'Appointment place is required'],
        trim: true,
        minlength: [2, 'Place must be at least 2 characters'],
        maxlength: [200, 'Place cannot exceed 200 characters']
    },
    type: {
        type: String,
        enum: {
            values: ['video', 'in-person'],
            message: 'Type must be video or in-person'
        },
        default: function () {
            // Auto-detect type from place
            const placeLower = this.place.toLowerCase();
            return (placeLower.includes('video') ||
                placeLower.includes('online') ||
                placeLower.includes('virtual'))
                ? 'video'
                : 'in-person';
        }
    },
    remarks: {
        type: String,
        trim: true,
        maxlength: [500, 'Remarks cannot exceed 500 characters']
    },
    status: {
        type: String,
        enum: {
            values: ['scheduled', 'completed', 'cancelled', 'missed'],
            message: 'Status must be scheduled, completed, cancelled, or missed'
        },
        default: 'scheduled'
    },
    attended: {
        type: Boolean,
        default: false
    },
    reminderSent: {
        type: Boolean,
        default: false
    },
    reminderSentAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Compound indexes for performance
appointmentSchema.index({ patientId: 1, date: 1 });
appointmentSchema.index({ patientId: 1, status: 1 });
appointmentSchema.index({ date: 1, status: 1 });
appointmentSchema.index({ reminderSent: 1, date: 1 });
appointmentSchema.index({ createdAt: -1 });

// Virtual for patient details
appointmentSchema.virtual('patient', {
    ref: 'Patient',
    localField: 'patientId',
    foreignField: '_id',
    justOne: true
});

// Virtual to check if appointment is upcoming
appointmentSchema.virtual('isUpcoming').get(function () {
    const now = new Date();
    const appointmentDateTime = new Date(this.date);
    const [hours, minutes] = this.time.split(':').map(Number);
    appointmentDateTime.setHours(hours, minutes, 0, 0);

    return appointmentDateTime > now && this.status === 'scheduled';
});

// Virtual to check if appointment is past
appointmentSchema.virtual('isPast').get(function () {
    const now = new Date();
    const appointmentDateTime = new Date(this.date);
    const [hours, minutes] = this.time.split(':').map(Number);
    appointmentDateTime.setHours(hours, minutes, 0, 0);

    return appointmentDateTime < now;
});

// Virtual to get days until appointment
appointmentSchema.virtual('daysUntil').get(function () {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const appointmentDate = new Date(this.date);
    appointmentDate.setHours(0, 0, 0, 0);

    const diffTime = appointmentDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
});

// Method to mark as attended
appointmentSchema.methods.markAsAttended = async function () {
    this.attended = true;
    this.status = 'completed';
    await this.save();
};

// Method to mark as missed
appointmentSchema.methods.markAsMissed = async function () {
    this.attended = false;
    this.status = 'missed';
    await this.save();
};

// Method to cancel appointment
appointmentSchema.methods.cancel = async function () {
    this.status = 'cancelled';
    await this.save();
};

// Method to mark reminder as sent
appointmentSchema.methods.markReminderSent = async function () {
    this.reminderSent = true;
    this.reminderSentAt = new Date();
    await this.save();
};

// Static method to get upcoming appointments for a patient
appointmentSchema.statics.getUpcomingForPatient = function (patientId) {
    const now = new Date();
    return this.find({
        patientId,
        date: { $gte: now },
        status: 'scheduled'
    }).sort({ date: 1, time: 1 });
};

// Static method to get past appointments for a patient
appointmentSchema.statics.getPastForPatient = function (patientId) {
    const now = new Date();
    return this.find({
        patientId,
        date: { $lt: now }
    }).sort({ date: -1, time: -1 });
};

// Static method to get appointments needing reminders
appointmentSchema.statics.getNeedingReminders = function (hoursAhead = 24) {
    const now = new Date();
    const futureTime = new Date(now.getTime() + (hoursAhead * 60 * 60 * 1000));

    return this.find({
        date: { $gte: now, $lte: futureTime },
        status: 'scheduled',
        reminderSent: false
    });
};

// Pre-save hook to auto-update status
appointmentSchema.pre('save', function (next) {
    // Auto-mark as missed if past and not attended
    if (this.isPast && this.status === 'scheduled' && !this.attended) {
        this.status = 'missed';
    }

    // Set attended based on status
    if (this.status === 'completed') {
        this.attended = true;
    }

    next();
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
