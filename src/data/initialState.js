/**
 * Initial State for Healthcare Application
 * Single source of truth for all patient data
 */

export const initialState = {
    // Patient Information
    patient: {
        id: 1,
        name: 'Srotrik',
        age: 28,
        gender: 'Male'
    },

    // Medications List
    medications: [
        {
            id: 1,
            name: 'Aspirin',
            scheduledTime: '08:00',
            mealType: 'after', // before / after meal
            qtyPerDose: 1,
            remainingQty: 30,
            takenLogs: [
                {
                    scheduledTime: '08:00',
                    takenTime: '08:05'
                }
            ]
        },
        {
            id: 2,
            name: 'Vitamin D3',
            scheduledTime: '09:00',
            mealType: 'before',
            qtyPerDose: 2,
            remainingQty: 20,
            takenLogs: [
                {
                    scheduledTime: '09:00',
                    takenTime: '09:00'
                }
            ]
        },
        {
            id: 3,
            name: 'Metformin',
            scheduledTime: '12:00',
            mealType: 'after',
            qtyPerDose: 1,
            remainingQty: 15,
            takenLogs: [
                {
                    scheduledTime: '12:00',
                    takenTime: '12:15'
                }
            ]
        },
        {
            id: 4,
            name: 'Omega-3',
            scheduledTime: '14:00',
            mealType: 'before',
            qtyPerDose: 2,
            remainingQty: 8,
            takenLogs: []
        },
        {
            id: 5,
            name: 'Lisinopril',
            scheduledTime: '20:00',
            mealType: 'after',
            qtyPerDose: 1,
            remainingQty: 25,
            takenLogs: [
                {
                    scheduledTime: '20:00',
                    takenTime: '20:02'
                }
            ]
        }
    ],

    // Appointments List
    appointments: [
        {
            id: 1,
            doctorName: 'Dr. Sarah Johnson',
            specialty: 'Cardiologist',
            contact: '+1 (555) 123-4567',
            date: '2026-01-18',
            time: '10:30',
            place: 'City Medical Center, Room 305',
            remarks: 'Bring previous ECG reports and fasting required'
        },
        {
            id: 2,
            doctorName: 'Dr. Michael Chen',
            specialty: 'General Physician',
            contact: '+1 (555) 987-6543',
            date: '2026-01-20',
            time: '14:00',
            place: 'Online Video Call',
            remarks: 'Discuss recent blood test results'
        },
        {
            id: 3,
            doctorName: 'Dr. Emily Rodriguez',
            specialty: 'Endocrinologist',
            contact: '+1 (555) 456-7890',
            date: '2026-01-25',
            time: '11:00',
            place: 'Health Plus Clinic, 2nd Floor',
            remarks: 'Bring glucose monitoring logs for past 2 weeks'
        },
        {
            id: 4,
            doctorName: 'Dr. James Wilson',
            specialty: 'Dentist',
            contact: '+1 (555) 234-5678',
            date: '2026-01-28',
            time: '09:00',
            place: 'Smile Dental Care, Suite 101',
            remarks: 'Routine cleaning - no special preparation needed'
        }
    ]
};
