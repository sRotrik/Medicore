/**
 * Initial State for Healthcare Application
 * Single source of truth for all patient data
 * CLEARED - Ready for your own data
 */

export const initialState = {
    // Patient Information
    patient: {
        id: 1,
        name: '',
        age: 0,
        gender: ''
    },

    // Medications List - Empty, ready for your data
    medications: [],

    // Appointments List - Empty, ready for your data
    appointments: []
};
