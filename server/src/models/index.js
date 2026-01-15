/**
 * Models Index
 * Central export for all Mongoose models
 */

const User = require('./User');
const Patient = require('./Patient');
const Helper = require('./Helper');
const Medication = require('./Medication');
const Appointment = require('./Appointment');
const Notification = require('./Notification');

module.exports = {
    User,
    Patient,
    Helper,
    Medication,
    Appointment,
    Notification
};
