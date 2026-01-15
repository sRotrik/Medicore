import React, { useState } from 'react';
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

const MedicationList = () => {
    const navigate = useNavigate();

    // Dummy medication data
    const [medications, setMedications] = useState([
        {
            id: 1,
            name: 'Aspirin',
            time: '08:00 AM',
            mealTiming: 'After Meal',
            dosagePerIntake: 1,
            remainingQuantity: 45,
            expiryDate: '2026-12-31',
            status: 'active'
        },
        {
            id: 2,
            name: 'Metformin',
            time: '12:00 PM',
            mealTiming: 'Before Meal',
            dosagePerIntake: 2,
            remainingQuantity: 30,
            expiryDate: '2026-08-15',
            status: 'active'
        },
        {
            id: 3,
            name: 'Lisinopril',
            time: '08:00 PM',
            mealTiming: 'After Meal',
            dosagePerIntake: 1,
            remainingQuantity: 8,
            expiryDate: '2026-06-20',
            status: 'low'
        },
        {
            id: 4,
            name: 'Vitamin D3',
            time: '09:00 AM',
            mealTiming: 'After Meal',
            dosagePerIntake: 1,
            remainingQuantity: 60,
            expiryDate: '2027-01-10',
            status: 'active'
        }
    ]);

    const handleAddMedication = () => {
        navigate('/patient/medication/add');
    };

    const handleEdit = (id) => {
        console.log('Edit medication:', id);
        // Navigate to edit page (can be implemented similarly to add)
    };

    const handleDelete = (id) => {
        console.log('Delete medication:', id);
        // Show confirmation dialog and delete
    };

    const getStatusColor = (status, quantity) => {
        if (quantity <= 10) return 'border-red-500/30 bg-red-500/5';
        if (status === 'low') return 'border-orange-500/30 bg-orange-500/5';
        return 'border-slate-800';
    };

    const getQuantityBadge = (quantity) => {
        if (quantity <= 10) {
            return (
                <span className="px-2 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-lg flex items-center gap-1">
                    <AlertCircle size={12} />
                    Low Stock
                </span>
            );
        }
        return (
            <span className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-lg">
                In Stock
            </span>
        );
    };

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
                        whileHover={{ scale: 1.05, boxShadow: "0 0 20px -5px rgba(16, 185, 129, 0.5)" }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-emerald-900/30"
                    >
                        <Plus size={20} />
                        Add Medication
                    </motion.button>
                </motion.div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-slate-900 border border-slate-800 rounded-xl p-4"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                                <Pill className="text-emerald-400" size={20} />
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">Total Medications</p>
                                <p className="text-2xl font-bold text-white">{medications.length}</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-slate-900 border border-slate-800 rounded-xl p-4"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                <Clock className="text-blue-400" size={20} />
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">Today's Doses</p>
                                <p className="text-2xl font-bold text-white">{medications.reduce((sum, med) => sum + med.dosagePerIntake, 0)}</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-slate-900 border border-slate-800 rounded-xl p-4"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
                                <AlertCircle className="text-orange-400" size={20} />
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">Low Stock Items</p>
                                <p className="text-2xl font-bold text-white">
                                    {medications.filter(m => m.remainingQuantity <= 10).length}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Medication Cards */}
                <div className="grid gap-4">
                    {medications.map((med, index) => (
                        <motion.div
                            key={med.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index }}
                            whileHover={{ x: 4, boxShadow: "0 10px 30px -10px rgba(16, 185, 129, 0.2)" }}
                            className={`bg-slate-900 border rounded-2xl p-6 transition-all duration-300 ${getStatusColor(med.status, med.remainingQuantity)}`}
                        >
                            <div className="flex items-start justify-between">

                                {/* Left Section - Medicine Info */}
                                <div className="flex-1">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                            <Pill className="text-emerald-400" size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-bold text-white">{med.name}</h3>
                                                {getQuantityBadge(med.remainingQuantity)}
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                                                <span className={`px-2 py-0.5 rounded-md ${med.mealTiming === 'Before Meal'
                                                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                        : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                                    }`}>
                                                    {med.mealTiming}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Medicine Details Grid */}
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
                                                <p className={`text-sm font-semibold ${med.remainingQuantity <= 10 ? 'text-red-400' : 'text-white'
                                                    }`}>
                                                    {med.remainingQuantity} tablets
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Calendar className="text-slate-500" size={16} />
                                            <div>
                                                <p className="text-xs text-slate-500">Expires</p>
                                                <p className="text-sm font-semibold text-white">
                                                    {new Date(med.expiryDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Section - Actions */}
                                <div className="flex flex-col gap-2 ml-4">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleEdit(med.id)}
                                        className="p-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-500/40 text-blue-400 rounded-lg transition-all"
                                        title="Edit"
                                    >
                                        <Edit size={18} />
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleDelete(med.id)}
                                        className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 rounded-lg transition-all"
                                        title="Delete"
                                    >
                                        <Trash2 size={18} />
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Empty State */}
                {medications.length === 0 && (
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
