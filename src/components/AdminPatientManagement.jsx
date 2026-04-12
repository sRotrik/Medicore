/**
 * Admin Patient Management
 * View all patients, their stats, and manage helper assignments
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Shield,
    Users,
    Search,
    Activity,
    Calendar,
    Pill,
    TrendingUp,
    ChevronRight,
    UserCheck,
    RefreshCw,
    Trash2,
    Mail
} from 'lucide-react';

const AdminPatientManagement = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sendingFeedback, setSendingFeedback] = useState(false);
    const [feedbackMsg, setFeedbackMsg] = useState('');

    const sendFeedbackNow = async () => {
        if (!window.confirm('Send helper feedback emails to ALL patients right now?')) return;
        setSendingFeedback(true);
        setFeedbackMsg('');
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch('http://localhost:5000/api/feedback/send-now', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setFeedbackMsg(data.success ? '✅ Feedback emails sent!' : '❌ ' + data.message);
        } catch {
            setFeedbackMsg('❌ Failed to send emails');
        } finally {
            setSendingFeedback(false);
            setTimeout(() => setFeedbackMsg(''), 5000);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const token = localStorage.getItem('accessToken');

            const response = await fetch('http://localhost:5000/api/admin/patients', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setPatients(data.patients || []);
            }
        } catch (error) {
            console.error('Error fetching patients:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePatient = async (id) => {
        if (!window.confirm('Are you sure you want to permanently delete this patient? All associated data (medications, appointments, logs) will be removed. This action cannot be undone.')) {
            return;
        }

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`http://localhost:5000/api/admin/patients/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                // Refresh list
                setPatients(patients.filter(p => (p.id || p.user_id) !== id));
            } else {
                alert('Failed to delete patient');
            }
        } catch (error) {
            console.error('Error deleting patient:', error);
            alert('An error occurred while deleting the patient');
        }
    };

    const filteredPatients = patients.filter(patient =>
        patient.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'Excellent': return 'emerald';
            case 'Good': return 'blue';
            default: return 'orange';
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            {/* Header */}
            <div className="bg-slate-900/50 border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/admin/dashboard')}
                                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-slate-400" />
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                                    <Shield className="text-indigo-500 w-6 h-6" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-white">MediCore Admin</h1>
                                    <p className="text-xs text-slate-500">Patient Management</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={sendFeedbackNow}
                                disabled={sendingFeedback}
                                className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500
                                    disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-all"
                            >
                                <Mail className="w-4 h-4" />
                                {sendingFeedback ? 'Sending...' : 'Send Feedback Emails Now'}
                            </motion.button>
                            {feedbackMsg && (
                                <span className="text-sm font-medium text-emerald-400">{feedbackMsg}</span>
                            )}
                            <button
                                onClick={() => navigate('/login')}
                                className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                            >
                                Logout
                            </button>
                        </div>
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
                    <h2 className="text-3xl font-bold text-white mb-2">Patient Management</h2>
                    <p className="text-slate-400">Monitor patient health and manage helper assignments</p>
                </motion.div>

                {/* Summary Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="bg-slate-900 rounded-xl border border-slate-800 p-6 mb-8"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm mb-1">Total Patients</p>
                            <p className="text-4xl font-bold text-white">{patients.length}</p>
                        </div>
                        <Users className="w-12 h-12 text-emerald-400" />
                    </div>
                </motion.div>

                {/* Search */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-slate-900 rounded-xl border border-slate-800 p-6 mb-6"
                >
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-white placeholder-slate-500 transition-all outline-none"
                        />
                    </div>
                </motion.div>

                {/* Patient List */}
                <div className="space-y-4">
                    {filteredPatients.map((patient, index) => (
                        <motion.div
                            key={patient.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                            className="bg-slate-900 rounded-xl border border-slate-800 p-6 hover:border-slate-700 transition-all"
                        >
                            <div className="flex items-start justify-between">
                                {/* Patient Info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-4">
                                        <h3 className="text-xl font-bold text-white">{patient.fullName}</h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${getStatusColor(patient.stats.status)}-500/10 border border-${getStatusColor(patient.stats.status)}-500/20 text-${getStatusColor(patient.stats.status)}-400`}>
                                            {patient.stats.status}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-6 mb-4 text-sm text-slate-400">
                                        <span>{patient.age}y, {patient.gender}</span>
                                        <span>{patient.email}</span>
                                        <span>{patient.mobile}</span>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                        <div className="bg-slate-800/50 rounded-lg p-3">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Pill className="w-4 h-4 text-emerald-400" />
                                                <p className="text-xs text-slate-500">Medications</p>
                                            </div>
                                            <p className="text-lg font-bold text-white">{patient.stats.totalMedications}</p>
                                        </div>

                                        <div className="bg-slate-800/50 rounded-lg p-3">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Calendar className="w-4 h-4 text-blue-400" />
                                                <p className="text-xs text-slate-500">Appointments</p>
                                            </div>
                                            <p className="text-lg font-bold text-white">{patient.stats.totalAppointments}</p>
                                        </div>

                                        <div className="bg-slate-800/50 rounded-lg p-3">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Activity className="w-4 h-4 text-purple-400" />
                                                <p className="text-xs text-slate-500">Compliance</p>
                                            </div>
                                            <p className="text-lg font-bold text-white">{patient.stats.complianceRate}%</p>
                                        </div>

                                        <div className="bg-slate-800/50 rounded-lg p-3">
                                            <div className="flex items-center gap-2 mb-1">
                                                <UserCheck className="w-4 h-4 text-orange-400" />
                                                <p className="text-xs text-slate-500">Assigned Helper</p>
                                            </div>
                                            <p className="text-sm font-semibold text-white truncate">
                                                {patient.assignedHelper ? patient.assignedHelper.name : 'None'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-2 ml-4">
                                    <button
                                        onClick={() => {
                                            console.log('Navigating to patient:', patient.id || patient.user_id);
                                            console.log('Full patient object:', patient);
                                            const patientId = patient.id || patient.user_id;
                                            if (!patientId) {
                                                alert('Error: Patient ID is missing!');
                                                return;
                                            }
                                            navigate(`/admin/patient/${patientId}`);
                                        }}
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-all flex items-center gap-2"
                                    >
                                        View Details
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            const patientId = patient.id || patient.user_id;
                                            if (patientId) handleDeletePatient(patientId);
                                        }}
                                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 border border-red-500/20 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Empty State */}
                {filteredPatients.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-slate-900 rounded-xl border border-slate-800 p-12 text-center"
                    >
                        <Users className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No Patients Found</h3>
                        <p className="text-slate-400">Try adjusting your search criteria.</p>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default AdminPatientManagement;
