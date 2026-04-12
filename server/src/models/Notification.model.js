/**
 * Notification Model (Sequelize)
 * Stores notification history
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notification = sequelize.define('notifications', {
    notification_id: {
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

    // Notification details
    type: {
        type: DataTypes.ENUM(
            'medication_reminder',
            'appointment_reminder',
            'low_stock',
            'helper_assigned',
            'welcome'
        ),
        allowNull: false
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },

    // Related entities
    medication_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'medications',
            key: 'medication_id'
        },
        onDelete: 'SET NULL'
    },
    appointment_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'appointments',
            key: 'appointment_id'
        },
        onDelete: 'SET NULL'
    },

    // Status
    is_read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    sent_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    read_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    tableName: 'notifications',
    indexes: [
        { fields: ['user_id'] },
        { fields: ['type'] },
        { fields: ['is_read'] },
        { fields: ['sent_at'] },
        { fields: ['user_id', 'is_read'] }
    ]
});

/**
 * Instance Methods
 */

// Mark as read
Notification.prototype.markAsRead = async function () {
    this.is_read = true;
    this.read_at = new Date();
    await this.save();
    return this;
};

// Mark as unread
Notification.prototype.markAsUnread = async function () {
    this.is_read = false;
    this.read_at = null;
    await this.save();
    return this;
};

/**
 * Static Methods
 */

// Create notification
Notification.createNotification = async function (userId, type, title, message, relatedData = {}) {
    return await this.create({
        user_id: userId,
        type: type,
        title: title,
        message: message,
        medication_id: relatedData.medication_id || null,
        appointment_id: relatedData.appointment_id || null
    });
};

// Create medication reminder
Notification.createMedicationReminder = async function (userId, medicationId, medicationName, scheduledTime) {
    return await this.createNotification(
        userId,
        'medication_reminder',
        `💊 Time to take ${medicationName}`,
        `Don't forget to take your ${medicationName} scheduled for ${scheduledTime}`,
        { medication_id: medicationId }
    );
};

// Create appointment reminder
Notification.createAppointmentReminder = async function (userId, appointmentId, doctorName, appointmentDate, appointmentTime) {
    return await this.createNotification(
        userId,
        'appointment_reminder',
        `📅 Upcoming appointment with ${doctorName}`,
        `Your appointment is scheduled for ${appointmentDate} at ${appointmentTime}`,
        { appointment_id: appointmentId }
    );
};

// Create low stock alert
Notification.createLowStockAlert = async function (userId, medicationId, medicationName, remainingQuantity) {
    return await this.createNotification(
        userId,
        'low_stock',
        `⚠️ Low stock: ${medicationName}`,
        `Only ${remainingQuantity} doses remaining. Please refill soon.`,
        { medication_id: medicationId }
    );
};

// Create welcome notification
Notification.createWelcomeNotification = async function (userId, userName) {
    return await this.createNotification(
        userId,
        'welcome',
        `🏥 Welcome to MediCore, ${userName}!`,
        `Thank you for joining MediCore. We're here to help you manage your health effectively.`
    );
};

// Create helper assigned notification
Notification.createHelperAssignedNotification = async function (userId, helperName) {
    return await this.createNotification(
        userId,
        'helper_assigned',
        `👥 Helper assigned: ${helperName}`,
        `${helperName} has been assigned to support you with your healthcare management.`
    );
};

// Get user notifications
Notification.getUserNotifications = async function (userId, unreadOnly = false, limit = null) {
    const where = { user_id: userId };
    if (unreadOnly) {
        where.is_read = false;
    }

    const options = {
        where,
        order: [['sent_at', 'DESC']]
    };

    if (limit) {
        options.limit = limit;
    }

    return await this.findAll(options);
};

// Get unread count
Notification.getUnreadCount = async function (userId) {
    return await this.count({
        where: {
            user_id: userId,
            is_read: false
        }
    });
};

// Mark all as read for user
Notification.markAllAsRead = async function (userId) {
    const [affectedRows] = await this.update(
        { is_read: true, read_at: new Date() },
        {
            where: {
                user_id: userId,
                is_read: false
            }
        }
    );

    return affectedRows;
};

// Delete old notifications (cron job helper)
Notification.deleteOldNotifications = async function (daysOld = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const count = await this.destroy({
        where: {
            sent_at: { [sequelize.Sequelize.Op.lt]: cutoffDate },
            is_read: true
        }
    });

    console.log(`🧹 Deleted ${count} old notifications`);
    return count;
};

// Get notification statistics
Notification.getStats = async function (userId = null) {
    const where = userId ? { user_id: userId } : {};

    const [results] = await sequelize.query(`
        SELECT 
            COUNT(*) as total_notifications,
            SUM(CASE WHEN is_read = 1 THEN 1 ELSE 0 END) as read_count,
            SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) as unread_count,
            type,
            COUNT(*) as type_count
        FROM notifications
        ${userId ? 'WHERE user_id = :userId' : ''}
        GROUP BY type
    `, {
        replacements: { userId }
    });

    return results;
};

module.exports = Notification;
