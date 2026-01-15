/**
 * Health Context Provider
 * Global state management for the healthcare application
 * Single source of truth for all patient, medication, and appointment data
 */

import React, { createContext, useContext, useReducer } from 'react';
import { healthReducer, ACTIONS } from './healthReducer';
import { initialState } from '../data/initialState';

// Create Context
const HealthContext = createContext();

/**
 * Health Provider Component
 * Wraps the entire app to provide global state access
 */
export const HealthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(healthReducer, initialState);

    // Context value with state and dispatch
    const value = {
        // State
        patient: state.patient,
        medications: state.medications,
        appointments: state.appointments,

        // Dispatch function
        dispatch,

        // Action creators for convenience
        addMedication: (medicationData) => {
            dispatch({
                type: ACTIONS.ADD_MEDICATION,
                payload: medicationData
            });
        },

        updateMedication: (medicationId, updates) => {
            dispatch({
                type: ACTIONS.UPDATE_MEDICATION,
                payload: { medicationId, updates }
            });
        },

        takeMedication: (medicationId, takenTime) => {
            dispatch({
                type: ACTIONS.TAKE_MEDICATION,
                payload: { medicationId, takenTime }
            });
        },

        addAppointment: (appointmentData) => {
            dispatch({
                type: ACTIONS.ADD_APPOINTMENT,
                payload: appointmentData
            });
        },

        updateAppointment: (appointmentId, updates) => {
            dispatch({
                type: ACTIONS.UPDATE_APPOINTMENT,
                payload: { appointmentId, updates }
            });
        },

        updatePatient: (patientData) => {
            dispatch({
                type: ACTIONS.UPDATE_PATIENT,
                payload: patientData
            });
        }
    };

    return (
        <HealthContext.Provider value={value}>
            {children}
        </HealthContext.Provider>
    );
};

/**
 * Custom Hook to use Health Context
 * Use this in any component to access global state
 * 
 * @example
 * const { medications, takeMedication } = useHealth();
 */
export const useHealth = () => {
    const context = useContext(HealthContext);

    if (context === undefined) {
        throw new Error('useHealth must be used within a HealthProvider');
    }

    return context;
};

// Export ACTIONS for direct use if needed
export { ACTIONS } from './healthReducer';

// Export helper functions from reducer
export { calculateDelay, getStatus, getTodayStats } from './healthReducer';
