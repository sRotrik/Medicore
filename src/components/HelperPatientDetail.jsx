/**
 * Helper Patient Detail View
 * Shows complete patient dashboard (medications, stats, appointments)
 * Uses read-only components - helpers can only view, not edit
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Activity, User, Phone, Calendar } from 'lucide-react';
import { useHealth } from '../context/HealthContext';

import HelperMedicationView from './HelperMedicationView';
import Stats from './Stats';
import HelperAppointmentView from './HelperAppointmentView';
import PatientScoreCard from './PatientScoreCard';

const HelperPatientDetail = () => {
    const navigate = useNavigate();
    const { patientId } = useParams();

    // State for patient data
    const [patientData, setPatientData] = React.useState(null);
    const [medications, setMedications] = React.useState([]);
    const [appointments, setAppointments] = React.useState([]);
    const [prescriptions, setPrescriptions] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    const [activeTab, setActiveTab] = React.useState('medications');

    React.useEffect(() => {
        const fetchPatientDetails = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const headers = { 'Authorization': `Bearer ${token}` };

                // Fetch Patient Details
                const patientRes = await fetch(`http://localhost:5000/api/helper/patients/${patientId}`, { headers });
                const patientJson = await patientRes.json();

                if (patientJson.success) {
                    const p = patientJson.data;
                    setPatientData({
                        id: p.user_id || p._id, // Handle mismatch if any
                        name: p.full_name,
                        age: p.age,
                        gender: p.gender,
                        phone: p.mobile,
                        profileImage: 'https://ui-avatars.com/api/?name=' + p.full_name + '&background=random'
                    });
                }

                // Fetch Medications
                const medsRes = await fetch(`http://localhost:5000/api/helper/patients/${patientId}/medications`, { headers });
                const medsJson = await medsRes.json();

                if (medsJson.success) {
                    setMedications(medsJson.data.map(m => ({
                        id: m._id || m.medication_id,
                        name: m.name || m.medicine_name,
                        scheduledTime: m.time || m.frequency || (m.scheduled_times ? m.scheduled_times[0] : null), 
                        mealType: m.mealTiming || (m.meal_type === 'before_meal' ? 'Before Meal' : 'After Meal'),
                        qtyPerDose: m.dosage || m.qty_per_dose || 1,
                        remainingQty: m.stock || m.remaining_quantity || 0,
                        takenLogs: m.logs ? m.logs.map(log => ({ takenTime: log.taken_time })) : []
                    })));
                }

                // Fetch Appointments
                const aptsRes = await fetch(`http://localhost:5000/api/helper/patients/${patientId}/appointments`, { headers });
                const aptsJson = await aptsRes.json();

                if (aptsJson.success) {
                    setAppointments(aptsJson.data.map(a => ({
                        id: a._id,
                        doctorName: a.doctor_name,
                        specialty: a.type,
                        contact: 'N/A', // If not in backend
                        date: a.date.split('T')[0],
                        time: a.time,
                        place: a.location,
                        remarks: a.notes || ''
                    })));
                }

                // Fetch Prescriptions
                const prescRes = await fetch(`http://localhost:5000/api/helper/patients/${patientId}/prescriptions`, { headers });
                const prescJson = await prescRes.json();
                if (prescJson.success) {
                    setPrescriptions(prescJson.data);
                }

            } catch (error) {
                console.error('Error fetching patient details:', error);
            } finally {
                setLoading(false);
            }
        };

        if (patientId) {
            fetchPatientDetails();
        }
    }, [patientId]);

    const tabs = [
        { id: 'medications', label: 'Medications' },
        { id: 'stats', label: 'Stats & Progress' },
        { id: 'appointments', label: 'Appointments' },
        { id: 'prescriptions', label: 'Prescriptions' }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!patientData) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
                Patient not found or access denied.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            {/* Header */}
            <div className="bg-slate-900/50 border-b border-slate-800 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/helper/patients')}
                                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-slate-400" />
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                                    <Activity className="text-emerald-500 w-6 h-6" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-white">MediCore</h1>
                                    <p className="text-xs text-slate-500">Patient Details</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/login')}
                            className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Patient Info Header */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border-b border-slate-700">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex items-center gap-6"
                    >
                        {/* Profile Image */}
                        <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-emerald-500/20">
                            <img
                                src={patientData.profileImage}
                                alt={patientData.name}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Patient Info */}
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-white mb-2">{patientData.name}</h2>
                            <div className="flex items-center gap-6 text-sm text-slate-400">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    <span>{patientData.age}y, {patientData.gender}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4" />
                                    <span>{patientData.phone}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>Patient ID: #{patientData.id}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Patient Achievements (helper cannot see raw credibility %) */}
            <div className="max-w-7xl mx-auto px-6 py-4">
                <PatientScoreCard mode="helper" patientId={patientId} />
            </div>

            {/* Tab Navigation */}
            <div className="bg-slate-900/50 border-b border-slate-800 sticky top-[73px] z-40">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex gap-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-6 py-4 text-sm font-medium transition-all relative ${activeTab === tab.id
                                    ? 'text-emerald-400'
                                    : 'text-slate-400 hover:text-slate-300'
                                    }`}
                            >
                                {tab.label}
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {activeTab === 'medications' && (
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-6">Medication Schedule</h3>
                            <p className="text-slate-400 text-sm mb-4">
                                View-only mode: You can see the patient's medication schedule and progress.
                            </p>
                            <HelperMedicationView medications={medications} patientId={patientId} />
                        </div>
                    )}

                    {activeTab === 'stats' && (
                        <div>
                            <Stats medications={medications} />
                        </div>
                    )}

                    {activeTab === 'appointments' && (
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-6">Appointments</h3>
                            <p className="text-slate-400 text-sm mb-4">
                                View-only mode: You can see the patient's scheduled appointments.
                            </p>
                            <HelperAppointmentView appointments={appointments} patientId={patientId} />
                        </div>
                    )}

                    {activeTab === 'prescriptions' && (
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-6">Prescriptions</h3>
                            <p className="text-slate-400 text-sm mb-4">
                                View-only mode: You can see the patient's prescriptions and documents.
                            </p>
                            {prescriptions.length === 0 ? (
                                <div className="text-center py-12 bg-slate-900/50 border border-slate-800 rounded-3xl backdrop-blur-xl">
                                    <h3 className="text-xl font-medium text-slate-300">No prescriptions found</h3>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {prescriptions.map((pr) => (
                                        <div key={pr.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-emerald-500/30 transition-all">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="text-xs font-medium px-3 py-1 bg-slate-800 text-slate-400 rounded-full flex items-center gap-1.5">
                                                    {new Date(pr.date).toLocaleDateString('en-GB')}
                                                </div>
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-100 mb-1">{pr.title}</h3>
                                            <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                                                <span>Dr. {pr.doctor_name}</span>
                                            </div>
                                            {pr.notes && (
                                                <p className="text-sm text-slate-500 mb-6 bg-slate-950 p-3 rounded-lg border border-slate-800/50">
                                                    {pr.notes}
                                                </p>
                                            )}
                                            {pr.image_url && (
                                                <a href={pr.image_url} target="_blank" rel="noopener noreferrer" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
                                                    View Document
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default HelperPatientDetail;
