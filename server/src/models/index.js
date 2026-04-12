/**
 * Model Index & Associations
 * Centralizes all Sequelize models and defines relationships
 */

const User = require('./User.model');
const Medication = require('./Medication.model');
const Appointment = require('./Appointment.model');
const MedicationLog = require('./MedicationLog.model');
const PatientHelper = require('./PatientHelper.model');
const RefreshToken = require('./RefreshToken.model');
const Notification = require('./Notification.model');
const Prescription = require('./Prescription.model');

// ============================================================================
// ASSOCIATIONS / RELATIONSHIPS
// ============================================================================

// ----------------------------------------------------------------------------
// User -> Medications (1:N)
// A patient can have many medications
// ----------------------------------------------------------------------------
User.hasMany(Medication, {
    foreignKey: 'patient_id',
    as: 'medications',
    onDelete: 'CASCADE'
});

Medication.belongsTo(User, {
    foreignKey: 'patient_id',
    as: 'patient'
});

// ----------------------------------------------------------------------------
// User -> Appointments (1:N)
// A patient can have many appointments
// ----------------------------------------------------------------------------
User.hasMany(Appointment, {
    foreignKey: 'patient_id',
    as: 'appointments',
    onDelete: 'CASCADE'
});

Appointment.belongsTo(User, {
    foreignKey: 'patient_id',
    as: 'patient'
});

// ----------------------------------------------------------------------------
// User -> Prescriptions (1:N)
// A patient can have many prescriptions
// ----------------------------------------------------------------------------
User.hasMany(Prescription, {
    foreignKey: 'patient_id',
    as: 'prescriptions',
    onDelete: 'CASCADE'
});

Prescription.belongsTo(User, {
    foreignKey: 'patient_id',
    as: 'patient'
});

// ----------------------------------------------------------------------------
// Medication -> MedicationLogs (1:N)
// A medication can have many log entries
// ----------------------------------------------------------------------------
Medication.hasMany(MedicationLog, {
    foreignKey: 'medication_id',
    as: 'logs',
    onDelete: 'CASCADE'
});

MedicationLog.belongsTo(Medication, {
    foreignKey: 'medication_id',
    as: 'medication'
});

// ----------------------------------------------------------------------------
// User -> MedicationLogs (1:N)
// A patient can have many medication logs
// ----------------------------------------------------------------------------
User.hasMany(MedicationLog, {
    foreignKey: 'patient_id',
    as: 'medication_logs',
    onDelete: 'CASCADE'
});

MedicationLog.belongsTo(User, {
    foreignKey: 'patient_id',
    as: 'patient'
});

// ----------------------------------------------------------------------------
// User -> RefreshTokens (1:N)
// A user can have many refresh tokens
// ----------------------------------------------------------------------------
User.hasMany(RefreshToken, {
    foreignKey: 'user_id',
    as: 'refresh_tokens',
    onDelete: 'CASCADE'
});

RefreshToken.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
});

// ----------------------------------------------------------------------------
// User -> Notifications (1:N)
// A user can have many notifications
// ----------------------------------------------------------------------------
User.hasMany(Notification, {
    foreignKey: 'user_id',
    as: 'notifications',
    onDelete: 'CASCADE'
});

Notification.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
});

// ----------------------------------------------------------------------------
// Medication -> Notifications (1:N)
// A medication can trigger many notifications
// ----------------------------------------------------------------------------
Medication.hasMany(Notification, {
    foreignKey: 'medication_id',
    as: 'notifications',
    onDelete: 'SET NULL'
});

Notification.belongsTo(Medication, {
    foreignKey: 'medication_id',
    as: 'medication'
});

// ----------------------------------------------------------------------------
// Appointment -> Notifications (1:N)
// An appointment can trigger many notifications
// ----------------------------------------------------------------------------
Appointment.hasMany(Notification, {
    foreignKey: 'appointment_id',
    as: 'notifications',
    onDelete: 'SET NULL'
});

Notification.belongsTo(Appointment, {
    foreignKey: 'appointment_id',
    as: 'appointment'
});

// ----------------------------------------------------------------------------
// PatientHelper Associations
// Defines the many-to-many relationship between patients and helpers
// ----------------------------------------------------------------------------

// Patient side
PatientHelper.belongsTo(User, {
    foreignKey: 'patient_id',
    as: 'patient'
});

// Helper side
PatientHelper.belongsTo(User, {
    foreignKey: 'helper_id',
    as: 'helper'
});

// Assigned by (admin)
PatientHelper.belongsTo(User, {
    foreignKey: 'assigned_by',
    as: 'admin'
});

// User has many patient-helper relationships (as patient)
User.hasMany(PatientHelper, {
    foreignKey: 'patient_id',
    as: 'helper_relationships'
});

// User has many patient-helper relationships (as helper)
User.hasMany(PatientHelper, {
    foreignKey: 'helper_id',
    as: 'patient_relationships'
});

// ============================================================================
// EXPORT ALL MODELS
// ============================================================================

module.exports = {
    User,
    Medication,
    Appointment,
    MedicationLog,
    PatientHelper,
    RefreshToken,
    Notification,
    Prescription
};
