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

// Import read-only helper components
import HelperMedicationView from './HelperMedicationView';
import Stats from './Stats';
import HelperAppointmentView from './HelperAppointmentView';

const HelperPatientDetail = () => {
    const navigate = useNavigate();
    const { patientId } = useParams();
    const { patient, medications, appointments } = useHealth();

    // Mock patient data (in real app, would filter by patientId)
    const patientData = {
        id: patientId,
        name: 'Sarah Johnson',
        age: 45,
        gender: 'Female',
        phone: '9876543210',
        profileImage: 'https://randomuser.me/api/portraits/women/44.jpg'
    };

    const [activeTab, setActiveTab] = React.useState('medications'); // medications, stats, appointments

    const tabs = [
        { id: 'medications', label: 'Medications' },
        { id: 'stats', label: 'Stats & Progress' },
        { id: 'appointments', label: 'Appointments' }
    ];

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
                            <HelperMedicationView />
                        </div>
                    )}

                    {activeTab === 'stats' && (
                        <div>
                            <Stats />
                        </div>
                    )}

                    {activeTab === 'appointments' && (
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-6">Appointments</h3>
                            <p className="text-slate-400 text-sm mb-4">
                                View-only mode: You can see the patient's scheduled appointments.
                            </p>
                            <HelperAppointmentView />
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default HelperPatientDetail;
