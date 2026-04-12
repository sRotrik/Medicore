/**
 * Medication Model (Sequelize)
 * Represents patient medication records
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Medication = sequelize.define('medications', {
    medication_id: {
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

    // Medication details
    medicine_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    dosage: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    qty_per_dose: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
            min: 1
        }
    },
    total_quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    remaining_quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 0
        }
    },

    // Timing
    meal_type: {
        type: DataTypes.ENUM('before_meal', 'after_meal', 'with_meal', 'empty_stomach'),
        allowNull: false
    },
    scheduled_times: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: 'Array of times: ["08:00", "14:00", "20:00"]'
    },
    selected_days: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        comment: 'Array of days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]'
    },

    // Duration
    start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    end_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },

    // Additional info
    remarks: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    tableName: 'medications',
    indexes: [
        { fields: ['patient_id'] },
        { fields: ['is_active'] },
        { fields: ['start_date', 'end_date'] },
        { fields: ['created_at'] },
        { fields: ['patient_id', 'is_active'] }
    ]
});

/**
 * Instance Methods
 */

// Check if medication is expired
Medication.prototype.isExpired = function () {
    return new Date(this.end_date) < new Date();
};

// Check if medication is low stock
Medication.prototype.isLowStock = function () {
    const daysRemaining = Math.floor(this.remaining_quantity / this.qty_per_dose);
    return daysRemaining <= 3;
};

// Reduce quantity after taking medication
Medication.prototype.reduceQuantity = async function () {
    this.remaining_quantity -= this.qty_per_dose;
    if (this.remaining_quantity < 0) {
        this.remaining_quantity = 0;
    }
    if (this.remaining_quantity === 0) {
        this.is_active = false;
    }
    await this.save();
    return this;
};

// Get days remaining
Medication.prototype.getDaysRemaining = function () {
    return Math.floor(this.remaining_quantity / this.qty_per_dose);
};

/**
 * Hooks
 */

// Auto-deactivate expired medications
Medication.beforeUpdate(async (medication) => {
    if (medication.isExpired()) {
        medication.is_active = false;
    }
});

/**
 * Static Methods
 */

// Find active medications for a patient
Medication.findActiveByPatient = async function (patientId) {
    return await this.findAll({
        where: {
            patient_id: patientId,
            is_active: true
        },
        order: [['created_at', 'DESC']]
    });
};

// Find low stock medications
Medication.findLowStock = async function (patientId = null) {
    const where = { is_active: true };
    if (patientId) {
        where.patient_id = patientId;
    }

    const medications = await this.findAll({ where });
    return medications.filter(med => med.isLowStock());
};

// Get medication statistics for a patient
Medication.getPatientStats = async function (patientId) {
    const [results] = await sequelize.query(`
        SELECT 
            COUNT(*) as total_medications,
            SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_medications,
            SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as completed_medications,
            SUM(remaining_quantity) as total_remaining_doses
        FROM medications
        WHERE patient_id = :patientId
    `, {
        replacements: { patientId }
    });
    return results[0] || {};
};

// Get today's medications for a patient
Medication.getTodaysMedications = async function (patientId) {
    const today = new Date().toISOString().split('T')[0];

    return await this.findAll({
        where: {
            patient_id: patientId,
            is_active: true,
            start_date: { [sequelize.Sequelize.Op.lte]: today },
            end_date: { [sequelize.Sequelize.Op.gte]: today }
        },
        order: [['created_at', 'DESC']]
    });
};

// Deactivate expired medications (cron job helper)
Medication.deactivateExpired = async function () {
    const today = new Date().toISOString().split('T')[0];

    const [affectedRows] = await this.update(
        { is_active: false },
        {
            where: {
                is_active: true,
                end_date: { [sequelize.Sequelize.Op.lt]: today }
            }
        }
    );

    return affectedRows;
};

module.exports = Medication;
