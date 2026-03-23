/**
 * PatientHelper Model (Sequelize)
 * Maps helpers to patients (many-to-many relationship)
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PatientHelper = sequelize.define('patient_helpers', {
    relationship_id: {
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
    helper_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'user_id'
        },
        onDelete: 'CASCADE'
    },

    // Relationship details
    assigned_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'user_id'
        },
        onDelete: 'SET NULL'
    },
    assigned_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },

    // Permissions
    can_view_medications: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    can_view_appointments: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    can_view_logs: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    tableName: 'patient_helpers',
    indexes: [
        { fields: ['patient_id'] },
        { fields: ['helper_id'] },
        { fields: ['is_active'] },
        {
            unique: true,
            fields: ['patient_id', 'helper_id'],
            name: 'unique_patient_helper'
        }
    ]
});

/**
 * Instance Methods
 */

// Activate relationship
PatientHelper.prototype.activate = async function () {
    this.is_active = true;
    await this.save();
    return this;
};

// Deactivate relationship
PatientHelper.prototype.deactivate = async function () {
    this.is_active = false;
    await this.save();
    return this;
};

// Update permissions
PatientHelper.prototype.updatePermissions = async function (permissions) {
    if (permissions.can_view_medications !== undefined) {
        this.can_view_medications = permissions.can_view_medications;
    }
    if (permissions.can_view_appointments !== undefined) {
        this.can_view_appointments = permissions.can_view_appointments;
    }
    if (permissions.can_view_logs !== undefined) {
        this.can_view_logs = permissions.can_view_logs;
    }
    await this.save();
    return this;
};

/**
 * Static Methods
 */

// Assign helper to patient
PatientHelper.assignHelper = async function (patientId, helperId, assignedBy = null) {
    // Check if relationship already exists
    const existing = await this.findOne({
        where: { patient_id: patientId, helper_id: helperId }
    });

    if (existing) {
        // Reactivate if inactive
        if (!existing.is_active) {
            existing.is_active = true;
            existing.assigned_by = assignedBy;
            existing.assigned_at = new Date();
            await existing.save();
        }
        return existing;
    }

    // Create new relationship
    return await this.create({
        patient_id: patientId,
        helper_id: helperId,
        assigned_by: assignedBy,
        is_active: true
    });
};

// Remove helper from patient
PatientHelper.removeHelper = async function (patientId, helperId) {
    const relationship = await this.findOne({
        where: { patient_id: patientId, helper_id: helperId }
    });

    if (relationship) {
        await relationship.deactivate();
    }

    return relationship;
};

// Get all helpers for a patient
PatientHelper.getPatientHelpers = async function (patientId, activeOnly = true) {
    const where = { patient_id: patientId };
    if (activeOnly) {
        where.is_active = true;
    }

    return await this.findAll({
        where,
        include: [{
            association: 'helper',
            attributes: ['user_id', 'full_name', 'email', 'mobile', 'specialization', 'experience_years']
        }],
        order: [['assigned_at', 'DESC']]
    });
};

// Get all patients for a helper
PatientHelper.getHelperPatients = async function (helperId, activeOnly = true) {
    const where = { helper_id: helperId };
    if (activeOnly) {
        where.is_active = true;
    }

    return await this.findAll({
        where,
        include: [{
            association: 'patient',
            attributes: ['user_id', 'full_name', 'email', 'mobile', 'age', 'gender']
        }],
        order: [['assigned_at', 'DESC']]
    });
};

// Check if helper has access to patient
PatientHelper.hasAccess = async function (helperId, patientId) {
    const relationship = await this.findOne({
        where: {
            helper_id: helperId,
            patient_id: patientId,
            is_active: true
        }
    });

    return relationship !== null;
};

// Get permissions for helper-patient relationship
PatientHelper.getPermissions = async function (helperId, patientId) {
    const relationship = await this.findOne({
        where: {
            helper_id: helperId,
            patient_id: patientId,
            is_active: true
        }
    });

    if (!relationship) {
        return null;
    }

    return {
        can_view_medications: relationship.can_view_medications,
        can_view_appointments: relationship.can_view_appointments,
        can_view_logs: relationship.can_view_logs
    };
};

// Get statistics
PatientHelper.getStats = async function () {
    const [results] = await sequelize.query(`
        SELECT 
            COUNT(*) as total_relationships,
            SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_relationships,
            COUNT(DISTINCT patient_id) as total_patients_with_helpers,
            COUNT(DISTINCT helper_id) as total_helpers_assigned
        FROM patient_helpers
    `);

    return results[0] || {};
};

module.exports = PatientHelper;
