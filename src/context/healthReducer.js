/**
 * Health Reducer
 * Handles all state updates for the healthcare application
 */

// Action Types
export const ACTIONS = {
    ADD_MEDICATION: 'ADD_MEDICATION',
    UPDATE_MEDICATION: 'UPDATE_MEDICATION',
    TAKE_MEDICATION: 'TAKE_MEDICATION',
    ADD_APPOINTMENT: 'ADD_APPOINTMENT',
    UPDATE_APPOINTMENT: 'UPDATE_APPOINTMENT',
    UPDATE_PATIENT: 'UPDATE_PATIENT',
    DELETE_MEDICATION: 'DELETE_MEDICATION',
    SET_STATE: 'SET_STATE'
};

/**
 * Health Reducer Function
 * @param {Object} state - Current state
 * @param {Object} action - Action with type and payload
 * @returns {Object} - New state
 */
export const healthReducer = (state, action) => {
    switch (action.type) {

        // ============================================
        // ADD MEDICATION
        // ============================================
        case ACTIONS.ADD_MEDICATION: {
            const newMedication = {
                ...action.payload,
                id: action.payload.id || action.payload._id || Date.now(),
                takenLogs: []
            };

            return {
                ...state,
                medications: [...state.medications, newMedication]
            };
        }

        // ============================================
        // UPDATE MEDICATION
        // ============================================
        case ACTIONS.UPDATE_MEDICATION: {
            const { medicationId, updates } = action.payload;

            return {
                ...state,
                medications: state.medications.map(med =>
                    med.id === medicationId
                        ? { ...med, ...updates }
                        : med
                )
            };
        }

        // ============================================
        // DELETE MEDICATION
        // ============================================
        case ACTIONS.DELETE_MEDICATION: {
            const medicationId = action.payload;
            return {
                ...state,
                medications: state.medications.filter(med => med.id !== medicationId)
            };
        }

        // ============================================
        // TAKE MEDICATION
        // ============================================
        case ACTIONS.TAKE_MEDICATION: {
            const { medicationId, takenTime } = action.payload;

            return {
                ...state,
                medications: state.medications.map(med => {
                    if (med.id === medicationId) {
                        // Calculate new remaining quantity
                        const newRemainingQty = Math.max(0, med.remainingQty - med.qtyPerDose);

                        // Create new taken log entry
                        const newLog = {
                            scheduledTime: med.scheduledTime,
                            takenTime: takenTime || new Date().toLocaleTimeString('en-US', {
                                hour12: false,
                                hour: '2-digit',
                                minute: '2-digit'
                            })
                        };

                        return {
                            ...med,
                            remainingQty: newRemainingQty,
                            takenLogs: [...med.takenLogs, newLog]
                        };
                    }
                    return med;
                })
            };
        }

        // ============================================
        // ADD APPOINTMENT
        // ============================================
        case ACTIONS.ADD_APPOINTMENT: {
            const newAppointment = {
                id: Date.now(), // Generate unique ID
                doctorName: action.payload.doctorName,
                specialty: action.payload.specialty || 'General',
                contact: action.payload.contact,
                date: action.payload.date,
                time: action.payload.time,
                place: action.payload.place,
                remarks: action.payload.remarks || ''
            };

            return {
                ...state,
                appointments: [...state.appointments, newAppointment]
            };
        }

        // ============================================
        // UPDATE APPOINTMENT
        // ============================================
        case ACTIONS.UPDATE_APPOINTMENT: {
            const { appointmentId, updates } = action.payload;

            return {
                ...state,
                appointments: state.appointments.map(apt =>
                    apt.id === appointmentId
                        ? { ...apt, ...updates }
                        : apt
                )
            };
        }

        // ============================================
        // UPDATE PATIENT INFO (Optional)
        // ============================================
        case ACTIONS.UPDATE_PATIENT: {
            return {
                ...state,
                patient: {
                    ...state.patient,
                    ...action.payload
                }
            };
        }

        // ============================================
        // SET FULL STATE (FROM API)
        // ============================================
        case ACTIONS.SET_STATE: {
            return {
                ...state,
                ...action.payload
            };
        }

        // ============================================
        // DEFAULT
        // ============================================
        default:
            return state;
    }
};

/**
 * Helper Functions for Stats Calculations
 * These can be used by components to derive stats from state
 */

/**
 * Calculate delay in minutes between scheduled and actual time
 * @param {string} scheduledTime - HH:MM format
 * @param {string} takenTime - HH:MM format
 * @returns {number} - Delay in minutes
 */
export const calculateDelay = (scheduledTime, takenTime) => {
    if (!takenTime) return null;

    const [schedHours, schedMinutes] = scheduledTime.split(':').map(Number);
    const [takenHours, takenMinutes] = takenTime.split(':').map(Number);

    const schedTotalMinutes = schedHours * 60 + schedMinutes;
    const takenTotalMinutes = takenHours * 60 + takenMinutes;

    return takenTotalMinutes - schedTotalMinutes;
};

/**
 * Get status based on delay
 * @param {number} delay - Delay in minutes
 * @returns {string} - 'on-time', 'late', or 'missed'
 */
export const getStatus = (delay) => {
    if (delay === null) return 'missed';
    if (Math.abs(delay) <= 5) return 'on-time';
    return 'late';
};

/**
 * Get today's medication stats from state
 * @param {Object|Array} stateOrMedications - State object or medications array
 * @returns {Object} - Stats object with counts
 */
export const getTodayStats = (stateOrMedications) => {
    // Handle both state object and medications array
    const medications = Array.isArray(stateOrMedications)
        ? stateOrMedications
        : (stateOrMedications?.medications || []);

    const stats = {
        total: medications.length,
        takenCount: 0,
        onTime: 0,
        late: 0,
        missed: 0,
        pending: 0,
        complianceRate: 0,
        medicationDetails: []
    };

    if (medications.length === 0) {
        return stats;
    }

    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();

    medications.forEach(med => {
        // Get the most recent log (today's log)
        const todayLog = med.takenLogs?.[med.takenLogs.length - 1];

        const scheduledTime = med.scheduledTime || med.time || '00:00';
        let schedMins = 0;
        if (scheduledTime.includes(':')) {
            const parts = scheduledTime.split(':');
            if (parts.length === 2) {
               schedMins = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
            }
        }

        let status = 'missed';
        let delay = null;

        if (todayLog) {
            delay = calculateDelay(scheduledTime, todayLog.takenTime);
            status = getStatus(delay);
            stats.takenCount++;
        } else if (currentMins < schedMins) {
            status = 'pending';
        }

        // Update counts
        if (status === 'on-time') stats.onTime++;
        else if (status === 'late') stats.late++;
        else if (status === 'pending') stats.pending++;
        else stats.missed++;

        // Add medication details
        stats.medicationDetails.push({
            id: med.id || med._id,
            name: med.name,
            scheduledTime: scheduledTime,
            actualTime: todayLog?.takenTime || null,
            status,
            delay
        });
    });

    // Calculate compliance rate
    stats.complianceRate = medications.length > 0
        ? Math.round((stats.takenCount / medications.length) * 100)
        : 0;

    return stats;
};
