/**
 * Health Context Provider - OPTIMIZED VERSION
 * Fetches and manages patient health data
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

const HealthContext = createContext();

export const HealthProvider = ({ children }) => {
    const [patient, setPatient] = useState(null);
    const [medications, setMedications] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const role = localStorage.getItem('role');

            if (!token || role !== 'patient') {
                setLoading(false);
                return;
            }

            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            // Fetch medications only (fastest)
            const medsResponse = await fetch('http://localhost:5000/api/patient/medications', { headers });
            const medsData = await medsResponse.json();

            if (medsData.success && medsData.data) {
                const transformedMeds = medsData.data.map(m => ({
                    id: m._id,
                    name: m.name,
                    time: m.time || m.frequency,
                    scheduledTime: m.time || m.frequency,
                    dosagePerIntake: m.dosage || 1,
                    qtyPerDose: m.dosage || 1,
                    remainingQuantity: m.stock || 0,
                    remainingQty: m.stock || 0,
                    mealTiming: m.mealTiming || 'After Meal',
                    expiryDate: m.expiryDate,
                    manufacturingDate: m.manufacturingDate,
                    isActive: m.isActive !== false,
                    takenLogs: []
                }));

                setMedications(transformedMeds);
            }

            setLoading(false);
        } catch (error) {
            console.error('❌ Fetch error:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const takeMedication = async (medicationId, takenTime) => {
        try {
            const token = localStorage.getItem('accessToken');

            const response = await fetch(`http://localhost:5000/api/patient/medications/${medicationId}/take`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    taken_time: takenTime
                })
            });

            if (response.ok) {
                // Refresh data to show updated stock
                await fetchData();
                alert('Medication marked as taken!');
            } else {
                const errorData = await response.json();
                alert(errorData.message || 'Failed to mark medication as taken');
            }
        } catch (error) {
            console.error('Error marking medication as taken:', error);
            alert('Error marking medication as taken');
        }
    };

    const value = {
        patient,
        medications,
        appointments,
        loading,
        refreshData: fetchData,
        takeMedication
    };

    return (
        <HealthContext.Provider value={value}>
            {children}
        </HealthContext.Provider>
    );
};

export const useHealth = () => {
    const context = useContext(HealthContext);
    if (!context) {
        throw new Error('useHealth must be used within HealthProvider');
    }
    return context;
};
