/**
 * Appointment Model (Sequelize)
 * Represents doctor appointment records
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Appointment = sequelize.define('appointments', {
    appointment_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    patient_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'user_id'
        },
        onDelete: 'CASCADE'
    },

    // Appointment details
    doctor_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    specialization: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    appointment_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    appointment_time: {
        type: DataTypes.TIME,
        allowNull: false
    },

    // Location
    hospital_name: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    contact_number: {
        type: DataTypes.STRING(15),
        allowNull: true
    },

    // Status
    status: {
        type: DataTypes.ENUM('scheduled', 'completed', 'cancelled', 'missed'),
        defaultValue: 'scheduled'
    },

    // Additional info
    reason: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    remarks: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    reminder_sent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    tableName: 'appointments',
    indexes: [
        { fields: ['patient_id'] },
        { fields: ['appointment_date'] },
        { fields: ['status'] },
        { fields: ['reminder_sent'] },
        { fields: ['patient_id', 'appointment_date'] }
    ]
});

/**
 * Instance Methods
 */

// Check if appointment is upcoming
Appointment.prototype.isUpcoming = function () {
    const appointmentDateTime = new Date(`${this.appointment_date} ${this.appointment_time}`);
    return appointmentDateTime > new Date() && this.status === 'scheduled';
};

// Check if appointment is past
Appointment.prototype.isPast = function () {
    const appointmentDateTime = new Date(`${this.appointment_date} ${this.appointment_time}`);
    return appointmentDateTime < new Date();
};

// Mark as completed
Appointment.prototype.markCompleted = async function () {
    this.status = 'completed';
    await this.save();
    return this;
};

// Mark as cancelled
Appointment.prototype.markCancelled = async function () {
    this.status = 'cancelled';
    await this.save();
    return this;
};

/**
 * Hooks
 */

// Auto-update status for missed appointments
Appointment.beforeUpdate(async (appointment) => {
    if (appointment.isPast() && appointment.status === 'scheduled') {
        appointment.status = 'missed';
    }
});

/**
 * Static Methods
 */

// Find upcoming appointments for a patient
Appointment.findUpcoming = async function (patientId) {
    const today = new Date().toISOString().split('T')[0];

    return await this.findAll({
        where: {
            patient_id: patientId,
            status: 'scheduled',
            appointment_date: { [sequelize.Sequelize.Op.gte]: today }
        },
        order: [['appointment_date', 'ASC'], ['appointment_time', 'ASC']]
    });
};

// Find appointments by date range
Appointment.findByDateRange = async function (patientId, startDate, endDate) {
    return await this.findAll({
        where: {
            patient_id: patientId,
            appointment_date: {
                [sequelize.Sequelize.Op.between]: [startDate, endDate]
            }
        },
        order: [['appointment_date', 'ASC'], ['appointment_time', 'ASC']]
    });
};

// Get appointment statistics
Appointment.getPatientStats = async function (patientId) {
    const [results] = await sequelize.query(`
        SELECT 
            COUNT(*) as total_appointments,
            SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) as scheduled,
            SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
            SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
            SUM(CASE WHEN status = 'missed' THEN 1 ELSE 0 END) as missed
        FROM appointments
        WHERE patient_id = :patientId
    `, {
        replacements: { patientId }
    });
    return results[0] || {};
};

// Update missed appointments (cron job helper)
Appointment.updateMissedAppointments = async function () {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().split(' ')[0];

    const [affectedRows] = await this.update(
        { status: 'missed' },
        {
            where: {
                status: 'scheduled',
                [sequelize.Sequelize.Op.or]: [
                    { appointment_date: { [sequelize.Sequelize.Op.lt]: today } },
                    {
                        appointment_date: today,
                        appointment_time: { [sequelize.Sequelize.Op.lt]: currentTime }
                    }
                ]
            }
        }
    );

    return affectedRows;
};

module.exports = Appointment;
