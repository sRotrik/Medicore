/**
 * Helper Patient List
 * Shows all patients assigned to the helper
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    User,
    Phone,
    Calendar,
    Activity,
    TrendingUp,
    TrendingDown,
    Minus,
    ChevronRight,
    CheckCircle,
    AlertCircle,
    Clock
} from 'lucide-react';

const HelperPatientList = () => {
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const response = await fetch('http://localhost:5000/api/helper/patients', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();

                if (data.success) {
                    setPatients(data.data.map(p => ({
                        id: p.user_id,
                        name: p.full_name,
                        age: p.age,
                        gender: p.gender,
                        phone: p.mobile,
                        profileImage: 'https://ui-avatars.com/api/?name=' + p.full_name + '&background=random',
                        lastUpdated: new Date().toISOString().split('T')[0], // Placeholder as backend result doesn't have last updated yet
                        stats: {
                            medicationsToday: p.stats.medicationsToday,
                            medicationsTaken: 0, // Need to implement logic for 'taken' count in backend fully
                            upcomingAppointments: p.stats.upcomingAppointments,
                            complianceRate: p.stats.complianceRate,
                            trend: 'stable'
                        }
                    })));
                }
            } catch (error) {
                console.error('Error fetching patients:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPatients();
    }, []);

    const getTrendIcon = (trend) => {
        switch (trend) {
            case 'up':
                return <TrendingUp className="w-4 h-4 text-emerald-400" />;
            case 'down':
                return <TrendingDown className="w-4 h-4 text-red-400" />;
            default:
                return <Minus className="w-4 h-4 text-slate-400" />;
        }
    };

    const getComplianceColor = (rate) => {
        if (rate >= 90) return 'emerald';
        if (rate >= 70) return 'yellow';
        return 'red';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            {/* Header */}
            <div className="bg-slate-900/50 border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/helper/dashboard')}
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
                                    <p className="text-xs text-slate-500">Helper Portal</p>
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

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">

                {/* Page Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-2">Assigned Patients</h2>
                            <p className="text-slate-400">Manage and monitor your {patients.length} assigned patients</p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                            <Activity className="w-4 h-4" />
                            Refresh
                        </motion.button>
                    </div>
                </motion.div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="bg-slate-900 rounded-xl border border-slate-800 p-6"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-slate-400 text-sm">Total Patients</p>
                            <User className="w-5 h-5 text-emerald-400" />
                        </div>
                        <p className="text-3xl font-bold text-white">{patients.length}</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-slate-900 rounded-xl border border-slate-800 p-6"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-slate-400 text-sm">Avg Compliance</p>
                            <CheckCircle className="w-5 h-5 text-blue-400" />
                        </div>
                        <p className="text-3xl font-bold text-white">
                            {Math.round(patients.reduce((acc, p) => acc + p.stats.complianceRate, 0) / patients.length)}%
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="bg-slate-900 rounded-xl border border-slate-800 p-6"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-slate-400 text-sm">Pending Tasks</p>
                            <AlertCircle className="w-5 h-5 text-orange-400" />
                        </div>
                        <p className="text-3xl font-bold text-white">
                            {patients.reduce((acc, p) => acc + (p.stats.medicationsToday - p.stats.medicationsTaken), 0)}
                        </p>
                    </motion.div>
                </div>

                {/* Patient List */}
                <div className="space-y-4">
                    {patients.map((patient, index) => (
                        <motion.div
                            key={patient.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                            onClick={() => navigate(`/helper/patient/${patient.id}`)}
                            className="bg-slate-900 rounded-xl border border-slate-800 p-6 hover:border-emerald-500/30 transition-all cursor-pointer group"
                        >
                            <div className="flex items-start justify-between">
                                {/* Patient Info */}
                                <div className="flex items-start gap-4 flex-1">
                                    {/* Profile Image */}
                                    <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-slate-700 group-hover:border-emerald-500/30 transition-all">
                                        <img
                                            src={patient.profileImage}
                                            alt={patient.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                                                {patient.name}
                                            </h3>
                                            <span className="px-2 py-1 bg-slate-800 rounded-md text-xs text-slate-400">
                                                {patient.age}y, {patient.gender}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-6 mb-4">
                                            <div className="flex items-center gap-2 text-slate-400 text-sm">
                                                <Phone className="w-4 h-4" />
                                                <span>{patient.phone}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-400 text-sm">
                                                <Clock className="w-4 h-4" />
                                                <span>Updated {new Date(patient.lastUpdated).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="bg-slate-800/50 rounded-lg p-3">
                                                <p className="text-xs text-slate-500 mb-1">Medications Today</p>
                                                <p className="text-lg font-bold text-white">
                                                    {patient.stats.medicationsTaken}/{patient.stats.medicationsToday}
                                                </p>
                                            </div>

                                            <div className="bg-slate-800/50 rounded-lg p-3">
                                                <p className="text-xs text-slate-500 mb-1">Appointments</p>
                                                <p className="text-lg font-bold text-white">
                                                    {patient.stats.upcomingAppointments}
                                                </p>
                                            </div>

                                            <div className="bg-slate-800/50 rounded-lg p-3">
                                                <p className="text-xs text-slate-500 mb-1">Compliance Rate</p>
                                                <div className="flex items-center gap-2">
                                                    <p className={`text-lg font-bold text-${getComplianceColor(patient.stats.complianceRate)}-400`}>
                                                        {patient.stats.complianceRate}%
                                                    </p>
                                                    {getTrendIcon(patient.stats.trend)}
                                                </div>
                                            </div>

                                            <div className="bg-slate-800/50 rounded-lg p-3">
                                                <p className="text-xs text-slate-500 mb-1">Status</p>
                                                <div className="flex items-center gap-2">
                                                    {patient.stats.medicationsTaken === patient.stats.medicationsToday ? (
                                                        <>
                                                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                                                            <span className="text-sm text-emerald-400 font-medium">On Track</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <AlertCircle className="w-4 h-4 text-orange-400" />
                                                            <span className="text-sm text-orange-400 font-medium">Pending</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Arrow */}
                                <ChevronRight className="w-6 h-6 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all flex-shrink-0 mt-2" />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Empty State (if no patients) */}
                {patients.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-slate-900 rounded-xl border border-slate-800 p-12 text-center"
                    >
                        <User className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No Patients Assigned</h3>
                        <p className="text-slate-400">You don't have any assigned patients yet.</p>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default HelperPatientList;
