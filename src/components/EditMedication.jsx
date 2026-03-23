import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Pill,
    Clock,
    Calendar,
    Package,
    Save,
    AlertCircle
} from 'lucide-react';
import { useHealth } from '../context/HealthContext';

const EditMedication = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { medications, refreshData } = useHealth();

    const [formData, setFormData] = useState({
        medicineName: '',
        time: '',
        mealTiming: 'after', // 'before' or 'after'
        manufacturingDate: '',
        expiryDate: '',
        quantityPerIntake: '',
        remainingQuantity: ''
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch medication details
    useEffect(() => {
        // Find medication in global state
        // Note: id from params is string, med.id could be string or number
        const med = medications.find(m => String(m.id) === String(id) || String(m._id) === String(id));

        if (med) {
            setFormData({
                medicineName: med.name || '',
                time: med.time || med.frequency || '',
                mealTiming: med.mealTiming === 'Before Meal' ? 'before' : 'after',
                manufacturingDate: med.manufacturingDate || '',
                expiryDate: med.expiryDate || '',
                quantityPerIntake: med.qtyPerDose || med.dosage || '',
                remainingQuantity: med.remainingQty || med.stock || ''
            });
        }
    }, [id, medications]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleToggleMealTiming = () => {
        setFormData(prev => ({
            ...prev,
            mealTiming: prev.mealTiming === 'before' ? 'after' : 'before'
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.medicineName.trim()) {
            newErrors.medicineName = 'Medicine name is required';
        }

        if (!formData.time) {
            newErrors.time = 'Time is required';
        }

        if (!formData.manufacturingDate) {
            newErrors.manufacturingDate = 'Manufacturing date is required';
        }

        if (!formData.expiryDate) {
            newErrors.expiryDate = 'Expiry date is required';
        } else if (new Date(formData.expiryDate) <= new Date(formData.manufacturingDate)) {
            newErrors.expiryDate = 'Expiry date must be after manufacturing date';
        }

        if (!formData.quantityPerIntake || formData.quantityPerIntake <= 0) {
            newErrors.quantityPerIntake = 'Valid quantity per intake is required';
        }

        if (!formData.remainingQuantity || formData.remainingQuantity <= 0) {
            newErrors.remainingQuantity = 'Valid remaining quantity is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const isFormValid = () => {
        return formData.medicineName.trim() &&
            formData.time &&
            formData.manufacturingDate &&
            formData.expiryDate &&
            formData.quantityPerIntake > 0 &&
            formData.remainingQuantity > 0 &&
            new Date(formData.expiryDate) > new Date(formData.manufacturingDate);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validateForm()) {
            setIsSubmitting(true);

            try {
                const token = localStorage.getItem('accessToken');
                const response = await fetch(`http://localhost:5000/api/patient/medications/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();

                if (data.success) {
                    await refreshData(); // Refresh all data from server
                    alert('Medication updated successfully!');
                    navigate('/patient/medication');
                } else {
                    alert('Failed to update medication: ' + (data.message || 'Unknown error'));
                }
            } catch (error) {
                console.error('Error updating medication:', error);
                alert('Server error. Please try again.');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleBack = () => {
        navigate('/patient/medication');
    };

    return (
        <div className="min-h-screen bg-slate-950 ml-64 p-8">
            <div className="max-w-3xl mx-auto">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4 group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Back to Medications</span>
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                            <Pill className="text-emerald-400" size={32} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-1">Edit Medication</h1>
                            <p className="text-slate-400">Update the details of your medication</p>
                        </div>
                    </div>
                </motion.div>

                {/* Form Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-8"
                >
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Medicine Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                <Pill size={16} />
                                Medicine Name *
                            </label>
                            <input
                                type="text"
                                name="medicineName"
                                value={formData.medicineName}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-white placeholder-slate-600 transition-all outline-none"
                                placeholder="e.g., Aspirin, Metformin"
                            />
                            {errors.medicineName && (
                                <p className="text-xs text-red-400 flex items-center gap-1">
                                    <AlertCircle size={12} />
                                    {errors.medicineName}
                                </p>
                            )}
                        </div>

                        {/* Time and Meal Timing Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Time */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                    <Clock size={16} />
                                    Time of Medicine *
                                </label>
                                <input
                                    type="time"
                                    name="time"
                                    value={formData.time}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-white transition-all outline-none"
                                />
                                {errors.time && (
                                    <p className="text-xs text-red-400 flex items-center gap-1">
                                        <AlertCircle size={12} />
                                        {errors.time}
                                    </p>
                                )}
                            </div>

                            {/* Meal Timing Toggle */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">
                                    Meal Timing *
                                </label>
                                <div className="flex items-center gap-4 h-[50px]">
                                    <span className={`text-sm font-medium transition-colors ${formData.mealTiming === 'before' ? 'text-emerald-400' : 'text-slate-500'
                                        }`}>
                                        Before Meal
                                    </span>

                                    {/* Toggle Switch */}
                                    <motion.button
                                        type="button"
                                        onClick={handleToggleMealTiming}
                                        className={`relative w-16 h-8 rounded-full transition-colors ${formData.mealTiming === 'after' ? 'bg-emerald-500' : 'bg-blue-500'
                                            }`}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <motion.div
                                            className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-lg"
                                            animate={{
                                                x: formData.mealTiming === 'after' ? 32 : 0
                                            }}
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        />
                                    </motion.button>

                                    <span className={`text-sm font-medium transition-colors ${formData.mealTiming === 'after' ? 'text-emerald-400' : 'text-slate-500'
                                        }`}>
                                        After Meal
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Manufacturing and Expiry Date Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Manufacturing Date */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                    <Calendar size={16} />
                                    Manufacturing Date *
                                </label>
                                <input
                                    type="date"
                                    name="manufacturingDate"
                                    value={formData.manufacturingDate}
                                    onChange={handleInputChange}
                                    max={new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-white transition-all outline-none"
                                />
                                {errors.manufacturingDate && (
                                    <p className="text-xs text-red-400 flex items-center gap-1">
                                        <AlertCircle size={12} />
                                        {errors.manufacturingDate}
                                    </p>
                                )}
                            </div>

                            {/* Expiry Date */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                    <Calendar size={16} />
                                    Expiry Date *
                                </label>
                                <input
                                    type="date"
                                    name="expiryDate"
                                    value={formData.expiryDate}
                                    onChange={handleInputChange}
                                    min={formData.manufacturingDate || new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-white transition-all outline-none"
                                />
                                {errors.expiryDate && (
                                    <p className="text-xs text-red-400 flex items-center gap-1">
                                        <AlertCircle size={12} />
                                        {errors.expiryDate}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Quantity Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Quantity per Intake */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                    <Pill size={16} />
                                    Quantity per Intake *
                                </label>
                                <input
                                    type="number"
                                    name="quantityPerIntake"
                                    value={formData.quantityPerIntake}
                                    onChange={handleInputChange}
                                    min="1"
                                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-white placeholder-slate-600 transition-all outline-none"
                                    placeholder="e.g., 1, 2"
                                />
                                {errors.quantityPerIntake && (
                                    <p className="text-xs text-red-400 flex items-center gap-1">
                                        <AlertCircle size={12} />
                                        {errors.quantityPerIntake}
                                    </p>
                                )}
                            </div>

                            {/* Remaining Quantity */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                    <Package size={16} />
                                    Remaining Medicine Quantity *
                                </label>
                                <input
                                    type="number"
                                    name="remainingQuantity"
                                    value={formData.remainingQuantity}
                                    onChange={handleInputChange}
                                    min="1"
                                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-white placeholder-slate-600 transition-all outline-none"
                                    placeholder="e.g., 30, 60"
                                />
                                {errors.remainingQuantity && (
                                    <p className="text-xs text-red-400 flex items-center gap-1">
                                        <AlertCircle size={12} />
                                        {errors.remainingQuantity}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-4">
                            <motion.button
                                type="button"
                                onClick={handleBack}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition-colors"
                            >
                                Cancel
                            </motion.button>

                            <motion.button
                                type="submit"
                                disabled={!isFormValid() || isSubmitting}
                                whileHover={isFormValid() && !isSubmitting ? { scale: 1.02, boxShadow: "0 0 20px -5px rgba(16, 185, 129, 0.5)" } : {}}
                                whileTap={isFormValid() && !isSubmitting ? { scale: 0.98 } : {}}
                                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${isFormValid() && !isSubmitting
                                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30'
                                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                    }`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <Save size={20} />
                                        Update Medication
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default EditMedication;
