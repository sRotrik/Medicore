/**
 * MedicationLog Model (Sequelize)
 * Tracks medication adherence (when patient takes medicine)
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MedicationLog = sequelize.define('medication_logs', {
    log_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    medication_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'medications',
            key: 'medication_id'
        },
        onDelete: 'CASCADE'
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

    // Timing details
    scheduled_time: {
        type: DataTypes.TIME,
        allowNull: false
    },
    taken_time: {
        type: DataTypes.DATE,
        allowNull: false
    },
    delay_minutes: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Positive = late, Negative = early'
    },

    // Status
    status: {
        type: DataTypes.ENUM('on_time', 'late', 'early', 'missed', 'skipped'),
        allowNull: false
    },

    // Additional info
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    tableName: 'medication_logs',
    indexes: [
        { fields: ['medication_id'] },
        { fields: ['patient_id'] },
        { fields: ['status'] },
        { fields: ['taken_time'] },
        { fields: ['patient_id', 'taken_time'] }
    ]
});

/**
 * Instance Methods
 */

// Check if taken on time
MedicationLog.prototype.isOnTime = function () {
    return this.status === 'on_time';
};

// Check if late
MedicationLog.prototype.isLate = function () {
    return this.status === 'late';
};

// Get adherence score (0-100)
MedicationLog.prototype.getAdherenceScore = function () {
    if (this.status === 'on_time') return 100;
    if (this.status === 'early') return 90;
    if (this.status === 'late' && this.delay_minutes <= 30) return 70;
    if (this.status === 'late' && this.delay_minutes <= 60) return 50;
    if (this.status === 'late') return 30;
    if (this.status === 'missed' || this.status === 'skipped') return 0;
    return 0;
};

/**
 * Static Methods
 */

// Calculate adherence status based on delay
MedicationLog.calculateStatus = function (scheduledTime, takenTime) {
    const scheduled = new Date(`1970-01-01 ${scheduledTime}`);
    const taken = new Date(takenTime);

    // Get time portion only
    const takenTimeOnly = new Date(`1970-01-01 ${taken.toTimeString().split(' ')[0]}`);

    const delayMinutes = Math.round((takenTimeOnly - scheduled) / (1000 * 60));

    let status;
    if (delayMinutes >= -15 && delayMinutes <= 15) {
        status = 'on_time';
    } else if (delayMinutes > 15) {
        status = 'late';
    } else {
        status = 'early';
    }

    return { status, delay_minutes: delayMinutes };
};

// Create log entry
MedicationLog.createLog = async function (medicationId, patientId, scheduledTime, takenTime, notes = null) {
    const { status, delay_minutes } = this.calculateStatus(scheduledTime, takenTime);

    return await this.create({
        medication_id: medicationId,
        patient_id: patientId,
        scheduled_time: scheduledTime,
        taken_time: takenTime,
        delay_minutes: delay_minutes,
        status: status,
        notes: notes
    });
};

// Get logs for a medication
MedicationLog.findByMedication = async function (medicationId) {
    return await this.findAll({
        where: { medication_id: medicationId },
        order: [['taken_time', 'DESC']]
    });
};

// Get logs for a patient
MedicationLog.findByPatient = async function (patientId, limit = null) {
    const options = {
        where: { patient_id: patientId },
        order: [['taken_time', 'DESC']]
    };

    if (limit) {
        options.limit = limit;
    }

    return await this.findAll(options);
};

// Get adherence statistics for a patient
MedicationLog.getAdherenceStats = async function (patientId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [results] = await sequelize.query(`
        SELECT 
            COUNT(*) as total_doses,
            SUM(CASE WHEN status = 'on_time' THEN 1 ELSE 0 END) as on_time_count,
            SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_count,
            SUM(CASE WHEN status = 'early' THEN 1 ELSE 0 END) as early_count,
            SUM(CASE WHEN status = 'missed' THEN 1 ELSE 0 END) as missed_count,
            SUM(CASE WHEN status = 'skipped' THEN 1 ELSE 0 END) as skipped_count,
            ROUND(
                (SUM(CASE WHEN status = 'on_time' THEN 1 ELSE 0 END) * 100.0) / 
                NULLIF(COUNT(*), 0), 
                2
            ) as adherence_percentage,
            AVG(CASE WHEN status = 'late' THEN delay_minutes ELSE NULL END) as avg_delay_minutes
        FROM medication_logs
        WHERE patient_id = :patientId
          AND taken_time >= :startDate
    `, {
        replacements: { patientId, startDate: startDate.toISOString() }
    });

    return results[0] || {};
};

// Get today's logs for a patient
MedicationLog.getTodaysLogs = async function (patientId) {
    const today = new Date().toISOString().split('T')[0];

    return await this.findAll({
        where: {
            patient_id: patientId,
            taken_time: {
                [sequelize.Sequelize.Op.gte]: new Date(today)
            }
        },
        order: [['taken_time', 'DESC']]
    });
};

// Get streak (consecutive days with on-time doses)
MedicationLog.getStreak = async function (patientId) {
    const [results] = await sequelize.query(`
        SELECT 
            DATE(taken_time) as log_date,
            COUNT(*) as doses,
            SUM(CASE WHEN status = 'on_time' THEN 1 ELSE 0 END) as on_time_doses
        FROM medication_logs
        WHERE patient_id = :patientId
        GROUP BY DATE(taken_time)
        ORDER BY log_date DESC
        LIMIT 30
    `, {
        replacements: { patientId }
    });

    let streak = 0;
    for (const day of results) {
        if (day.on_time_doses > 0) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
};

module.exports = MedicationLog;
