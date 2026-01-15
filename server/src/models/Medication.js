/**
 * Medication Model
 * Stores patient medication information and tracking
 */

const mongoose = require('mongoose');

const takenLogSchema = new mongoose.Schema({
    takenTime: {
        type: Date,
        required: true
    },
    delayMinutes: {
        type: Number,
        default: 0,
        min: 0
    }
}, { _id: true });

const medicationSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: [true, 'Patient reference is required']
    },
    name: {
        type: String,
        required: [true, 'Medication name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    qtyPerDose: {
        type: Number,
        required: [true, 'Quantity per dose is required'],
        min: [1, 'Quantity per dose must be at least 1']
    },
    totalQty: {
        type: Number,
        required: [true, 'Total quantity is required'],
        min: [1, 'Total quantity must be at least 1']
    },
    remainingQty: {
        type: Number,
        required: [true, 'Remaining quantity is required'],
        min: [0, 'Remaining quantity cannot be negative']
    },
    scheduledTime: {
        type: String,
        required: [true, 'Scheduled time is required'],
        match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:MM format (24-hour)']
    },
    mealType: {
        type: String,
        enum: {
            values: ['Before Meal', 'After Meal', 'With Meal'],
            message: 'Meal type must be Before Meal, After Meal, or With Meal'
        },
        required: [true, 'Meal type is required']
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required']
    },
    endDate: {
        type: Date,
        required: [true, 'End date is required'],
        validate: {
            validator: function (value) {
                return value > this.startDate;
            },
            message: 'End date must be after start date'
        }
    },
    remarks: {
        type: String,
        trim: true,
        maxlength: [500, 'Remarks cannot exceed 500 characters']
    },
    takenLogs: [takenLogSchema],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Compound indexes for performance
medicationSchema.index({ patientId: 1, scheduledTime: 1 });
medicationSchema.index({ patientId: 1, isActive: 1 });
medicationSchema.index({ startDate: 1, endDate: 1 });
medicationSchema.index({ createdAt: -1 });

// Virtual for patient details
medicationSchema.virtual('patient', {
    ref: 'Patient',
    localField: 'patientId',
    foreignField: '_id',
    justOne: true
});

// Virtual to check if medication is currently active based on dates
medicationSchema.virtual('isCurrentlyActive').get(function () {
    const now = new Date();
    return this.isActive &&
        now >= this.startDate &&
        now <= this.endDate &&
        this.remainingQty > 0;
});

// Method to mark medication as taken
medicationSchema.methods.markAsTaken = async function (takenTime = new Date()) {
    // Calculate delay
    const [schedHours, schedMinutes] = this.scheduledTime.split(':').map(Number);
    const scheduledDateTime = new Date(takenTime);
    scheduledDateTime.setHours(schedHours, schedMinutes, 0, 0);

    const delayMs = takenTime - scheduledDateTime;
    const delayMinutes = Math.max(0, Math.round(delayMs / (1000 * 60)));

    // Add to taken logs
    this.takenLogs.push({
        takenTime,
        delayMinutes
    });

    // Decrease remaining quantity
    this.remainingQty = Math.max(0, this.remainingQty - this.qtyPerDose);

    // Deactivate if no quantity left
    if (this.remainingQty === 0) {
        this.isActive = false;
    }

    await this.save();

    return {
        takenTime,
        delayMinutes,
        remainingQty: this.remainingQty
    };
};

// Method to check if taken today
medicationSchema.methods.isTakenToday = function () {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.takenLogs.some(log => {
        const logDate = new Date(log.takenTime);
        logDate.setHours(0, 0, 0, 0);
        return logDate.getTime() === today.getTime();
    });
};

// Method to get today's log
medicationSchema.methods.getTodayLog = function () {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.takenLogs.find(log => {
        const logDate = new Date(log.takenTime);
        logDate.setHours(0, 0, 0, 0);
        return logDate.getTime() === today.getTime();
    });
};

// Static method to get active medications for a patient
medicationSchema.statics.getActiveForPatient = function (patientId) {
    const now = new Date();
    return this.find({
        patientId,
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now }
    }).sort({ scheduledTime: 1 });
};

// Pre-save hook to validate dates
medicationSchema.pre('save', function (next) {
    // Auto-deactivate if past end date
    const now = new Date();
    if (now > this.endDate) {
        this.isActive = false;
    }

    next();
});

const Medication = mongoose.model('Medication', medicationSchema);

module.exports = Medication;
