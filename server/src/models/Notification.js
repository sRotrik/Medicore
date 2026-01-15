/**
 * Notification Model
 * Stores system notifications for users
 */

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User reference is required']
    },
    type: {
        type: String,
        enum: {
            values: [
                'medication_reminder',
                'medication_missed',
                'appointment_reminder',
                'appointment_missed',
                'system',
                'helper_assigned',
                'account_status'
            ],
            message: 'Invalid notification type'
        },
        required: [true, 'Notification type is required']
    },
    title: {
        type: String,
        required: [true, 'Notification title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    message: {
        type: String,
        required: [true, 'Notification message is required'],
        trim: true,
        maxlength: [1000, 'Message cannot exceed 1000 characters']
    },
    relatedId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'relatedModel',
        default: null
    },
    relatedModel: {
        type: String,
        enum: ['Medication', 'Appointment', 'Patient', 'Helper'],
        default: null
    },
    read: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date,
        default: null
    },
    emailSent: {
        type: Boolean,
        default: false
    },
    emailSentAt: {
        type: Date,
        default: null
    },
    priority: {
        type: String,
        enum: {
            values: ['low', 'medium', 'high', 'urgent'],
            message: 'Priority must be low, medium, high, or urgent'
        },
        default: 'medium'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for performance
notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ emailSent: 1, createdAt: -1 });
notificationSchema.index({ createdAt: -1 });

// Virtual for user details
notificationSchema.virtual('user', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true
});

// Virtual to check if notification is recent (within 24 hours)
notificationSchema.virtual('isRecent').get(function () {
    const now = new Date();
    const dayAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    return this.createdAt > dayAgo;
});

// Method to mark as read
notificationSchema.methods.markAsRead = async function () {
    if (!this.read) {
        this.read = true;
        this.readAt = new Date();
        await this.save();
    }
};

// Method to mark email as sent
notificationSchema.methods.markEmailSent = async function () {
    if (!this.emailSent) {
        this.emailSent = true;
        this.emailSentAt = new Date();
        await this.save();
    }
};

// Static method to get unread notifications for a user
notificationSchema.statics.getUnreadForUser = function (userId) {
    return this.find({
        userId,
        read: false
    }).sort({ createdAt: -1 });
};

// Static method to get recent notifications for a user
notificationSchema.statics.getRecentForUser = function (userId, limit = 20) {
    return this.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit);
};

// Static method to get unread count for a user
notificationSchema.statics.getUnreadCount = function (userId) {
    return this.countDocuments({
        userId,
        read: false
    });
};

// Static method to mark all as read for a user
notificationSchema.statics.markAllAsReadForUser = async function (userId) {
    const now = new Date();
    return this.updateMany(
        { userId, read: false },
        { $set: { read: true, readAt: now } }
    );
};

// Static method to create medication reminder
notificationSchema.statics.createMedicationReminder = async function (userId, medication) {
    return this.create({
        userId,
        type: 'medication_reminder',
        title: `⏰ Medication Reminder: ${medication.name}`,
        message: `Time to take your medication: ${medication.name} (${medication.qtyPerDose} pill(s)) at ${medication.scheduledTime}`,
        relatedId: medication._id,
        relatedModel: 'Medication',
        priority: 'high'
    });
};

// Static method to create medication missed alert
notificationSchema.statics.createMedicationMissed = async function (userId, medication) {
    return this.create({
        userId,
        type: 'medication_missed',
        title: `⚠️ Missed Medication: ${medication.name}`,
        message: `You missed your scheduled medication: ${medication.name} at ${medication.scheduledTime}. Please take it as soon as possible.`,
        relatedId: medication._id,
        relatedModel: 'Medication',
        priority: 'urgent'
    });
};

// Static method to create appointment reminder
notificationSchema.statics.createAppointmentReminder = async function (userId, appointment) {
    return this.create({
        userId,
        type: 'appointment_reminder',
        title: `📅 Appointment Reminder: Dr. ${appointment.doctorName}`,
        message: `You have an appointment with Dr. ${appointment.doctorName} tomorrow at ${appointment.time} at ${appointment.place}`,
        relatedId: appointment._id,
        relatedModel: 'Appointment',
        priority: 'high'
    });
};

// Static method to create appointment missed alert
notificationSchema.statics.createAppointmentMissed = async function (userId, appointment) {
    return this.create({
        userId,
        type: 'appointment_missed',
        title: `⚠️ Missed Appointment: Dr. ${appointment.doctorName}`,
        message: `You missed your appointment with Dr. ${appointment.doctorName}. Please contact them to reschedule.`,
        relatedId: appointment._id,
        relatedModel: 'Appointment',
        priority: 'urgent'
    });
};

// Auto-delete old read notifications (older than 30 days)
notificationSchema.statics.cleanupOldNotifications = async function () {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return this.deleteMany({
        read: true,
        createdAt: { $lt: thirtyDaysAgo }
    });
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
