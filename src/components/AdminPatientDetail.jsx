/**
 * Admin Patient Detail
 * View detailed patient information and reassign helpers
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Shield,
    User,
    Pill,
    Calendar,
    Activity,
    UserCheck,
    RefreshCw,
    Phone,
    Mail
} from 'lucide-react';

const AdminPatientDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [patient, setPatient] = useState(null);
    const [helpers, setHelpers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showReassignModal, setShowReassignModal] = useState(false);
    const [selectedHelper, setSelectedHelper] = useState('');

    useEffect(() => {
        fetchPatientDetails();
        fetchHelpers();
    }, [id]);

    const fetchPatientDetails = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            console.log('=== PATIENT DETAIL DEBUG ===');
            console.log('Patient ID from URL:', id);
            console.log('Token exists:', !!token);

            const response = await fetch(`http://localhost:5000/api/admin/patients/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            console.log('Response status:', response.status);
            console.log('Response OK:', response.ok);

            if (response.ok) {
                const data = await response.json();
                console.log('Patient data received:', data);
                setPatient(data.patient);
            } else {
                const errorData = await response.json();
                console.error('❌ API Error:', errorData);
                alert(`Error loading patient: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error fetching patient:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchHelpers = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('http://localhost:5000/api/admin/helpers', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setHelpers(data.helpers.filter(h => h.status === 'active'));
            }
        } catch (error) {
            console.error('Error fetching helpers:', error);
        }
    };

    const handleReassign = async () => {
        if (!selectedHelper) {
            alert('Please select a helper');
            return;
        }

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`http://localhost:5000/api/admin/patients/${id}/reassign`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ helperId: selectedHelper })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                alert(`✅ ${data.message}`);
                setShowReassignModal(false);
                fetchPatientDetails(); // Refresh data
            } else {
                alert(`❌ ${data.message}`);
            }
        } catch (error) {
            console.error('Error reassigning:', error);
            alert('❌ Error reassigning helper');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    if (!patient) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-white">Patient not found</div>
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
                                onClick={() => navigate('/admin/patients')}
                                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-slate-400" />
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                                    <Shield className="text-indigo-500 w-6 h-6" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-white">Patient Details</h1>
                                    <p className="text-xs text-slate-500">{patient.fullName}</p>
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
                {/* Patient Info Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900 rounded-xl border border-slate-800 p-6 mb-6"
                >
                    <h2 className="text-2xl font-bold text-white mb-4">{patient.fullName}</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div>
                            <p className="text-slate-500 text-sm">Age</p>
                            <p className="text-white font-semibold">{patient.age} years</p>
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm">Gender</p>
                            <p className="text-white font-semibold capitalize">{patient.gender}</p>
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm">Email</p>
                            <p className="text-white font-semibold">{patient.email}</p>
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm">Mobile</p>
                            <p className="text-white font-semibold">{patient.mobile}</p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-slate-800/50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Pill className="w-5 h-5 text-emerald-400" />
                                <p className="text-slate-400 text-sm">Total Medications</p>
                            </div>
                            <p className="text-3xl font-bold text-white">{patient.stats.totalMedications}</p>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar className="w-5 h-5 text-blue-400" />
                                <p className="text-slate-400 text-sm">Total Appointments</p>
                            </div>
                            <p className="text-3xl font-bold text-white">{patient.stats.totalAppointments}</p>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Activity className="w-5 h-5 text-purple-400" />
                                <p className="text-slate-400 text-sm">Compliance Rate</p>
                            </div>
                            <p className="text-3xl font-bold text-white">{patient.stats.complianceRate}%</p>
                        </div>
                    </div>
                </motion.div>

                {/* Assigned Helper Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-slate-900 rounded-xl border border-slate-800 p-6 mb-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-white">Assigned Helper</h3>
                        <button
                            onClick={() => setShowReassignModal(true)}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-all flex items-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Reassign Helper
                        </button>
                    </div>

                    {patient.assignedHelper ? (
                        <div className="bg-slate-800/50 rounded-lg p-4">
                            <p className="text-lg font-semibold text-white mb-2">{patient.assignedHelper.name}</p>
                            <div className="flex items-center gap-4 text-sm text-slate-400">
                                <span className="flex items-center gap-1">
                                    <Mail className="w-4 h-4" />
                                    {patient.assignedHelper.email}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Phone className="w-4 h-4" />
                                    {patient.assignedHelper.mobile}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <p className="text-slate-400">No helper assigned</p>
                    )}
                </motion.div>

                {/* Medications List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-slate-900 rounded-xl border border-slate-800 p-6 mb-6"
                >
                    <h3 className="text-xl font-bold text-white mb-4">Medications ({patient.medications.length})</h3>
                    <div className="space-y-2">
                        {patient.medications.map((med, idx) => (
                            <div key={idx} className="bg-slate-800/50 rounded-lg p-3 flex items-center justify-between">
                                <div>
                                    <p className="text-white font-semibold">{med.name}</p>
                                    <p className="text-sm text-slate-400">Dosage: {med.dosage} | {med.mealType}</p>
                                </div>
                                <span className="text-xs text-slate-500">{med.startDate} to {med.endDate}</span>
                            </div>
                        ))}
                        {patient.medications.length === 0 && (
                            <p className="text-slate-400 text-center py-4">No medications</p>
                        )}
                    </div>
                </motion.div>

                {/* Appointments List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-slate-900 rounded-xl border border-slate-800 p-6"
                >
                    <h3 className="text-xl font-bold text-white mb-4">Appointments ({patient.appointments.length})</h3>
                    <div className="space-y-2">
                        {patient.appointments.map((apt, idx) => (
                            <div key={idx} className="bg-slate-800/50 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-white font-semibold">Dr. {apt.doctor}</p>
                                    <span className="text-sm text-slate-400">{apt.date} at {apt.time}</span>
                                </div>
                                <p className="text-sm text-slate-400">{apt.location}</p>
                            </div>
                        ))}
                        {patient.appointments.length === 0 && (
                            <p className="text-slate-400 text-center py-4">No appointments</p>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Reassign Modal */}
            {showReassignModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-slate-900 rounded-xl border border-slate-800 p-6 max-w-md w-full mx-4"
                    >
                        <h3 className="text-xl font-bold text-white mb-4">Reassign Helper</h3>
                        <p className="text-slate-400 mb-4">Select a new helper for {patient.fullName}</p>

                        <select
                            value={selectedHelper}
                            onChange={(e) => setSelectedHelper(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white mb-4 outline-none focus:ring-2 focus:ring-indigo-500/20"
                        >
                            <option value="">Select Helper...</option>
                            {helpers.map(helper => (
                                <option key={helper.id} value={helper.id}>
                                    {helper.fullName} ({helper.email})
                                </option>
                            ))}
                        </select>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowReassignModal(false)}
                                className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReassign}
                                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-all"
                            >
                                Reassign
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default AdminPatientDetail;
