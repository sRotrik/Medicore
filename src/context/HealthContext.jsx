/**
 * Health Context Provider
 * Fetches and manages patient health data with real-time sync
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

const HealthContext = createContext();

export const HealthProvider = ({ children }) => {
    const [patient, setPatient] = useState(null);
    const [medications, setMedications] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [takenToday, setTakenToday] = useState(new Set());

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

            // Fetch patient profile
            const profileResponse = await fetch('http://localhost:5000/api/patient/profile', { headers });
            const profileData = await profileResponse.json();
            if (profileData.success && profileData.data) {
                setPatient(profileData.data);
            }

            // Fetch medications
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
                    selectedDays: m.selectedDays,
                    takenLogs: []
                }));
                setMedications(transformedMeds);
            }

            // Fetch appointments
            const aptsResponse = await fetch('http://localhost:5000/api/patient/appointments', { headers });
            const aptsData = await aptsResponse.json();

            if (aptsData.success && aptsData.data) {
                const transformedApts = aptsData.data.map(apt => ({
                    id: apt._id,
                    doctorName: apt.doctor_name,
                    specialty: apt.specialization || 'General Physician',
                    date: apt.date,
                    time: apt.time,
                    place: apt.location || 'N/A',
                    contactNumber: apt.contact_number || 'N/A',
                    purpose: apt.notes || 'Consultation',
                    remarks: apt.notes || '',
                    status: apt.status
                }));
                setAppointments(transformedApts);
            }

            setLoading(false);
        } catch (error) {
            console.error('Fetch error:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const takeMedication = async (medicationId, takenTime) => {
        try {
            const token = localStorage.getItem('accessToken');

            // Optimistic update — instant UI sync
            setTakenToday(prev => new Set([...prev, medicationId]));
            setMedications(prev => prev.map(med =>
                med.id === medicationId
                    ? {
                        ...med,
                        remainingQuantity: Math.max(0, med.remainingQuantity - med.qtyPerDose),
                        remainingQty: Math.max(0, med.remainingQty - med.qtyPerDose)
                    }
                    : med
            ));

            const response = await fetch(`http://localhost:5000/api/patient/medications/${medicationId}/take`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ taken_time: takenTime })
            });

            if (response.ok) {
                // Sync with server for accurate values
                await fetchData();
            } else {
                // Rollback optimistic update on failure
                setTakenToday(prev => {
                    const next = new Set(prev);
                    next.delete(medicationId);
                    return next;
                });
                await fetchData(); // restore original quantities
                const errorData = await response.json();
                alert(errorData.message || 'Failed to mark medication as taken');
            }
        } catch (error) {
            console.error('Error marking medication as taken:', error);
            await fetchData();
            alert('Error marking medication as taken');
        }
    };

    // Derived stats — always in sync with medications & takenToday
    const stats = {
        totalMedications: medications.length,
        takenTodayCount: takenToday.size,
        pendingDoses: Math.max(0, medications.length - takenToday.size),
        complianceRate: medications.length > 0
            ? Math.round((takenToday.size / medications.length) * 100)
            : 0,
        upcomingAppointments: appointments.filter(apt => new Date(apt.date) >= new Date()).length,
    };

    const value = {
        patient,
        medications,
        appointments,
        loading,
        takenToday,
        stats,
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
