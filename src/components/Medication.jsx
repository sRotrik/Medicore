import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Pill,
    Clock,
    Calendar,
    Package,
    Plus,
    Edit,
    Trash2,
    AlertCircle
} from 'lucide-react';
import { useHealth } from '../context/HealthContext';

const MedicationList = () => {
    const navigate = useNavigate();
    const { medications, refreshData, loading } = useHealth();

    console.log('💊 Medication Component:');
    console.log('   Loading:', loading);
    console.log('   Medications:', medications);
    console.log('   Count:', medications?.length);

    const handleAddMedication = () => {
        navigate('/patient/medication/add');
    };

    const handleEdit = (id) => {
        navigate(`/patient/medication/edit/${id}`);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this medication?')) {
            try {
                const token = localStorage.getItem('accessToken');
                const response = await fetch(`http://localhost:5000/api/patient/medications/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    await refreshData();
                    alert('Medication deleted successfully!');
                } else {
                    const data = await response.json();
                    alert(data.message || 'Failed to delete medication');
                }
            } catch (error) {
                console.error('Error deleting medication:', error);
                alert('Error deleting medication');
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 ml-64 flex items-center justify-center">
                <div className="text-white">Loading medications...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 ml-64 p-8">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between mb-8"
                >
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Medication Schedule</h1>
                        <p className="text-slate-400">Manage your daily medications and prescriptions</p>
                    </div>

                    <motion.button
                        onClick={handleAddMedication}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg"
                    >
                        <Plus size={20} />
                        Add Medication
                    </motion.button>
                </motion.div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                                <Pill className="text-emerald-400" size={20} />
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">Total Medications</p>
                                <p className="text-2xl font-bold text-white">{medications.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Medication Cards */}
                {medications && medications.length > 0 ? (
                    <div className="grid gap-4">
                        {medications.map((med, index) => (
                            <motion.div
                                key={med.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * index }}
                                className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                                <Pill className="text-emerald-400" size={24} />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-white mb-2">{med.name}</h3>
                                                <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 text-sm">
                                                    {med.mealTiming}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                            <div className="flex items-center gap-2">
                                                <Clock className="text-slate-500" size={16} />
                                                <div>
                                                    <p className="text-xs text-slate-500">Time</p>
                                                    <p className="text-sm font-semibold text-white">{med.time}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Pill className="text-slate-500" size={16} />
                                                <div>
                                                    <p className="text-xs text-slate-500">Dosage</p>
                                                    <p className="text-sm font-semibold text-white">{med.dosagePerIntake} tablet(s)</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Package className="text-slate-500" size={16} />
                                                <div>
                                                    <p className="text-xs text-slate-500">Remaining</p>
                                                    <p className="text-sm font-semibold text-white">{med.remainingQuantity} tablets</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Calendar className="text-slate-500" size={16} />
                                                <div>
                                                    <p className="text-xs text-slate-500">Expires</p>
                                                    <p className="text-sm font-semibold text-white">
                                                        {med.expiryDate ? new Date(med.expiryDate).toLocaleDateString() : 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 ml-4">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleEdit(med.id)}
                                            className="p-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 rounded-lg transition-all"
                                        >
                                            <Edit size={18} />
                                        </motion.button>

                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleDelete(med.id)}
                                            className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-16"
                    >
                        <div className="inline-block p-6 bg-slate-900 rounded-full mb-4">
                            <Pill className="text-slate-600" size={48} />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">No medications added yet</h3>
                        <p className="text-slate-400 mb-6">Start by adding your first medication</p>
                        <motion.button
                            onClick={handleAddMedication}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold transition-colors"
                        >
                            Add Your First Medication
                        </motion.button>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default MedicationList;
